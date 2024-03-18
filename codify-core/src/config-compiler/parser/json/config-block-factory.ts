import { SyntaxError } from '../../../utils/errors.js';
import { ConfigClass } from '../../language-definition.js';
import { PluginConfig } from '../entities/configs/plugin.js';
import { ProjectConfig } from '../entities/configs/project.js';
import { ResourceConfig } from '../entities/configs/resource.js';
import { ConfigBlock } from '../entities/index.js';

export const JsonConfigBlockFactory = {

  create(
    unknownNode: Record<string, unknown>,
    errorInfo: { fileName: string; lineNumber: string }
  ): ConfigBlock {
    if (!unknownNode.type || typeof unknownNode.type !== 'string') {
      throw new SyntaxError({
        ...errorInfo,
        message: 'No type declaration found. A type field is required for all objects',
      })
    }

    switch (unknownNode.type) {
      case ConfigClass.PLUGIN: {
        return new PluginConfig({
          parameters: unknownNode,
        });
      }

      case ConfigClass.PROJECT: {
        return new ProjectConfig(unknownNode);
      }

      default: {
        return new ResourceConfig(unknownNode);
      }
    }
  },

};
