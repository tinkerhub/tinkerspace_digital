/**
 * Calendar layout engine for calculating multi-day event spans
 * and track allocations (row stacking) to prevent collisions.
 */

export const MAX_TRACKS = 3;

/**
 * Calculates events layout for a single week.
 *
 * @param {Array} week - Array of 7 day objects { date, dayOfMonth, ... }
 * @param {Array} events - Full list of events
 * @returns {{ tracks: Array }}
 */
export function layoutWeekEvents(week, events) {
  const weekStart = week[0].date;
  const weekEnd = week[6].date;
  
  // 1. Find events intersecting with this week
  const weekEvents = [];
  events.forEach(event => {
    const eStart = new Date(event.starts_at);
    const eEnd = event.ends_at ? new Date(event.ends_at) : eStart;
    
    // Normalize to date-only (midnight) for accurate intersection
    const startD = new Date(eStart.getFullYear(), eStart.getMonth(), eStart.getDate());
    const endD = new Date(eEnd.getFullYear(), eEnd.getMonth(), eEnd.getDate());
    
    // Check intersection
    if (startD <= weekEnd && endD >= weekStart) {
      // Calculate column spanning (1 to 7)
      const startCol = startD < weekStart ? 1 : startD.getDay() + 1;
      const endCol = endD > weekEnd ? 7 : endD.getDay() + 1;
      
      weekEvents.push({
        ...event,
        startCol,
        endCol,
        span: endCol - startCol + 1,
        // Calculate raw duration and start time for deterministic sorting
        duration: endD.getTime() - startD.getTime(),
        startMs: startD.getTime()
      });
    }
  });

  // 2. Sort events: longer events first, then earlier start time
  weekEvents.sort((a, b) => {
    if (b.duration !== a.duration) return b.duration - a.duration;
    return a.startMs - b.startMs;
  });

  // 3. Allocate rows (tracks) — no visual cap, UI handles overflow via auto-scroll.
  //    Safety limit prevents infinite loops from unexpected edge cases.
  const SAFETY_LIMIT = 20;
  const trackAvailability = [];
  const tracks = [];

  weekEvents.forEach(event => {
    let trackIdx = 0;
    let placed = false;
    while (trackIdx < SAFETY_LIMIT) {
      // Initialize track array if not exists
      if (!trackAvailability[trackIdx]) {
        trackAvailability[trackIdx] = Array(7).fill(false);
      }
      
      // Check if this track is free for the event's column span
      let canFit = true;
      for (let c = event.startCol - 1; c < event.endCol; c++) {
        if (trackAvailability[trackIdx][c]) {
          canFit = false;
          break;
        }
      }
      
      if (canFit) {
        for (let c = event.startCol - 1; c < event.endCol; c++) {
          trackAvailability[trackIdx][c] = true;
        }
        tracks.push({ ...event, trackIdx });
        placed = true;
        break;
      }
      
      trackIdx++;
    }
    // If not placed after SAFETY_LIMIT tracks, silently drop the event
  });

  return { tracks };
}
