import { RemoveMethods } from '../utils/types';

export interface ResourceParameter {
  name: string;
}

export interface ResourceTemplate {
  parameters: ResourceParameter[];
  typeId: string;
}

export class Resource {
  dependencies!: Resource[];
  metadata!: Record<string, unknown>;
  name!: string;
  parameters!: ResourceParameter[];
  typeId!: string;

  constructor(props: RemoveMethods<Resource>) {
    Object.assign(this, props);
  }
}
