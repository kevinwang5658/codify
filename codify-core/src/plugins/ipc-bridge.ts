import { ChildProcess, fork } from 'node:child_process';

import { config } from '../project-configs/index.js';
import { validateTypeRecordStringUnknown } from '../utils/validator.js';
import { PluginMessage } from './entities/message.js';

type Resolve = (value: unknown) => void;
type Reject = (reason?: Error) => void;

const resultFunctionName = (cmd: string) => `${cmd}_Result`;

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

    process.stdout!.on('data', (message) => console.log(message.toString()));
    process.stderr!.on('data', (message) => console.log(message.toString()));


    return new PluginIpcBridge(process);
  }

  killPlugin(): void {
    this.process.kill();
  }

  async sendMessageForResult(message: PluginMessage): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const handler = new SendMessageForResultHandler(message, this.process, resolve, reject);

      this.process.on('message', handler.messageListener);
      this.process.stderr!.on('data', handler.reject);
      this.process.send(message);
    });
  }

  sendMessage(message: PluginMessage): void {
    this.process.send(message);
  }
}

class SendMessageForResultHandler {
  messageToSend: PluginMessage;
  process: ChildProcess;
  promiseResolve: Resolve;
  promiseReject: Reject;
  timer: NodeJS.Timeout;

  constructor(messageToSend: PluginMessage, process: ChildProcess, resolve: Resolve, reject: Reject) {
    this.messageToSend = messageToSend;
    this.process = process;
    this.promiseResolve = resolve;
    this.promiseReject = reject;
    this.timer = this.setResultTimeout();
  }

  messageListener = (incomingMessage: unknown) => {
    console.log(incomingMessage);

    if (!validateTypeRecordStringUnknown(incomingMessage)) {
      return this.reject(new Error(`Bad message from plugin. ${JSON.stringify(incomingMessage, null, 2)}`))
    }

    if (incomingMessage.cmd === resultFunctionName(this.messageToSend.cmd)) {
      this.resolve(incomingMessage.data);
    }
  };

  reject = (err: Error) => {
    if (this.timer.hasRef()) {
      clearTimeout(this.timer);
    }

    this.process.removeListener('message', this.messageListener);
    this.process.stderr!.removeListener('data', this.reject);
    this.promiseReject(err);
  }

  private resolve = (value: unknown) => {
    if (this.timer.hasRef()) {
      clearTimeout(this.timer);
    }

    this.process.removeListener('message', this.messageListener);
    this.process.stderr!.removeListener('data', this.reject);
    this.promiseResolve(value);
  }

  private setResultTimeout = () => setTimeout(() => {
    this.reject(new Error(`Plugin did not respond in 10s to call: ${this.messageToSend.cmd}`))
  }, 10_000);
}

