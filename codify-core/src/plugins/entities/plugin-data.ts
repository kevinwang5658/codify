import { ResourceDefinition } from '../../entities/resource-definition';
import { RemoveMethods } from '../../utils/types';
import { validateTypeArray, validateTypeRecordStringUnknown } from '../../utils/validator';

type ResourceName = string;

export class PluginData {

  // Plugin names should be globally unique
  name!: string;
  directory!: string;
  resourceDefinitions!: Map<ResourceName, ResourceDefinition>;

  constructor(props: RemoveMethods<PluginData>) {
    Object.assign(this, props);
  }

  static create(name: string, directory: string, resourceDefinitions: unknown): PluginData {
    if (this.validate(resourceDefinitions)) {
      const entries = resourceDefinitions.map((u) => {
        const resourceDefinition = ResourceDefinition.fromJson(u);

        // Append the plugin name to all resources to prevent conflicts across plugins
        return [`${this.name}_${resourceDefinition.name}`, resourceDefinition] as const;
      })

      return new PluginData({ directory, name, resourceDefinitions: new Map(entries) });
    }

    throw new Error('Unable to parse plugin definition')
  }


  private static validate(resourceDefinitions: unknown): resourceDefinitions is Array<Record<string, unknown>> {
    if (!validateTypeArray(resourceDefinitions)) {
      throw new Error('Resource definitions is not of type array')
    }

    if (!resourceDefinitions.every((u) => validateTypeRecordStringUnknown(u))) {
      throw new Error('Type definitions is not of Record<string, unknown>')
    }

    return true;
  }

}
