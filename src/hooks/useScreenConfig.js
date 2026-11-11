import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const SCREEN_ID_KEY = 'tinkerspace_screen_id';
const CACHED_SPACE_ID_KEY = 'tinkerspace_cached_space_id';

function isLikelyKiosk() {
  if (typeof window === 'undefined') return false;
  // Allow explicit opt-in for portrait displays or Android TV WebViews via query param or localStorage
  if (
    window.location.search.includes('kiosk=true') ||
    localStorage.getItem('tinkerspace_force_kiosk') === 'true'
  ) {
    return true;
  }
  return window.innerWidth >= 1024 && !/Mobi/i.test(navigator.userAgent);
}

function getOrCreateScreenId() {
  let id = localStorage.getItem(SCREEN_ID_KEY);
  if (!id) {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      id = crypto.randomUUID();
    } else {
      id = 'scr-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
    }
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
  const initialSpaceId = (typeof window !== 'undefined' && localStorage.getItem(CACHED_SPACE_ID_KEY))
    ? Number(localStorage.getItem(CACHED_SPACE_ID_KEY))
    : 1;

  const [state, setState] = useState({
    status: 'pending',
    code: null,
    spaceId: initialSpaceId,
    calendarDurationMs: 10_000,
    makerDurationMs: 20_000,
  });

  useEffect(() => {
    if (!supabase) {
      setState((prev) => ({ ...prev, status: 'unconfigured', spaceId: prev.spaceId || 1 }));
      return;
    }
    if (!isLikelyKiosk()) {
      return; // stays 'pending' — renders normally, never registers
    }

    const screenId = getOrCreateScreenId();
    let cancelled = false;

    const applyScreenRow = (row) => {
      if (cancelled || !row) return;
      if (row.space_id) {
        try {
          localStorage.setItem(CACHED_SPACE_ID_KEY, String(row.space_id));
        } catch (e) {}
      }
      setState((prev) => ({
        ...prev,
        status: row.status === 'claimed' ? 'claimed' : 'unclaimed',
        code: screenId.slice(-5).toUpperCase(),
        spaceId: row.space_id ?? prev.spaceId,
      }));
    };

    const applySettingsRow = (row) => {
      if (cancelled || !row) return;
      setState((prev) => ({
        ...prev,
        calendarDurationMs: row.calendar_duration_ms || prev.calendarDurationMs,
        makerDurationMs: row.maker_duration_ms || prev.makerDurationMs,
      }));
    };

    async function registerAndLoad() {
      try {
        const { data: existing, error: selectErr } = await supabase
          .from('screens')
          .select('*')
          .eq('id', screenId)
          .maybeSingle();

        if (selectErr) {
          console.warn('[useScreenConfig] Failed to query screen:', selectErr.message);
          return;
        }

        if (existing) {
          await supabase.from('screens').update({ last_seen: new Date().toISOString() }).eq('id', screenId);
          applyScreenRow(existing);
        } else {
          const { data: created, error: insertErr } = await supabase
            .from('screens')
            .insert({ id: screenId, status: 'unclaimed' })
            .select()
            .maybeSingle();
          if (!insertErr && created) {
            applyScreenRow(created);
          }
        }

        const { data: settings } = await supabase.from('settings').select('*').maybeSingle();
        if (settings) {
          applySettingsRow(settings);
        }
      } catch (err) {
        console.warn('[useScreenConfig] Failed to register/load from Supabase:', err);
      }
    }

    registerAndLoad();

    if (typeof window !== 'undefined') {
      window.addEventListener('online', registerAndLoad);
      window.addEventListener('kiosk:online', registerAndLoad);
    }

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
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', registerAndLoad);
        window.removeEventListener('kiosk:online', registerAndLoad);
      }
      supabase.removeChannel(channel);
    };
  }, []);

  return state;
}
