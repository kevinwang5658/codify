import { RemoveMethods } from '../../../utils/types';
import { validateNameString, validateStringEq, validateTypeRecordStringUnknown, } from '../../../utils/validator';
import { ConfigBlockType } from '../../language-definition';
import { ConfigBlock } from './index';

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
  readonly configType = ConfigBlockType.RESOURCE;

  type: string;
  name?: string;
  parameters: Record<string, unknown>;
  dependencies?: Node[] = [];

  constructor(config: unknown) {
    if (this.validate(config)) {
      const { name, type, ...params } = config;
      this.type = type;
      this.name = name;
      this.parameters = params ?? {};
    }

    throw new Error('Unable to parse resource config');
  }

  validate(config: unknown): config is RemoveMethods<ResourceConfig> {
    if (!validateTypeRecordStringUnknown(config)) {
      throw new Error('Config is not an object');
    }

    if (!validateStringEq(config.type, 'project')) {
      throw new Error('Config is not of type project');
    }

    if (config.name && !validateNameString(config.name)) {
      throw new Error('Name must be of type string, start with a letter, and only contain a-z0-9_-');
    }

    return true;
  }

}
