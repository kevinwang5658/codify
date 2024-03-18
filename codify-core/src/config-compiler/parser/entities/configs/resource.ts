import { ResourceSchema } from 'codify-schemas';

import { RemoveMethods } from '../../../../utils/types.js';
import { ajv, } from '../../../../utils/validator.js';
import { ConfigClass } from '../../../language-definition.js';
import { ConfigBlock } from '../index.js';

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

const validate = ajv.compile(ResourceSchema);

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
    if (!validate(config)) {
      throw new Error(`Invalid project config: ${JSON.stringify(validate.errors, null, 2)}`)
    }

    return true;
  }

  get id() {
    return this.name === null || this.name === undefined ? this.type : `${this.type}.${this.name}`;
  }
}
