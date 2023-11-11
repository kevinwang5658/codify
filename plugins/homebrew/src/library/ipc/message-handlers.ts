import { Message } from "./entities";
import { Plugin } from "../entities/plugin";
import {validateMessage} from "../utils/validators";

const MESSAGE_HANDLERS: Record<string, (plugin: Plugin, message: Message) => Promise<void>> = {
  'getResourceDefinitions': getResourceDefinitions,
}

export async function onMessage(plugin: Plugin, message: unknown) {
  if (!validateMessage(message)) {
    throw new Error(`Message ${message} is not in the proper format`);
  }

  console.log(`Received message ${JSON.stringify(message, null, 2)}`);

  const handler = MESSAGE_HANDLERS[message.cmd];
  await handler(plugin, message)
}

async function getResourceDefinitions(plugin: Plugin, message: Message): Promise<void> {
  const data = await plugin.getResourceDefinitions(message);
  process.send!({ cmd: message.cmd + 'Result', data });
}
