import React, { createContext, useContext, useEffect, useRef } from 'react';
import { X } from './icons';
import { cn } from '../../lib/utils';

const DialogContext = createContext({ open: false, onOpenChange: () => {} });

export function Dialog({ open, onOpenChange, children }) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ asChild, children }) {
  const { onOpenChange } = useContext(DialogContext);
  return (
    <span onClick={() => onOpenChange(true)} className="inline-block cursor-pointer">
      {children}
    </span>
  );
}

export function DialogContent({ className, children, ...props }) {
  const { open, onOpenChange } = useContext(DialogContext);
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    try {
      if (open && !dialog.open) {
        dialog.showModal();
      } else if (!open && dialog.open) {
        dialog.close();
      }
    } catch (e) {
      console.error('Error in showModal/close:', e);
    }

    return () => {
      try {
        if (dialog && dialog.open) {
          dialog.close();
        }
      } catch (e) {}
    };
  }, [open]);

  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (!dialogRef.current) return;
    const rect = dialogRef.current.getBoundingClientRect();
    const isInDialog = (
      rect.top <= e.clientY && e.clientY <= rect.bottom &&
      rect.left <= e.clientX && e.clientX <= rect.right
    );
    if (!isInDialog) onOpenChange(false);
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={() => onOpenChange(false)}
      onClick={handleBackdropClick}
      className={cn(
        'm-auto p-0 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 shadow-xl max-w-sm w-full text-gray-900 dark:text-gray-100 backdrop:bg-black/40 backdrop:backdrop-blur-sm',
        className
      )}
      {...props}
    >
      <div className="relative p-5">
        {children}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          type="button"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>
    </dialog>
  );
}

export function DialogHeader({ className, ...props }) {
  return <div className={cn('mb-4', className)} {...props} />;
}

export function DialogTitle({ className, ...props }) {
  return <h3 className={cn('text-sm font-semibold text-gray-900 dark:text-gray-100', className)} {...props} />;
}
