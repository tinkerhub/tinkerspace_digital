import React from 'react';
import { cn } from '../../lib/utils';

export const Switch = React.forwardRef(function Switch({ className, disabled, ...props }, ref) {
  return (
    <label
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className
      )}
    >
      <input ref={ref} type="checkbox" role="switch" disabled={disabled} className="peer sr-only" {...props} />
      <span
        className="absolute inset-0 rounded-full bg-gray-300 dark:bg-white/20 transition-colors
          peer-checked:bg-gray-900 dark:peer-checked:bg-white
          peer-focus-visible:ring-2 peer-focus-visible:ring-gray-400 dark:peer-focus-visible:ring-white/40"
      />
      <span
        className="absolute left-0.5 h-4 w-4 rounded-full bg-white dark:bg-gray-900 shadow transition-transform
          peer-checked:translate-x-4"
      />
    </label>
  );
});
