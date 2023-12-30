import { RemoveMethods } from '../../../../utils/types'
import { ConfigClass } from '../../../language-definition';
import { ConfigBlock } from '../index';

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
