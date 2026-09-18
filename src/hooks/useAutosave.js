import { useEffect, useRef } from 'react';

/**
 * Debounce-saves whenever any value in `deps` changes, skipping the very
 * first run (the initial load/fetch that populates those values isn't a
 * user edit). Same deps-array shape as useEffect.
 */
export default function useAutosave(save, deps, { delay = 600 } = {}) {
  const isFirstRun = useRef(true);
  const timerRef = useRef(null);
  const saveRef = useRef(save);
  saveRef.current = save;

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => saveRef.current(), delay);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
