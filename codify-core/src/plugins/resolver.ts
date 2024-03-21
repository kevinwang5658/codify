import * as fsSync from 'node:fs';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';

import { Plugin } from './entities/plugin.js';

const DEFAULT_PLUGIN_URL = 'https://codify-plugin-library.s3.amazonaws.com/codify-core/index.js';
const DEFAULT_PLUGIN_REGEX = /(?<=default).*$/g
const PLUGIN_CACHE_DIR = '/Library/Caches/codify/plugins'

export class PluginResolver {

  static async resolve(name: string, version?: string): Promise<Plugin> {
    await PluginResolver.checkAndCreateCacheDirIfNotExists()

    // TODO: Add plugin versioning in the future
    if (DEFAULT_PLUGIN_REGEX.test(name)) {
      return this.resolveDefaultPlugin()
    }

    throw new Error(`Unable to resolve plugin of name: ${name} and version: ${version}`)
  }

  private static async resolveDefaultPlugin(): Promise<Plugin> {

    const { body } = await fetch(DEFAULT_PLUGIN_URL)
    if (!body) {
      throw new Error('Un-able to fetch default plugin. Body was null');
    }

    const fileUrl = path.join(PLUGIN_CACHE_DIR, 'default.js');
    const ws = fsSync.createWriteStream(fileUrl)

    // Different type definitions here for readable stream (NodeJS vs DOM). Small hack to fix that
    await finished(Readable.fromWeb(body as never).pipe(ws));

    return new Plugin({
      directory: fileUrl,
      name: 'default',
    })
  }

  private static async checkAndCreateCacheDirIfNotExists() {
    if (!(await fs.stat(PLUGIN_CACHE_DIR))) {
      await fs.mkdir(PLUGIN_CACHE_DIR);
    }
  }
}
