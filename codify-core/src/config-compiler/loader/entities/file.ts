import { Validatable } from '../../../entities';
import { RemoveMethods } from '../../../utils/types';

export class LoadedFile implements Validatable {
  contents!: string;
  fileName!: string;
  fileType!: string;

  constructor(props: RemoveMethods<LoadedFile>) {
    Object.assign(this, props);
  }

  validate(): Promise<boolean> {
    return Promise.resolve(true);
  }

}
