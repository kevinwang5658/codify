import { ConfigCompiler } from '../../config-compiler';

export const PlanOrchestrator = {
  async run(rootDirectory: string): Promise<void> {
    const loadedProject = await ConfigCompiler.compileProject(rootDirectory);

    console.log(JSON.stringify(loadedProject, null, 2));
  },
};
