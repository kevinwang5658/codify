export interface ResourceDefinition {
  name: string;
  parameters: Record<string, ResourceParameterDefinition>;
}

type ResourceParameter = [] | boolean | null | number | object | string


export interface ResourceParameterDefinition {
  name: string;
  type: ResourceParameterType
  allowedValues?: ResourceParameter | ResourceParameter[];
  minNumberValue?: number;
  maxNumberValue?: number;
}

export enum ResourceParameterType {
  ARRAY = 'array',
  BOOLEAN = 'boolean',
  NULL = 'null',
  NUMBER = 'number',
  OBJECT = 'object',
  STRING = 'string',
}
