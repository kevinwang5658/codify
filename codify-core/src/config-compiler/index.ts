import { ResourceDefinitions } from '../entities/resource-definition';
import { InternalError } from '../utils/errors';
import { ConfigBlockType } from './language-definition';
import { ConfigLoader } from './loader';
import { FileParser } from './parser';
import { ParsedModule, ParsedProject } from './parser/entities';
import { ProjectConfig } from './parser/entities/project';
import { JsonFileParser } from './parser/json/file-parser';
import { ConfigSemanticAnalyzer } from './semantic-analysis/config-semantic-analyzer';

export class ConfigCompiler {

  static readonly supportedParsers: Record<string, FileParser> = {
    'json': new JsonFileParser(),
  }

  static async parseProject(directory: string): Promise<ParsedProject> {
    const loadedProject = await (new ConfigLoader().loadProject(directory));

    const configBlocksResult = await Promise.all(loadedProject.coreModule.files.map((file) => {
      const parser = ConfigCompiler.supportedParsers[file.fileType];
      if (!parser) {
        throw new InternalError(`Unsupported file format loaded into parser: ${file.fileName}`);
      }

      return parser.parse(file);
    }));
    const configBlocks = configBlocksResult.flat(1);

    const parsedProjectConfigs = configBlocks.filter((u) => u.configType === ConfigBlockType.PROJECT);
    if (parsedProjectConfigs.length !== 1) {
      throw new Error('One one project config can be specified');
    }

    const projectConfig = parsedProjectConfigs[0] as ProjectConfig;
    return new ParsedProject({
      coreModule: new ParsedModule({
        configBlocks: configBlocks.filter((u) => u.configType !== ConfigBlockType.PROJECT),
      }),
      projectConfig,
    })
  }

  static async analyzeProject(parsedProject: ParsedProject, resourceDefinitions: ResourceDefinitions): Promise<void> {
    ConfigSemanticAnalyzer.validate(parsedProject, resourceDefinitions);
  }
}
