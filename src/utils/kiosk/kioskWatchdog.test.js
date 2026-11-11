import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { initKioskWatchdog, teardownKioskWatchdog, canSafelyReload } from './kioskWatchdog';

describe('kioskWatchdog 24/7 guardian', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    teardownKioskWatchdog();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    teardownKioskWatchdog();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('initKioskWatchdog is idempotent and does not attach duplicate timers or listeners', () => {
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout');
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    initKioskWatchdog();
    initKioskWatchdog();
    initKioskWatchdog();

    // Only 1 maintenance reload timer is scheduled
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
    // Only 2 listeners (online, offline) are registered
    expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
  });

  it('teardownKioskWatchdog cleans up registered timers and listeners', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    initKioskWatchdog();
    teardownKioskWatchdog();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  it('canSafelyReload returns false if browser navigator is offline', async () => {
    vi.stubGlobal('navigator', { onLine: false });
    const safe = await canSafelyReload();
    expect(safe).toBe(false);
  });

  it('canSafelyReload returns true if navigator is online and probe succeeds', async () => {
    // Assert that the probed asset actually exists in the public directory on disk
    const manifestPath = path.resolve(__dirname, '../../../public/manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);

    vi.stubGlobal('navigator', { onLine: true });
    global.fetch.mockResolvedValueOnce({ ok: true, status: 200 });
    const safe = await canSafelyReload();
    expect(safe).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith('/manifest.json', { method: 'HEAD', cache: 'no-store' });
  });

  it('canSafelyReload returns true if probe returns 405 Method Not Allowed (server is online)', async () => {
    vi.stubGlobal('navigator', { onLine: true });
    global.fetch.mockResolvedValueOnce({ ok: false, status: 405 });
    const safe = await canSafelyReload();
    expect(safe).toBe(true);
  });

  it('canSafelyReload returns false if network probe fails', async () => {
    vi.stubGlobal('navigator', { onLine: true });
    global.fetch.mockRejectedValueOnce(new Error('Probe timeout'));
    const safe = await canSafelyReload();
    expect(safe).toBe(false);
  });

  it('online event triggers callback and dispatches kiosk:online window event', () => {
    const onlineCallback = vi.fn();
    const kioskOnlineEventSpy = vi.fn();
    window.addEventListener('kiosk:online', kioskOnlineEventSpy);

    initKioskWatchdog(onlineCallback);

    window.dispatchEvent(new Event('online'));

    expect(onlineCallback).toHaveBeenCalledTimes(1);
    expect(kioskOnlineEventSpy).toHaveBeenCalledTimes(1);

    window.removeEventListener('kiosk:online', kioskOnlineEventSpy);
  });
});

