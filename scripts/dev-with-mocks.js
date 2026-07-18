const { spawn } = require('child_process');

const children = [];
let shuttingDown = false;

function startProcess(label, command, args, extraEnv = {}) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    env: {
      ...process.env,
      ...extraEnv,
    },
  });

  child.on('exit', (code, signal) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    for (const proc of children) {
      if (proc.pid && proc.pid !== child.pid) {
        proc.kill('SIGTERM');
      }
    }

    if (signal) {
      console.error(`[${label}] exited with signal ${signal}`);
      process.removeAllListeners(signal);
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });

  children.push(child);
  return child;
}

const mockPort = process.env.MOCK_SERVER_PORT || '4010';
const mockApiKey = process.env.MOCK_SPACECALENDAR_API_KEY || 'tinkerspace-local-dev';

startProcess('mock-server', 'node', ['mock-server/server.js'], {
  MOCK_SERVER_PORT: mockPort,
  MOCK_SPACECALENDAR_API_KEY: mockApiKey,
});

startProcess('frontend', 'node', ['scripts/react-scripts-with-mocks.js', 'start'], {
  MOCK_SERVER_PORT: mockPort,
  MOCK_SPACECALENDAR_API_KEY: mockApiKey,
});

function shutdown(signal) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  for (const child of children) {
    if (child.pid) {
      child.kill('SIGTERM');
    }
  }
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
