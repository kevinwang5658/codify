import { ConfigClass } from '../../language-definition.js';

export interface ConfigBlock {
  configClass: ConfigClass;

  validateConfig(config: unknown): never | void;
}
