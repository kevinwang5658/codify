import { ConfigClass } from '../../language-definition.js';
import { ResourceParameter } from './resource-parameter.js';

export interface Applyable {
  configClass: ConfigClass;
  dependencies: Applyable[];

  get id(): string;

  parameters: Map<string, ResourceParameter>;
  pluginName: string;

  toJson(): Record<string, unknown>;
}
