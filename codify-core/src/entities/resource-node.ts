import { RemoveMethods } from '../utils/types';
import { Node } from './node';
import { ResourceParameter } from './resource-parameter';

export class ResourceNode implements Node {
  type!: string;
  name!: string;
  metadata?: Record<string, unknown>;
  parameters!: ResourceParameter[];
  dependencies!: Node[];

  constructor(props: RemoveMethods<ResourceNode>) {
    Object.assign(this, props);
  }

  static create(type: string, name?: string) {
    return new ResourceNode({
      dependencies: [],
      name: name ?? 'default',
      parameters: [],
      type,
    })
  }

}
