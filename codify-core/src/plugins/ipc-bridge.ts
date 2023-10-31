import * as ChildProcess from 'node:child_process';

import { config } from '../project-configs';
import { validateTypeRecordStringUnknown } from '../utils/validator';
import { PluginMessage } from './entities/message';
import { Plugin } from './entities/plugin';

export class PluginIpcBridge {

  static async initializePlugin(directory: string, name: string): Promise<Plugin> {
    const childProcess = ChildProcess.fork(
      directory + '/' + name + config.defaultPluginEntryPoint,
      [],
      { execArgv: ['-r', 'ts-node/register'], silent: true },
    );
    const plugin = new Plugin(directory, name, childProcess);

    childProcess.stdout!.on('data', (data) => {
      console.log(data.toString());
    });

    childProcess.stderr!.on('data', (data) => {
      console.log(data.toString());
    })

    await this.initializeResourceDefinitions(plugin);

    return plugin;
  }

  static async initializeResourceDefinitions(plugin: Plugin): Promise<void> {
    const resourceDefinitions = await this.sendMessageForResult(plugin, { cmd: 'getResourceDefinitions' });
    plugin.setResourceDefinitions(resourceDefinitions);
  }

  static killPlugin(plugin: Plugin): void {
    plugin.process.kill();
  }

  private static async sendMessageForResult(plugin: Plugin, message: PluginMessage): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        plugin.process.kill();
        reject(new Error(`Plugin did not respond in 10s to call: ${message.cmd}`))
      }, 10_000);

      const errorListener = (error: Buffer) => {
        plugin.process.kill();
        reject(error.toString());
      }

      const messageListener = (incomingMessage: unknown) => {
        console.log(incomingMessage);

        if (!validateTypeRecordStringUnknown(incomingMessage)) {
          return reject(new Error(`Bad message from plugin ${plugin.name}. ${JSON.stringify(incomingMessage, null, 2)}`))
        }

        if (incomingMessage.cmd === this.getResultFunctionName(message.cmd)) {
          clearTimeout(timer);
          plugin.process.removeListener('message', messageListener);
          plugin.process.removeListener('error', errorListener);
          resolve(incomingMessage.data);
        }
      };

      plugin.process.on('message', messageListener);
      plugin.process.stderr!.on('data', errorListener);
      plugin.process.send(message);
    });
  }

  private sendMessage(plugin: Plugin, message: PluginMessage): void {
    plugin.process.send(message);
  }

  private static getResultFunctionName(rpcFunctionName: string): string {
    return rpcFunctionName + 'Result';
  }

}
