import { ResourceDefinition } from '../../../plugins/entities/definitions/resource';
import { validateResourceParameterType } from '../../../utils/validator';
import { ConfigClass, } from '../../language-definition';
import { ResourceConfig } from '../../parser/entities/configs/resource';
import { Applyable } from './index';
import { ResourceParameter } from './resource-parameter';

export class Resource implements Applyable {
  readonly configClass: ConfigClass = ConfigClass.RESOURCE;

  type: string;
  name?: string;
  parameters: Map<string, ResourceParameter>; // Map<ResourceParameterName, value>
  pluginName: string;
  dependencies: Applyable[] = [];

  constructor(type: string, name: string | undefined, parameters: Map<string, ResourceParameter>, pluginName: string) {
    this.type = type;
    this.name = name;
    this.parameters = parameters;
    this.pluginName = pluginName;
  }

  get id(): string {
    return (this.name) ? this.type + '.' + this.name : this.type;
  }

  static validateAndTransformFromConfig(config: ResourceConfig, resourceDefinition: ResourceDefinition): Resource {
    const resource = new Resource(
      config.type,
      config.name,
      new Map(Object.entries(config.parameters)) as Map<string, ResourceParameter>,
      resourceDefinition.pluginName,
    );

    resource.validateUsingDefinitions(resourceDefinition);
    return resource
  }

  toJson(): Record<string, unknown> {
    return {
      name: this.name,
      parameters: Object.fromEntries(this.parameters.entries()),
      type: this.type,
    }
  }

  private validateUsingDefinitions(definition: ResourceDefinition): void {
    if (definition.name !== this.type) {
      throw new Error(`Resource type and definition name is mismatched: Expected: ${this.type} Got: ${definition.name}`)
    }

    const { parameters: parameterDefinitions } = definition;
    for (const [key, value] of this.parameters.entries()) {

      if (!parameterDefinitions.has(key)) {
        throw new Error(`Invalid resource parameter: ${key}. Resource: ${this.type}`)
      }

      if (!validateResourceParameterType(value, parameterDefinitions.get(key)!.type)) {
        throw new Error(`Invalid parameter type: ${key}:${value} is not of type ${parameterDefinitions.get(key)!.type}`)
      }

      const parameter = parameterDefinitions.get(key)!;
      // validate value here
      if (parameter.allowedValues && !(parameter.allowedValues as Array<unknown>).includes(value)) {
        throw new Error(`Invalid resource config ${this.type}. Allowed values are ${parameter.allowedValues} but ${value} was provided`)
      }
    }
  }

}
