import { RemoveMethods } from '../../../utils/types';
import { ConfigBlock } from './index';

export class ParsedModule {
  configBlocks!: ConfigBlock[];

  constructor(props: RemoveMethods<ParsedModule>) {
    Object.assign(this, props);
  }
}
