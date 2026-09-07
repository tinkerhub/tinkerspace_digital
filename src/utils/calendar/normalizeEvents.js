import { normalizeCategory } from '../../components/calendar/EventBadge';

/**
 * Turns the raw TinkerHub `/v1/public/event/all` event list into the
 * { live_event, upcoming_events, calendar, generated_at, api_version }
 * shape the calendar UI expects.
 *
 * The API returns every event for every space/org — it does not filter
 * by spaceId (confirmed against a real sample response) — so the space
 * filter below is not an optimization, it's the only filter that exists.
 * If the API ever starts honoring a spaceId query param, this keeps working
 * unchanged: it just becomes a redundant (harmless) second pass.
 */

const STALE_AFTER_MS = 24 * 60 * 60 * 1000; // drop events that ended more than a day ago

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function buildCalendarDisplay(rawEvents, { spaceId, now = new Date() } = {}) {
  const events = Array.isArray(rawEvents) ? rawEvents : [];
  const nowMs = now.getTime();
  const today = startOfDay(now);

  const mapped = events
    .filter((event) => event && event.startDate)
    .filter((event) => String(event.spaceId) === String(spaceId))
    .filter((event) => event.status === 'published')
    .map((event) => {
      const startMs = new Date(event.startDate).getTime();
      const endMs = event.endDate ? new Date(event.endDate).getTime() : startMs;
      // "Ongoing" only applies on the event's start day, up to midnight —
      // a multi-day span (e.g. a month-long registration window) doesn't
      // recur as "live" every night after that, no matter how far endDate is.
      const isStartDay = startOfDay(new Date(startMs)) === today;
      return {
        id: event.id,
        title: event.name,
        starts_at: event.startDate,
        ends_at: event.endDate || null,
        category: normalizeCategory(event.type),
        status:
          nowMs < startMs
            ? 'upcoming'
            : nowMs > endMs || !isStartDay
              ? 'completed'
              : 'ongoing',
        startMs,
        endMs,
      };
    })
    .filter((event) => nowMs - event.endMs < STALE_AFTER_MS)
    .sort((a, b) => a.startMs - b.startMs);

  const stripInternal = ({ startMs, endMs, ...rest }) => rest;

  const liveEvent = mapped.find((event) => event.status === 'ongoing') || null;
  const upcomingEvents = mapped.filter((event) => event.status === 'upcoming');

  return {
    live_event: liveEvent ? stripInternal(liveEvent) : null,
    upcoming_events: upcomingEvents.map(stripInternal),
    calendar: mapped.map(stripInternal),
    generated_at: now.toISOString(),
    api_version: null,
  };
}
