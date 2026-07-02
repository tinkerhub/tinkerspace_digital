import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { fetchCalendarDisplay } from '../../utils/api/fetchCalendar';
import { Calendar, LiveEventCard, UpcomingEvents } from '../calendar';

/**
 * CalendarDashboard — dedicated calendar view for the Digital Screen.
 *
 * Layout (rendered beneath the shared Header in App.js):
 *   ┌──────────────────────────────────────────┐
 *   │                                          │
 *   │      Calendar (~70%)  │  Live Event      │
 *   │                       ├─────────────────-│
 *   │                       │  Upcoming (×5)   │
 *   └──────────────────────────────────────────┘
 *
 * This component is the ONLY consumer of fetchCalendar.js.
 */

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const CalendarDashboard = () => {
  // ── State ──────────────────────────────────────────────────────
  const [data, setData] = useState(null);            // null = never loaded
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const isFetchingRef = useRef(false);               // prevents duplicate requests
  const intervalRef = useRef(null);

  // ── Fetch logic ────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    // Guard: don't stack concurrent requests
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const result = await fetchCalendarDisplay();

      // Only update state if we got meaningful data, or if we've
      // never had a successful load (so empty states render).
      const hasData = result.generated_at !== null;

      if (hasData || data === null) {
        setData(result);
      }
      // If the fetch returned fallback (generated_at === null) but we
      // already have data, we silently keep the previous data.
    } catch {
      // fetchCalendarDisplay never throws, but just in case:
      // swallow and keep the previous state.
    } finally {
      isFetchingRef.current = false;
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [data, isInitialLoad]);

  // ── Mount: initial fetch + polling ─────────────────────────────
  useEffect(() => {
    refresh();

    intervalRef.current = setInterval(refresh, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived values (memoised) ──────────────────────────────────
  const currentDate = useMemo(() => {
    if (data?.generated_at) {
      return new Date(data.generated_at);
    }
    return new Date();
  }, [data?.generated_at]);

  const calendarEvents = useMemo(() => data?.calendar ?? [], [data?.calendar]);
  const liveEvent = useMemo(() => data?.live_event ?? null, [data?.live_event]);
  const upcomingEvents = useMemo(() => data?.upcoming_events ?? [], [data?.upcoming_events]);

  // ── Render: initial loading state ──────────────────────────────
  if (isInitialLoad) {
    return (
      <div className="flex-1 flex items-center justify-center px-12 font-geist">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin transition-colors duration-500" />
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 tracking-wider uppercase transition-colors duration-500">
            Loading calendar
          </span>
        </div>
      </div>
    );
  }

  // ── Render: dashboard ──────────────────────────────────────────
  return (
    <div className="flex-1 flex gap-6 px-12 pt-[clamp(1rem,2vh,1.5rem)] pb-24 mt-[clamp(0.5rem,1vh,1rem)] overflow-hidden font-geist">

      {/* LEFT — Calendar (~70%) */}
      <div className="flex-[7] min-w-0">
        <Calendar
          events={calendarEvents}
          currentDate={currentDate}
          className="h-full"
        />
      </div>

      {/* RIGHT — Sidebar (~30%) */}
      <div className="flex-[3] min-w-0 flex flex-col gap-6">
        {/* Live Event */}
        <LiveEventCard event={liveEvent} />

        {/* Upcoming Events */}
        <UpcomingEvents
          events={upcomingEvents}
          className="flex-1 overflow-hidden"
        />
      </div>
    </div>
  );
};

export default React.memo(CalendarDashboard);

