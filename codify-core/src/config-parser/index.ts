import * as fs from 'node:fs/promises';

export abstract class ConfigParser {

  async loadFile(directory: string): Promise<string> {
    try {
      const dir = await fs.readdir(directory);

      return `${dir}`;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  abstract parse(): Promise<string>;
}
