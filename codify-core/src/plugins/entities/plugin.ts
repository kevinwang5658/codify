import { Applyable } from '../../config-compiler/output-generator/entities/index.js';
import { PluginIpcBridge } from '../ipc-bridge.js';
import { PluginData } from './plugin-data.js';

export class Plugin {

  ipcBridge?: PluginIpcBridge;

  // Separate out data so that the validation logic is testable.
  data: PluginData;

  constructor(data: PluginData) {
    this.data = data;
  }

  async initialize(ipcBridge?: PluginIpcBridge): Promise<unknown> {
    ipcBridge = ipcBridge ?? await PluginIpcBridge.create(this.data.directory);
    const resourceList = await ipcBridge.sendMessageForResult({ cmd: 'initialize' });

    this.data.resourceDefinitions = resourceList as any;
    return resourceList;
  }

  async generateResourcePlan(applyable: Applyable): Promise<unknown> {
    return this.ipcBridge!.sendMessageForResult({ cmd: 'generateResourcePlan', data: applyable.toJson() });
  }

  destroy() {
    this.ipcBridge!.killPlugin();
  }
}
