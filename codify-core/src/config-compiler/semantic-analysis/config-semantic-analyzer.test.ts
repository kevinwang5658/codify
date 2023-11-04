import { ResourceConfig } from '../parser/entities/resource';
import { ResourceDefinition } from '../../entities/resource-definition';
import { ResourceParameterDefinition } from '../../entities/resource-parameter';
import { ResourceParameterType } from '../language-definition';
import { ConfigSemanticAnalyzer } from './config-semantic-analyzer';
import { expect } from '@oclif/test';

describe('Config semantic analyzer tests', () => {

  const createResource1 = () => {
    return new ResourceConfig({
      type: 'homebrew_installation',
      directory: '/usr/opt'
    })
  }

  const createResource2 = () => {
    return new ResourceConfig({
      type: 'homebrew_installation',
      invalidParameter: 'something',
    })
  }

  const createResource3 = () => {
    return new ResourceConfig({
      type: 'homebrew_installation_wrong',
      directory: '/usr/opt'
    })
  }

  const createResource4 = () => {
    return new ResourceConfig({
      type: 'homebrew_installation',
      directory: 123
    })
  }

  const createResource5 = () => {
    return new ResourceConfig({
      type: 'homebrew_options',
      directory: '${homebrew_installation.directory}'
    })
  }

  const createResource6 = () => {
    return new ResourceConfig({
      type: 'homebrew_options',
      directory: '${homebrew_installation_invalid.directory}'
    })
  }

  const createResource7 = () => {
    return new ResourceConfig({
      type: 'homebrew_options',
      directory: '${homebrew_installation.directory_invalid}'
    })
  }

  const createResource8 = () => {
    return new ResourceConfig({
      type: 'homebrew_options',
      directory: `$\{homebrew_installation.directory} and $\{homebrew_installation.directory}`
    })
  }

  const createResourceDefinition1 = () => {
    return new ResourceDefinition({
      name: 'homebrew_installation',
      parameters: new Map(Object.entries({
        directory: new ResourceParameterDefinition({
          name: 'directory',
          type: ResourceParameterType.STRING,
        })
      }))
    })
  }


  it('validates resources based on the definition', () => {
    const resource = createResource1();
    const definition = createResourceDefinition1();

    expect(() => ConfigSemanticAnalyzer.validateResourceConfigs([resource], new Map([[definition.name, definition] as const]))).to.not.throw();
  });

  it('validates invalid parameter names', () => {
    const resource = createResource2();
    const definition = createResourceDefinition1();

    expect(() => ConfigSemanticAnalyzer.validateResourceConfigs([resource], new Map([[definition.name, definition] as const]))).to.throw();
  })

  it('validates invalid resource names', () => {
    const resource = createResource3();
    const definition = createResourceDefinition1();


    expect(() => ConfigSemanticAnalyzer.validateResourceConfigs([resource], new Map([[definition.name, definition] as const]))).to.throw();
  })

  it('validates invalid parameter type', () => {
    const resource = createResource4();
    const definition = createResourceDefinition1();

    expect(() => ConfigSemanticAnalyzer.validateResourceConfigs([resource], new Map([[definition.name, definition] as const]))).to.throw();
  })

  it('parses and replace resource references', () => {
    const resource1 = createResource1();
    const resource2 = createResource5();

    expect(() => ConfigSemanticAnalyzer.parseResourceDependencies([resource1, resource2])).to.not.throw()
    expect(resource1).to.deep.eq(createResource1())
    expect(resource2.parameters['directory']).to.eq(resource1.parameters.directory);
  })

  it('validates invalid resources', () => {
    const resource1 = createResource1();
    const resource2 = createResource6();

    expect(() => ConfigSemanticAnalyzer.parseResourceDependencies([resource1, resource2])).to.throw()
  })

  it('validates invalid parameters', () => {
    const resource1 = createResource1();
    const resource2 = createResource7();

    expect(() => ConfigSemanticAnalyzer.parseResourceDependencies([resource1, resource2])).to.throw()
  })

  it('handles multiple resource references', () => {
    const resource1 = createResource1();
    const resource2 = createResource8();

    expect(() => ConfigSemanticAnalyzer.parseResourceDependencies([resource1, resource2])).to.not.throw()
    expect(resource1).to.deep.eq(createResource1())
    expect(resource2.parameters['directory']).to.eq(`${resource1.parameters.directory} and ${resource1.parameters.directory}`);
  })
});
