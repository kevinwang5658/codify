import { RemoveMethods } from '../utils/types.js';
import { ProjectConfig } from './project-config.js';
import { ResourceConfig } from './resource-config.js';

export class Project {
  resourceConfigs!: ResourceConfig[];
  projectConfig!: ProjectConfig;

  constructor(props: RemoveMethods<Project>) {
    Object.assign(this, props)
  }

  validateWithResourceMap(resourceMap: Map<string, string[]>) {
    const invalidConfigs = this.resourceConfigs.filter((c) => resourceMap.get(c.type));
    if (invalidConfigs.length > 0) {
      throw new Error(`Unknown types specified: ${JSON.stringify(invalidConfigs, null, 2)}`);
    }
  }
}
