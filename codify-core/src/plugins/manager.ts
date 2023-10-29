import { ParsedProject } from '../config-compiler/parser/entities';
import { ResourceTemplate } from '../resource/entities';
import { Plugin } from './entities/plugin';
import { PluginResolver } from './resolver';

type PluginName = string;

const DEFAULT_PLUGINS = {
  'default:homebrew': 'latest',
  'default:node': 'latest',
}

export class PluginsManager {

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

  async getResources(): Promise<ResourceTemplate[]> {
    return [];
  }

  async destroyPlugins(): Promise<void> {

  }

}
