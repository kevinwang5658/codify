import type { ChildProcess } from 'node:child_process';

import { PluginIpcBridge } from '../ipc-bridge';
import { PluginData } from './plugin-data';

export class Plugin {

  process: ChildProcess;
  ipcBridge: PluginIpcBridge;

  // Separate out data so that the validation logic is testable.
  data: PluginData;

  constructor(data: PluginData, process: ChildProcess, ipcBridge: PluginIpcBridge = new PluginIpcBridge()) {
    this.process = process;
    this.ipcBridge = ipcBridge;
    this.data = data;
  }

  static async create(directory: string, name: string, ipcBridge: PluginIpcBridge = new PluginIpcBridge()): Promise<Plugin> {
    const process = await ipcBridge.createProcess(directory, name);
    const resourceDefinitions = await ipcBridge.sendMessageForResult(process, { cmd: 'getResourceDefinitions' });

    return new Plugin(PluginData.create(directory, name, resourceDefinitions), process);
  }

  destroy() {
    this.ipcBridge.killPlugin(this.process);
  }
}
