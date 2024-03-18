import { RemoveMethods } from '../../../../utils/types.js'
import { ConfigClass } from '../../../language-definition.js';
import { ConfigBlock } from '../index.js';

export class PluginConfig implements ConfigBlock {
  configClass = ConfigClass.PLUGIN;

  parameters!: Record<string, unknown>;

  constructor(props: Omit<RemoveMethods<PluginConfig>, 'configClass'>) {
    Object.assign(this, props)
  }

  validateConfig(config: unknown): void {
    console.log(config);
  }

}
