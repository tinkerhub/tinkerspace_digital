import { defineConfig, loadEnv } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [preact()],
    resolve: {
      alias: [
        { find: 'react', replacement: 'preact/compat' },
        { find: 'react-dom/test-utils', replacement: 'preact/test-utils' },
        { find: 'react-dom', replacement: 'preact/compat' },
        { find: 'react/jsx-runtime', replacement: 'preact/compat/jsx-runtime' },
      ],
    },
    build: {
      outDir: 'build',
      target: 'es2020',
    },
    server: {
      port: 3000,
      strictPort: true,
    },
    define: {
      'process.env.PUBLIC_URL': JSON.stringify(''),
      'process.env.REACT_APP_API_BASE_URL': JSON.stringify(
        env.REACT_APP_API_BASE_URL || env.VITE_API_BASE_URL || ''
      ),
      'process.env.REACT_APP_SUPABASE_URL': JSON.stringify(
        env.REACT_APP_SUPABASE_URL || env.VITE_SUPABASE_URL || ''
      ),
      'process.env.REACT_APP_SUPABASE_ANON_KEY': JSON.stringify(
        env.REACT_APP_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || ''
      ),
      'process.env.REACT_APP_MASCOT_ASSET_VERSION': JSON.stringify(
        env.REACT_APP_MASCOT_ASSET_VERSION || env.VITE_MASCOT_ASSET_VERSION || 'mascot-watchdog-v1'
      ),
    },
  };
});

