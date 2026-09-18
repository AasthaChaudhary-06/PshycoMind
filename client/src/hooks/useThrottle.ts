import { useEffect, useRef, useState } from 'react';

export function useThrottle(callback, limit = 500) {
  const inThrottle = useRef(false);
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  return (...args) => {
    if (inThrottle.current) return;
    inThrottle.current = true;
    savedCallback.current(...args);
    setTimeout(() => {
      inThrottle.current = false;
    }, limit);
  };
}

export function useThrottledValue(value, limit = 500) {
  const [throttled, setThrottled] = useState(value);
  const lastUpdated = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();
    const elapsed = now - lastUpdated.current;
    if (elapsed >= limit) {
      lastUpdated.current = now;
      setThrottled(value);
      return undefined;
    }
    const timeout = setTimeout(() => {
      lastUpdated.current = Date.now();
      setThrottled(value);
    }, limit - elapsed);
    return () => clearTimeout(timeout);
  }, [value, limit]);

  return throttled;
}
