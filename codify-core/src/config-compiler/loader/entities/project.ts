import { LoadedModule } from './module';

export interface LoadedProject {
  coreModule: LoadedModule;
  rootDirectory: string;
}
