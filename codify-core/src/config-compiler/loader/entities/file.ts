import { RemoveMethods } from '../../../utils/types';

export class LoadedFile {
  contents!: string;
  fileName!: string;
  fileType!: string;

  constructor(props: RemoveMethods<LoadedFile>) {
    Object.assign(this, props);
  }

}
