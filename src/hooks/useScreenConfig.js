import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { resolveSetting } from '../utils/resolveSetting';

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
const DEFAULT_STATE = {
  status: 'pending',
  code: null,
  spaceId: null,
  calendarDurationMs: 10_000,
  makersDurationMs: 20_000,
  calendarEnabled: true,
  makersEnabled: true,
  makersPerRow: 4,
  minSlotMs: 5000,
  makersPerRowMin: 2,
  makersPerRowMax: 6,
};

export default function useScreenConfig() {
  const [state, setState] = useState(DEFAULT_STATE);

  useEffect(() => {
    if (!supabase) {
      setState((prev) => ({ ...prev, status: 'unconfigured' }));
      return;
    }
    if (!isLikelyKiosk()) {
      return; // stays 'pending' — renders normally, never registers
    }

    const screenId = getOrCreateScreenId();
    let cancelled = false;
    // Screen row and global settings row can each arrive/update independently
    // (separate realtime subscriptions below) — keep both halves and re-merge
    // on every change, rather than resolving once at load time.
    let screenRow = null;
    let settingsRow = null;

    const resolveAndApply = () => {
      if (cancelled || (!screenRow && !settingsRow)) return;
      setState((prev) => ({
        ...prev,
        status: screenRow ? (screenRow.status === 'claimed' ? 'claimed' : 'unclaimed') : prev.status,
        code: screenRow ? screenId.slice(-5).toUpperCase() : prev.code,
        spaceId: screenRow ? screenRow.space_id : prev.spaceId,
        calendarDurationMs: resolveSetting(
          screenRow?.calendar_duration_ms,
          settingsRow?.calendar_duration_ms ?? prev.calendarDurationMs
        ),
        // settings.maker_duration_ms is the pre-existing (singular) column name;
        // the new per-screen override column is plural (makers_duration_ms).
        makersDurationMs: resolveSetting(
          screenRow?.makers_duration_ms,
          settingsRow?.maker_duration_ms ?? prev.makersDurationMs
        ),
        calendarEnabled: resolveSetting(screenRow?.calendar_enabled, true),
        makersEnabled: resolveSetting(screenRow?.makers_enabled, true),
        makersPerRow: resolveSetting(
          screenRow?.makers_per_row,
          settingsRow?.makers_per_row_min ?? prev.makersPerRow
        ),
        minSlotMs: settingsRow?.min_slot_ms ?? prev.minSlotMs,
        makersPerRowMin: settingsRow?.makers_per_row_min ?? prev.makersPerRowMin,
        makersPerRowMax: settingsRow?.makers_per_row_max ?? prev.makersPerRowMax,
      }));
    };

    const applyScreenRow = (row) => {
      if (!row) return;
      screenRow = row;
      resolveAndApply();
    };

    const applySettingsRow = (row) => {
      if (!row) return;
      settingsRow = row;
      resolveAndApply();
    };

    async function registerAndLoad() {
      const deviceInfo = {
        user_agent: navigator.userAgent,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        device_pixel_ratio: window.devicePixelRatio,
      };

      const { data: existing } = await supabase
        .from('screens')
        .select('*')
        .eq('id', screenId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('screens')
          .update({ last_seen: new Date().toISOString(), ...deviceInfo })
          .eq('id', screenId);
        applyScreenRow(existing);
      } else {
        const { data: created } = await supabase
          .from('screens')
          .insert({ id: screenId, status: 'unclaimed', ...deviceInfo })
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
