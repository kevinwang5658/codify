import { ParsedProject } from '../config-compiler/parser/entities';
import { ResourceDefinition } from '../entities/resource-definition';
import { Plugin } from './entities/plugin';
import { PluginIpcBridge } from './ipc-bridge';
import { PluginResolver } from './resolver';

type PluginName = string;

const DEFAULT_PLUGINS = {
  'default:homebrew': 'latest',
  // 'default:node': 'latest',
}

export class PluginCollection {

  private plugins: Map<PluginName, Plugin> = new Map();

  async initializePlugins(project: ParsedProject): Promise<void> {
    const pluginDefinitions = {
      ...DEFAULT_PLUGINS,
      ...project.projectConfig.plugins,
    };

    const pluginResolver = new PluginResolver();
    const plugins = await Promise.all(Object.entries(pluginDefinitions).map(([name, version]) =>
      pluginResolver.resolve(name, version)
    ));

    for (const u of plugins) {
      this.plugins.set(u.name, u);
    }
  }

  async getAllResourceDefinitions(): Promise<Map<string, ResourceDefinition>> {
    const result = new Map<string, ResourceDefinition>();
    for (const plugin of this.plugins.values()) {
      const { resourceDefinitions } = plugin;
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

  async killPlugins(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      PluginIpcBridge.killPlugin(plugin);
    }
  }

}
