import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Settings2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CustomTabs } from "@/components/ui/custom-tabs";
import {
  parseAmount,
  presentValueGrowingAnnuity,
  type RetirementProjection,
} from "@shared/retirement-calculations";
import {
  simulateDrawdown,
  maxSustainableIncome,
  requiredSaving,
} from "@shared/retirement-longevity";
import {
  LongevityChart,
  type LongevityChartPoint,
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

    return {
      surplus,
      voluntaryCapital,
      retirementDbFunds,
      incomeOverLife,
      monthlyProvided: maxSustainableIncome(l),
      monthlyRequired: l.monthlyIncomeRequired,
      untilAge: l.untilAge,
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
    cpiPct: pctOr(params?.cpi, DEFAULT_CPI_PCT),
    yieldPremiumPct: pctOr(params?.yieldPremium, DEFAULT_YIELD_PREMIUM_PCT),
  };
  const effective: DrawdownLevers = { ...baseline, ...levers };

  // ---- Run the model: frozen "Current" baseline vs live "Projected" --------
  const currentRun = simulateDrawdown(baseline);
  const projectedRun = simulateDrawdown(effective);
  const presets = {
    providedIncome: maxSustainableIncome(effective),
    requiredSaving: requiredSaving(effective),
  };

  // ---- Need-summary figures (the four Build metrics), recomputed for the
  //      Current (baseline) vs Adjusted (effective) scenarios. Anchored to the
  //      captured values so the Current tab reproduces them exactly, then moved
  //      by the lever deltas. --------------------------------------------------
  const summaryFor = makeSummaryComputer(projection, baseline);
  const currentSummary = summaryFor(baseline);
  const adjustedSummary = summaryFor(effective);

  const byAge = new Map<number, LongevityChartPoint>();
  for (const p of currentRun.series) {
    byAge.set(p.age, { age: p.age, current: p.balance, projected: NaN });
  }
  for (const p of projectedRun.series) {
    const e = byAge.get(p.age) ?? {
      age: p.age,
      current: NaN,
      projected: p.balance,
    };
    e.projected = p.balance;
    byAge.set(p.age, e);
  }
  const chartData = Array.from(byAge.values()).sort((a, b) => a.age - b.age);

  return (
    <div className="w-full px-6 py-4">
      <div className="w-[1320px] max-w-full">
        <Card className="px-5 py-4 border-0 shadow-sm bg-white">
          {/* Header: title, legend and Adjust as one centred group. */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-8">
            <h2 className="text-2xl font-semibold text-primary">
              Capital over time
            </h2>
            <Legend />
            <button
              type="button"
              onClick={() => setAdjustOpen(true)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium bg-white border border-input shadow-sm hover:bg-accent hover:text-accent-foreground"
              style={{ color: "var(--ew-primary-navy)" }}
            >
              <Settings2 className="h-3.5 w-3.5" />
              Adjust
            </button>
          </div>

          {/* Body: integrated summary rail + chart */}
          <div className="flex gap-6">
            <div className="w-80 flex-shrink-0">
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
              />
            </div>
          </div>
        </Card>
      </div>

      <AdjustDrawer open={adjustOpen} onClose={() => setAdjustOpen(false)}>
        <DrawerTabs
          controls={
            <LongevityControls
              levers={effective}
              presets={presets}
              onChange={(next) => setLevers((prev) => ({ ...prev, ...next }))}
              onReset={() => setLevers({})}
              dirty={Object.keys(levers).length > 0}
            />
          }
          breakdown={<BreakdownTab projection={projection} />}
        />
      </AdjustDrawer>
    </div>
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

function DrawerTabs({
  controls,
  breakdown,
}: {
  controls: React.ReactNode;
  breakdown: React.ReactNode;
}) {
  const [active, setActive] = useState<"adjust" | "breakdown">("adjust");
  return (
    <>
      <CustomTabs
        tabs={[
          { id: "adjust", label: "Adjust" },
          { id: "breakdown", label: "Breakdown" },
        ]}
        activeTab={active}
        onTabChange={(id) => setActive(id as "adjust" | "breakdown")}
        className="mb-3"
      />
      {active === "breakdown" ? breakdown : controls}
    </>
  );
}
