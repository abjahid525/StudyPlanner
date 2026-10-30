const { spawn } = require('node:child_process');

const port = 3200 + Math.floor(Math.random() * 500);
const server = spawn(process.execPath, ['server.js'], {
  env: { ...process.env, NODE_ENV: 'test', PORT: String(port) },
  stdio: ['ignore', 'pipe', 'pipe']
});

let output = '';
server.stdout.on('data', (chunk) => {
  output += chunk.toString();
});
server.stderr.on('data', (chunk) => {
  output += chunk.toString();
});

const stopServer = () => {
  if (!server.killed) server.kill();
};

const fail = (error) => {
  stopServer();
  console.error(error.message);
  if (output) console.error(output);
  process.exitCode = 1;
};

const run = async () => {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/health`);
      const body = await response.json();
      if (response.ok && body.status === 'ok' && body.app === 'study-planner') {
        const pageResponse = await fetch(`http://127.0.0.1:${port}/`);
        const page = await pageResponse.text();
        if (!pageResponse.ok || !page.includes('<title>Study Planner</title>')) {
          throw new Error('Study Planner frontend did not load correctly.');
        }
        console.log('Study Planner health and frontend checks passed.');
        stopServer();
        return;
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error('Study Planner health endpoint did not become ready.');
};

server.once('error', fail);
run().catch(fail);
