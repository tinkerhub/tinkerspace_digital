import { useState, useEffect, useRef, useCallback } from 'react';
import DISPLAY_CONFIG from '../utils/constants/displayConfig';

const { VIEWS, MAKER_DURATION, CALENDAR_DURATION } = DISPLAY_CONFIG;

/**
 * useDisplayOrchestrator — lightweight display controller.
 *
 * Determines which view (Makers or Calendar) should be rendered based
 * on maker availability and configurable rotation timing.
 *
 * Rules:
 *   • makers.length === 0  →  Calendar always (no rotation)
 *   • makers.length > 0    →  Makers ↔ Calendar rotation
 *
 * When makers become available → joins rotation immediately.
 * When all makers leave      → stops rotation, shows Calendar immediately.
 *
 * @param {number} makerCount - Current number of active makers.
 * @returns {{ currentView: string }}
 */
export default function useDisplayOrchestrator(makerCount, totalPages = 1, hasFetched = false) {
  const hasMakers = makerCount > 0;

  // Start with makers view by default so it doesn't flash calendar on load
  const [currentView, setCurrentView] = useState(VIEWS.MAKERS);

  const timerRef = useRef(null);

  // ── Clear any running rotation timer ──────────────────────────
  const clearRotationTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ── Schedule the next view transition ─────────────────────────
  const scheduleNext = useCallback((view) => {
    clearRotationTimer();

    const duration = view === VIEWS.MAKERS ? (MAKER_DURATION * totalPages) : CALENDAR_DURATION;

    timerRef.current = setTimeout(() => {
      const nextView = view === VIEWS.MAKERS ? VIEWS.CALENDAR : VIEWS.MAKERS;
      setCurrentView(nextView);
    }, duration);
  }, [clearRotationTimer, totalPages]);

  // ── React to maker availability changes ───────────────────────
  useEffect(() => {
    if (!hasFetched) {
      // Still loading data, don't force to calendar yet
      return;
    }

    if (!hasMakers) {
      // No makers → immediately show calendar, stop rotation
      clearRotationTimer();
      setCurrentView(VIEWS.CALENDAR);
      return;
    }

    // Makers exist → ensure rotation is running.
    // If we were on calendar (because no makers), switch to makers first.
    setCurrentView((prev) => {
      if (prev === VIEWS.CALENDAR) {
        return VIEWS.MAKERS;
      }
      return prev;
    });
  }, [hasMakers, hasFetched, clearRotationTimer]);

  // ── Start / restart the rotation timer whenever the view changes ─
  useEffect(() => {
    if (!hasMakers) {
      // No rotation when there are no makers
      return;
    }

    scheduleNext(currentView);

    return () => clearRotationTimer();
  }, [currentView, hasMakers, scheduleNext, clearRotationTimer]);

  return { currentView };
}
