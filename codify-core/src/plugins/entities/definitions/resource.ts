import { InternalError } from '../../../utils/errors';
import { RemoveMethods } from '../../../utils/types';
import {
  validateAllowedObjectKeys,
  validateNameString,
  validateTypeRecordStringUnknown,
} from '../../../utils/validator';
import { ResourceParameterDefinition } from './resource-parameter';

type Name = string;
export type ResourceDefinitions = Map<Name, ResourceDefinition>

/**
 * Example json def:
 * {
 *   "name": "plugin_name_resource_one"
 *   "parameters: {
 *     "parameter1": {
 *       "type": "number",
 *       "minNumberValue": 0,
 *     }
 *     "parameter2": "string",
 *   }
 * }
 */
export class ResourceDefinition {
  name!: string;
  parameters!: Map<Name, ResourceParameterDefinition>;
  pluginName!: string;

  constructor(props: RemoveMethods<ResourceDefinition>) {
    Object.assign(this, props);
  }

  static fromJson(pluginName: string, json: unknown): ResourceDefinition {
    if (this.validateDefinition(json)) {
      const entries = Object.entries(json.parameters).map(([name, value]) => {
        const resourceParameterDefinition = ResourceParameterDefinition.fromJson(name, value);

        return [name, resourceParameterDefinition] as const;
      })

      const parametersMap = new Map(entries);
      return new ResourceDefinition({ name: `${pluginName}_${json.name}`, parameters: parametersMap, pluginName })
    }

    throw new InternalError('Unable to parse resource definition');
  }

  private static validateDefinition(json: unknown): json is { name: string; parameters: Record<string, unknown> } {
    if (!validateTypeRecordStringUnknown(json)) {
      throw new Error(`Unable to validate definition is type object ${json}`);
    }

    if (!validateAllowedObjectKeys(json, ['name', 'parameters'])) {
      throw new Error(`Only keys name and parameters is allowed. ${json}`);
    }

    if (!validateNameString(json.name)) {
      throw new Error(`Unable find definition name. ${json}`);
    }

    if (!validateTypeRecordStringUnknown(json.parameters)) {
      throw new Error(`Unable to parse parameters. ${json}`);
    }

    return true;
  }

}
