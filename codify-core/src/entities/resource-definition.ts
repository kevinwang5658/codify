import { RemoveMethods } from '../utils/types';
import { validateAllowedObjectKeys, validateNameString, validateTypeRecordStringUnknown, } from '../utils/validator';
import { ResourceParameterDefinition } from './resource-parameter';

type Name = string;

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

  constructor(props: RemoveMethods<ResourceDefinition>) {
    Object.assign(this, props);
  }

  static fromJson(json: unknown): ResourceDefinition {
    if (this.validateDefinition(json)) {
      const entries = Object.entries(json.parameters).map(([name, value]) => {
        const resourceParameterDefinition = ResourceParameterDefinition.fromJson(name, value);

        return [name, resourceParameterDefinition] as const;
      })

      const parametersMap = new Map(entries);
      return new ResourceDefinition({ name: json.name, parameters: parametersMap })
    }

    throw new Error('Unable to parse resource definition');
  }

  private static validateDefinition(json: unknown): json is { name: string; parameters: Record<string, unknown> } {
    if (!validateTypeRecordStringUnknown(json)) {
      return false;
    }

    if (!validateAllowedObjectKeys(json, ['name', 'parameters'])) {
      return false;
    }

    if (!validateNameString(json.name)) {
      return false;
    }

    if (!validateTypeRecordStringUnknown(json.parameters)) {
      return false;
    }

    return true;
  }

}
