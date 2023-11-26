import { Resource } from "./resource";

export enum PlanOperation {
  NO_CHANGE = 'no_change',
  ADD = 'add',
  DELETE = 'delete',
  MODIFY = 'modify'
}

export interface ResourcePlan {
  resourceName: string;
  operation: PlanOperation;

  parameters: Array<ResourceParameterPlan>;
}

export interface ResourceParameterPlan {
  parameterName: string;
  previousValue: any;
  newValue?: any;
  operation: PlanOperation
}
