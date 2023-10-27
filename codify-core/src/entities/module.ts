import { RemoveMethods } from '../utils/types';
import { Node } from './node';

export class Module {
  nodes!: Node[];

  constructor(props: RemoveMethods<Module>) {
    Object.assign(this, props);
  }
}
