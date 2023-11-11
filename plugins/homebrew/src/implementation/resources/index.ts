import {Resource} from "../../library/entities/resource";
import {ResourceDefinition, ResourceParameterType} from "../../library/entities/resource-definition";
import {PlanOperation, ResourceParameterPlan} from "../../library/entities/plan";

const HomebrewMainResourceDef = <ResourceDefinition> {
  name: 'homebrew',
  parameters: {
    a: {
      name: 'a',
      type: ResourceParameterType.STRING,
    }
  }
}

export class HomebrewMainResource extends Resource<typeof HomebrewMainResourceDef> {
  definitionFileName = 'main.json'

  async generatePlanForResource(resourceConfig: Record<string, unknown>): Promise<Record<keyof typeof HomebrewMainResourceDef["parameters"], ResourceParameterPlan>> {
    return {
      a: {
        parameterName: 'a',
        previousValue: 'a',
        operation: PlanOperation.MODIFY
      }
    }
  }


}
