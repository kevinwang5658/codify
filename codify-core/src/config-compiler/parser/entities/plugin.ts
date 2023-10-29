import { RemoveMethods } from '../../../utils/types'
import { ConfigBlockType } from '../../language-definition';
import { ConfigBlock } from './index';

export class PluginConfig implements ConfigBlock {
  configType = ConfigBlockType.PLUGIN;

  parameters!: Record<string, unknown>;

  constructor(props: Omit<RemoveMethods<PluginConfig>, 'configType'>) {
    Object.assign(this, props)
  }

  validate(config: unknown): void {
    console.log(config);
  }

}
