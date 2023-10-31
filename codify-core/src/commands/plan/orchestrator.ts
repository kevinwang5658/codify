import { ConfigCompiler } from '../../config-compiler';
import { PluginCollection } from '../../plugins/plugin-collection';

export const PlanOrchestrator = {
  async run(rootDirectory: string): Promise<void> {
    const project = await ConfigCompiler.parseProject(rootDirectory);

    const pluginCollection = new PluginCollection();
    await pluginCollection.initializePlugins(project);

    const resourceDefinitions = await pluginCollection.getAllResourceDefinitions();
    console.log(resourceDefinitions);

    await pluginCollection.killPlugins();
  },
};
