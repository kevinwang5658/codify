import type { ChildProcess } from 'node:child_process';

import { ResourceDefinition } from '../../entities/resource-definition';
import { validateTypeArray, validateTypeRecordStringUnknown } from '../../utils/validator';

type ResourceName = string;

export class Plugin {
  name: string;
  directory: string;

  process: ChildProcess;
  resourceDefinitions?: Map<ResourceName, ResourceDefinition>;

  constructor(name: string, directory: string, process: ChildProcess) {
    this.name = name;
    this.directory = directory;
    this.process = process;
  }

  setResourceDefinitions(definitions: unknown): void {
    if (this.validate(definitions)) {
      const entries = definitions.map((u) => {
        const resourceDefinition = ResourceDefinition.fromJson(u);
        return [resourceDefinition.name, resourceDefinition] as const;
      })

      this.resourceDefinitions = new Map(entries);
    }

    throw new Error('Unable to parse resource definition');
  }

  private validate(definitions: unknown): definitions is Array<Record<string, unknown>> {
    if (!validateTypeArray(definitions)) {
      return false;
    }

    if (!definitions.every((u) => validateTypeRecordStringUnknown(u))) {
      return false;
    }

    return true;
  }
}
