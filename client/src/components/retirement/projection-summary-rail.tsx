import { useState } from "react";
import { formatCurrencyValue } from "@/lib/formatting";

const rand = (n: number) => formatCurrencyValue(Math.round(n).toString());

// A softened tint of the EW accent brown (#A55A2A over the cream card), so the
// labels recede and the navy values lead. Tune the alpha to taste.
const LABEL_COLOR = "rgba(165, 90, 42, 0.65)";

/** The need-summary figures for one scenario (current or adjusted). */
export interface SummaryFigures {
  /** Surplus / (shortfall) at retirement — the headline. */
  surplus: number;
  voluntaryCapital: number;
  retirementDbFunds: number;
  /** Income required, capitalised over the retirement horizon. */
  incomeOverLife: number;
  monthlyProvided: number;
  monthlyRequired: number;
  untilAge: number;
}

/**
 * The need-summary in the EW cream card, integrated beside the Project chart.
 * Two tabs — Current (the captured plan) and Adjusted (recomputed live as the
 * sliders move) — showing the same four metrics as the Build band so the
 * planner can compare the original and changed numbers.
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
  const shortfall = f.surplus < 0;

  return (
    <div
      className="rounded-lg p-5"
      style={{ backgroundColor: "#FAF5EA", border: "1px solid #ECE5D3" }}
    >
      <div
        className="flex justify-center gap-6 mb-5"
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

      <div className="flex flex-col gap-6">
        <div>
          <div
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: LABEL_COLOR }}
          >
            At retirement
          </div>
          <div
            className="text-3xl font-semibold tabular-nums mt-1"
            style={{
              color: shortfall
                ? "var(--ew-tangerine)"
                : "var(--ew-primary-navy)",
            }}
          >
            {shortfall ? "−" : ""}
            {rand(Math.abs(f.surplus))}
          </div>
          <div
            className="text-xs mt-1 leading-snug"
            style={{ color: "var(--ew-gray-700)" }}
          >
            vs the capital needed to fund income to age {f.untilAge}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <RailRow label="Voluntary capital" value={rand(f.voluntaryCapital)} />
          <RailRow
            label="Retirement & DB funds"
            value={rand(f.retirementDbFunds)}
          />
          <RailRow
            label="Income drawn over life"
            value={rand(f.incomeOverLife)}
          />
          <RailRow
            label="Monthly income"
            value={rand(f.monthlyProvided)}
            sub={`of ${rand(f.monthlyRequired)}`}
          />
        </div>
      </div>
    </div>
  );
}

function RailRow({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div>
      <div
        className="text-xs font-medium uppercase tracking-wide"
        style={{ color: LABEL_COLOR }}
      >
        {label}
      </div>
      <div
        className="text-base font-semibold tabular-nums"
        style={{ color: "var(--ew-primary-navy)" }}
      >
        {value}
        {sub && (
          <span
            className="text-xs font-normal ml-1"
            style={{ color: "var(--ew-gray-700)" }}
          >
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}
