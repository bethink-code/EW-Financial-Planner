import { useMemo } from 'react';

/**
 * useHybridViewData - A custom hook to prepare data for hybrid view components
 * Extracts totals, summary data, and formats items for consistent display
 */
interface UseHybridViewDataProps<T> {
  items: T[];
  getTotals: (items: T[]) => Record<string, number>;
  getSummaryItems: (totals: Record<string, number>, items: T[]) => Array<{
    label: string;
    value: string | number;
    className?: string;
  }>;
  getItemPreview: (item: T) => {
    id: string | number;
    title: string;
    subtitle?: string;
    primaryValue: string;
    secondaryInfo?: string;
  };
  maxPreviewItems?: number;
}

export function useHybridViewData<T>({
  items,
  getTotals,
  getSummaryItems,
  getItemPreview,
  maxPreviewItems = 5
}: UseHybridViewDataProps<T>) {
  
  const totals = useMemo(() => getTotals(items), [items, getTotals]);
  
  const summaryItems = useMemo(() => getSummaryItems(totals, items), [totals, items, getSummaryItems]);
  
  const previewItems = useMemo(() => {
    return items.slice(0, maxPreviewItems).map(getItemPreview);
  }, [items, maxPreviewItems, getItemPreview]);
  
  const hasMoreItems = items.length > maxPreviewItems;
  const remainingCount = items.length - maxPreviewItems;
  
  return {
    totals,
    summaryItems,
    previewItems,
    hasMoreItems,
    remainingCount,
    isEmpty: items.length === 0
  };
}

export default useHybridViewData;