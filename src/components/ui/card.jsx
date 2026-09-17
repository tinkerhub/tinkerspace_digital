import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('px-5 pt-5', className)} {...props} />;
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn('text-sm font-semibold text-gray-900 dark:text-gray-100', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, ...props }) {
  return <div className={cn('px-5 pb-5 pt-4', className)} {...props} />;
}
