import { useState } from "react";
import { formatCurrencyValue } from "@/lib/formatting";

const rand = (n: number) => formatCurrencyValue(Math.round(n).toString());

// A light neutral grey so the labels recede and the navy values lead. (Was an
// accent-brown tint; switched to grey on request — colours still being tuned.)
const LABEL_COLOR = "#A3A3A3";

/** The need-summary figures for one scenario (current or adjusted). */
export interface SummaryFigures {
  /** Surplus / (shortfall) at retirement = capital − income need. Computed but
   *  deliberately not shown as a headline; the gap reads through the income and
   *  run-out figures instead. */
  surplus: number;
  voluntaryCapital: number;
  retirementDbFunds: number;
  /** Voluntary + retirement/DB — the capital at the retirement handoff. */
  capitalAtRetirement: number;
  /** Income required, capitalised over the retirement horizon. */
  incomeOverLife: number;
  monthlyProvided: number;
  monthlyRequired: number;
  untilAge: number;
  /** Age the pot runs out under the required income; null if it lasts. */
  runsOutAge: number | null;
}

/**
 * The need-summary in a light-blue card (matching the Build FieldGroups),
 * integrated beside the Project chart.
 * Two tabs — Current (the captured plan) and Adjusted (recomputed live as the
 * sliders move) — and two hero figures mirroring the chart's halves: capital
 * "At retirement" (building up) and the monthly income "Through retirement"
 * (drawing down), each with its supporting numbers as sub-items. The shortfall
 * is deliberately not the headline — the gap shows through "of R… /mo" and the
 * run-out age instead.
 */
export function ProjectionSummaryRail({
  current,
  adjusted,
}: {
  current: SummaryFigures;
  adjusted: SummaryFigures;
}) {
  const [tab, setTab] = useState<"current" | "adjusted">("adjusted");
  const f = tab === "current" ? current : adjusted;

  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: "#FAF5EA" }}>
      <div
        className="flex justify-center gap-6 mb-3"
        style={{ borderBottom: "1px solid #ECE5D3" }}
      >
        {(["current", "adjusted"] as const).map((id) => {
          const on = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className="pb-2 text-sm capitalize transition-colors"
              style={{
                color: on ? "var(--ew-primary-navy)" : "var(--ew-gray-700)",
                fontWeight: on ? 600 : 400,
                borderBottom: on
                  ? "2px solid var(--ew-blue)"
                  : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              {id}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        {/* Phase 1 — building up: the capital built by retirement, with its two
            components as sub-items. */}
        <PhaseBlock
          heading="At retirement"
          value={rand(f.capitalAtRetirement)}
          rows={[
            { label: "Voluntary capital", value: rand(f.voluntaryCapital) },
            {
              label: "Retirement & DB funds",
              value: rand(f.retirementDbFunds),
            },
          ]}
          first
        />

        {/* Phase 2 — drawing down: the income that capital provides, with the
            life-of-retirement total and the run-out age as sub-items. */}
        <PhaseBlock
          heading="Through retirement"
          value={rand(f.monthlyProvided)}
          valueSub={`of ${rand(f.monthlyRequired)} /mo`}
          rows={[
            { label: "Income drawn over life", value: rand(f.incomeOverLife) },
            {
              label:
                f.runsOutAge == null ? "Capital lasts" : "Capital runs out",
              value:
                f.runsOutAge == null
                  ? `past ${f.untilAge}`
                  : `age ${Math.round(f.runsOutAge)}`,
            },
          ]}
        />
      </div>
    </div>
  );
}

/** One phase: a hero number (the phase outcome) with its supporting figures as
 *  compact single-line sub-items. The two blocks mirror the chart's building-up
 *  and drawing-down halves. */
function PhaseBlock({
  heading,
  value,
  valueSub,
  rows,
  first = false,
}: {
  heading: string;
  value: string;
  valueSub?: string;
  rows: { label: string; value: string }[];
  first?: boolean;
}) {
  return (
    <div
      className={first ? undefined : "pt-3"}
      style={first ? undefined : { borderTop: "1px solid #ECE5D3" }}
    >
      <div className="text-xs font-medium" style={{ color: "var(--ew-blue)" }}>
        {heading}
      </div>
      <div
        className="text-2xl font-semibold tabular-nums mt-0.5"
        style={{ color: "var(--ew-primary-navy)" }}
      >
        {value}
        {valueSub && (
          <span
            className="text-sm font-normal ml-1.5"
            style={{ color: "var(--ew-gray-700)" }}
          >
            {valueSub}
          </span>
        )}
      </div>
      <div className="mt-2 space-y-1">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-baseline justify-between gap-3"
          >
            <span className="text-sm" style={{ color: LABEL_COLOR }}>
              {r.label}
            </span>
            <span
              className="text-sm font-semibold tabular-nums"
              style={{ color: "var(--ew-primary-navy)" }}
            >
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
