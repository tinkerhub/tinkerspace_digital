const { spawn } = require('child_process');

const command = process.argv[2] || 'start';
const mockPort = process.env.MOCK_SERVER_PORT || '4010';
const mockApiKey = process.env.MOCK_SPACECALENDAR_API_KEY || 'tinkerspace-local-dev';

const child = spawn(
  'pnpm',
  ['exec', 'react-scripts', command],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL || `http://localhost:${mockPort}`,
      REACT_APP_SPACECALENDAR_API: process.env.REACT_APP_SPACECALENDAR_API || `http://localhost:${mockPort}`,
      REACT_APP_SPACECALENDAR_API_KEY:
        process.env.REACT_APP_SPACECALENDAR_API_KEY || mockApiKey,
    },
  }
);

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
