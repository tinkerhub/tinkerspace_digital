import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchCalendarDisplay } from './fetchCalendar';

describe('fetchCalendar API service', () => {
  const originalEnv = process.env;
  let mockStorage = {};

  beforeEach(() => {
    mockStorage = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => mockStorage[key] ?? null),
      setItem: vi.fn((key, val) => { mockStorage[key] = String(val); }),
      removeItem: vi.fn((key) => { delete mockStorage[key]; }),
      clear: vi.fn(() => { mockStorage = {}; }),
    });
    vi.stubGlobal('fetch', vi.fn());
    process.env = { ...originalEnv, REACT_APP_API_BASE_URL: 'http://localhost:4010' };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    process.env = originalEnv;
  });

  it('serves cached calendar when server returns HTTP 500 error', async () => {
    const cachedCalendar = {
      live_event: { id: 'evt-live', title: 'Live Workshop' },
      upcoming_events: [],
      calendar: [],
      generated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
      api_version: null,
    };
    mockStorage['tinkerspace_cached_calendar'] = JSON.stringify(cachedCalendar);

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      headers: { get: () => 'application/json' },
    });

    const result = await fetchCalendarDisplay('1');
    expect(result.generated_at).toBe(cachedCalendar.generated_at);
    expect(result.live_event?.title).toBe('Live Workshop');
  });

  it('serves cached calendar when reverse proxy returns HTML error page (e.g. 502/504)', async () => {
    const cachedCalendar = {
      live_event: { id: 'evt-live', title: 'Cached HTML Fallback' },
      upcoming_events: [],
      calendar: [],
      generated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      api_version: null,
    };
    mockStorage['tinkerspace_cached_calendar'] = JSON.stringify(cachedCalendar);

    global.fetch.mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'text/html' },
      text: async () => '<html>502 Bad Gateway</html>',
    });

    const result = await fetchCalendarDisplay('1');
    expect(result.live_event?.title).toBe('Cached HTML Fallback');
  });

  it('suppresses live_event if cached calendar is between 24h and 72h old', async () => {
    const staleDate = new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(); // 36 hours old
    const cachedCalendar = {
      live_event: { id: 'evt-stale', title: 'Stale Live Event' },
      upcoming_events: [{ id: 'evt-up', title: 'Future Event' }],
      calendar: [],
      generated_at: staleDate,
      api_version: null,
    };
    mockStorage['tinkerspace_cached_calendar'] = JSON.stringify(cachedCalendar);

    global.fetch.mockRejectedValueOnce(new Error('Network offline'));

    const result = await fetchCalendarDisplay('1');
    // Live event is cleared because 36h > 24h
    expect(result.live_event).toBeNull();
    // But upcoming events and calendar are retained because 36h < 72h
    expect(result.upcoming_events.length).toBe(1);
  });

  it('completely expires cache when older than 72 hours and returns fallback payload', async () => {
    const veryStaleDate = new Date(Date.now() - 1000 * 60 * 60 * 75).toISOString(); // 75 hours old
    const cachedCalendar = {
      live_event: { id: 'evt-old', title: 'Old Event' },
      upcoming_events: [],
      calendar: [],
      generated_at: veryStaleDate,
      api_version: null,
    };
    mockStorage['tinkerspace_cached_calendar'] = JSON.stringify(cachedCalendar);

    global.fetch.mockRejectedValueOnce(new Error('Network offline'));

    const result = await fetchCalendarDisplay('1');
    expect(result.generated_at).toBeNull();
    expect(result.calendar).toEqual([]);
  });

  it('returns fallback immediately when spaceId is null or undefined without network call', async () => {
    const result = await fetchCalendarDisplay(null);
    expect(result.generated_at).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

