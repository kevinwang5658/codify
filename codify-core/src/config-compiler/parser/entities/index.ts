import { RemoveMethods } from '../../../utils/types';
import { ProjectConfig } from './project';

export enum ConfigBlockType {
  PLUGIN = 'plugin',
  PROJECT = 'project',
  RESOURCE = 'resource',
}

export interface ConfigBlock {
  configType: ConfigBlockType;
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
