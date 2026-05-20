import React from 'react';
import { cn } from '@/lib/utils';

interface HybridViewWrapperProps {
  /** Optional section-level summary band at the top of the card — aggregate
   *  stats for the data on this tab. Sits above the header strip; bordered
   *  off underneath. Example: AdditionalEstateDutyItemsSummary. */
  summary?: React.ReactNode;
  /** Optional top action strip — Add | Title | Duplicate/Delete. Spans the
   *  full form-card width above the sidebar + detail-form columns. */
  header?: React.ReactNode;
  summaryCards: React.ReactNode;
  detailForms: React.ReactNode;
  isUpdating?: boolean;
  isEmpty?: boolean;
  emptyStateMessage?: string;
  children?: React.ReactNode;
  /** When true, the wrapper renders its own white card (background, border,
   *  shadow, rounded corners). Use this on pages that don't wrap the editor
   *  in a separate CalculatorHeader card — i.e. pages migrated to the new
   *  top-strip-inside-the-card pattern. Defaults to false for backward
   *  compatibility with the older pages that still rely on CalculatorHeader
   *  for the card visual. */
  card?: boolean;
}

/**
 * HybridViewWrapper — the shared two-pane editing layout used across every
 * financial domain. Four optional slots:
 *
 *   ┌──────────────────────────────────────────────────────┐
 *   │  header   (Add | Title | Duplicate/Delete)           │
 *   ├──────────────────────────────────────────────────────┤
 *   │  summary  (section-level aggregate stats)            │
 *   ├────────────┬─────────────────────────────────────────┤
 *   │ summary    │ detailForms                             │
 *   │ cards      │                                         │
 *   └────────────┴─────────────────────────────────────────┘
 *
 * The phase/step-level summary (e.g. Retirement projection ribbon) lives
 * elsewhere — passed through NeedLayout's `headerExtra` slot into the
 * PlanStepper card.
 */
export function HybridViewWrapper({
  summary,
  header,
  summaryCards,
  detailForms,
  isEmpty = false,
  emptyStateMessage = "No items found",
  children,
  card = false,
}: HybridViewWrapperProps) {
  return (
    <div
      className={cn(
        "flex flex-col",
        card && "rounded-lg shadow-sm border border-neutral-200 overflow-hidden",
      )}
    >
      {header && (
        <div className={cn("border-b border-neutral-200", card && "bg-white")}>
          {header}
        </div>
      )}
      {summary && (
        <div className={cn("border-b border-neutral-200", card && "bg-white")}>
          {summary}
        </div>
      )}
      <div className="flex max-w-full overflow-hidden">
        <div className="w-80 flex-shrink-0 border-r border-neutral-200 bg-neutral-50">
          {summaryCards}
        </div>
        <div className={cn("flex-1", card && "bg-white")}>
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
