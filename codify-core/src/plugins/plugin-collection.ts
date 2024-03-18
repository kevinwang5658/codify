import { CompiledProject } from '../config-compiler/output-generator/entities/compiled-project.js';
import { ParsedProject } from '../config-compiler/parser/entities/parsed-project.js';
import { ResourceDefinition } from './entities/definitions/resource.js';
import { Plugin } from './entities/plugin.js';
import { PluginResolver } from './resolver.js';

type PluginName = string;

const DEFAULT_PLUGINS = {
  'default:homebrew': 'latest',
  // 'default:node': 'latest',
}

export class PluginCollection {

  private plugins: Map<PluginName, Plugin>

  constructor(plugins: Map<PluginName, Plugin>) {
    this.plugins = plugins;
  }

  static async create(project: ParsedProject): Promise<PluginCollection> {
    const pluginDefinitions: Record<string, string> = {
      ...DEFAULT_PLUGINS,
      ...project.projectConfig.plugins,
    };

    const plugins = await Promise.all(Object.entries(pluginDefinitions).map(([name, version]) =>
      PluginResolver.resolve(name, version)
    ));

    return new PluginCollection(new Map(plugins.map((plugin) => [plugin.data.name, plugin])))
  }

  getResourceDefinitions(): Map<string, ResourceDefinition> {
    const result = new Map<string, ResourceDefinition>();
    for (const plugin of this.plugins.values()) {
      const { resourceDefinitions } = plugin.data;
      if (!resourceDefinitions) {
        continue;
      }

      for (const [name, resourceDef] of resourceDefinitions) {
        if (result.has(name)) {
          throw new Error(`Resource definition conflict error. Two resource definitions have the same name
            ${JSON.stringify(resourceDef, null, 2)}
            ${JSON.stringify(result.get(name))}
          `,)
        }

        result.set(name, resourceDef);
      }
    }

    return result;
  }

  async getPlan(project: CompiledProject): Promise<Array<string>> {
    const result = new Array<string>();
    for (const applyable of project.getApplySequence()) {
      const plugin = this.plugins.get(applyable.pluginName);
      if (!plugin) {
        continue;
      }

      console.log('a');

      // eslint-disable-next-line no-await-in-loop
      result.push(await plugin.generateResourcePlan(applyable) as string);
    }

    return result;
  }

  async destroy(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      plugin.destroy();
    }
  }

}
