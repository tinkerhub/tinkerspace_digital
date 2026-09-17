import React from 'react';

export default function UnclaimedScreen({ code }) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="animate-pulse text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
        Waiting for setup
      </div>
      <div className="mt-4 text-6xl font-bold tracking-wider">#{code}</div>
      <p className="mt-6 max-w-xs text-center text-sm text-gray-500 dark:text-gray-400">
        Open the admin dashboard on any device and claim this screen using the code above.
      </p>
    </div>
  );
}
