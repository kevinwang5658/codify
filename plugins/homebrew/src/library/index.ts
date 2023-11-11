import { Plugin} from "./entities/plugin";
import { onMessage } from "./ipc/message-handlers";

export async function runPlugin(plugin: Plugin) {
  await plugin.onInitialize();

  process.on('message', (message) => onMessage(plugin, message))
}
