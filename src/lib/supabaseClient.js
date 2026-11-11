import { createClient } from '@supabase/supabase-js';

// Access environment variables directly with dot notation so Vite's
// define AST replacement can inject the strings at build time.
// Destructuring process.env fails in Vite production bundles because
// bare process.env is replaced with {}.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// null when unconfigured (e.g. `pnpm dev:mock` with no Supabase project set
// up yet) rather than throwing — the kiosk should still run without it,
// just without screen registration/admin features.
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
