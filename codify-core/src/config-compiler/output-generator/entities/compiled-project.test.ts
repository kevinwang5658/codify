import { expect } from '@oclif/test';
import { Resource } from './resource.js';
import { CompiledProject } from './compiled-project.js';
import { ProjectConfig } from '../../parser/entities/configs/project.js';

describe('', () => {

  // homebrew_options \-----/ homebrew_installation --- homebrew_main
  //                   \   /                        /
  // homebrew_options -\--/-- homebrew_installation /
  // xcode_options \
  //                ---- xcode_main
  // xcode_options /

  const createApplyableGraph = (): Map<string, Resource> => {
    const applyableList = [
      new Resource(
        'homebrew_options',
        'first',
        new Map(),
        '',
      ),
      new Resource(
        'homebrew_options',
        'second',
        new Map(),
        '',
      ),
      new Resource(
        'homebrew_installation',
        'first',
        new Map(),
        '',
      ),
      new Resource(
        'homebrew_main',
        undefined,
        new Map(),
        '',
      ),
      new Resource(
        'homebrew_installation',
        'second',
        new Map(),
        '',
      ),
      new Resource(
        'xcode_options',
        'first',
        new Map(),
        '',
      ),
      new Resource(
        'xcode_options',
        'second',
        new Map(),
        '',
      ),
      new Resource(
        'xcode_main',
        undefined,
        new Map(),
        '',
      ),
    ]

    applyableList[0].dependencies = [applyableList[2], applyableList[4]];
    applyableList[1].dependencies = [applyableList[2], applyableList[4]];
    applyableList[2].dependencies = [applyableList[3]];
    applyableList[4].dependencies = [applyableList[3]];
    applyableList[5].dependencies = [applyableList[7]];
    applyableList[6].dependencies = [applyableList[7]];

    return new Map(applyableList.map((a) => [a.id, a]));
  }

  it('creates a dependency list', () => {
    const compiledProject = new CompiledProject({
      applyableGraph: createApplyableGraph(),
      projectConfig: {} as ProjectConfig,
    })


    const applySequence = compiledProject.getApplySequence()
    expect(applySequence[0].id).to.eq('homebrew_main');
    expect(applySequence[1].id).to.eq('xcode_main');
    expect(applySequence[2].id).to.eq('homebrew_installation.second');
    expect(applySequence[3].id).to.eq('homebrew_installation.first');
    expect(applySequence[4].id).to.eq('xcode_options.second');
    expect(applySequence[5].id).to.eq('xcode_options.first');
    expect(applySequence[6].id).to.eq('homebrew_options.second');
    expect(applySequence[7].id).to.eq('homebrew_options.first');

  })

  const createApplyableGraph2 = (): Map<string, Resource> => {
    const applyableList = [
      new Resource(
        'homebrew_main',
        undefined,
        new Map(),
        'homebrew',
      ),
      new Resource(
        'homebrew_options',
        undefined,
        new Map(),
        'homebrew',
      ),
    ]

    applyableList[1].dependencies = [applyableList[0]];

    return new Map(applyableList.map((a) => [a.id, a]));
  }

  it('handles a list size of 2', () => {
    const compiledProject = new CompiledProject({
      applyableGraph: createApplyableGraph2(),
      projectConfig: {} as ProjectConfig,
    })


    const applySequence = compiledProject.getApplySequence()
    expect(applySequence[0].id).to.eq('homebrew_main');
    expect(applySequence[1].id).to.eq('homebrew_options');
  })

  // homebrew_options -----> homebrew_installation ---> homebrew_main /
  //              ^--------------------------------------------------/

  const createCyclicApplyableGraph = (): Map<string, Resource> => {
    const applyableList = [
      new Resource(
        'homebrew_options',
        undefined,
        new Map(),
        '',
      ),
      new Resource(
        'homebrew_installation',
        undefined,
        new Map(),
        '',
      ),
      new Resource(
        'homebrew_main',
        undefined,
        new Map(),
        '',
      ),
    ]

    applyableList[0].dependencies = [applyableList[1]];
    applyableList[1].dependencies = [applyableList[2]];
    applyableList[2].dependencies = [applyableList[0]];

    return new Map(applyableList.map((a) => [a.id, a]));
  }

  it('errors out on cyclic dependencies', () => {
    const compiledProject = new CompiledProject({
      applyableGraph: createCyclicApplyableGraph(),
      projectConfig: {} as ProjectConfig,
    })

    expect(() => compiledProject.getApplySequence()).to.throw;
  })
})
