import { RemoveMethods } from '../../../utils/types';
import { LoadedFile } from './file';

export class LoadedModule {
  directory!: string;
  files!: LoadedFile[];

  // TODO: Add support for sub-modules in the future
  // modules!: CodifyModule[];

  constructor(props: RemoveMethods<LoadedModule>) {
    Object.assign(this, props);
  }


}
