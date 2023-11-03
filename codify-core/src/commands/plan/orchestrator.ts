import { ConfigCompiler } from '../../config-compiler';
import { ConfigSemanticAnalyzer } from '../../config-compiler/semantic-analysis/config-semantic-analyzer';
import { PluginCollection } from '../../plugins/plugin-collection';

export const PlanOrchestrator = {
  async run(rootDirectory: string): Promise<void> {
    const project = await ConfigCompiler.parseProject(rootDirectory);

    const pluginCollection = await PluginCollection.create(project);
    const resourceDefinitions = await pluginCollection.getAllResourceDefinitions();

    await ConfigSemanticAnalyzer.validate(project, resourceDefinitions);

    await pluginCollection.destroy();
  },
};
