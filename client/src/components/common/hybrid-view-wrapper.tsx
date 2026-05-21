interface HybridViewWrapperProps {
  /** Optional section-level summary band at the top of the card — aggregate
   *  stats for the data on this tab. Sits above the body row; bordered off
   *  underneath. Example: AdditionalEstateDutyItemsSummary. */
  summary?: React.ReactNode;
  /** Optional top action strip — Add | Title | Duplicate/Delete. Spans the
   *  full card width above the sidebar + detail-form columns. */
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
 * card frame (border, shadow, rounded corners) plus four stacked slots:
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
}: HybridViewWrapperProps) {
  return (
    <div className="flex flex-col rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      {header && (
        <div className="border-b border-neutral-200 bg-white">{header}</div>
      )}
      {summary && (
        <div className="border-b border-neutral-200 bg-white">{summary}</div>
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
