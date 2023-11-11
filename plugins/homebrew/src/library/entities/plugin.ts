import { Resource } from "./resource";
import { Message } from "../ipc/entities";

export abstract class Plugin {

  abstract resources: Array<Resource<any>>
  abstract name: string;

  async onInitialize(): Promise<void> {
    await Promise.all(this.resources.map((resource) => resource.initialize()));
  }

  async getResourceDefinitions(message: Message): Promise<Array<Record<string, unknown>>> {
    const definitions = await Promise.all(this.resources.map((resources) => resources.getResourceDefinitions()));
    return definitions.flat(1);
  }

  async onDestroy(): Promise<void> {}

}
