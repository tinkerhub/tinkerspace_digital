import { signal } from '@preact/signals';

function getFormattedTime() {
  return new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function getFormattedDateChars() {
  return new Date()
    .toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    .toUpperCase()
    .split('');
}

export const timeStringSignal = signal(getFormattedTime());
export const dateCharsSignal = signal(getFormattedDateChars());

let clockTimer = null;
let lastKnownDay = new Date().getDate();

export function startClock() {
  if (clockTimer) return;
  clockTimer = setInterval(() => {
    timeStringSignal.value = getFormattedTime();
    
    // Only recompute date characters when day of month changes (at midnight)
    const today = new Date().getDate();
    if (today !== lastKnownDay) {
      lastKnownDay = today;
      dateCharsSignal.value = getFormattedDateChars();
    }
  }, 1000);
}

export function stopClock() {
  if (clockTimer) {
    clearInterval(clockTimer);
    clockTimer = null;
  }
}

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
  startClock();
}
