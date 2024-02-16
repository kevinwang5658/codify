export interface ProjectConfig {
  type: string;
  version?: string;
  plugins?: Record<string, string>;
  description?: string;
}

export interface ResourceConfig {
  type: string;
  name?: string;
  dependsOn?: string[];
}

export enum MessageStatus {
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface IpcMessage {
  cmd: string;
  status?: MessageStatus;
  data: unknown | null;
}

export interface ValidateRequestData {
  configs: ResourceConfig[];
}

export type ValidateResponseData = null;

export interface PlanRequestData extends ResourceConfig {}

export enum ResourceOperation {
  CREATE = "create",
  DESTROY = "destroy",
  MODIFY = "modify",
  RECREATE = "recreate",
  NOOP = "noop"
}

export enum ParameterOperation {
  ADD = "add",
  REMOVE = "remove",
  MODIFY = "modify",
  NOOP = "noop"
}

export interface PlanResponseData {
  planId: string;
  operation: ResourceOperation;
  resourceName?: string;
  resourceType: string;
  parameters: Array<{
    name: string;
    operation: ParameterOperation;
    previousValue: string | null;
    newValue: string | null;
  }>
}

export interface ApplyRequestData {
  planId: string;
}
