import { ChildProcess, fork } from 'node:child_process';

import { config } from '../project-configs';
import { validateTypeRecordStringUnknown } from '../utils/validator';
import { PluginMessage } from './entities/message';

export class PluginIpcBridge {

  async createProcess(directory: string, name: string): Promise<ChildProcess> {
    return fork(
      directory + '/' + name + config.defaultPluginEntryPoint,
      [],
      { execArgv: ['-r', 'ts-node/register'], silent: true },
    );
  }

  killPlugin(process: ChildProcess): void {
    process.kill();
  }

  async sendMessageForResult(process: ChildProcess, message: PluginMessage): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        process.kill();
        reject(new Error(`Plugin did not respond in 10s to call: ${message.cmd}`))
      }, 10_000);

      const errorListener = (error: Buffer) => {
        process.kill();
        reject(error.toString());
      }

      const messageListener = (incomingMessage: unknown) => {
        console.log(incomingMessage);

        if (!validateTypeRecordStringUnknown(incomingMessage)) {
          return reject(new Error(`Bad message from plugin ${name}. ${JSON.stringify(incomingMessage, null, 2)}`))
        }

        if (incomingMessage.cmd === this.getResultFunctionName(message.cmd)) {
          clearTimeout(timer);
          process.removeListener('message', messageListener);
          process.removeListener('error', errorListener);
          resolve(incomingMessage.data);
        }
      };

      process.on('message', messageListener);
      process.stderr!.on('data', errorListener);
      process.send(message);
    });
  }

  sendMessage(process: ChildProcess, message: PluginMessage): void {
    process.send(message);
  }

  private getResultFunctionName(rpcFunctionName: string): string {
    return rpcFunctionName + 'Result';
  }

}
