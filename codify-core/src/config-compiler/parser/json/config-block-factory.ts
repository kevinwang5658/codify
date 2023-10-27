import { InvalidResourceError, SyntaxError } from '../../../utils/errors';
import { ConfigBlock, ConfigBlockType } from '../entities';
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
      case ConfigBlockType.RESOURCE: {
        const { name, type, ...parameters } = unknownNode;

        return new ResourceConfig({
          name: name?.toString(),
          parameters,
          type,
        });
      }

      case ConfigBlockType.PLUGIN: {
        return new PluginConfig({
          parameters: unknownNode,
        });
      }

      case ConfigBlockType.PROJECT: {
        return ProjectConfig.create(unknownNode.plugins);
      }

      default: {
        throw new InvalidResourceError({
          fileName: errorInfo.fileName,
          message: 'Unknown resource type',
          resourceDefinition: JSON.stringify(unknownNode, null, 2),
        })
      }
    }
  },

};
