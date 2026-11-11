import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchData } from './fetchData';

describe('fetchData API service', () => {
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

  it('successfully fetches active makers and caches them with timestamp', async () => {
    const mockMakers = [
      { membershipId: 'm-1', name: 'Alice' },
      { membershipId: 'm-2', name: 'Bob' },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => mockMakers,
    });

    const result = await fetchData();
    expect(result).toEqual(mockMakers);

    const cachedRaw = mockStorage['tinkerspace_cached_makers'];
    expect(cachedRaw).toBeDefined();
    const cachedParsed = JSON.parse(cachedRaw);
    expect(cachedParsed.makers).toEqual(mockMakers);
    expect(typeof cachedParsed.timestamp).toBe('number');
  });

  it('appends space_id query parameter when spaceId argument is provided', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => [],
    });

    await fetchData('42');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:4010/checkin/active?space_id=42',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('falls back to valid cached makers when network throws error', async () => {
    const cachedData = {
      timestamp: Date.now() - 1000 * 60 * 10, // 10 minutes ago (valid < 24h)
      makers: [{ membershipId: 'm-cached', name: 'Cached Maker' }],
    };
    mockStorage['tinkerspace_cached_makers'] = JSON.stringify(cachedData);

    global.fetch.mockRejectedValueOnce(new Error('Network offline'));

    const result = await fetchData();
    expect(result).toEqual(cachedData.makers);
  });

  it('falls back to legacy raw array cache structure', async () => {
    const legacyArray = [{ membershipId: 'm-legacy', name: 'Legacy Maker' }];
    mockStorage['tinkerspace_cached_makers'] = JSON.stringify(legacyArray);

    global.fetch.mockRejectedValueOnce(new Error('Network offline'));

    const result = await fetchData();
    expect(result).toEqual(legacyArray);
  });

  it('rejects expired cache (> 24 hours) and returns empty array on failure', async () => {
    const expiredData = {
      timestamp: Date.now() - 1000 * 60 * 60 * 25, // 25 hours ago
      makers: [{ membershipId: 'm-expired', name: 'Expired Maker' }],
    };
    mockStorage['tinkerspace_cached_makers'] = JSON.stringify(expiredData);

    global.fetch.mockRejectedValueOnce(new Error('Network offline'));

    const result = await fetchData();
    expect(result).toEqual([]);
  });

  it('handles non-array 200 OK responses safely by returning cached data or empty array', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ status: 'error', message: 'unauthorized' }),
    });

    const result = await fetchData();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual([]);
  });

  it('handles corrupt JSON in localStorage without throwing', async () => {
    mockStorage['tinkerspace_cached_makers'] = '{invalid-json---';

    global.fetch.mockRejectedValueOnce(new Error('Network failure'));

    const result = await fetchData();
    expect(result).toEqual([]);
  });
});

