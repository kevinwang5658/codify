import { ResourceParameterType } from '../../../config-compiler/language-definition.js';
import { ResourceParameter } from '../../../config-compiler/output-generator/entities/resource-parameter.js';
import { RemoveMethods } from '../../../utils/types.js';
import {
  validateAllowedObjectKeys,
  validateTypeNumber,
  validateTypeRecordStringString,
  validateTypeResourceParameterType
} from '../../../utils/validator.js';

/**
 * Resource parameter defintiion can be either a resource parameter type or an object with additional definitions.
 * Ex.
 * "version": "number"
 * OR
 * "version": {
 *   "type": "number",
 *   "minNumberValue": 10
 * }
 */

export class ResourceParameterDefinition {
  name!: string;
  type!: ResourceParameterType
  allowedValues?: ResourceParameter | ResourceParameter[];
  minNumberValue?: number;
  maxNumberValue?: number;

  constructor(props: RemoveMethods<ResourceParameterDefinition>) {
    Object.assign(this, props);
  }

  static fromJson(name: string, value: unknown): ResourceParameterDefinition {
    if (this.validateTypeOnlyDefinition(value)) {
      return new ResourceParameterDefinition({ name, type: value });
    }

    if (this.validateObjectDefinition(value)) {
      return new ResourceParameterDefinition({ ...value, name });
    }

    throw new Error('Unable to parse resource definition');
  }

  private static validateTypeOnlyDefinition(value: unknown): value is ResourceParameterType {
    return validateTypeResourceParameterType(value);
  }

  private static validateObjectDefinition(value: unknown): value is RemoveMethods<ResourceParameterDefinition> {
    if (!validateTypeRecordStringString(value)) {
      return false;
    }

    if (!validateAllowedObjectKeys(value, ['name', 'type', 'allowedValues', 'minNumberValue', 'maxNumberValue'])) {
      return false;
    }

    if (!validateTypeResourceParameterType(value.type)) {
      return false;
    }

    if (value.minNumberValue && !validateTypeNumber(value.minNumberValue)) {
      return false;
    }

    if (value.maxNumberValue && validateTypeNumber(value.maxNumberValue)) {
      return false;
    }

    return true;
  }
}
