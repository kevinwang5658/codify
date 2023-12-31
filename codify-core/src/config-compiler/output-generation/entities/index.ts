import { ConfigClass } from '../../language-definition';
import { ResourceParameter } from './resource-parameter';

export interface Applyable {
  configClass: ConfigClass;
  dependencies: Applyable[];
  parameters: Map<string, ResourceParameter>;

  get id(): string;

  toJson(): string;
}
