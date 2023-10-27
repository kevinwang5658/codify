import { RemoveMethods } from '../../../utils/types';
import {
  validateAllowedObjectKeys,
  validateNameString,
  validateSemver,
  validateStringEq,
  validateTypeRecordStringString,
  validateTypeRecordStringUnknown,
  validateTypeString,
  validateUrl
} from '../../../utils/validator';
import { ConfigBlock, ConfigBlockType } from './index';

/** Project JSON supported format
 * {
 *   "type": "project",
 *   "name?": "optional-name"
 *   "plugins?": {
 *     "plguin1": "^10.6.2", // From registry
 *     "https://www.github.com/project": "^10.3.2", // url
 *   }
 * }
 */

const ALLOWED_KEYS = [
  'type',
  'name',
  'plugins'
]

export class ProjectConfig implements ConfigBlock {
  configType = ConfigBlockType.PROJECT;

  name?: string;
  plugins?: Record<string, string>;

  constructor(config: unknown) {
    if (this.validate(config)) {
      this.name = config.name;
      this.plugins = config.plugins;
    }
  }

  validate(config: unknown): config is RemoveMethods<ProjectConfig> {
    if (!validateTypeRecordStringUnknown(config)) {
      throw new Error('Config is not an object');
    }

    if (!validateAllowedObjectKeys(config, ALLOWED_KEYS)) {
      throw new Error('Config has invalid keys');
    }

    if (!validateStringEq(config.type, 'project')) {
      throw new Error('Config is not of type project');
    }

    if (config.name && !validateNameString(config.name)) {
      throw new Error('Name must be of type string, start with a letter, and only contain [a-z][0-9]_-');
    }

    if (config.plugins && !validateTypeRecordStringString) {
      throw new Error('Plugin is not of type Record<string, string>');
    }

    if (config.plugins && !Object.keys(config.plugins).map((k) =>
      validateUrl(k) || validateTypeString(k),
    ).every(Boolean)) {
      throw new Error('Plugins must be either package name or url');
    }

    if (config.plugins && !Object.values(config.plugins).map((v) =>
      validateSemver(v)
    ).every(Boolean)) {
      throw new Error('Plugin versions must be proper semvers');
    }

    return true;
  }
}
