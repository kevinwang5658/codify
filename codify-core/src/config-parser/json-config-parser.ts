import { ConfigParser } from './index';

export class JsonConfigParser extends ConfigParser {

  parse(): Promise<string> {
    return Promise.resolve('');
  }

}
