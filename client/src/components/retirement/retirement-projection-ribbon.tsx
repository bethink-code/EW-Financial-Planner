import { Fragment, useState } from "react";
import { ChevronDown, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
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

  // Collapsed by default — Surplus headline + toggle + Refresh stay visible;
  // the three driver segments slide in when the advisor expands the band.
  const [expanded, setExpanded] = useState(false);

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

  // Both layouts share the same headline button and meta strip — layoutId on
  // the wrapping motion.divs lets Framer Motion animate their positions when
  // the band switches between the closed (one-row) and expanded (two-row)
  // layouts. Drivers fade in when expanded.
  const headlineButton = (
    <button
      type="button"
      onClick={() => setExpanded((e) => !e)}
      className="flex items-stretch text-left hover:bg-black/[0.02] transition-colors w-full"
      aria-expanded={expanded}
      aria-label={
        expanded
          ? "Collapse projection breakdown"
          : "Expand projection breakdown"
      }
    >
      <div className="flex items-center pl-4 pr-1">
        <ChevronDown
          className="h-4 w-4 transition-transform duration-300"
          style={{
            color: "var(--ew-gray-700)",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </div>
      <Segment
        label="Surplus / (shortfall)"
        value={pick(surplusCapital)}
        loading={isLoading}
        leading
        inline={!expanded}
      />
    </button>
  );

  const toggleGroup = (
    <div className="flex items-center gap-2">
      <ValueModeToggle mode={mode} onChange={setMode} />
      <span
        className="text-xs tabular-nums"
        style={{ color: "var(--ew-gray-700)" }}
      >
        {yearsToRetirement} yrs to retirement
      </span>
    </div>
  );

  const refreshGroup = (
    <div className="flex items-center gap-3">
      {actions}
      <Button
        variant="outline"
        size="sm"
        onClick={refresh}
        disabled={isLoading}
        className="gap-1.5 h-8 px-3 text-xs bg-white"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Refresh
      </Button>
    </div>
  );

  const layoutTransition = {
    type: "tween" as const,
    duration: 0.4,
    ease: "easeInOut" as const,
  };

  return (
    <div
      className="rounded-md overflow-hidden"
      style={{ backgroundColor: "#FAF5EA" }}
    >
      {expanded ? (
        <>
          {/* Top row: toggle group on the left, Refresh on the right —
              matches the horizontal positions they had in the closed band so
              they don't jump when expanding. */}
          <div
            className="flex items-center gap-3 px-4 py-1.5"
            style={{ borderBottom: "1px solid #ECE5D3" }}
          >
            {toggleGroup}
            <div className="ml-auto">{refreshGroup}</div>
          </div>
          {/* Bottom row: full equation */}
          <div className="flex items-stretch flex-nowrap">
            <motion.div
              layoutId="headline-button"
              transition={layoutTransition}
            >
              {headlineButton}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeInOut", delay: 0.1 }}
              className="flex items-stretch flex-1 flex-nowrap overflow-hidden"
            >
              <Operator symbol="=" />
              {drivers.map((d, i) => (
                <Fragment key={d.label}>
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
            </motion.div>
          </div>
        </>
      ) : (
        /* Closed: one row. Headline + toggle group hug the left; Refresh sits
           on the far right (ml-auto pushes it there). */
        <div className="flex items-center gap-3 pr-4">
          <motion.div
            layoutId="headline-button"
            transition={layoutTransition}
            className="min-w-0"
          >
            {headlineButton}
          </motion.div>
          {toggleGroup}
          <div className="ml-auto">{refreshGroup}</div>
        </div>
      )}
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
  leading,
  inline,
}: {
  label: string;
  value: number;
  loading?: boolean;
  /** Show the absolute value (the +/− lives in the connecting Operator).
   *  Tone still reflects the signed value. */
  magnitude?: boolean;
  /** Drop left padding so the segment sits flush against a leading element
   *  (currently the expand caret on the Surplus headline). */
  leading?: boolean;
  /** Single-line layout: label and value share a baseline. Used by the
   *  closed-band headline; expanded segments stay stacked. */
  inline?: boolean;
}) {
  const shown = magnitude ? Math.abs(value) : value;
  if (inline) {
    return (
      <div
        className={`${leading ? "pl-2 pr-4" : "px-4"} py-2 flex items-baseline gap-3 min-w-0`}
      >
        <div
          className="text-xs font-medium uppercase tracking-wide truncate"
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
  return (
    <div className={`${leading ? "pl-2 pr-4" : "px-4"} py-6 flex-1 min-w-0`}>
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

/** Segmented control — tan container, active option rendered as a raised
 *  white pill with a subtle shadow (iOS-style). Inactive options blend into
 *  the container background. */
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
      className="inline-flex rounded-md p-1 gap-1"
      style={{ backgroundColor: "#ECE5D3" }}
    >
      {options.map((o) => {
        const active = mode === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className="text-sm px-3 py-1 rounded transition-all"
            style={{
              backgroundColor: active ? "#fff" : "transparent",
              color: active
                ? "var(--ew-primary-navy)"
                : "var(--ew-gray-700)",
              boxShadow: active
                ? "0 1px 2px rgba(0, 0, 0, 0.08), 0 1px 1px rgba(0, 0, 0, 0.04)"
                : "none",
              fontWeight: active ? 600 : 500,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
