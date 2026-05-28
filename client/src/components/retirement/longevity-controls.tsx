import { formatCurrencyValue } from "@/lib/formatting";
import { Slider } from "@/components/ui/slider";
import { YieldControl } from "@/components/retirement/yield-control";

type Format = "currency" | "percent" | "age";

export interface DrawdownLevers {
  // Fixed from the profile — not editable here:
  currentAge: number;
  startingBalance: number;
  // Editable levers:
  cpiPct: number;
  retirementAge: number;
  untilAge: number;
  monthlySaving: number;
  monthlyIncomeRequired: number;
  yieldPremiumPct: number;
}

/** Live preset targets, recomputed by the page on every change. */
export interface DrawdownPresets {
  /** Sustainable monthly income at the current settings. */
  providedIncome: number;
  /** Monthly saving that funds the required income to the end age. */
  requiredSaving: number;
}

const rand = (n: number) => formatCurrencyValue(Math.round(n).toString());

/**
 * The drawdown calculator's editable levers — income required, monthly saving,
 * yield (CPI + risk-profile premium) and retirement age, plus the until-age
 * number and the read-only "monthly income provided". Current age and current
 * savings are fixed from the client's profile and are not editable here.
 */
export function LongevityControls({
  levers,
  presets,
  onChange,
  onReset,
  dirty = false,
}: {
  levers: DrawdownLevers;
  presets: DrawdownPresets;
  onChange: (next: Partial<DrawdownLevers>) => void;
  /** Restore every lever to the captured baseline. */
  onReset?: () => void;
  /** True when any lever differs from the baseline. */
  dirty?: boolean;
}) {
  const shortfall = Math.max(
    0,
    levers.monthlyIncomeRequired - presets.providedIncome
  );
  return (
    <div className="pt-1 pb-2 space-y-3">
      {onReset && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onReset}
            disabled={!dirty}
            className="text-xs underline disabled:opacity-40"
            style={{ color: "var(--ew-blue)" }}
          >
            Reset to current
          </button>
        </div>
      )}
      {/* Read-only sustainable income + the editable end age, per the reference. */}
      <div
        className="flex items-end justify-between gap-3 rounded-lg p-4"
        style={{ backgroundColor: "#F4F8FB" }}
      >
        <div>
          <div
            className="text-xs uppercase tracking-wide font-medium"
            style={{ color: "var(--ew-blue)" }}
          >
            Monthly income provided
          </div>
          <div
            className="text-lg font-semibold tabular-nums"
            style={{ color: "var(--ew-primary-navy)" }}
          >
            {rand(presets.providedIncome)}
          </div>
          {shortfall > 0 && (
            <div className="text-xs" style={{ color: "var(--ew-tangerine)" }}>
              shortfall {rand(shortfall)}/mo
            </div>
          )}
        </div>
        <label
          className="flex items-center gap-2 text-xs uppercase tracking-wide font-medium"
          style={{ color: "var(--ew-blue)" }}
        >
          Until age
          <input
            type="number"
            value={Math.round(levers.untilAge)}
            onChange={(e) =>
              onChange({ untilAge: parseFloat(e.target.value) || 0 })
            }
            className="table-input tabular-nums text-right"
            style={{ width: 64 }}
            min={70}
            max={105}
            step={1}
          />
        </label>
      </div>

      <ControlRow
        label="Monthly income required"
        value={levers.monthlyIncomeRequired}
        min={0}
        max={200_000}
        step={500}
        format="currency"
        preset={{
          label: `Set to provided of ${rand(presets.providedIncome)}`,
          value: presets.providedIncome,
        }}
        onChange={(v) => onChange({ monthlyIncomeRequired: v })}
      />
      <ControlRow
        label="Monthly saving"
        value={levers.monthlySaving}
        min={0}
        max={100_000}
        step={100}
        format="currency"
        preset={{
          label: `Set to required of ${rand(presets.requiredSaving)}`,
          value: presets.requiredSaving,
        }}
        onChange={(v) => onChange({ monthlySaving: v })}
      />
      <YieldControl
        cpiPct={levers.cpiPct}
        premium={levers.yieldPremiumPct}
        onPremiumChange={(v) => onChange({ yieldPremiumPct: v })}
      />
      <ControlRow
        label="Retirement age"
        value={levers.retirementAge}
        min={55}
        max={75}
        step={1}
        format="age"
        preset={{ label: "Set to 65", value: 65 }}
        onChange={(v) => onChange({ retirementAge: v })}
      />
    </div>
  );
}

function ControlRow({
  label,
  value,
  min,
  max,
  step,
  format,
  preset,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: Format;
  preset?: { label: string; value: number };
  onChange: (n: number) => void;
}) {
  const showPreset =
    preset !== undefined && Math.round(preset.value) !== Math.round(value);
  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: "#F4F8FB" }}>
      <label
        className="block text-xs uppercase tracking-wide font-medium mb-2"
        style={{ color: "var(--ew-blue)" }}
      >
        {label}
      </label>
      <div className="flex items-center gap-3">
        <Slider
          className="flex-1"
          min={min}
          max={max}
          step={step}
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          aria-label={label}
        />
        <input
          type="number"
          value={format === "percent" ? value : Math.round(value)}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="table-input tabular-nums text-right"
          style={{ width: 96 }}
          min={min}
          max={max}
          step={step}
        />
      </div>
      <div className="flex justify-end mt-0.5 h-4">
        {showPreset && (
          <button
            type="button"
            onClick={() => onChange(preset!.value)}
            className="text-xs underline"
            style={{ color: "var(--ew-blue)" }}
          >
            {preset!.label}
          </button>
        )}
      </div>
    </div>
  );
}
