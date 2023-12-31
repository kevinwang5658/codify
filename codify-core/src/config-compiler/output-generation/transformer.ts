import { ResourceDefinitions } from '../../plugins/entities/definitions/resource';
import { ConfigClass } from '../language-definition';
import { ResourceConfig } from '../parser/entities/configs/resource';
import { ParsedProject } from '../parser/entities/parsed-project';
import { CompiledProject } from './entities/compiled-project';
import { Resource } from './entities/resource';

export const CompiledProjectTransformer = {

  validateAndTransform(parsedProject: ParsedProject, resourceDefinitions: ResourceDefinitions): CompiledProject {
    const modules = parsedProject.getModuleTree();
    const configBlockList = modules.configBlocks;

    const applyableBlocks = configBlockList.map((configBlock) => {
      switch (configBlock.configClass) {
        case ConfigClass.RESOURCE: {
          const resourceConfig = configBlock as ResourceConfig;

          const definition = resourceDefinitions.get(resourceConfig.type);
          if (!definition) {
            throw new Error(`Invalid resource type specified ${resourceConfig.type}. Type is not found in any plugins`);
          }

          return Resource.validateAndTransformFromConfig(resourceConfig, definition);
        }

        default: {
          throw new Error('Unimplemented');
        }
      }
    })

    return new CompiledProject({
      applyableGraph: new Map(applyableBlocks.map((b) => [b.id, b])),
      projectConfig: parsedProject.projectConfig,
    })
  },
};
