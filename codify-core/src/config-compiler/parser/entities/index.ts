import { RemoveMethods } from '../../../utils/types';
import { ConfigBlockType } from '../../language-definition';
import { ProjectConfig } from './project';

export interface ConfigBlock {
  configType: ConfigBlockType;

  validate(config: unknown): never | void;
}

export class ParsedProject {
  coreModule!: ParsedModule;
  projectConfig!: ProjectConfig;

  constructor(props: RemoveMethods<ParsedProject>) {
    Object.assign(this, props)
  }
}

export class ParsedModule {
  configBlocks!: ConfigBlock[];

  constructor(props: RemoveMethods<ParsedModule>) {
    Object.assign(this, props);
  }
}
