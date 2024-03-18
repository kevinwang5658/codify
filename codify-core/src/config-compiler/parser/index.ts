import { LoadedFile } from '../loader/entities/file.js';
import { ConfigBlock } from './entities/index.js';

export interface FileParser {
  parse(file: LoadedFile): Promise<ConfigBlock[]>
}
