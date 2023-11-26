import { ConfigCompiler } from '../../config-compiler';
import { PluginCollection } from '../../plugins/plugin-collection';

export const PlanOrchestrator = {
  async run(rootDirectory: string): Promise<string> {
    const project = await ConfigCompiler.parseProject(rootDirectory);

    const pluginCollection = await PluginCollection.create(project);
    const resourceDefinitions = await pluginCollection.getAllResourceDefinitions();

    await ConfigCompiler.analyzeProject(project, resourceDefinitions);
    const plan = await pluginCollection.getPlan(project);

    await pluginCollection.destroy();
    return JSON.stringify(plan, null, 2);
  },
};
