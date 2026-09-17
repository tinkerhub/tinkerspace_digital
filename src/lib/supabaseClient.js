import { createClient } from '@supabase/supabase-js';

const { REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY } = process.env;

// null when unconfigured (e.g. `pnpm dev:mock` with no Supabase project set
// up yet) rather than throwing — the kiosk should still run without it,
// just without screen registration/admin features.
export const supabase =
  REACT_APP_SUPABASE_URL && REACT_APP_SUPABASE_ANON_KEY
    ? createClient(REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY)
    : null;
