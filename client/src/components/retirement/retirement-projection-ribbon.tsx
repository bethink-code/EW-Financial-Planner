import { Fragment } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrencyValue } from "@/lib/formatting";
import {
  useRetirementProjection,
  useRefreshRetirementProjection,
} from "@/hooks/use-retirement-projection";
import { useValueMode, type ValueMode } from "@/components/common/value-mode";

function rand(n: number): string {
  return formatCurrencyValue(Math.round(n).toString());
}

/** Navy when in surplus, tangerine when negative — used by every row. */
function signedTone(n: number): string {
  return n >= 0 ? "var(--ew-primary-navy)" : "var(--ew-tangerine)";
}

interface RetirementProjectionRibbonProps {
  /** Optional page-specific action(s) rendered alongside the Refresh button —
   *  used by simple-table pages (future-inflows, lump-sum-needs) to surface
   *  their Add button next to Refresh instead of as a separate row. */
  actions?: React.ReactNode;
}

/**
 * Live cross-need summary. Renders as a single cream card with four blocks
 * laid out as an equation — Surplus / (shortfall) = Voluntary capital surplus
 * + Retirement & DB funds + Income surplus / (shortfall) — so the headline
 * figure and its drivers read in one glance. Three of the four are net figures
 * (provisions less needs); only Retirement & DB funds is gross. Each driver's
 * connector carries its sign, so a deficit reads as a subtraction. Sits inside
 * the stepper card on Retirement Build *and* Project routes (rendered by
 * RetirementLayout via NeedLayout's `headerExtra` slot).
 */
export function RetirementProjectionRibbon({
  actions,
}: RetirementProjectionRibbonProps = {}) {
  const { data: projection, isLoading } = useRetirementProjection();
  const refresh = useRefreshRetirementProjection();

  // Toggle drives all rows here AND every per-tab section summary, via the
  // shared ValueMode context (see ValueModeToggle below).
  const { mode, setMode } = useValueMode();

  const yearsToRetirement = projection?.yearsToRetirement ?? 0;

  const voluntaryCapitalSurplus = projection?.voluntaryCapitalSurplus;
  const incomeSurplus = projection?.incomeSurplus;
  const surplusCapital = projection?.surplusCapital;

  // The row the surplus band used to hide: compulsory retirement + DB/GEPF
  // fund capital. Surfacing it makes the four rows reconcile —
  //   voluntary surplus + income surplus + fund capital = surplus capital.
  const sumFunds = (key: "capitalAtRetirement" | "valueInCurrentTerms") =>
    (projection?.retirementFunds ?? []).reduce((s, x) => s + x[key], 0) +
    (projection?.definedBenefitFunds ?? []).reduce((s, x) => s + x[key], 0);
  const retirementFundCapital = {
    capitalAtRetirement: sumFunds("capitalAtRetirement"),
    valueInCurrentTerms: sumFunds("valueInCurrentTerms"),
  };

  // Each surplus metric carries both an at-retirement value and its today's-
  // terms equivalent; the toggle picks which one every row shows.
  const pick = (m?: {
    capitalAtRetirement: number;
    valueInCurrentTerms: number;
  }) =>
    mode === "atRetirement"
      ? m?.capitalAtRetirement ?? 0
      : m?.valueInCurrentTerms ?? 0;

  // The three drivers that sum to Surplus capital, in the order the client
  // reads them. Each block's sign drives its connecting operator below.
  const drivers = [
    {
      label: "Voluntary capital surplus",
      value: pick(voluntaryCapitalSurplus),
    },
    { label: "Retirement & DB funds", value: pick(retirementFundCapital) },
    { label: "Income surplus / (shortfall)", value: pick(incomeSurplus) },
  ];

  return (
    <div
      className="rounded-md overflow-hidden"
      style={{
        backgroundColor: "#FAF5EA",
      }}
    >
      {/* Meta strip — anchors "years to retirement" and the Refresh button. */}
      <div
        className="flex items-center justify-end gap-3 px-4 py-1.5"
        style={{ borderBottom: "1px solid #ECE5D3" }}
      >
        <ValueModeToggle mode={mode} onChange={setMode} />
        <span
          className="text-xs tabular-nums"
          style={{ color: "var(--ew-gray-700)" }}
        >
          {yearsToRetirement} yrs to retirement
        </span>
        {actions}
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={isLoading}
          className="gap-1.5 h-7 px-2 text-xs"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </Button>
      </div>

      {/* Four blocks showing how Surplus capital is built up: it leads as the
          headline, then the three drivers. Each driver's connector carries its
          sign (+/−) and the block shows the magnitude, so it reads as a clean
          equation. Wraps to a new line if the viewport is too narrow. */}
      <div className="flex items-stretch flex-wrap">
        <Segment
          label="Surplus / (shortfall)"
          value={pick(surplusCapital)}
          loading={isLoading}
        />
        <Operator symbol="=" />
        {drivers.map((d, i) => (
          <Fragment key={d.label}>
            {/* First driver gets a leading sign only when negative; the rest
                always show their +/− connector. */}
            {(i > 0 || d.value < 0) && (
              <Operator symbol={d.value < 0 ? "−" : "+"} />
            )}
            <Segment
              label={d.label}
              value={d.value}
              magnitude
              loading={isLoading}
            />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

/** Operator glyph between blocks — reads the row as an equation rather than a
 *  stacked sum. Muted so the figures stay the focus. */
function Operator({ symbol }: { symbol: "=" | "+" | "−" }) {
  return (
    <div
      className="flex items-center px-1 text-lg font-medium select-none"
      style={{ color: "var(--ew-gray-700)" }}
      aria-hidden
    >
      {symbol}
    </div>
  );
}

function Segment({
  label,
  value,
  loading,
  magnitude,
}: {
  label: string;
  value: number;
  loading?: boolean;
  /** Show the absolute value (the +/− lives in the connecting Operator).
   *  Tone still reflects the signed value. */
  magnitude?: boolean;
}) {
  const shown = magnitude ? Math.abs(value) : value;
  return (
    <div className="px-4 py-6 flex-1 min-w-0">
      <div
        className="text-xs font-medium uppercase tracking-wide mb-1.5 truncate"
        style={{ color: "#A55A2A" }}
      >
        {label}
      </div>
      <div
        className="text-lg font-semibold tabular-nums truncate"
        style={{ color: signedTone(value) }}
      >
        {loading ? "…" : rand(shown)}
      </div>
    </div>
  );
}

/** Two-segment pill that flips every tile between at-retirement and today's
 *  value. EW blue active state, cream border to match the ribbon. */
function ValueModeToggle({
  mode,
  onChange,
}: {
  mode: ValueMode;
  onChange: (m: ValueMode) => void;
}) {
  const options: { id: ValueMode; label: string }[] = [
    { id: "atRetirement", label: "At retirement" },
    { id: "today", label: "Today" },
  ];
  return (
    <div
      className="inline-flex rounded-md overflow-hidden"
      style={{ border: "1px solid #ECE5D3" }}
    >
      {options.map((o) => {
        const active = mode === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className="text-xs px-2.5 py-1 transition-colors"
            style={{
              backgroundColor: active ? "var(--ew-blue)" : "transparent",
              color: active ? "#fff" : "var(--ew-gray-700)",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
