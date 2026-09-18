import { useState, useEffect, useRef, useCallback } from 'react';
import DISPLAY_CONFIG from '../utils/constants/displayConfig';

const { VIEWS } = DISPLAY_CONFIG;

/**
 * useDisplayOrchestrator — content-aware display controller.
 *
 * Determines which view (Makers, Calendar, or a Fallback screen) should be
 * rendered, based on per-component enable flags and live content counts.
 *
 * Rules:
 *   • Neither component has content (or both are disabled) → Fallback, no rotation.
 *   • Only one is visible → force that view, no rotation.
 *   • Both visible → ping-pong, each view's dwell time is its resolved
 *     duration (screen override, else global) times its own page count, so
 *     multi-page content gets to show every page before flipping away.
 *     Changing the resolved duration or page count live (e.g. an admin edit)
 *     immediately reschedules the in-flight timer with the new value.
 */
export default function useDisplayOrchestrator({
  makerCount = 0,
  makerPages = 1,
  calendarEventCount = 0,
  calendarPages = 1,
  hasFetched = false,
  calendarEnabled = true,
  makersEnabled = true,
  makersDurationMs = DISPLAY_CONFIG.MAKER_DURATION,
  calendarDurationMs = DISPLAY_CONFIG.CALENDAR_DURATION,
}) {
  const makersVisible = makersEnabled && makerCount > 0;
  const calendarVisible = calendarEnabled && calendarEventCount > 0;

  // Start with makers view by default so it doesn't flash calendar on load
  const [currentView, setCurrentView] = useState(VIEWS.MAKERS);

  const timerRef = useRef(null);

  const clearRotationTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ── React to component visibility changes ─────────────────────
  useEffect(() => {
    if (!hasFetched) {
      // Still loading data, don't force a view yet
      return;
    }

    if (!makersVisible && !calendarVisible) {
      clearRotationTimer();
      setCurrentView(VIEWS.FALLBACK);
      return;
    }
    if (!makersVisible) {
      clearRotationTimer();
      setCurrentView(VIEWS.CALENDAR);
      return;
    }
    if (!calendarVisible) {
      clearRotationTimer();
      setCurrentView(VIEWS.MAKERS);
      return;
    }

    // Both visible → resume/continue rotation from wherever we were,
    // unless we're coming from the fallback screen.
    setCurrentView((prev) => (prev === VIEWS.FALLBACK ? VIEWS.MAKERS : prev));
  }, [makersVisible, calendarVisible, hasFetched, clearRotationTimer]);

  // ── Start / restart the rotation timer whenever the active view's
  //    resolved duration or page count changes — so a live admin edit
  //    reschedules the in-flight timer immediately, not on the next flip ──
  useEffect(() => {
    if (!hasFetched || !makersVisible || !calendarVisible) {
      return;
    }

    clearRotationTimer();

    const duration = currentView === VIEWS.MAKERS
      ? makersDurationMs * makerPages
      : calendarDurationMs * calendarPages;

    timerRef.current = setTimeout(() => {
      setCurrentView((prev) => (prev === VIEWS.MAKERS ? VIEWS.CALENDAR : VIEWS.MAKERS));
    }, duration);

    return () => clearRotationTimer();
  }, [
    currentView,
    hasFetched,
    makersVisible,
    calendarVisible,
    makersDurationMs,
    calendarDurationMs,
    makerPages,
    calendarPages,
    clearRotationTimer,
  ]);

  return { currentView };
}
