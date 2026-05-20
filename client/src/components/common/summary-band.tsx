import { cn } from '@/lib/utils';

interface SummaryBandProps {
  /** When true, the first column is left as a spacer matching the body's
   *  w-80 sidebar so the tiles sit directly above the detail-form area.
   *  Set to false on tabs without a sidebar (single-record pages) so the
   *  tiles span the full card width. Defaults to true. */
  firstColIsSidebar?: boolean;
  children: React.ReactNode;
}

/**
 * SummaryBand — section-level summary row that lives in HybridViewWrapper's
 * `summary` slot. Provides the shared outer layout: optional sidebar-width
 * spacer + an auto-distributed grid of SummaryTile children.
 *
 *   ┌──────────────┬─────────────────────────────────────────────────┐
 *   │ (spacer)     │  [ Tile ]   [ Tile ]   [ Tile ]                 │
 *   └──────────────┴─────────────────────────────────────────────────┘
 *
 * Auto-flow: tiles take equal-fraction columns regardless of how many you
 * pass, so adding a fourth tile re-balances the grid automatically.
 */
export function SummaryBand({ firstColIsSidebar = true, children }: SummaryBandProps) {
  return (
    <div className="flex items-stretch">
      {firstColIsSidebar && <div className="w-80 flex-shrink-0" />}
      <div className={cn('flex-1 py-5', firstColIsSidebar ? 'pl-6 pr-4' : 'px-4')}>
        <div className="grid grid-flow-col auto-cols-fr gap-3">
          {children}
        </div>
      </div>
    </div>
  );
}

type TileVariant = 'default' | 'accent';

interface SummaryTileProps {
  label: string;
  value: string;
  /** Optional smaller line under the value (e.g. "2 assets"). */
  subValue?: string;
  /** `default` — light blue chip (the common case).
   *  `accent` — warm cream chip (Net / headline tiles). */
  variant?: TileVariant;
}

const TILE_STYLES: Record<TileVariant, { bg: string; border: string; label: string }> = {
  default: {
    bg: '#F4F8FB',
    border: 'var(--ew-blue-tertiary-50)',
    label: 'var(--ew-blue)',
  },
  accent: {
    bg: '#FAF5EA',
    border: '#ECE5D3',
    label: '#A55A2A',
  },
};

/**
 * SummaryTile — one card inside a SummaryBand. Label on the left (uppercase,
 * coloured); value on the right (semibold, neutral-900). Optional subValue
 * stacks under the value, right-aligned.
 *
 * Variants exist so client-feedback tweaks land in one place: change the
 * `default` style here and every section summary updates.
 */
export function SummaryTile({ label, value, subValue, variant = 'default' }: SummaryTileProps) {
  const s = TILE_STYLES[variant];
  return (
    <div
      className="rounded-lg border px-4 py-4 flex items-center justify-between"
      style={{ backgroundColor: s.bg, borderColor: s.border }}
    >
      <div
        className="text-sm font-medium uppercase tracking-wide"
        style={{ color: s.label }}
      >
        {label}
      </div>
      <div className="flex flex-col items-end">
        <div className="text-lg font-semibold text-neutral-900">{value}</div>
        {subValue && (
          <div className="text-xs mt-0.5" style={{ color: s.label }}>
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
}
