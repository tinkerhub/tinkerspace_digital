import React, { createContext, useCallback, useContext, useState } from 'react';
import { cn } from '../../lib/utils';

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, variant = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{ animation: 'toast-in 200ms ease-out' }}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium shadow-lg text-white',
              t.variant === 'error' ? 'bg-red-600' : 'bg-gray-900 dark:bg-white dark:text-gray-900'
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Returns a showToast(message, variant?) function — variant is 'success' (default) or 'error'.
export function useToast() {
  return useContext(ToastContext);
}
