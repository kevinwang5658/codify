import { Project } from '../entities/project.js';
import { groupBy } from '../utils/index.js';
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

  async initialize(project: Project): Promise<Map<string, string[]>> {
    const plugins = await this.resolvePlugins(project);

    plugins.forEach((plugin) => {
      this.plugins.set(plugin.name, plugin)
    })

    const dependencyMap = await this.initializePlugins(plugins);
    return dependencyMap;
  }

  async validate(project: Project): Promise<void> {
    const { resourceConfigs } = project;
    const pluginGroupedResourceConfigs = groupBy(
        resourceConfigs,
        (item) => this.resourceToPluginMapping.get(item.type)!
    );

    const result = await Promise.all(
        Object.entries(pluginGroupedResourceConfigs).map(([pluginName, configs]) =>
            this.plugins.get(pluginName)!.validate(configs)
        )
    );

    const errorMessages = result.flat()
    if (errorMessages.length > 0) {
      throw new Error(`Config validation errors: ${JSON.stringify(errorMessages, null, 2)}`);
    }
  }

  async getPlan(project: Project): Promise<Array<string>> {
    const result = new Array<string>();
    for (const config of project.resourceConfigs) {
      const pluginName = this.resourceToPluginMapping.get(config.type);
      if (!pluginName) {
        continue;
      }

      // eslint-disable-next-line no-await-in-loop
      result.push(await this.plugins.get(pluginName)!.plan(config) as string);
    }

    return result;
  }

  async destroy(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      plugin.destroy();
    }
  }

  private async resolvePlugins(project: Project): Promise<Plugin[]> {
    const pluginDefinitions: Record<string, string> = {
      ...DEFAULT_PLUGINS,
      ...project.projectConfig.plugins,
    };

    return Promise.all(Object.entries(pluginDefinitions).map(([name, version]) =>
      PluginResolver.resolve(name, version)
    ));
  }

  private async initializePlugins(plugins: Plugin[]): Promise<Map<string, string[]>> {
    const responses = await Promise.all(
      plugins.map(async (p) => {
        const initializeResult = await p.initialize();
        return [p.name, initializeResult.resourceDefinitions] as const
      })
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
