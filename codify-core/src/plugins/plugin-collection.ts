import { CompiledProject } from '../config-compiler/output-generator/entities/compiled-project.js';
import { ParsedProject } from '../config-compiler/parser/entities/parsed-project.js';
import { Plugin } from './entities/plugin.js';
import { PluginResolver } from './resolver.js';

type PluginName = string;

const DEFAULT_PLUGINS = {
  'default': 'latest',
  // 'default:node': 'latest',
}

export class PluginCollection {

  private plugins = new Map<PluginName, Plugin>()
  private resourceToPluginMapping = new Map<string, string>()
  private pluginToResourceMapping = new Map<string, string[]>()

  async initialize(project: ParsedProject): Promise<Map<string, string[]>> {
    const plugins = await this.resolvePlugins(project);

    plugins.forEach((plugin) => {
      this.plugins.set(plugin.name, plugin)
    })

    const dependencyMap = await this.initializePlugins(plugins);
    return dependencyMap;
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

  private async resolvePlugins(project: ParsedProject): Promise<Plugin[]> {
    const pluginDefinitions: Record<string, string> = {
      ...DEFAULT_PLUGINS,
      ...project.projectConfig.plugins,
    };

    return await Promise.all(Object.entries(pluginDefinitions).map(([name, version]) =>
      PluginResolver.resolve(name, version)
    ));
  }

  private async initializePlugins(plugins: Plugin[]): Promise<Map<string, string[]>> {
    const responses = await Promise.all(
      plugins.map(async (p) => [p.name, (await p.initialize()).resourceDefinitions] as const)
    );

    const resourceMap = new Map<string, string[]>;

    for (const [pluginName, definitions] of responses) {
      for (const definition of definitions) {
        // Build resource to plugin mapping
        if (this.resourceToPluginMapping.has(definition.type)) {
          throw new Error(`Duplicated types between plugin ${this.resourceToPluginMapping.get(definition.type)} and ${pluginName}`)
        }
        this.resourceToPluginMapping.set(definition.type, pluginName);

        // Build plugin to resource mapping
        if (!this.pluginToResourceMapping.has(pluginName)) {
          this.pluginToResourceMapping.set(pluginName, []);
        }
        this.pluginToResourceMapping.get(pluginName)!.push(definition.type);

        // Build resource dependency map
        if (resourceMap.has(definition.type)) {
          throw new Error(`Duplicated types between plugins ${this.resourceToPluginMapping.get(definition.type)} and ${pluginName}`);
        }
        resourceMap.set(definition.type, definition.dependencies)
      }
    }

    return resourceMap;
  }

}
