import { RemoveMethods } from '../../../utils/types';
import { ProjectConfig } from './configs/project';
import { ParsedModule } from './parsed-module';

export class ParsedProject {
  coreModule!: ParsedModule;
  projectConfig!: ProjectConfig;

  constructor(props: RemoveMethods<ParsedProject>) {
    Object.assign(this, props)
  }
}
