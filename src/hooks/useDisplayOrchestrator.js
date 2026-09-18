import { useState, useEffect, useRef, useCallback } from 'react';
import DISPLAY_CONFIG from '../utils/constants/displayConfig';
import { computeSlot } from '../utils/rotation/computeSlot';

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
 *   • Both visible → ping-pong, each view's dwell time computed from its own
 *     content via computeSlot (a single maker/event gets a short minSlotMs
 *     glance; a full page gets up to its configured duration ceiling).
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
  minSlotMs = 5000,
}) {
  const makersVisible = makersEnabled && makerCount > 0;
  const calendarVisible = calendarEnabled && calendarEventCount > 0;

  // Start with makers view by default so it doesn't flash calendar on load
  const [currentView, setCurrentView] = useState(VIEWS.MAKERS);

  const timerRef = useRef(null);
  const configRef = useRef({});
  configRef.current = { makerCount, makerPages, calendarEventCount, calendarPages, makersDurationMs, calendarDurationMs, minSlotMs };

  const clearRotationTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ── Schedule the next view transition ─────────────────────────
  const scheduleNext = useCallback((view) => {
    clearRotationTimer();

    const {
      makerCount, makerPages, calendarEventCount, calendarPages,
      makersDurationMs, calendarDurationMs, minSlotMs,
    } = configRef.current;

    const duration = view === VIEWS.MAKERS
      ? computeSlot(makerCount, makerPages, minSlotMs, makersDurationMs)
      : computeSlot(calendarEventCount, calendarPages, minSlotMs, calendarDurationMs);

    timerRef.current = setTimeout(() => {
      const nextView = view === VIEWS.MAKERS ? VIEWS.CALENDAR : VIEWS.MAKERS;
      setCurrentView(nextView);
    }, duration);
  }, [clearRotationTimer]);

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

  // ── Start / restart the rotation timer only while both are visible ──
  useEffect(() => {
    if (!hasFetched || !makersVisible || !calendarVisible) {
      return;
    }

    scheduleNext(currentView);

    return () => clearRotationTimer();
  }, [currentView, hasFetched, makersVisible, calendarVisible, scheduleNext, clearRotationTimer]);

  return { currentView };
}
