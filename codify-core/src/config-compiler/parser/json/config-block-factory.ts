import { SyntaxError } from '../../../utils/errors';
import { ConfigBlockType } from '../../language-definition';
import { ConfigBlock } from '../entities';
import { PluginConfig } from '../entities/plugin';
import { ProjectConfig } from '../entities/project';
import { ResourceConfig } from '../entities/resource';

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
      case ConfigBlockType.PLUGIN: {
        return new PluginConfig({
          parameters: unknownNode,
        });
      }

      case ConfigBlockType.PROJECT: {
        return new ProjectConfig(unknownNode);
      }

      default: {
        return new ResourceConfig(unknownNode);
      }
    }
  },

};
