import { ConfigCompiler } from '../../config-compiler';
import { PluginsManager } from '../../plugins/manager';

export const PlanOrchestrator = {
  async run(rootDirectory: string): Promise<void> {
    const project = await ConfigCompiler.parseProject(rootDirectory);

    const pluginsManager = new PluginsManager();
    await pluginsManager.initializePlugins(project);


  },
};
