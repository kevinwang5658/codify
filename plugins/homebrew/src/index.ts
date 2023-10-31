import * as fs from "fs/promises";
import * as path from "path";

interface Message {
  cmd: string;
  data?: unknown;
}

if (!process.send) {
  throw new Error('Unable to find process.send. The child process was not started with fork()');
}

process.on('message', async (message) => {
  console.log(message);

  if (!validateMessage(message)) {
    return;
  }

  if (message.cmd === 'getResourceDefinitions') {
    const dir = path.join(__dirname, '../resource-definitions');

    const files = await fs.readdir(dir);
    const json = await Promise.all(files.map(async (fileName) => {
      const contents = await fs.readFile(path.join(dir, fileName), 'utf8');
      return JSON.parse(contents);
    }))

    process.send!({ cmd: message.cmd + 'Result', data: json });
  }
})

process.send!({ cmd: 'something', data: 'somthing' })

function validateMessage(message: unknown): message is Message {
  if (!message) {
    return false;
  }

  if (typeof message !== 'object') {
    return false;
  }

  // @ts-ignore
  if (!message.cmd) {
    return false;
  }

  return true;
}
