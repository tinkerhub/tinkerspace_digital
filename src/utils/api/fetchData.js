const REQUEST_TIMEOUT_MS = 10000;
const MAX_CACHE_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours max

function getCacheKey(spaceId) {
  return spaceId ? `tinkerspace_cached_makers_${spaceId}` : 'tinkerspace_cached_makers';
}

function getCachedMakers(spaceId) {
  if (typeof window === 'undefined') return [];
  try {
    const key = getCacheKey(spaceId);
    let raw = localStorage.getItem(key);
    // If partitioned key is not set, fallback to default key
    if (!raw && spaceId) {
      raw = localStorage.getItem('tinkerspace_cached_makers');
    }
    if (!raw) return [];
    const parsed = JSON.parse(raw);

    // Support both new wrapper format { timestamp, makers } and legacy raw array
    let makers = [];
    let timestamp = 0;

    if (Array.isArray(parsed)) {
      makers = parsed;
    } else if (parsed && Array.isArray(parsed.makers)) {
      makers = parsed.makers;
      timestamp = parsed.timestamp || 0;
    }

    if (timestamp > 0 && Date.now() - timestamp > MAX_CACHE_AGE_MS) {
      console.warn('[fetchData] Cached makers expired (> 24h).');
      return [];
    }

    if (makers.length > 0) {
      console.warn('[fetchData] Serving cached active makers.');
    }
    return makers;
  } catch (e) {
    console.warn('[fetchData] Failed to parse cached makers:', e);
    return [];
  }
}

export const fetchData = async (spaceId) => {
  const API_URL = process.env.REACT_APP_API_BASE_URL;

  if (!API_URL) {
    console.warn('[fetchData] REACT_APP_API_BASE_URL is not set.');
    return getCachedMakers(spaceId);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const query = spaceId ? `?space_id=${encodeURIComponent(spaceId)}` : '';
    const response = await fetch(`${API_URL}/checkin/active${query}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'same-origin',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Response is not JSON.');
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      if (typeof window !== 'undefined') {
        try {
          const cacheKey = getCacheKey(spaceId);
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ timestamp: Date.now(), makers: data })
          );
          if (!spaceId || spaceId === 1) {
            localStorage.setItem(
              'tinkerspace_cached_makers',
              JSON.stringify({ timestamp: Date.now(), makers: data })
            );
          }
        } catch (e) {
          // Ignore quota errors
        }
      }
      return data;
    }

    console.warn('[fetchData] API returned non-array payload:', data);
    return getCachedMakers(spaceId);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error(`[fetchData] Request timed out after ${REQUEST_TIMEOUT_MS}ms`);
    } else {
      console.error('[fetchData] Error fetching data:', error.message);
    }
    return getCachedMakers(spaceId);
  }
};
