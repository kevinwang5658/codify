import { RemoveMethods } from '../../../utils/types.js';
import { ConfigBlock } from './index.js';

export class ParsedModule {
  configBlocks!: ConfigBlock[];

  constructor(props: RemoveMethods<ParsedModule>) {
    Object.assign(this, props);
  }
}
