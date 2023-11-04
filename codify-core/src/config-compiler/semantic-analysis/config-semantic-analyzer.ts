import { ResourceDefinitions } from '../../entities/resource-definition';
import { validateResourceParameterType } from '../../utils/validator';
import { ConfigBlockType } from '../language-definition';
import { ParsedProject } from '../parser/entities';
import { ResourceConfig } from '../parser/entities/resource';

/* eslint-disable perfectionist/sort-objects */
export const ConfigSemanticAnalyzer = {

  validate(project: ParsedProject, resourceDefinitions: ResourceDefinitions): void {
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

        if (!validateResourceParameterType(value, parameterDefinitions.get(key)!.type)) {
          throw new Error(`Invalid parameter type: ${key}:${value} is not of type ${parameterDefinitions.get(key)!.type}`)
        }

        const parameter = parameterDefinitions.get(key)!;
        // validate value here
        if (parameter.allowedValues && !(parameter.allowedValues as Array<unknown>).includes(value)) {
          throw new Error(`Invalid resource config ${type}. Allowed values are ${parameter.allowedValues} but ${value} was provided`)
        }
      }
    }
  },


  parseResourceDependencies(blocks: ResourceConfig[]) {
    const resourceReferenceRegex = /\${([\w.]+)}/g

    // TODO: Support named resources in the future
    const resourceMap = new Map(blocks.map((resource) => [resource.type, resource]));

    for (const configBlock of blocks) {

      const referenceParameters = Object.entries(configBlock.parameters)
        .map(([name, value]) => [name, String(value), String(value).matchAll(resourceReferenceRegex)] as const)
        .filter(([, _, match]) => match)
        .flatMap(([name, value, matches]) =>
          [...matches].map(match => [name, value, match[1]] as const
          ));

      for (const [name, value, match] of referenceParameters) {
        const parts = match.split('.');
        if (parts.length < 2) {
          throw new Error(`Only resource parameter references are allowed. ${match}`);
        }

        if (!resourceMap.has(parts[0])) {
          throw new Error(`Un-able to find resource being referenced. ${match}`);
        }

        // TODO: Check for circular dependencies

        // TODO: Support named resources in the future
        const referencedResource = resourceMap.get(parts[0])!;
        const referencedParameter = referencedResource.parameters[parts[1]];

        if (!referencedParameter) {
          throw new Error(`Un-able to find parameter being referenced. ${match}`);
        }

        // TODO: Add recursive check for parameters of type parameter

        configBlock.dependencies.push({
          match,
          parameterName: name,
          parameterValue: value,
          resource: referencedResource
        })

        // Substitute with actual value
        configBlock.parameters[name] = String(configBlock.parameters[name]).replace(`\${${match}}`, String(referencedParameter));
      }
    }
  }

};
