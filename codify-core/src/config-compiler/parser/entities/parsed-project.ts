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

  validateWithResourceMap(resourceMap: Map<string, string[]>) {
    const invalidConfigs = this.coreModule.configBlocks.filter((c) => resourceMap.get(c.type));
    if (invalidConfigs.length > 0) {
      throw new Error(`Unknown types specified: ${JSON.stringify(invalidConfigs, null, 2)}`);
    }
  }
}
