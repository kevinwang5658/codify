import { ResourceDefinitions } from '../plugins/entities/definitions/resource';
import { InternalError } from '../utils/errors';
import { ConfigClass } from './language-definition';
import { ConfigLoader } from './loader';
import { DependencyGraphBuilder } from './output-generation/dependency-graph-builder';
import { CompiledProject } from './output-generation/entities/compiled-project';
import { CompiledProjectTransformer } from './output-generation/transformer';
import { FileParser } from './parser';
import { ProjectConfig } from './parser/entities/configs/project';
import { ParsedModule } from './parser/entities/parsed-module';
import { ParsedProject } from './parser/entities/parsed-project';
import { JsonFileParser } from './parser/json/file-parser';

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

    const parsedProjectConfigs = configBlocks.filter((u) => u.configClass === ConfigClass.PROJECT);
    if (parsedProjectConfigs.length !== 1) {
      throw new Error('One one project config can be specified');
    }

    const projectConfig = parsedProjectConfigs[0] as ProjectConfig;
    return new ParsedProject({
      coreModule: new ParsedModule({
        configBlocks: configBlocks.filter((u) => u.configClass !== ConfigClass.PROJECT),
      }),
      projectConfig,
    })
  }

  static compileProject(parsedProject: ParsedProject, definitions: ResourceDefinitions): CompiledProject {
    const compiledProject = CompiledProjectTransformer.validateAndTransform(parsedProject, definitions);
    DependencyGraphBuilder.buildDependencyGraph(compiledProject);
    return compiledProject;
  }
}
