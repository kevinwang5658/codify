import { Applyable } from '../../config-compiler/output-generator/entities/index.js';
import { PluginIpcBridge } from '../ipc-bridge.js';
import { InitializeResponseData, InitializeResponseDataSchema } from 'codify-schemas';
import { ajv } from '../../utils/ajv.js';

const initializeResponseValidator = ajv.compile(InitializeResponseDataSchema);

export class Plugin {

  ipcBridge?: PluginIpcBridge;

  name: string;
  path: string;
  resourceDependenciesMap = new Map<string, string[]>()

  constructor(name: string, path: string) {
    this.name = name;
    this.path = path;
  }

  async initialize(ipcBridge?: PluginIpcBridge): Promise<InitializeResponseData> {
    ipcBridge = ipcBridge ?? await PluginIpcBridge.create(this.path);
    const initializeResponse = await ipcBridge.sendMessageForResult({ cmd: 'initialize' });

    if (!this.validateInitializeResponse(initializeResponse)) {
      throw new Error();
    }

    initializeResponse.resourceDefinitions.forEach((d) => {
      this.resourceDependenciesMap.set(d.type, d.dependencies)
    });

    return initializeResponse;
  }

  async generateResourcePlan(applyable: Applyable): Promise<unknown> {
    return this.ipcBridge!.sendMessageForResult({ cmd: 'generateResourcePlan', data: applyable.toJson() });
  }

  destroy() {
    this.ipcBridge!.killPlugin();
  }

  private validateInitializeResponse(response: unknown): response is InitializeResponseData {
    if (initializeResponseValidator(response)) {
      throw new Error(`Invalid initialize response from plugin: ${this.name}. Error: ${initializeResponseValidator.errors}`)
    }

    return true;
  }
}
