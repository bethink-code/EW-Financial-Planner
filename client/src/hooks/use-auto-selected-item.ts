import { useEffect, useRef, useState } from 'react';

/**
 * useAutoSelectedItem — sidebar selection state for any Hybrid editor.
 *
 * Behaviour:
 *  - Initial load: auto-selects the first item.
 *  - List grows (Add or Duplicate): switches to the just-added item
 *    (the one with the highest id, since serial PKs guarantee that the
 *    newcomer has the largest id). User lands on the new item ready to
 *    edit, instead of staring at whichever they were last on.
 *  - List shrinks (Delete): caller clears the selection in its delete
 *    handler; on the next render this hook re-selects the first item.
 *  - User selection wins until the list size changes again.
 */
export function useAutoSelectedItem<T>(
  items: T[],
  getId: (item: T) => number,
): [number | null, (id: number | null) => void] {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const previousCount = useRef(items.length);

  useEffect(() => {
    if (items.length === 0) {
      if (selectedId !== null) setSelectedId(null);
    } else if (selectedId === null) {
      setSelectedId(getId(items[0]));
    } else if (items.length > previousCount.current) {
      // New item — pick the largest id (the newcomer).
      let latestId = getId(items[0]);
      for (const item of items) {
        const id = getId(item);
        if (id > latestId) latestId = id;
      }
      setSelectedId(latestId);
    }
    previousCount.current = items.length;
  }, [items, selectedId, getId]);

  return [selectedId, setSelectedId];
}
