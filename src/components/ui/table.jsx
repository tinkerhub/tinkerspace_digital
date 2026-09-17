import React from 'react';
import { cn } from '../../lib/utils';

export function Table({ className, ...props }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full text-sm', className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }) {
  return <thead className={cn('border-b border-gray-200 dark:border-white/10', className)} {...props} />;
}

export function TableBody({ className, ...props }) {
  return <tbody className={cn('divide-y divide-gray-100 dark:divide-white/5', className)} {...props} />;
}

export function TableRow({ className, ...props }) {
  return <tr className={cn('', className)} {...props} />;
}

export function TableHead({ className, ...props }) {
  return (
    <th
      className={cn('px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400', className)}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }) {
  return <td className={cn('px-3 py-2 align-middle', className)} {...props} />;
}
