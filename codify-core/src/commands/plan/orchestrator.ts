import { ConfigCompiler } from '../../config-compiler/index.js';
import { DependencyGraphBuilder } from '../../dependency-graph-builder/dependency-graph-builder.js';
import { PluginCollection } from '../../plugins/plugin-collection.js';

export const PlanOrchestrator = {
  async run(rootDirectory: string): Promise<string> {
    const project = await ConfigCompiler.parseProject(rootDirectory);

    const pluginCollection = new PluginCollection();
    const resourceMap = await pluginCollection.initialize(project);
    project.validateWithResourceMap(resourceMap);

    await pluginCollection.validate(project);
    const depedencyGraph = await DependencyGraphBuilder.buildDependencyGraph(project);

    const plan = await pluginCollection.getPlan(project);
    //
    // await pluginCollection.destroy();
    // return JSON.stringify(plan, null, 2);

    return '';
  },
};
