import { SyntaxError } from '../../../utils/errors';
import { ConfigClass } from '../../language-definition';
import { ConfigBlock } from '../entities';
import { PluginConfig } from '../entities/configs/plugin';
import { ProjectConfig } from '../entities/configs/project';
import { ResourceConfig } from '../entities/configs/resource';

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
