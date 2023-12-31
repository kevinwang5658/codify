import { RemoveMethods } from '../../../../utils/types';
import { validateNameString, validateTypeRecordStringUnknown, validateTypeString, } from '../../../../utils/validator';
import { ConfigClass } from '../../../language-definition';
import { ConfigBlock } from '../index';

/** Resource JSON supported format
 * {
 *   "type": "plugin_name_resource_1",
 *   "name?": "optional-name"
 *   "parameter1": {
 *     "plguin1": "^10.6.2", // From registry
 *     "https://www.github.com/project": "^10.3.2", // url
 *   }
 *   "parameter2": "string",
 *   "parameter3": 1,
 * }
 *
 * We won't be able to validate the parameters until we get the resource definitions from the plugins
 */

export class ResourceConfig implements ConfigBlock {
  readonly configClass = ConfigClass.RESOURCE;

  type: string;
  name?: string;
  pluginName?: string;
  parameters: Record<string, unknown>;

  constructor(config: unknown) {
    if (this.validateConfig(config)) {
      const { name, type, ...parameters } = config;
      this.type = type;
      this.name = name;
      this.parameters = parameters ?? {};

      return;
    }

    throw new Error('Unable to parse resource config');
  }

  validateConfig(config: unknown): config is RemoveMethods<ResourceConfig> {
    if (!validateTypeRecordStringUnknown(config)) {
      throw new Error('Config is not an object');
    }

    if (!validateTypeString(config.type)) {
      throw new Error('Config type is not specified');
    }

    if (config.name && !validateNameString(config.name)) {
      throw new Error('Name must be of type string, start with a letter, and only contain a-z0-9_-');
    }

    return true;
  }

  get id() {
    return this.name === null || this.name === undefined ? this.type : `${this.type}.${this.name}`;
  }
}
