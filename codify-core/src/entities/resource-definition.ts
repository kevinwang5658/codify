import { RemoveMethods } from '../utils/types';
import { ResourceParameter } from './resource-parameter';

export class ResourceDefinition {
  typeId!: string;
  parameters!: ResourceParameter[];

  constructor(props: RemoveMethods<ResourceDefinition>) {
    Object.assign(this, props);
  }

}
