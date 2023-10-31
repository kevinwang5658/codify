import type { ChildProcess } from 'node:child_process';

import { ResourceDefinition } from '../../entities/resource-definition';
import { validateTypeArray, validateTypeRecordStringUnknown } from '../../utils/validator';

type ResourceName = string;

export class Plugin {

  // Plugin names should be globally unique
  name: string;
  directory: string;

  process: ChildProcess;
  resourceDefinitions?: Map<ResourceName, ResourceDefinition>;

  constructor(directory: string, name: string, process: ChildProcess) {
    this.name = name;
    this.directory = directory;
    this.process = process;
  }

  setResourceDefinitions(definitions: unknown): void {
    if (this.validate(definitions)) {
      const entries = definitions.map((u) => {
        const resourceDefinition = ResourceDefinition.fromJson(u);

        // Append the plugin name to all resources to prevent conflicts across plugins
        return [`${this.name}_${resourceDefinition.name}`, resourceDefinition] as const;
      })

      this.resourceDefinitions = new Map(entries);
      return;
    }

    throw new Error('Unable to parse resource definition');
  }

  private validate(definitions: unknown): definitions is Array<Record<string, unknown>> {
    if (!validateTypeArray(definitions)) {
      throw new Error('Definitions is not of type array')
    }

    if (!definitions.every((u) => validateTypeRecordStringUnknown(u))) {
      throw new Error('Type definitions is not of Record<string, unknown>')
    }

    return true;
  }
}
