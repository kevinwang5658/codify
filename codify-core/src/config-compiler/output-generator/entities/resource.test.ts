import { ResourceConfig } from '../../parser/entities/configs/resource.js';
import { ResourceDefinition } from '../../../plugins/entities/definitions/resource.js';
import { ResourceParameterDefinition } from '../../../plugins/entities/definitions/resource-parameter.js';
import { ResourceParameterType } from '../../language-definition.js';
import { expect } from '@oclif/test';
import { Resource } from './resource.js';

describe('Resource definition validation', () => {

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

  const createResourceDefinition1 = () => {
    return new ResourceDefinition({
      name: 'homebrew_installation',
      parameters: new Map(Object.entries({
        directory: new ResourceParameterDefinition({
          name: 'directory',
          type: ResourceParameterType.STRING,
        })
      })),
      pluginName: 'homebrew',
    })
  }


  it('validates resources based on the definition', () => {
    const resource = createResource1();
    const definition = createResourceDefinition1();

    expect(() => Resource.validateAndTransformFromConfig(resource, definition)).to.not.throw();
  });

  it('validates invalid parameter names', () => {
    const resource = createResource2();
    const definition = createResourceDefinition1();

    expect(() => Resource.validateAndTransformFromConfig(resource, definition)).to.throw();
  })

  it('validates invalid resource names', () => {
    const resource = createResource3();
    const definition = createResourceDefinition1();


    expect(() => Resource.validateAndTransformFromConfig(resource, definition)).to.throw();
  })

  it('validates invalid parameter type', () => {
    const resource = createResource4();
    const definition = createResourceDefinition1();

    expect(() => Resource.validateAndTransformFromConfig(resource, definition)).to.throw();
  })
});
