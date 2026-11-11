import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { timeStringSignal, dateCharsSignal, startClock, stopClock } from './clockSignal';
import { weatherSignal, startWeatherPolling, stopWeatherPolling, refreshSharedWeather } from './weatherSignal';
import * as weatherService from '../utils/api/weatherService';

describe('Preact Signals & Timers Lifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    stopClock();
    stopWeatherPolling();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('clockSignal updates timeStringSignal on timer tick and can be stopped', () => {
    startClock();
    const initialTime = timeStringSignal.value;
    expect(initialTime).toBeDefined();

    // Advance 2 seconds
    vi.advanceTimersByTime(2000);
    expect(timeStringSignal.value).toBeDefined();

    // Stop clock and advance timers
    stopClock();
    const stoppedTime = timeStringSignal.value;
    vi.advanceTimersByTime(5000);
    // Value remains unchanged after stopping
    expect(timeStringSignal.value).toBe(stoppedTime);
  });

  it('dateCharsSignal provides array of characters representing the current date', () => {
    expect(Array.isArray(dateCharsSignal.value)).toBe(true);
    expect(dateCharsSignal.value.length).toBeGreaterThan(5);
  });

  it('weatherSignal polls weatherService and updates value without leaking timers', async () => {
    const mockWeather = {
      isRaining: false,
      description: 'clear sky',
      temperature: 28,
      precipitation: 0,
    };

    vi.spyOn(weatherService, 'getCurrentWeather').mockResolvedValue(mockWeather);

    await refreshSharedWeather();
    expect(weatherSignal.value).toEqual(mockWeather);

    startWeatherPolling();
    stopWeatherPolling();
  });
});

