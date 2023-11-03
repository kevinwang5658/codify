import { ResourceDefinitions } from '../../entities/resource-definition';
import { ConfigBlockType } from '../language-definition';
import { ParsedProject } from '../parser/entities';
import { ResourceConfig } from '../parser/entities/resource';

export const ConfigSemanticAnalyzer = {

  async validate(project: ParsedProject, resourceDefinitions: ResourceDefinitions): Promise<void> {
    const resourceConfigs = project
      .coreModule
      .configBlocks
      .filter((u) => u.configType === ConfigBlockType.RESOURCE) as ResourceConfig[];

    this.validateResourceConfigs(resourceConfigs, resourceDefinitions);
  },

  // TODO: Move this logic to ResourceConfig entity when plugin initialization is moved to be the first step
  validateResourceConfigs(blocks: ResourceConfig[], resourceDefinitions: ResourceDefinitions) {
    for (const configBlock of blocks) {
      const { parameters, type } = configBlock;
      const definition = resourceDefinitions.get(type);
      if (!definition) {
        throw new Error(`Invalid resource type specified ${type}. Type is not found in any plugins`);
      }

      const { parameters: parameterDefinitions } = definition;
      for (const [key, value] of Object.entries(parameters)) {

        if (!parameterDefinitions.has(key)) {
          throw new Error(`Invalid resource parameter: ${key}. Resource: ${type}`)
        }

        const parameter = parameterDefinitions.get(key)!;
        // validate value here
        if (parameter.allowedValues && !(parameter.allowedValues as Array<unknown>).includes(value)) {
          throw new Error(`Invalid resource config ${type}. Allowed values are ${parameter.allowedValues} but ${value} was provided`)
        }
      }
    }

  }

};
