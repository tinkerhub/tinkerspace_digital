/**
 * TinkerHub public events API service
 *
 * Fetches every event across every org/space from the public TinkerHub
 * events endpoint, then narrows it down to this display's TinkerSpace and
 * shapes it for the calendar UI. Consumed by CalendarDashboard.jsx, which
 * polls it every 5 minutes.
 *
 * Endpoint: GET /v1/public/event/all (no auth — path is public)
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
 * Fetches the raw event list and returns the consolidated display payload
 * for the configured TinkerSpace.
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

  // ── Timeout via AbortController ───────────────────────────────
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
      `${API_URL}/v1/public/event/all?spaceId=${encodeURIComponent(spaceId)}&limit=1000`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    // ── Guard: HTTP errors ────────────────────────────────────
    if (!response.ok) {
      console.error(
        `[fetchCalendar] HTTP ${response.status} — ${response.statusText}`
      );
      return FALLBACK_RESPONSE;
    }

    // ── Guard: content type ───────────────────────────────────
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(
        '[fetchCalendar] Response is not JSON. Content-Type:', contentType
      );
      return FALLBACK_RESPONSE;
    }

    // ── Parse JSON ────────────────────────────────────────────
    const json = await response.json();

    // The API wraps payloads in { status, data }.
    // Guard against unexpected shapes.
    if (!json || !json.status || !Array.isArray(json.data)) {
      return FALLBACK_RESPONSE;
    }

    return buildCalendarDisplay(json.data, { spaceId });
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      console.error(
        `[fetchCalendar] Request timed out after ${REQUEST_TIMEOUT_MS}ms`
      );
    } else {
      console.error('[fetchCalendar] Fetch failed:', error.message);
    }

    return FALLBACK_RESPONSE;
  }
};
