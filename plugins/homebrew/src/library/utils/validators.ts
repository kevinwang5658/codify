import { Message } from "../ipc/entities";
import { ResourceDefinition, ResourceParameterType } from "../entities/resource-definition";

export function validateMessage(message: unknown): message is Message {
  if (!message) {
    return false;
  }

  if (typeof message !== 'object') {
    return false;
  }

  // @ts-ignore
  if (!message.cmd) {
    return false;
  }

  return true;
}

export function validateTypeRecordStringUnknown(actual: unknown): actual is Record<string, unknown> | never {
  return typeof actual === 'object';
}


export function validateResourceConfig(config: unknown, definition: ResourceDefinition): config is Record<string, unknown> {
  if (!validateTypeRecordStringUnknown(config)) {
    throw new Error('Improperly formatted config');
  }

  const { parameters: parameterDefinitions } = definition;
  for (const [key, value] of Object.entries(config)) {

    if (!parameterDefinitions[key]) {
      throw new Error(`Invalid resource parameter: ${key}`)
    }

    if (!validateResourceParameterType(value, parameterDefinitions[key]!.type)) {
      throw new Error(`Invalid parameter type: ${key}:${value} is not of type ${parameterDefinitions[key]!.type}`)
    }

    const parameter = parameterDefinitions[key]!;
    // validate value here
    if (parameter.allowedValues && !(parameter.allowedValues as Array<unknown>).includes(value)) {
      throw new Error(`Invalid resource config. Allowed values are ${parameter.allowedValues} but ${value} was provided`)
    }
  }

  return true;
}

export function validateResourceParameterType(actual: unknown, type: ResourceParameterType): boolean {

  /* eslint-disable unicorn/switch-case-braces */
  switch (type) {
    case ResourceParameterType.ARRAY:
      return validateTypeArray(actual);
    case ResourceParameterType.STRING:
      return validateTypeString(actual);
    case ResourceParameterType.BOOLEAN:
      return validateTypeBoolean(actual);
    case ResourceParameterType.NUMBER:
      return validateTypeNumber(actual);
    case ResourceParameterType.OBJECT:
      return validateTypeRecordStringUnknown(actual);
    default:
      return false;
  }
  /* eslint-enable unicorn/switch-case-braces */
}

export function validateTypeString(actual: unknown): actual is string {
  return typeof actual === 'string';
}

export function validateTypeBoolean(actual: unknown): actual is boolean {
  return typeof actual === 'boolean';
}

export function validateTypeArray(actual: unknown): actual is [] {
  return Array.isArray(actual);
}

export function validateTypeNumber(actual: unknown): actual is number {
  return typeof actual === 'number';
}
