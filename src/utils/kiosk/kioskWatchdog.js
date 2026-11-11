/**
 * 24/7 Kiosk Watchdog
 *
 * Designed specifically for unattended digital signage displays.
 * Performs scheduled off-hours soft reloads (at 04:00 AM) to clear
 * Chromium V8 heap memory fragmentation and GPU texture allocations,
 * and monitors online/offline connectivity with offline reload protection.
 */

let isInitialized = false;
let reloadTimer = null;
let onlineHandler = null;
let offlineHandler = null;

export async function canSafelyReload() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }
  try {
    const publicUrl = (typeof process !== 'undefined' && process.env?.PUBLIC_URL) || '';
    const probePath = `${publicUrl}/manifest.json` || '/manifest.json';
    const probe = await fetch(probePath, { method: 'HEAD', cache: 'no-store' });
    return probe.ok || probe.status === 304 || probe.status === 405;
  } catch {
    return false;
  }
}

export function teardownKioskWatchdog() {
  if (reloadTimer) {
    clearTimeout(reloadTimer);
    reloadTimer = null;
  }
  if (typeof window !== 'undefined') {
    if (onlineHandler) window.removeEventListener('online', onlineHandler);
    if (offlineHandler) window.removeEventListener('offline', offlineHandler);
  }
  onlineHandler = null;
  offlineHandler = null;
  isInitialized = false;
}

export function initKioskWatchdog(onOnlineCallback) {
  if (typeof window === 'undefined') return () => {};
  if (isInitialized) return teardownKioskWatchdog;
  isInitialized = true;

  // 1. Off-hours scheduled daily soft reload (04:00 AM)
  const scheduleDailyMaintenance = () => {
    const now = new Date();
    const target = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      4, // 04:00 AM
      0,
      0,
      0
    );

    if (now >= target) {
      target.setDate(target.getDate() + 1);
    }

    const delayMs = target.getTime() - now.getTime();
    console.log(`[KioskWatchdog] Scheduled daily maintenance reload in ${Math.round(delayMs / 60000)} minutes.`);

    const executeReloadWhenSafe = async () => {
      const isSafe = await canSafelyReload();
      if (!isSafe) {
        console.warn('[KioskWatchdog] Scheduled 04:00 AM reload deferred: display appears offline.');
        reloadTimer = setTimeout(executeReloadWhenSafe, 15 * 60 * 1000); // Check again in 15 mins
        return;
      }

      console.log('[KioskWatchdog] Executing scheduled 04:00 AM memory purge.');
      window.location.reload();
    };

    reloadTimer = setTimeout(executeReloadWhenSafe, delayMs);
  };

  scheduleDailyMaintenance();

  // 2. Connectivity event tracking & online recovery
  onlineHandler = () => {
    console.log('[KioskWatchdog] Network connection re-established.');
    window.dispatchEvent(new CustomEvent('kiosk:online'));
    if (typeof onOnlineCallback === 'function') {
      onOnlineCallback();
    }
  };

  offlineHandler = () => {
    console.warn('[KioskWatchdog] Network connection lost. Serving from local cache.');
    window.dispatchEvent(new CustomEvent('kiosk:offline'));
  };

  window.addEventListener('online', onlineHandler);
  window.addEventListener('offline', offlineHandler);

  return teardownKioskWatchdog;
}
