import { ConfigClass } from '../../language-definition';

export interface ConfigBlock {
  configClass: ConfigClass;

  validateConfig(config: unknown): never | void;
}
