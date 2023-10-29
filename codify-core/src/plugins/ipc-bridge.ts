import * as ChildProcess from 'node:child_process';

import { config } from '../project-configs';
import { Plugin } from './entities/plugin';

export class PluginIpcBridge {

  static async initializePlugin(directory: string, name: string): Promise<Plugin> {
    const childProcess = ChildProcess.fork(location + config.defaultPluginEntryPoint);
    const plugin = new Plugin(directory, name, childProcess);
    await this.initializeResourceDefinitions(plugin);

    return plugin;
  }

  static async initializeResourceDefinitions(plugin: Plugin): Promise<void> {
    const resourceDefinitions = await this.sendMessageForResult(plugin, 'getResourceDefinitions');
    plugin.setResourceDefinitions(resourceDefinitions);
  }

  private static async sendMessageForResult(plugin: Plugin, rpcFunctionName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error(`Plugin did respond in 10s to call: ${rpcFunctionName}`)), 10_000);
      plugin.process.on(this.getResultFunctionName(rpcFunctionName), (message) => {
        resolve(message);
      });

      plugin.process.send(rpcFunctionName);
    });
  }

  private static getResultFunctionName(rpcFunctionName: string): string {
    return rpcFunctionName + 'Result';
  }

}
