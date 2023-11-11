import { Resource } from "../../library/entities/resource";
import {ResourceParameterPlan} from "../../library/entities/plan";

export class HomebrewOptionsResource extends Resource<any> {
  definitionFileName = 'options.json';

  async generatePlanForResource(resourceConfig: Record<string, unknown>): Promise<Record<keyof any, ResourceParameterPlan>> {
    return {}; //Promise.resolve(undefined);
  }

}
