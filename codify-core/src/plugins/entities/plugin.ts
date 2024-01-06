import { Applyable } from '../../config-compiler/output-generator/entities';
import { PluginIpcBridge } from '../ipc-bridge';
import { PluginData } from './plugin-data';

export class Plugin {

  ipcBridge: PluginIpcBridge;

  // Separate out data so that the validation logic is testable.
  data: PluginData;

  constructor(data: PluginData, ipcBridge: PluginIpcBridge) {
    this.ipcBridge = ipcBridge;
    this.data = data;
  }

  static async create(directory: string, name: string, ipcBridge?: PluginIpcBridge): Promise<Plugin> {
    ipcBridge = ipcBridge ?? await PluginIpcBridge.create(directory, name);
    const resourceDefinitions = await ipcBridge.sendMessageForResult({ cmd: 'getResourceDefinitions' });

    return new Plugin(PluginData.create(directory, name, resourceDefinitions), ipcBridge);
  }

  async generateResourcePlan(applyable: Applyable): Promise<unknown> {
    return this.ipcBridge.sendMessageForResult({ cmd: 'generateResourcePlan', data: applyable.toJson() });
  }

  destroy() {
    this.ipcBridge.killPlugin();
  }
}
