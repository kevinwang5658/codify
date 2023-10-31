import * as fs from 'node:fs/promises';

import { Plugin } from './entities/plugin';

const DEFAULT_PLUGIN_REGEX = /(?<=default:).*$/g

export class PluginResolver {

  static async resolve(name: string, version: string): Promise<Plugin> {

    if (DEFAULT_PLUGIN_REGEX.test(name)) {
      return this.resolveDefaultPlugin(name, version)
    }

    throw new Error(`Unable to resolve plugin of name: ${name} and version: ${version}`)
  }

  // TODO: update this method to resolve default plugins from github in the future.
  private static async resolveDefaultPlugin(name: string, _version: string): Promise<Plugin> {
    const pluginName = name.match(DEFAULT_PLUGIN_REGEX)![0]

    const defaultPluginDir = '../plugins';
    const pluginDirFiles = await fs.readdir(defaultPluginDir);
    if (!pluginDirFiles.includes(pluginName)) {
      throw new Error(`Unable to find default plugin: ${name}`)
    }

    return Plugin.create(defaultPluginDir, pluginName);
  }

}
