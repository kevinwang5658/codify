import { RemoveMethods } from '../../../utils/types.js';
import { ProjectConfig } from './configs/project.js';
import { ParsedModule } from './parsed-module.js';

export class ParsedProject {
  coreModule!: ParsedModule;
  projectConfig!: ProjectConfig;

  constructor(props: RemoveMethods<ParsedProject>) {
    Object.assign(this, props)
  }

  // TODO: Implement this when adding multi-modules
  getModuleTree(): ParsedModule {
    return this.coreModule;
  }
}
