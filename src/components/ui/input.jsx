import React from 'react';
import { cn } from '../../lib/utils';

export const Input = React.forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'flex h-9 w-full rounded-md border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 px-3 py-1 text-sm shadow-sm outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-white/40 disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
});
