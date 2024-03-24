import { Project } from '../entities/project.js';
import { ProjectConfig } from '../entities/project-config.js';
import { ResourceConfig } from '../entities/resource-config.js';
import { InternalError } from '../utils/errors.js';
import { ConfigClass } from './language-definition.js';
import { ConfigLoader } from './loader/index.js';
import { FileParser } from './parser/index.js';
import { JsonFileParser } from './parser/json/file-parser.js';

export class ConfigCompiler {

  static readonly supportedParsers: Record<string, FileParser> = {
    'json': new JsonFileParser(),
  }

  static async parseProject(directory: string): Promise<Project> {
    const loadedProject = await (new ConfigLoader().loadProject(directory));

    const configBlocksResult = await Promise.all(loadedProject.coreModule.files.map((file) => {
      const parser = ConfigCompiler.supportedParsers[file.fileType];
      if (!parser) {
        throw new InternalError(`Unsupported file format loaded into parser: ${file.fileName}`);
      }

      return parser.parse(file);
    }));
    const configBlocks = configBlocksResult.flat(1);

    const parsedProjectConfigs = configBlocks.filter((u) => u.configClass === ConfigClass.PROJECT);
    if (parsedProjectConfigs.length > 1) {
      throw new Error('One or zero project config can be specified');
    }

    const projectConfig = parsedProjectConfigs[0] as unknown as ProjectConfig;
    return new Project({
      projectConfig,
      resourceConfigs: configBlocks.filter((u) => u.configClass !== ConfigClass.PROJECT) as ResourceConfig[],
    })
  }
}
