interface HybridViewWrapperProps {
  /** Optional section-level summary band — aggregate stats for the data on this
   *  tab. Sits at the very top of the card, above the header row. Example:
   *  AdditionalEstateDutyItemsSummary, SectionCapitalSummary. */
  summary?: React.ReactNode;
  /** Optional action strip — Add | Title | Duplicate/Delete. Spans the full
   *  card width, below the summary and above the sidebar + detail-form columns. */
  header?: React.ReactNode;
  summaryCards: React.ReactNode;
  detailForms: React.ReactNode;
  isUpdating?: boolean;
  isEmpty?: boolean;
  emptyStateMessage?: string;
  children?: React.ReactNode;
}

/**
 * HybridViewWrapper — the shared two-pane editing layout. Renders the white
 * card frame (border, shadow, rounded BOTTOM corners) plus four stacked slots.
 * The top is squared and pulled up 1px (-mt-px) so its border merges with the
 * section tab strip's underline above it — no double line / corner notch at the
 * seam. (On a tab-less page the card simply reads as a square-topped card.)
 *
 *   ┌──────────────────────────────────────────────────────┐
 *   │  summary  (section-level aggregate stats)            │
 *   ├──────────────────────────────────────────────────────┤
 *   │  header   (Add | Title | Duplicate/Delete)           │
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
}: HybridViewWrapperProps) {
  return (
    <div className="-mt-px flex flex-col rounded-b-lg shadow-sm border border-neutral-200 overflow-hidden">
      {summary && (
        <div className="border-b border-neutral-200 bg-white">{summary}</div>
      )}
      {header && (
        <div className="border-b border-neutral-200 bg-white">{header}</div>
      )}
      <div className="flex max-w-full overflow-hidden">
        <div className="w-80 flex-shrink-0 border-r border-neutral-200 bg-neutral-50">
          {summaryCards}
        </div>
        <div className="flex-1 bg-white">
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
