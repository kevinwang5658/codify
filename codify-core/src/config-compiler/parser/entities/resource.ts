import { RemoveMethods } from '../../../utils/types';
import { ConfigBlock, ConfigBlockType } from './index';

export class ResourceConfig implements ConfigBlock {
  readonly configType = ConfigBlockType.RESOURCE;

  type!: string;
  name?: string;
  parameters!: Record<string, unknown>;
  dependencies?: Node[] = [];

  constructor(props: Omit<RemoveMethods<ResourceConfig>, 'configType'>) {
    Object.assign(this, props);
  }

  validate(config: unknown): void {
    console.log(config);
  }

}
