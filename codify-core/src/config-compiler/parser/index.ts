import { LoadedFile } from '../loader/entities/file';
import { ConfigBlock } from './entities';

export interface FileParser {
  parse(file: LoadedFile): Promise<ConfigBlock[]>
}
