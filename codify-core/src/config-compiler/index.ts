import { InternalError } from '../utils/errors';
import { ConfigLoader } from './loader';
import { LoadedProject } from './loader/entities/project';
import { FileParser } from './parser';
import { ConfigBlockType, ParsedModule, ParsedProject } from './parser/entities';
import { JsonFileParser } from './parser/json/file-parser';


export class ConfigCompiler {

  static readonly supportedParsers: Record<string, FileParser> = {
    'json': new JsonFileParser(),
  }

  static async compileProject(directory: string): Promise<ParsedProject> {
    const loadedProject = await ConfigCompiler.load(directory);
    return ConfigCompiler.parse(loadedProject);
  }

  private static load(directory: string): Promise<LoadedProject> {
    return new ConfigLoader().loadProject(directory);
  }

  private static async parse(loadedProject: LoadedProject): Promise<ParsedProject> {
    const configBlocks = await Promise.all(loadedProject.coreModule.files.map((file) => {
      const parser = ConfigCompiler.supportedParsers[file.fileType];
      if (!parser) {
        throw new InternalError(`Unsupported file format loaded into parser: ${file.fileName}`);
      }

      return parser.parse(file);
    }));

    return new ParsedProject({
      coreModule: new ParsedModule({
        configBlocks: configBlocks.flat(1),
      }),
      projectConfig: configBlocks.flat(1).find((u) => u.configType === ConfigBlockType.PROJECT)!,
    })
  }
}
