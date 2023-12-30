import { ConfigClass } from '../config-compiler/language-definition';
import { ResourceConfig } from '../config-compiler/parser/entities/configs/resource';
import { ParsedProject } from '../config-compiler/parser/entities/parsed-project';
import { ResourceDefinition } from '../entities/resource-definition';
import { Plugin } from './entities/plugin';
import { PluginResolver } from './resolver';

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
    const pluginDefinitions = {
      ...DEFAULT_PLUGINS,
      ...project.projectConfig.plugins,
    };

    const plugins = await Promise.all(Object.entries(pluginDefinitions).map(([name, version]) =>
      PluginResolver.resolve(name, version)
    ));

    return new PluginCollection(new Map(plugins.map((plugin) => [plugin.data.name, plugin])))
  }

  getAllResourceDefinitions(): Map<string, ResourceDefinition> {
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

  async getPlan(project: ParsedProject): Promise<Array<string>> {
    const result = new Array<string>();
    for (const config of project.coreModule.configBlocks) {
      if (config.configClass !== ConfigClass.RESOURCE) {
        continue;
      }

      const { pluginName } = (config as ResourceConfig);
      if (!pluginName) {
        continue;
      }

      const plugin = this.plugins.get(pluginName);
      if (!plugin) {
        continue;
      }

      result.push(await plugin.generateResourcePlan(config as ResourceConfig) as string);
    }

    return result;
  }

  async destroy(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      plugin.destroy();
    }
  }

}
