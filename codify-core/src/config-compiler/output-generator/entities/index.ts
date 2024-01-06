import { ConfigClass } from '../../language-definition';
import { ResourceParameter } from './resource-parameter';

export interface Applyable {
  configClass: ConfigClass;
  dependencies: Applyable[];

  get id(): string;

  parameters: Map<string, ResourceParameter>;
  pluginName: string;

  toJson(): Record<string, unknown>;
}
