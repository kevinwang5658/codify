import { ResourceDefinitions } from '../plugins/entities/definitions/resource.js';
import { InternalError } from '../utils/errors.js';
import { ConfigClass } from './language-definition.js';
import { ConfigLoader } from './loader/index.js';
import { DependencyGraphBuilder } from './output-generator/dependency-graph-builder.js';
import { CompiledProject } from './output-generator/entities/compiled-project.js';
import { CompiledProjectTransformer } from './output-generator/transformer.js';
import { ProjectConfig } from './parser/entities/configs/project.js';
import { ParsedModule } from './parser/entities/parsed-module.js';
import { ParsedProject } from './parser/entities/parsed-project.js';
import { FileParser } from './parser/index.js';
import { JsonFileParser } from './parser/json/file-parser.js';

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
    if (parsedProjectConfigs.length > 1) {
      throw new Error('One or zero project config can be specified');
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
