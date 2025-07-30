import { useRef, useCallback } from 'react';

export function useDebouncedUpdate<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<Map<string, any>>(new Map());

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // For retirement funds, args are: [id, field, value]
      const [id, field, value] = args;
      const key = `${id}-${field}`;
      
      // Store the latest value
      pendingUpdatesRef.current.set(key, { id, field, value });
      
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        // Process all pending updates
        const updates = Array.from(pendingUpdatesRef.current.values());
        pendingUpdatesRef.current.clear();
        
        // Execute callback for each update
        updates.forEach(({ id, field, value }) => {
          callback(id, field, value);
        });
      }, delay);
    },
    [callback, delay]
  ) as T;

  return debouncedCallback;
}