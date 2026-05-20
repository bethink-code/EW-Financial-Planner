import React from 'react';

interface HybridViewWrapperProps {
  /** Optional top action strip — Add | Title | Duplicate/Delete. Spans the
   *  full form-card width above the sidebar + detail-form columns. */
  header?: React.ReactNode;
  summaryCards: React.ReactNode;
  detailForms: React.ReactNode;
  isUpdating?: boolean;
  isEmpty?: boolean;
  emptyStateMessage?: string;
  children?: React.ReactNode;
}

/**
 * HybridViewWrapper — the shared two-pane editing layout used across every
 * financial domain. Three slots:
 *
 *   ┌──────────────────────────────────────────────────────┐
 *   │  header  (Add | Title | Duplicate/Delete — full width│
 *   ├────────────┬─────────────────────────────────────────┤
 *   │ summary    │ detailForms                             │
 *   │ cards      │                                         │
 *   └────────────┴─────────────────────────────────────────┘
 *
 * The header is the new pattern (action strip across the top); the sidebar
 * holds the active item expanded + compact rows for the rest; the right
 * pane holds the form fields with no header of its own.
 */
export function HybridViewWrapper({
  header,
  summaryCards,
  detailForms,
  isEmpty = false,
  emptyStateMessage = "No items found",
  children,
}: HybridViewWrapperProps) {
  return (
    <div className="flex flex-col">
      {header && (
        <div className="border-b border-neutral-200">
          {header}
        </div>
      )}
      <div className="flex max-w-full overflow-hidden">
        <div className="w-80 flex-shrink-0 border-r border-neutral-200 bg-neutral-50">
          {summaryCards}
        </div>
        <div className="flex-1">
          {isEmpty ? (
            <div className="text-center py-8">
              <p className="text-neutral-500 mb-4">{emptyStateMessage}</p>
            </div>
          ) : (
            detailForms
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export default HybridViewWrapper;
