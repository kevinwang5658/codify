import { RemoveMethods } from '../utils/types';
import { Node } from './node';
import { ResourceNode } from './resource-node';

export class PluginNode implements Node {
  source!: string;
  name!: string;
  metadata!: Record<string, unknown>;
  dependencies!: ResourceNode[];

  constructor(props: RemoveMethods<PluginNode>) {
    Object.assign(this, props)
  }

}
