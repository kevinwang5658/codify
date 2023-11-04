import { ConfigCompiler } from '../../config-compiler';
import { PluginCollection } from '../../plugins/plugin-collection';

export const PlanOrchestrator = {
  async run(rootDirectory: string): Promise<void> {
    const project = await ConfigCompiler.parseProject(rootDirectory);

    const pluginCollection = await PluginCollection.create(project);
    const resourceDefinitions = await pluginCollection.getAllResourceDefinitions();

    await ConfigCompiler.analyzeProject(project, resourceDefinitions);

    console.log(project.coreModule.configBlocks);

    await pluginCollection.destroy();
  },
};
