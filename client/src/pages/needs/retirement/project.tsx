import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Settings2, Table2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  parseAmount,
  presentValueGrowingAnnuity,
  type RetirementProjection,
} from "@shared/retirement-calculations";
import {
  simulateDrawdown,
  maxSustainableIncome,
} from "@shared/retirement-longevity";
import { computeGuaranteedIncome } from "@shared/retirement-guaranteed-income";
import { CustomTabs } from "@/components/ui/custom-tabs";
import {
  GuaranteedIncomeView,
  GuaranteedIncomeRail,
} from "@/components/retirement/guaranteed-income-view";
import { IncomeOverTimeChart } from "@/components/retirement/income-over-time-chart";
import {
  LongevityChart,
  type LongevityChartPoint,
  type ChartEvent,
} from "@/components/retirement/longevity-chart";
import {
  LongevityControls,
  type DrawdownLevers,
} from "@/components/retirement/longevity-controls";
import { BreakdownTab } from "@/components/retirement/breakdown-table";
import {
  ProjectionSummaryRail,
  type SummaryFigures,
} from "@/components/retirement/projection-summary-rail";
import { AdjustDrawer } from "@/components/retirement/adjust-drawer";

const PLAN_ID = 1;
const DEFAULT_YIELD_PREMIUM_PCT = 3; // Moderate-to-Balanced midpoint
// SARB target-band midpoint — a defensible long-term CPI (the engine's 6%
// overstates inflation). Editable in the Adjust panel.
const DEFAULT_CPI_PCT = 4.5;

const sumCap = (rows?: { capitalAtRetirement: number }[]) =>
  (rows ?? []).reduce((s, r) => s + (r.capitalAtRetirement ?? 0), 0);

/** Parse a stored percent string ("4.5%") to a number, falling back. */
const pctOr = (value: string | undefined, fallback: number) => {
  const n = parseFloat(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && value ? n : fallback;
};

/**
 * Builds a function that recomputes the four need-summary figures for any
 * lever set. Anchored to the captured projection so the baseline levers
 * reproduce the captured numbers exactly; other lever values move the figures
 * by their deltas:
 *  - income required (capitalised over the horizon) ← income / CPI / yield / ages
 *  - capital provided ← yield + retirement age (growth) and extra monthly saving
 */
function makeSummaryComputer(
  projection: RetirementProjection,
  baseline: DrawdownLevers
): (levers: DrawdownLevers) => SummaryFigures {
  const currentAge = baseline.currentAge;
  const capturedVoluntary =
    projection.voluntaryCapitalSurplus.capitalAtRetirement;
  const capturedRetDB =
    sumCap(projection.retirementFunds) + sumCap(projection.definedBenefitFunds);
  const capturedIncomeOverLife = sumCap(projection.incomeRequired);
  const capturedIncomeProvided = sumCap(projection.incomeProvided);

  const nom = (l: DrawdownLevers) => (l.cpiPct + l.yieldPremiumPct) / 100;
  const yrs = (l: DrawdownLevers) => Math.max(0, l.retirementAge - currentAge);
  const fvSaving = (monthly: number, r: number, years: number) => {
    const m = r / 12;
    const n = Math.max(0, Math.round(years * 12));
    return m === 0 ? monthly * n : monthly * ((Math.pow(1 + m, n) - 1) / m);
  };
  const reqCap = (l: DrawdownLevers) =>
    presentValueGrowingAnnuity({
      paymentPerPeriod: l.monthlyIncomeRequired,
      escalation: l.cpiPct / 100,
      discount: Math.max(0.001, l.yieldPremiumPct / 100),
      termYears: Math.max(0, l.untilAge - l.retirementAge),
      periodsPerYear: 12,
    });

  return (l: DrawdownLevers): SummaryFigures => {
    const growthScale =
      Math.pow(1 + nom(l), yrs(l)) / Math.pow(1 + nom(baseline), yrs(baseline));
    const dSaving =
      fvSaving(l.monthlySaving, nom(l), yrs(l)) -
      fvSaving(baseline.monthlySaving, nom(baseline), yrs(baseline));
    const dIncomeReq = reqCap(l) - reqCap(baseline);

    const voluntaryCapital = capturedVoluntary * growthScale;
    const retirementDbFunds = capturedRetDB * growthScale + dSaving;
    const incomeOverLife = capturedIncomeOverLife + dIncomeReq;
    const surplus =
      voluntaryCapital +
      retirementDbFunds +
      (capturedIncomeProvided - incomeOverLife);

    // The drawdown pot (chart peak) and the year it runs out — from the SAME
    // seeded model the chart uses, so the rail agrees with the curve.
    const capitalAtRetirement = retirementDbFunds + voluntaryCapital;
    const run = simulateDrawdown({ ...l, capitalAtRetirement });

    return {
      surplus,
      voluntaryCapital,
      retirementDbFunds,
      capitalAtRetirement,
      incomeOverLife,
      monthlyProvided: maxSustainableIncome({ ...l, capitalAtRetirement }),
      monthlyRequired: l.monthlyIncomeRequired,
      untilAge: l.untilAge,
      runsOutAge: run.depletionAge,
    };
  };
}

export default function RetirementProject() {
  const { data: projection, isLoading } = useQuery<
    RetirementProjection & { ready: boolean }
  >({
    queryKey: [`/api/retirement-projection/${PLAN_ID}`],
    queryFn: () =>
      fetch(`/api/retirement-projection/${PLAN_ID}`).then((r) => r.json()),
  });
  const { data: params } = useQuery<{
    retirementAge?: number;
    retirementPlanningAge?: number;
    cpi?: string;
    yieldPremium?: string;
  }>({
    queryKey: [`/api/retirement-parameters/${PLAN_ID}`],
    queryFn: () =>
      fetch(`/api/retirement-parameters/${PLAN_ID}`).then((r) => r.json()),
  });
  const { data: incomeNeeds = [] } = useQuery<{ amount?: string | null }[]>({
    queryKey: ["/api/income-needs"],
  });
  const { data: retirementFunds = [] } = useQuery<{ fundValue?: string }[]>({
    queryKey: ["/api/retirement-funds"],
  });
  const { data: voluntary = [] } = useQuery<{ marketValue?: string }[]>({
    queryKey: ["/api/voluntary-investments"],
  });

  const [levers, setLevers] = useState<Partial<DrawdownLevers>>({});
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [view, setView] = useState<"capital" | "guaranteed" | "incomeGraph">(
    "capital"
  );

  if (isLoading || !projection) {
    return (
      <div className="px-6 py-4 text-neutral-500">Loading projection…</div>
    );
  }

  // ---- Baseline, pre-filled from the client's captured profile -------------
  const retirementAge = params?.retirementAge ?? 65;
  const baseline: DrawdownLevers = {
    currentAge: retirementAge - projection.yearsToRetirement,
    retirementAge,
    untilAge: params?.retirementPlanningAge ?? 90,
    startingBalance:
      retirementFunds.reduce((s, f) => s + parseAmount(f.fundValue), 0) +
      voluntary.reduce((s, v) => s + parseAmount(v.marketValue), 0),
    monthlySaving: projection.currentMonthlyRaContribution,
    monthlyIncomeRequired: incomeNeeds.reduce(
      (s, n) => s + parseAmount(n.amount),
      0
    ),
    lumpSumAtRetirement: projection.retirementLumpSumCommuted,
    cpiPct: pctOr(params?.cpi, DEFAULT_CPI_PCT),
    yieldPremiumPct: pctOr(params?.yieldPremium, DEFAULT_YIELD_PREMIUM_PCT),
  };
  const effective: DrawdownLevers = { ...baseline, ...levers };

  // ---- Need-summary figures (the four Build metrics), recomputed for the
  //      Current (baseline) vs Adjusted (effective) scenarios. Anchored to the
  //      captured values so the Current tab reproduces them exactly, then moved
  //      by the lever deltas. These also OWN the run-up to retirement: the
  //      drawdown pot is seeded from them so the chart peak equals the rail.
  //      Capital at retirement (the chart peak = the rail's two capital rows)
  //      is computed inside makeSummaryComputer, so it OWNS the run-up: the
  //      drawdown pot is seeded from it and the chart peak equals the rail.
  const summaryFor = makeSummaryComputer(projection, baseline);
  const currentSummary = summaryFor(baseline);
  const adjustedSummary = summaryFor(effective);

  // ---- Guaranteed-income (term-annuity) view — the alternative narrative:
  //      take the Two-Pot cash, annuitise the residual over the horizon.
  //      Computed from the same seeded capital + commuted lump sum. ----------
  const guaranteed = computeGuaranteedIncome({
    capitalAtRetirement: adjustedSummary.capitalAtRetirement,
    lumpSumCommuted: effective.lumpSumAtRetirement,
    cpiPct: effective.cpiPct,
    yieldPremiumPct: effective.yieldPremiumPct,
    termYears: Math.max(0, effective.untilAge - effective.retirementAge),
  });

  // ---- Run the model: frozen "Current" baseline vs live "Projected". The
  //      projection owns accumulation (peak = the rail's capital), the engine
  //      owns the drawdown from that peak. ------------------------------------
  const currentRun = simulateDrawdown({
    ...baseline,
    capitalAtRetirement: currentSummary.capitalAtRetirement,
  });
  const projectedRun = simulateDrawdown({
    ...effective,
    capitalAtRetirement: adjustedSummary.capitalAtRetirement,
  });
  // Monthly saving that just funds the income to the end age. Re-solved here
  // (not via the engine) because saving now moves the peak through the summary,
  // not through the engine's own accumulation.
  const solveRequiredSaving = () => {
    let lo = 0;
    let hi = 100_000;
    for (let k = 0; k < 40; k++) {
      const mid = (lo + hi) / 2;
      const lv = { ...effective, monthlySaving: mid };
      const { finalBalance } = simulateDrawdown({
        ...lv,
        capitalAtRetirement: summaryFor(lv).capitalAtRetirement,
      });
      if (finalBalance >= 0) hi = mid;
      else lo = mid;
    }
    return hi;
  };
  const presets = {
    providedIncome: adjustedSummary.monthlyProvided,
    requiredSaving: solveRequiredSaving(),
  };

  // Merge the frozen Current and live Projected runs into chart rows. A two-
  // pointer walk over the age-sorted series (not a by-age map) so the vertical
  // lump-sum step — two points at the same retirement age — survives instead of
  // collapsing. Where only one series has a point (e.g. its own step age), the
  // other side is NaN and the line bridges it via connectNulls.
  const cur = currentRun.series;
  const proj = projectedRun.series;
  const chartData: LongevityChartPoint[] = [];
  let ci = 0;
  let pi = 0;
  while (ci < cur.length || pi < proj.length) {
    const ca = ci < cur.length ? cur[ci].age : Infinity;
    const pa = pi < proj.length ? proj[pi].age : Infinity;
    if (ca === pa) {
      chartData.push({
        age: ca,
        current: cur[ci].balance,
        projected: proj[pi].balance,
      });
      ci++;
      pi++;
    } else if (ca < pa) {
      chartData.push({ age: ca, current: cur[ci].balance, projected: NaN });
      ci++;
    } else {
      chartData.push({ age: pa, current: NaN, projected: proj[pi].balance });
      pi++;
    }
  }

  // Major events marked on the curve. The Two-Pot lump sum is the vertical step
  // at retirement: two projected points at that age — the gross peak, then the
  // annuity base. The dot sits at the base (where drawdown begins) and carries
  // the peak so the tooltip can show peak → lump sum → to annuity.
  const retAge = Math.round(effective.retirementAge);
  const atRet = projectedRun.series.filter((p) => p.age === retAge);
  const events: ChartEvent[] =
    effective.lumpSumAtRetirement > 0 && atRet.length > 1
      ? [
          {
            age: retAge,
            value: atRet[1].balance,
            title: "Lump sum commuted",
            amount: -effective.lumpSumAtRetirement,
            capitalBefore: atRet[0].balance,
          },
        ]
      : [];

  return (
    <div className="w-full px-6 py-4">
      <div className="w-[1320px] max-w-full">
        <Card className="px-5 py-4 border-0 shadow-sm bg-white">
          {/* Header: the two-view switcher + the slide-out buttons. The active
              tab reads as the section heading (text-xl, EW pattern). */}
          <div className="relative">
            <CustomTabs
              tabs={[
                { id: "capital", label: "Capital over time" },
                { id: "guaranteed", label: "Guaranteed income" },
                { id: "incomeGraph", label: "Income over time" },
              ]}
              activeTab={view}
              onTabChange={(id) =>
                setView(id as "capital" | "guaranteed" | "incomeGraph")
              }
            />
            <div className="absolute right-0 top-0 flex items-center gap-2">
              {view === "capital" && <Legend />}
              <ToolButton
                icon={Settings2}
                label="Adjust"
                onClick={() => setAdjustOpen(true)}
              />
              <ToolButton
                icon={Table2}
                label="Breakdown"
                onClick={() => setBreakdownOpen(true)}
              />
            </div>
          </div>

          {view === "capital" && (
            // Body: integrated summary rail + chart. Rail vertically centred
            // against the chart's height.
            <div className="flex gap-6">
              <div className="w-80 flex-shrink-0 self-center">
                <ProjectionSummaryRail
                  current={currentSummary}
                  adjusted={adjustedSummary}
                />
              </div>
              <div className="flex-1 min-w-0">
                <LongevityChart
                  data={chartData}
                  retirementAge={effective.retirementAge}
                  depletionAge={projectedRun.depletionAge}
                  events={events}
                  capitalAtRetirement={adjustedSummary.capitalAtRetirement}
                />
              </div>
            </div>
          )}

          {view === "guaranteed" && (
            <GuaranteedIncomeView
              result={guaranteed}
              capitalAtRetirement={adjustedSummary.capitalAtRetirement}
              monthlyRequired={effective.monthlyIncomeRequired}
            />
          )}

          {view === "incomeGraph" && (
            <div className="flex gap-6">
              <GuaranteedIncomeRail
                monthlyIncome={guaranteed.monthlyIncome}
                monthlyRequired={effective.monthlyIncomeRequired}
                termYears={guaranteed.termYears}
              />
              <div className="flex-1 min-w-0">
                <IncomeOverTimeChart
                  monthlyIncome={guaranteed.monthlyIncome}
                  monthlyRequired={effective.monthlyIncomeRequired}
                  cpiPct={effective.cpiPct}
                  retirementAge={effective.retirementAge}
                  untilAge={effective.untilAge}
                />
              </div>
            </div>
          )}
        </Card>
      </div>

      <AdjustDrawer
        open={adjustOpen}
        onClose={() => setAdjustOpen(false)}
        title="Adjust"
      >
        <LongevityControls
          levers={effective}
          presets={presets}
          onChange={(next) => setLevers((prev) => ({ ...prev, ...next }))}
          onReset={() => setLevers({})}
          dirty={Object.keys(levers).length > 0}
        />
      </AdjustDrawer>

      <AdjustDrawer
        open={breakdownOpen}
        onClose={() => setBreakdownOpen(false)}
        title="Breakdown"
      >
        <BreakdownTab projection={projection} />
      </AdjustDrawer>
    </div>
  );
}

/** A small header button that opens one of the slide-out panels. */
function ToolButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Settings2;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium bg-white border border-input shadow-sm hover:bg-accent hover:text-accent-foreground"
      style={{ color: "var(--ew-primary-navy)" }}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function Legend() {
  return (
    <div
      className="flex items-center gap-3 text-xs"
      style={{ color: "var(--ew-gray-700)" }}
    >
      <span className="flex items-center gap-1.5">
        <span
          className="inline-block w-4"
          style={{ borderTop: "2px solid var(--chart-primary-blue)" }}
        />
        projected
      </span>
      <span className="flex items-center gap-1.5">
        <span
          className="inline-block w-4"
          style={{ borderTop: "2px dashed #9CA3AF" }}
        />
        current
      </span>
    </div>
  );
}
