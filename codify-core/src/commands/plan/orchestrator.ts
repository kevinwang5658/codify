import { ConfigCompiler } from '../../config-compiler/index.js';
import { PluginCollection } from '../../plugins/plugin-collection.js';

export const PlanOrchestrator = {
  async run(rootDirectory: string): Promise<string> {
    const parsedProject = await ConfigCompiler.parseProject(rootDirectory);

    const pluginCollection = new PluginCollection();
    const resourceMap = await pluginCollection.initialize(parsedProject);

    parsedProject.validateWithResourceMap(resourceMap);


    // const compiledProject = await ConfigCompiler.compileProject(parsedProject, definitions);
    // console.log(compiledProject);
    // const plan = await pluginCollection.getPlan(compiledProject);
    //
    // await pluginCollection.destroy();
    // return JSON.stringify(plan, null, 2);

    return '';
  },
};
