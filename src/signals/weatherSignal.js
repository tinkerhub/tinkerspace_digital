import { signal } from '@preact/signals';
import { getCurrentWeather } from '../utils/api/weatherService';

export const weatherSignal = signal(null);

let weatherTimer = null;
let isFetching = false;

export async function refreshSharedWeather() {
  if (isFetching) return;
  isFetching = true;
  try {
    const data = await getCurrentWeather();
    if (data) {
      weatherSignal.value = data;
    }
  } catch (err) {
    console.warn('[weatherSignal] Failed to fetch weather:', err);
  } finally {
    isFetching = false;
  }
}

export function startWeatherPolling() {
  if (weatherTimer) return;
  refreshSharedWeather();
  weatherTimer = setInterval(refreshSharedWeather, 300000); // 5 minutes
}

export function stopWeatherPolling() {
  if (weatherTimer) {
    clearInterval(weatherTimer);
    weatherTimer = null;
  }
}

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
  startWeatherPolling();
}
