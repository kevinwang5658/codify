import { ConfigClass } from '../../language-definition.js';

export interface ConfigBlock {
  type: string;
  configClass: ConfigClass;

  validateConfig(config: unknown): never | void;
}
