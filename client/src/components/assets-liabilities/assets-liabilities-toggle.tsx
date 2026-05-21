import { cn } from '@/lib/utils';

export type AssetsLiabilitiesMode = 'assets' | 'liabilities';

interface AssetsLiabilitiesToggleProps {
  mode: AssetsLiabilitiesMode;
  onChange: (mode: AssetsLiabilitiesMode) => void;
  /** NET total = total assets − total liabilities. Constant across both
   *  toggle states; shows the estate's net worth at a glance. */
  netTotal: string;
}

/**
 * AssetsLiabilitiesToggle — the cream "accent" tile that lives in the
 * SummaryBand's firstSlot for the Assets & Liabilities tab. Two pill-style
 * tabs (Assets / Liabilities) flip the active dataset; the NET total below
 * stays constant because it's an estate-level figure.
 */
export function AssetsLiabilitiesToggle({ mode, onChange, netTotal }: AssetsLiabilitiesToggleProps) {
  return (
    <div
      className="rounded-lg border px-4 py-3 flex flex-col gap-2 h-full"
      style={{ backgroundColor: '#FAF5EA', borderColor: '#ECE5D3' }}
    >
      <div className="flex items-center gap-4 border-b pb-2" style={{ borderColor: '#ECE5D3' }}>
        <ToggleTab active={mode === 'assets'} onClick={() => onChange('assets')} label="Assets" />
        <ToggleTab active={mode === 'liabilities'} onClick={() => onChange('liabilities')} label="Liabilities" />
      </div>
      <div className="flex flex-col items-center justify-center flex-1 pt-1">
        <div className="text-xs font-medium text-neutral-600">NET Assets</div>
        <div className="text-lg font-semibold text-neutral-900">{netTotal}</div>
      </div>
    </div>
  );
}

function ToggleTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'text-sm font-medium pb-1 transition-colors',
        active ? 'border-b-2' : 'text-neutral-500 hover:text-neutral-700',
      )}
      style={
        active
          ? { color: '#A55A2A', borderColor: '#A55A2A' }
          : undefined
      }
    >
      {label}
    </button>
  );
}
