/**
 * TinkerHub public events API service
 *
 * Fetches every event across every org/space from the public TinkerHub
 * events endpoints, then narrows it down to this display's TinkerSpace and
 * shapes it for the calendar UI. Consumed by useCalendarData.js, which
 * polls it every 5 minutes.
 *
 * Two endpoints, merged: /v1/public/event/all only returns current/future
 * events — once an event's start time passes, it moves to a separate
 * /v1/public/event/all/past endpoint (confirmed against a real response).
 * Both are fetched so the current week's past days still have events.
 *
 * Endpoints: GET /v1/public/event/all, GET /v1/public/event/all/past (no auth — public)
 *
 * @module fetchCalendar
 */
import { buildCalendarDisplay } from '../calendar/normalizeEvents';

const REQUEST_TIMEOUT_MS = 10000;

/**
 * Fallback payload returned when the API call fails for any reason.
 * Matches the shape of a successful response so consumers can rely
 * on a stable contract without null-checking the top-level object.
 */
const FALLBACK_RESPONSE = Object.freeze({
  live_event: null,
  upcoming_events: [],
  calendar: [],
  generated_at: null,
  api_version: null,
});

/**
 * Fetches one page of raw events from the given path.
 * Returns the raw event array, or null on any failure (network, timeout,
 * HTTP error, non-JSON, malformed payload) — the caller decides whether
 * that failure is fatal (primary feed) or can be treated as "no data"
 * (supplementary feed).
 */
async function fetchEventPage(apiUrl, path, spaceId) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    // The API doesn't currently filter by spaceId server-side (it returns
    // every space's events regardless), so this param is sent defensively
    // for the day it does — the client-side filter in buildCalendarDisplay
    // is what actually enforces it either way.
    // The endpoint defaults to a 20-item page with no pagination metadata
    // in the response, so a generous explicit limit is the only way to
    // avoid silently dropping events.
    const response = await fetch(
      `${apiUrl}${path}?spaceId=${encodeURIComponent(spaceId)}&limit=1000`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`[fetchCalendar] HTTP ${response.status} on ${path} — ${response.statusText}`);
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`[fetchCalendar] Response is not JSON on ${path}. Content-Type:`, contentType);
      return null;
    }

    const json = await response.json();

    // The API wraps payloads in { status, data }. Guard against unexpected shapes.
    if (!json || !json.status || !Array.isArray(json.data)) {
      return null;
    }

    return json.data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      console.error(`[fetchCalendar] Request to ${path} timed out after ${REQUEST_TIMEOUT_MS}ms`);
    } else {
      console.error(`[fetchCalendar] Fetch to ${path} failed:`, error.message);
    }

    return null;
  }
}

/**
 * Fetches the raw event lists (current + past) and returns the consolidated
 * display payload for the configured TinkerSpace.
 *
 * Handles:
 *  - Missing / empty environment variables
 *  - Network failures
 *  - HTTP error statuses (401, 500, etc.)
 *  - Non-JSON responses
 *  - Malformed / missing payload
 *  - Request timeouts
 *
 * @param {string|number} spaceId - Which TinkerSpace to show events for
 *   (assigned to this screen via the admin dashboard).
 * @returns {Promise<{
 *   live_event:       object|null,
 *   upcoming_events:  Array,
 *   calendar:         Array,
 *   generated_at:     string|null,
 *   api_version:      string|null
 * }>}
 */
export const fetchCalendarDisplay = async (spaceId) => {
  const API_URL = process.env.REACT_APP_API_BASE_URL;

  // ── Guard: environment variables ──────────────────────────────
  if (!API_URL) {
    console.warn(
      '[fetchCalendar] REACT_APP_API_BASE_URL is not set. ' +
      'Returning fallback data.'
    );
    return FALLBACK_RESPONSE;
  }

  // ── Guard: not assigned a space yet (screen unclaimed/pending) ──
  if (spaceId === null || spaceId === undefined) {
    return FALLBACK_RESPONSE;
  }

  const [currentData, pastData] = await Promise.all([
    fetchEventPage(API_URL, '/v1/public/event/all', spaceId),
    fetchEventPage(API_URL, '/v1/public/event/all/past', spaceId),
  ]);

  // The primary (current/upcoming) feed failing is a real failure — the
  // supplementary past feed failing just means this week's past days won't
  // show, everything else still works.
  if (currentData === null) {
    return FALLBACK_RESPONSE;
  }

  const merged = new Map();
  for (const event of [...currentData, ...(pastData ?? [])]) {
    if (event && event.id != null) merged.set(event.id, event);
  }

  return buildCalendarDisplay([...merged.values()], { spaceId });
};
