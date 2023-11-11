export enum PlanOperation {
  NO_CHANGE = 'no_change',
  ADD = 'add',
  DELETE = 'delete',
  MODIFY = 'modify'
}

export interface ResourceParameterPlan {
  parameterName: string;
  previousValue: any;
  newValue?: any;
  operation: PlanOperation
}
