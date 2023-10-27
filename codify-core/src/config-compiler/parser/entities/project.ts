import { InvalidResourceError } from '../../../utils/errors';
import { RemoveMethods } from '../../../utils/types';
import { ConfigBlock, ConfigBlockType } from './index';

export class ProjectConfig implements ConfigBlock {
  configType = ConfigBlockType.PROJECT;

  plugins?: Record<string, string>;

  constructor(props: Omit<RemoveMethods<ProjectConfig>, 'configType'>) {
    Object.assign(this, props);
  }

  static create(plugins: unknown): ProjectConfig {
    if (ProjectConfig.validatePlugins(plugins)) {
      return new ProjectConfig({ plugins });
    }

    throw new InvalidResourceError({
      fileName: '',
      message: 'Invalid plugin definition',
      resourceDefinition: JSON.stringify(plugins, null, 2),
    })
  }

  private static validatePlugins(plugins: unknown): plugins is Record<string, string> | undefined {
    if (!plugins) {
      return true;
    }

    if (typeof plugins !== 'object') {
      return false;
    }

    for (const value of Object.values(plugins)) {
      if (typeof value !== 'string') {
        return false;
      }
    }

    return true;
  }
}
