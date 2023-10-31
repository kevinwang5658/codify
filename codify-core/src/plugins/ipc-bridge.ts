import { ChildProcess, fork } from 'node:child_process';

import { config } from '../project-configs';
import { validateTypeRecordStringUnknown } from '../utils/validator';
import { PluginMessage } from './entities/message';

export class PluginIpcBridge {

  process: ChildProcess;

  constructor(process: ChildProcess) {
    this.process = process;
  }

  static async create(directory: string, name: string): Promise<PluginIpcBridge> {
    const process = await fork(
      directory + '/' + name + config.defaultPluginEntryPoint,
      [],
      { execArgv: ['-r', 'ts-node/register'], silent: true },
    );

    return new PluginIpcBridge(process);
  }

  killPlugin(): void {
    this.process.kill();
  }

  async sendMessageForResult(message: PluginMessage): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.process.kill();
        reject(new Error(`Plugin did not respond in 10s to call: ${message.cmd}`))
      }, 10_000);

      const errorListener = (error: Buffer) => {
        this.process.kill();
        reject(error.toString());
      }

      const messageListener = (incomingMessage: unknown) => {
        console.log(incomingMessage);

        if (!validateTypeRecordStringUnknown(incomingMessage)) {
          return reject(new Error(`Bad message from plugin ${name}. ${JSON.stringify(incomingMessage, null, 2)}`))
        }

        if (incomingMessage.cmd === this.getResultFunctionName(message.cmd)) {
          clearTimeout(timer);
          this.process.removeListener('message', messageListener);
          this.process.removeListener('error', errorListener);
          resolve(incomingMessage.data);
        }
      };

      this.process.on('message', messageListener);
      this.process.stderr!.on('data', errorListener);
      this.process.send(message);
    });
  }

  sendMessage(message: PluginMessage): void {
    this.process.send(message);
  }

  private getResultFunctionName(rpcFunctionName: string): string {
    return rpcFunctionName + 'Result';
  }

}
