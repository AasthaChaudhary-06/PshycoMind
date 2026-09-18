import { useCallback, useEffect, useRef, useState } from 'react';

export function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useDebouncedCallback(callback, delay = 400) {
  const ref = useRef<any>();
  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  return useCallback(
    (...args) => {
      const timeout = setTimeout(() => ref.current?.(...args), delay);
      return () => clearTimeout(timeout);
    },
    [delay],
  );
}
