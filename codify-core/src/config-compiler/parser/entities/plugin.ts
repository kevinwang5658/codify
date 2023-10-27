import { RemoveMethods } from '../../../utils/types'
import { ConfigBlock, ConfigBlockType } from './index';

export class PluginConfig implements ConfigBlock {
  configType = ConfigBlockType.PLUGIN;

  parameters!: Record<string, unknown>;

  constructor(props: Omit<RemoveMethods<PluginConfig>, 'configType'>) {
    Object.assign(this, props)
  }

}
