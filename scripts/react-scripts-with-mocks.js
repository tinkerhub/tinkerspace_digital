const { spawn } = require('child_process');

const command = process.argv[2] || 'start';
const mockPort = process.env.MOCK_SERVER_PORT || '4010';

const child = spawn(
  'pnpm',
  ['exec', 'react-scripts', command],
  {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      // This launcher must override checked-in/local .env values so it always exercises mock data.
      REACT_APP_API_BASE_URL: `http://localhost:${mockPort}`,
      // Space assignment now comes from Supabase (screens table), not env —
      // REACT_APP_SUPABASE_URL/ANON_KEY still come through from process.env.
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
