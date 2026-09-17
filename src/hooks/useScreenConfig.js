import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const SCREEN_ID_KEY = 'tinkerspace_screen_id';

function isLikelyKiosk() {
  return window.innerWidth >= 1024 && !/Mobi/i.test(navigator.userAgent);
}

function getOrCreateScreenId() {
  let id = localStorage.getItem(SCREEN_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SCREEN_ID_KEY, id);
  }
  return id;
}

/**
 * Registers this device as a screen (skipping phone-sized devices), and
 * keeps its assigned space + the global rotation durations in sync live via
 * Supabase Realtime. This replaces the old env-driven spaceConfig.js seam —
 * an admin dashboard now controls this instead of a build-time env var.
 */
export default function useScreenConfig() {
  const [state, setState] = useState({
    status: 'pending',
    code: null,
    spaceId: null,
    calendarDurationMs: 10_000,
    makerDurationMs: 20_000,
  });

  useEffect(() => {
    if (!supabase || !isLikelyKiosk()) {
      return; // stays 'pending' — renders normally, never registers
    }

    const screenId = getOrCreateScreenId();
    let cancelled = false;

    const applyScreenRow = (row) => {
      if (cancelled || !row) return;
      setState((prev) => ({
        ...prev,
        status: row.status === 'claimed' ? 'claimed' : 'unclaimed',
        code: screenId.slice(-5).toUpperCase(),
        spaceId: row.space_id,
      }));
    };

    const applySettingsRow = (row) => {
      if (cancelled || !row) return;
      setState((prev) => ({
        ...prev,
        calendarDurationMs: row.calendar_duration_ms,
        makerDurationMs: row.maker_duration_ms,
      }));
    };

    async function registerAndLoad() {
      const { data: existing } = await supabase
        .from('screens')
        .select('*')
        .eq('id', screenId)
        .maybeSingle();

      if (existing) {
        await supabase.from('screens').update({ last_seen: new Date().toISOString() }).eq('id', screenId);
        applyScreenRow(existing);
      } else {
        const { data: created } = await supabase
          .from('screens')
          .insert({ id: screenId, status: 'unclaimed' })
          .select()
          .single();
        applyScreenRow(created);
      }

      const { data: settings } = await supabase.from('settings').select('*').single();
      applySettingsRow(settings);
    }

    registerAndLoad();

    const channel = supabase
      .channel(`screen-${screenId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'screens', filter: `id=eq.${screenId}` },
        (payload) => applyScreenRow(payload.new)
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'settings' },
        (payload) => applySettingsRow(payload.new)
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return state;
}
