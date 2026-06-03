import { Fragment, useState } from "react";
import { ChevronDown, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
 * Live cross-need summary, built as a concertina. A fixed header (the "mask")
 * always reads as the same plain headline sentence — "Projected capital
 * shortfall/surplus at retirement|today R…", the tail tracking the Values
 * toggle; on the right, that Values toggle (figures at retirement vs in today's
 * money) and Refresh. A chevron on the left is the single control that slides
 * open the breakdown below — the full equation that reconciles the headline,
 * with the Surplus / (shortfall) figure as its first block:
 *   Surplus = Voluntary capital surplus + Retirement & DB funds + Income surplus.
 * Three of the drivers are net figures (provisions less needs); only Retirement
 * & DB funds is gross. Each connector carries its sign, so a deficit reads as a
 * subtraction. Sits inside the stepper card on Retirement Build *and* Project
 * routes (rendered by RetirementLayout via NeedLayout's `headerExtra` slot).
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

  // The three drivers that sum to Surplus capital, in reading order. Each
  // block's sign drives its connecting operator below.
  const drivers = [
    {
      label: "Voluntary capital surplus",
      value: pick(voluntaryCapitalSurplus),
    },
    { label: "Retirement & DB funds", value: pick(retirementFundCapital) },
    { label: "Income surplus / (shortfall)", value: pick(incomeSurplus) },
  ];

  // Picks whether every figure shows its value at the retirement date or in
  // today's money. Lives on the right with Refresh.
  const valuesToggle = (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
        Values
      </span>
      <ValueModeToggle mode={mode} onChange={setMode} />
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

  // A fixed header (the "mask") plus a concertina body. The chevron on the left
  // is the single expand/collapse control — the header never reflows; the
  // breakdown drivers slide open below it.
  return (
    <div
      className="rounded-md overflow-hidden"
      style={{ backgroundColor: "#FAF5EA" }}
    >
      {/* Header — always visible, never moves. */}
      <div className="flex items-center pr-4">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center self-stretch pl-3 pr-1 hover:bg-black/[0.02] transition-colors"
          aria-expanded={expanded}
          aria-label={
            expanded
              ? "Collapse projection breakdown"
              : "Expand projection breakdown"
          }
        >
          <ChevronDown
            className="h-5 w-5 transition-transform duration-300"
            style={{
              color: "var(--ew-gray-700)",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </button>
        {/* The headline sentence — identical whether open or closed. When open,
            the surplus is ALSO shown as the first block of the equation below. */}
        <SummaryLine
          value={pick(surplusCapital)}
          atRetirement={mode === "atRetirement"}
          loading={isLoading}
        />
        <div className="ml-auto flex items-center gap-3">
          {valuesToggle}
          {refreshGroup}
        </div>
      </div>

      {/* Concertina — the breakdown drivers slide open below the header. */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="breakdown"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="flex items-stretch flex-nowrap justify-center"
              style={{ borderTop: "1px solid #ECE5D3" }}
            >
              <Segment
                label="Surplus / (shortfall)"
                value={pick(surplusCapital)}
                loading={isLoading}
              />
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** The headline sentence (same whether open or closed) — the situation and the
 *  figure as a plain sentence. The "at retirement / today" tail tracks the
 *  Values toggle so it matches the basis the figure is shown in. Advisor-facing,
 *  so neutral third-person — no "you". */
function SummaryLine({
  value,
  atRetirement,
  loading,
}: {
  value: number;
  atRetirement: boolean;
  loading?: boolean;
}) {
  const shortfall = value < 0;
  const when = atRetirement ? "at retirement" : "today";
  return (
    <div className="pl-2 pr-4 py-2 flex items-baseline gap-2 min-w-0">
      <span className="text-sm" style={{ color: "var(--ew-gray-700)" }}>
        {`Projected capital ${shortfall ? "shortfall" : "surplus"} ${when}`}
      </span>
      <span
        className="text-lg font-semibold tabular-nums"
        style={{ color: signedTone(value) }}
      >
        {loading ? "…" : rand(Math.abs(value))}
      </span>
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
        className={`${
          leading ? "pl-2 pr-4" : "px-4"
        } py-2 flex items-baseline gap-3 min-w-0`}
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
    <div className={`${leading ? "pl-2 pr-3" : "px-3"} py-6 min-w-0`}>
      <div
        className="text-xs font-medium uppercase tracking-wide mb-1.5 whitespace-nowrap"
        style={{ color: "#A55A2A" }}
      >
        {label}
      </div>
      <div
        className="text-lg font-semibold tabular-nums whitespace-nowrap"
        style={{ color: signedTone(value) }}
      >
        {loading ? "…" : rand(shown)}
      </div>
    </div>
  );
}

/** Toggle chips in the stepper's design language (the STEPS chips above):
 *  rounded-[6px], text-sm font-medium, the active option orange (#F97415) with
 *  white label, inactive a light chip. The stepper's inactive chips are cream,
 *  but those sit on a white card — here on the cream ribbon we use white so the
 *  chip still reads. */
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
    <div className="flex items-center gap-2">
      {options.map((o) => {
        const active = mode === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`px-3 h-8 text-sm font-medium rounded-[6px] transition-colors whitespace-nowrap ${
              active
                ? "bg-[#F97415] text-white"
                : "bg-white text-gray-700 hover:bg-[#F5F1E8]"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
