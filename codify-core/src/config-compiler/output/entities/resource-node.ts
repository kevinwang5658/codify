import { RemoveMethods } from '../../../utils/types';
import { ResourceConfig } from '../../parser/entities/configs/resource';

export class ResourceNode {
  dependencies!: ResourceNode[];
  id!: string;
  resource!: ResourceConfig;

  constructor(props: RemoveMethods<ResourceNode>) {
    Object.assign(this, props);
  }

  static fromResource(config: ResourceConfig) {
    return new ResourceNode({
      dependencies: [],
      id: config.id,
      resource: config,
    })
  }
}
