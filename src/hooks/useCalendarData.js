import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { fetchCalendarDisplay } from '../utils/api/fetchCalendar';

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * useCalendarData — fetches + polls calendar data for a space.
 *
 * Lifted out of CalendarDashboard.jsx so App.js can see calendar event
 * counts (needed for the rotation orchestrator) without fetching twice —
 * CalendarDashboard now just renders whatever this hook returns.
 */
export default function useCalendarData(spaceId) {
  const [data, setData] = useState(null); // null = never loaded
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const isFetchingRef = useRef(false); // prevents duplicate requests
  const hasLoadedRef = useRef(false); // tracks if we ever got good data
  const intervalRef = useRef(null);

  const refresh = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const result = await fetchCalendarDisplay(spaceId);

      // Only update state if we got meaningful data, or if we've
      // never had a successful load (so empty states render).
      const hasData = result.generated_at !== null;

      if (hasData || !hasLoadedRef.current) {
        setData(result);
        if (hasData) {
          hasLoadedRef.current = true;
        }
      }
      // If the fetch returned fallback (generated_at === null) but we
      // already have data, we silently keep the previous data.
    } catch {
      // fetchCalendarDisplay never throws, but just in case:
      // swallow and keep the previous state.
    } finally {
      isFetchingRef.current = false;
      setIsInitialLoad(false);
    }
  }, [spaceId]);

  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [refresh]);

  const generatedAt = data && data.generated_at;
  const currentDate = useMemo(() => (generatedAt ? new Date(generatedAt) : new Date()), [generatedAt]);
  const calendarEvents = useMemo(() => data?.calendar ?? [], [data?.calendar]);
  const liveEvent = useMemo(() => data?.live_event ?? null, [data?.live_event]);
  const upcomingEvents = useMemo(
    () => (data?.upcoming_events ?? []).filter((event) => new Date(event.starts_at) > currentDate),
    [data?.upcoming_events, currentDate]
  );

  return { isInitialLoad, currentDate, calendarEvents, liveEvent, upcomingEvents };
}
