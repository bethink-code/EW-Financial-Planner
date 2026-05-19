import React from 'react';

interface HybridViewWrapperProps {
  summaryCards: React.ReactNode;
  detailForms: React.ReactNode;
  isUpdating?: boolean;
  isEmpty?: boolean;
  emptyStateMessage?: string;
  children?: React.ReactNode;
}

/**
 * HybridViewWrapper - the shared two-pane editing layout used across every
 * financial domain: a left sidebar of summary cards (tabs) and a right pane
 * with the detail form for the selected item.
 *
 * Usage:
 * <HybridViewWrapper
 *   summaryCards={<YourSummaryCards />}
 *   detailForms={<YourDetailForms />}
 *   isEmpty={isEmpty}
 *   emptyStateMessage="No items found"
 * />
 */
export function HybridViewWrapper({
  summaryCards,
  detailForms,
  isEmpty = false,
  emptyStateMessage = "No items found",
  children
}: HybridViewWrapperProps) {
  return (
    <div className="flex border-t border-neutral-200 max-w-full overflow-hidden">
      {/* Left Sidebar - Summary Cards (Tabs) */}
      <div className="w-80 flex-shrink-0 border-r border-neutral-200 bg-neutral-50">
        {summaryCards}
      </div>

      {/* Right Side - Detailed Forms */}
      <div className="flex-1">
        {isEmpty ? (
          <div className="text-center py-8">
            <p className="text-neutral-500 mb-4">{emptyStateMessage}</p>
          </div>
        ) : (
          detailForms
        )}
      </div>

      {/* Additional content can be passed as children */}
      {children}
    </div>
  );
}

export default HybridViewWrapper;
