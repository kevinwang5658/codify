import { ResourceConfig } from '../parser/entities/configs/resource';
import { ResourceNode } from './entities/resource-node';
import { DependencyBuilder } from './dependency-builder';
import { expect } from '@oclif/test';

describe('Dependency graph tests', () => {

  it('parses and replace resource references', () => {
    const resource1 = new ResourceConfig({
      type: 'homebrew_installation',
      directory: '/usr/opt'
    })
    const resource2 = new ResourceConfig({
      type: 'homebrew_options',
      directory: '${homebrew_installation.directory}'
    })

    expect(() => DependencyBuilder.buildDependencyGraph([resource1, resource2])).to.not.throw()
    expect(resource1).to.deep.eq(new ResourceConfig({
      type: 'homebrew_installation',
      directory: '/usr/opt'
    }))
    expect(resource2.parameters['directory']).to.eq(resource1.parameters.directory);
  })

  it('validates invalid resources', () => {
    const resource1 = new ResourceConfig({
      type: 'homebrew_installation',
      directory: '/usr/opt'
    })
    const resource2 = new ResourceConfig({
      type: 'homebrew_options',
      directory: '${homebrew_installation_invalid.directory}'
    })

    expect(() => DependencyBuilder.buildDependencyGraph([resource1, resource2])).to.throw()
  })

  it('validates invalid parameters', () => {
    const resource1 = new ResourceConfig({
      type: 'homebrew_installation',
      directory: '/usr/opt'
    })
    const resource2 = new ResourceConfig({
      type: 'homebrew_options',
      directory: '${homebrew_installation.directory_invalid}'
    })

    expect(() => DependencyBuilder.buildDependencyGraph([resource1, resource2])).to.throw()
  })

  it('handles multiple resource references', () => {
    const resource1 = new ResourceConfig({
      type: 'homebrew_installation',
      directory: '/usr/opt'
    })
    const resource2 = new ResourceConfig({
      type: 'homebrew_options',
      directory: `$\{homebrew_installation.directory} and $\{homebrew_installation.directory}`
    })

    expect(() => DependencyBuilder.buildDependencyGraph([resource1, resource2])).to.not.throw()
    expect(resource1).to.deep.eq(new ResourceConfig({
      type: 'homebrew_installation',
      directory: '/usr/opt'
    }))
    expect(resource2.parameters['directory']).to.eq(`${resource1.parameters.directory} and ${resource1.parameters.directory}`);
  })

  // homebrew_options \-----/ homebrew_installation --- homebrew_main
  //                   \   /                        /
  // homebrew_options -\--/-- homebrew_installation /
  // xcode_options \
  //                ---- xcode_main
  // xcode_options /

  const createNodeGraph = (): ResourceNode[] => {
    const nodeList = [
      ResourceNode.fromResource(new ResourceConfig({
        type: 'homebrew_options',
        name: 'first',
        directory: ''
      })),
      ResourceNode.fromResource(new ResourceConfig({
        type: 'homebrew_options',
        name: 'second',
        directory: ''
      })),
      ResourceNode.fromResource(new ResourceConfig({
        type: 'homebrew_installation',
        name: 'first',
        directory: '',
      })),
      ResourceNode.fromResource(new ResourceConfig({
        type: 'homebrew_main',
        directory: '',
      })),
      ResourceNode.fromResource(new ResourceConfig({
        type: 'homebrew_installation',
        name: 'second',
        directory: '',
      })),
      ResourceNode.fromResource(new ResourceConfig({
        type: 'xcode_options',
        name: 'first',
        directory: '',
      })),
      ResourceNode.fromResource(new ResourceConfig({
        type: 'xcode_options',
        name: 'second',
        directory: '',
      })),
      ResourceNode.fromResource(new ResourceConfig({
        type: 'xcode_main',
        directory: '',
      })),
    ]

    nodeList[0].dependencies = [nodeList[2], nodeList[4]];
    nodeList[1].dependencies = [nodeList[2], nodeList[4]];
    nodeList[2].dependencies = [nodeList[3]];
    nodeList[4].dependencies = [nodeList[3]];
    nodeList[5].dependencies = [nodeList[7]];
    nodeList[6].dependencies = [nodeList[7]];

    return nodeList;
  }

  it('creates a dependency list', () => {
    const nodeGraph = createNodeGraph();

    const dependencyList = DependencyBuilder.generateDependencyList(nodeGraph)
    expect(dependencyList[0].id).to.eq('homebrew_options.first');
    expect(dependencyList[1].id).to.eq('homebrew_options.second');
    expect(dependencyList[2].id).to.eq('xcode_options.first');
    expect(dependencyList[3].id).to.eq('xcode_options.second');
    expect(dependencyList[4].id).to.eq('homebrew_installation.first');
    expect(dependencyList[5].id).to.eq('homebrew_installation.second');
    expect(dependencyList[6].id).to.eq('xcode_main');
    expect(dependencyList[7].id).to.eq('homebrew_main');
  })

  // homebrew_options -----> homebrew_installation ---> homebrew_main /
  //              ^--------------------------------------------------/

  const createCyclicNodeGraph = (): ResourceNode[] => {
    const nodeList = [
      ResourceNode.fromResource(new ResourceConfig({
        type: 'homebrew_options',
        directory: ''
      })),
      ResourceNode.fromResource(new ResourceConfig({
        type: 'homebrew_installation',
        name: 'first',
        directory: '',
      })),
      ResourceNode.fromResource(new ResourceConfig({
        type: 'homebrew_main',
        directory: '',
      })),
    ]

    nodeList[0].dependencies = [nodeList[1]];
    nodeList[1].dependencies = [nodeList[2]];
    nodeList[2].dependencies = [nodeList[0]];

    return nodeList;
  }

  it('errors out on cyclic dependencies', () => {
    const nodeGraph = createCyclicNodeGraph();

    expect(() => DependencyBuilder.generateDependencyList(nodeGraph)).to.throw;
  })

})
