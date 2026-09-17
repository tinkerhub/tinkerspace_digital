import React from 'react';
import { cn } from '../../lib/utils';

const VARIANTS = {
  default: 'bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200',
  outline: 'border border-gray-300 dark:border-white/20 bg-transparent hover:bg-gray-100 dark:hover:bg-white/10',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-white/10',
};

export const Button = React.forwardRef(function Button(
  { className, variant = 'default', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        className
      )}
      {...props}
    />
  );
});
