import { spawn } from 'child_process';

console.log('🌿 Starting Plant Doctor Development Servers...');

// On Windows, npm is npm.cmd
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

// Spawn Server
const server = spawn(npmCmd, ['run', 'dev'], {
  cwd: './server',
  stdio: 'inherit',
  shell: true
});

// Spawn Client
const client = spawn(npmCmd, ['run', 'dev'], {
  cwd: './client',
  stdio: 'inherit',
  shell: true
});

const cleanup = () => {
  server.kill();
  client.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
