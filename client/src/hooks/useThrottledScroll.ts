import { useCallback, useRef } from 'react';

/**
 * Returns a scroll listener throttled for high-frequency events
 * (window resize, PDF scroll, progress tracking).
 */
export function useThrottledScroll(callback, limit = 500) {
  const inThrottle = useRef(false);
  const savedCallback = useRef(callback);

  savedCallback.current = callback;

  return useCallback(
    (...args) => {
      if (inThrottle.current) return;
      inThrottle.current = true;
      savedCallback.current(...args);
      setTimeout(() => {
        inThrottle.current = false;
      }, limit);
    },
    [limit],
  );
}
