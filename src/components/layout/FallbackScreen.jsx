import React, { useEffect, useState } from 'react';

// Shown when both Calendar and Makers are hidden (disabled or empty) —
// keeps the display from ever going blank.
export default function FallbackScreen() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 text-gray-900 dark:text-gray-100">
      <div className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">TinkerHub</div>
      <div className="text-7xl font-black tracking-tighter">
        {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
      </div>
      <div className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
}
