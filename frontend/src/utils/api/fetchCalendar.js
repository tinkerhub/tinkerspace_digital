/**
 * SpaceCalendar API Service
 * 
 * Fetches display data from the SpaceCalendar API.
 * This module is a standalone service layer — it is not imported
 * anywhere yet and does not trigger any polling or side effects.
 * 
 * Endpoint: GET /api/v1/display
 * Auth:     X-API-Key header
 * 
 * @module fetchCalendar
 */

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
 * Fetches the consolidated display payload from the SpaceCalendar API.
 *
 * Handles:
 *  - Missing / empty environment variables
 *  - Network failures
 *  - HTTP error statuses (401, 500, etc.)
 *  - Non-JSON responses
 *  - Malformed / missing payload
 *  - Request timeouts
 *
 * @returns {Promise<{
 *   live_event:       object|null,
 *   upcoming_events:  Array,
 *   calendar:         Array,
 *   generated_at:     string|null,
 *   api_version:      string|null
 * }>}
 */
export const fetchCalendarDisplay = async () => {
  const API_URL = process.env.REACT_APP_SPACECALENDAR_API;
  const API_KEY = process.env.REACT_APP_SPACECALENDAR_API_KEY;

  // ── Guard: environment variables ──────────────────────────────
  if (!API_URL) {
    console.warn(
      '[fetchCalendar] REACT_APP_SPACECALENDAR_API is not set. ' +
      'Returning fallback data.'
    );
    return FALLBACK_RESPONSE;
  }

  if (!API_KEY) {
    console.warn(
      '[fetchCalendar] REACT_APP_SPACECALENDAR_API_KEY is not set. ' +
      'Returning fallback data.'
    );
    return FALLBACK_RESPONSE;
  }

  // ── Timeout via AbortController ───────────────────────────────
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}/api/v1/display`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-Key': API_KEY,
      },
      signal: controller.signal,
    });

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

    // The API wraps payloads in { success, data }.
    // Guard against unexpected shapes.
    if (!json || !json.success || !json.data) {
      console.error(
        '[fetchCalendar] Unexpected response structure:', json
      );
      return FALLBACK_RESPONSE;
    }

    const { data } = json;

    // ── Normalise & return ────────────────────────────────────
    return {
      live_event: data.live_event ?? null,
      upcoming_events: Array.isArray(data.upcoming_events) ? data.upcoming_events : [],
      calendar: Array.isArray(data.calendar) ? data.calendar : [],
      generated_at: data.generated_at ?? null,
      api_version: data.api_version ?? null,
    };
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
