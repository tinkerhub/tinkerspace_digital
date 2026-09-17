import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export function DialogContent({ className, children, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 p-5 shadow-lg',
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <X size={16} />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ className, ...props }) {
  return <div className={cn('mb-4', className)} {...props} />;
}

export function DialogTitle({ className, ...props }) {
  return <DialogPrimitive.Title className={cn('text-sm font-semibold text-gray-900 dark:text-gray-100', className)} {...props} />;
}
