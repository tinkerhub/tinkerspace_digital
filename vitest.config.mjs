import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: [
      { find: 'react', replacement: 'preact/compat' },
      { find: 'react-dom/test-utils', replacement: 'preact/test-utils' },
      { find: 'react-dom', replacement: 'preact/compat' },
      { find: 'react/jsx-runtime', replacement: 'preact/compat/jsx-runtime' },
    ],
  },
  define: {
    'process.env.PUBLIC_URL': JSON.stringify(''),
    'process.env.REACT_APP_API_BASE_URL': JSON.stringify('http://localhost:4010'),
    'process.env.REACT_APP_SUPABASE_URL': JSON.stringify(''),
    'process.env.REACT_APP_SUPABASE_ANON_KEY': JSON.stringify(''),
    'process.env.REACT_APP_MASCOT_ASSET_VERSION': JSON.stringify('mascot-watchdog-v1'),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{js,jsx}'],
  },
});
