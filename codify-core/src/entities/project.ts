import { RemoveMethods } from '../utils/types';
import { Module } from './module';
import { PluginNode } from './plugin-node';

export class Project {
  coreModule!: Module;
  plugins!: PluginNode[];

  constructor(props: RemoveMethods<Project>) {
    Object.assign(this, props)
  }
}
