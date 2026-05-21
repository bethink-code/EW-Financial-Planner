import { HybridItemPreviewCard } from './hybrid-item-preview-card';
import { HybridItemPreviewRow } from './hybrid-item-preview-row';

interface ActiveCardContent {
  /** Multi-line label/value lines joined with \n — rendered with pre-line. */
  subtitle?: string;
  /** Bold number/headline on the active card (e.g. "55 yrs", "R 1.2m"). */
  primaryValue?: string;
  /** Pipe-separated stats line below the primary value. */
  secondaryInfo?: string;
}

interface HybridSidebarProps<T> {
  items: T[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  /** Stable id per item — usually `item.id`. */
  getId: (item: T) => number;
  /** Title shown on both the active card and the compact rows. */
  getTitle: (item: T) => string;
  /** Builds the subtitle/primary/secondary slots for the active card. */
  renderActive: (item: T) => ActiveCardContent;
}

/**
 * HybridSidebar — the active-expanded / others-compact list pattern.
 *
 *   ┌────────────────────────┐
 *   │ Active item            │  ← HybridItemPreviewCard (variant="active")
 *   │   Label: value          │
 *   │   Label: value          │
 *   │ Primary                │
 *   │ Secondary | Secondary  │
 *   ├────────────────────────┤  ← single border-t cap on the row group
 *   │ Other item         (i) │  ← HybridItemPreviewRow
 *   │ Other item         (i) │
 *   └────────────────────────┘
 *
 * Drop into HybridViewWrapper's `summaryCards` slot. Each page only writes
 * its id/title/active-card mapping; spacing, borders and clickability are
 * handled here.
 */
export function HybridSidebar<T>({
  items,
  selectedId,
  onSelect,
  getId,
  getTitle,
  renderActive,
}: HybridSidebarProps<T>) {
  const selected = selectedId != null ? items.find(i => getId(i) === selectedId) ?? null : null;
  const others = items.filter(i => getId(i) !== selectedId);

  return (
    <div>
      {selected && (() => {
        const content = renderActive(selected);
        return (
          <HybridItemPreviewCard
            title={getTitle(selected)}
            subtitle={content.subtitle}
            primaryValue={content.primaryValue ?? ''}
            secondaryInfo={content.secondaryInfo}
            isLast={others.length === 0}
          />
        );
      })()}

      {others.length > 0 && (
        <div className="border-t border-neutral-200">
          {others.map(item => (
            <HybridItemPreviewRow
              key={getId(item)}
              title={getTitle(item)}
              onClick={() => onSelect(getId(item))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
