import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { CustomTabs } from "@/components/ui/custom-tabs";
import { formatCurrencyValue } from "@/lib/formatting";
import {
  additionalMonthlyContribution,
  futureValueOfMonthlyContribution,
  type RetirementProjection,
} from "@shared/retirement-calculations";

type Scenario = "voluntary" | "ra" | "mixed" | "lumpsum";

/** Amount overrides per scenario. `null` = use the recommended amount. */
type ScenarioAmounts = {
  voluntary: number | null;
  ra: number | null;
  mixVol: number | null;
  mixRa: number | null;
  lumpsum: number | null;
};

const PLAN_ID = 1;

function rand(n: number): string {
  return formatCurrencyValue(Math.round(n).toString());
}

export default function RetirementProject() {
  // Tuner state lives here so the CoverageBars chart can reflect the user's
  // chosen scenario + amount (partial top-ups → partial closure).
  const [scenario, setScenario] = useState<Scenario>("voluntary");
  const [mixVoluntaryPct, setMixVoluntaryPct] = useState(50);
  const [scenarioAmounts, setScenarioAmounts] = useState<ScenarioAmounts>({
    voluntary: null,
    ra: null,
    mixVol: null,
    mixRa: null,
    lumpsum: null,
  });
  const [growthPct, setGrowthPct] = useState(10);
  const [increasePct, setIncreasePct] = useState(6);
  const [raTaxPct, setRaTaxPct] = useState(25);

  const { data: projection, isLoading } = useQuery<
    RetirementProjection & { ready: boolean }
  >({
    queryKey: [`/api/retirement-projection/${PLAN_ID}`],
    queryFn: () =>
      fetch(`/api/retirement-projection/${PLAN_ID}`).then((r) => r.json()),
  });

  if (isLoading || !projection) {
    return (
      <div className="px-6 py-4 text-neutral-500">Loading projection…</div>
    );
  }

  const {
    capitalProvided,
    capitalRequired,
    surplus,
    coverage,
    retirementFunds,
    definedBenefitFunds,
    voluntaryInvestments,
    futureInflows,
    lumpSumNeeds,
    incomeRequired,
    incomeProvided,
    yearsToRetirement,
    yearsAfterRetirement,
  } = projection;

  // ---- Tuner derivations ---------------------------------------------------
  const shortfall = Math.max(0, -surplus);
  const GROWTH = growthPct / 100;
  const INCREASE = increasePct / 100;
  const RA_TAX = raTaxPct / 100;

  const recommendedFor = (shortfallShare: number) =>
    additionalMonthlyContribution({
      shortfallAtRetirement: shortfall * shortfallShare,
      growthRate: GROWTH,
      contributionEscalation: INCREASE,
      yearsToRetirement,
    });

  const mixVolFrac = mixVoluntaryPct / 100;
  const mixRaFrac = 1 - mixVolFrac;

  // Recommended amounts (close the gap fully).
  const recVoluntary = recommendedFor(1);
  const recRa = recommendedFor(1);
  const recMixVol = recommendedFor(mixVolFrac);
  const recMixRa = recommendedFor(mixRaFrac);
  const recLumpSum =
    yearsToRetirement > 0
      ? shortfall / Math.pow(1 + GROWTH, yearsToRetirement)
      : shortfall;

  // Effective amounts (override or recommended).
  const effVoluntary = scenarioAmounts.voluntary ?? recVoluntary;
  const effRa = scenarioAmounts.ra ?? recRa;
  const effMixVol = scenarioAmounts.mixVol ?? recMixVol;
  const effMixRa = scenarioAmounts.mixRa ?? recMixRa;
  const effLumpSum = scenarioAmounts.lumpsum ?? recLumpSum;

  // Capital added at retirement by the currently selected scenario.
  const capitalFromMonthly = (monthly: number) =>
    futureValueOfMonthlyContribution({
      monthlyContribution: monthly,
      growthRate: GROWTH,
      contributionEscalation: INCREASE,
      yearsToRetirement,
    });
  const capitalAdded =
    scenario === "voluntary"
      ? capitalFromMonthly(effVoluntary)
      : scenario === "ra"
      ? capitalFromMonthly(effRa)
      : scenario === "mixed"
      ? capitalFromMonthly(effMixVol) + capitalFromMonthly(effMixRa)
      : effLumpSum * Math.pow(1 + GROWTH, yearsToRetirement);

  const adjustedCapital = capitalProvided + capitalAdded;
  const adjustedCoverage =
    capitalRequired > 0 ? adjustedCapital / capitalRequired : 1;

  const flatRows: {
    category: string;
    description: string;
    capitalAtRetirement: number;
    valueInCurrentTerms: number;
    key: string;
  }[] = [
    ...retirementFunds.map((r) => ({
      category: "Retirement funds",
      description: r.description,
      capitalAtRetirement: r.capitalAtRetirement,
      valueInCurrentTerms: r.valueInCurrentTerms,
      key: `rf-${r.id}`,
    })),
    ...definedBenefitFunds.map((r) => ({
      category: "Defined benefit",
      description: r.description,
      capitalAtRetirement: r.capitalAtRetirement,
      valueInCurrentTerms: r.valueInCurrentTerms,
      key: `db-${r.id}`,
    })),
    ...voluntaryInvestments.map((r) => ({
      category: "Voluntary",
      description: r.description,
      capitalAtRetirement: r.capitalAtRetirement,
      valueInCurrentTerms: r.valueInCurrentTerms,
      key: `vi-${r.id}`,
    })),
    ...futureInflows.map((r) => ({
      category: "Future inflow",
      description: r.description,
      capitalAtRetirement: r.capitalAtRetirement,
      valueInCurrentTerms: r.valueInCurrentTerms,
      key: `fi-${r.id}`,
    })),
    ...lumpSumNeeds.map((r) => ({
      category: "Lump sum need",
      description: r.description,
      capitalAtRetirement: r.capitalAtRetirement,
      valueInCurrentTerms: r.valueInCurrentTerms,
      key: `ls-${r.id}`,
    })),
    ...incomeRequired.map((r) => ({
      category: "Income required",
      description: r.description,
      capitalAtRetirement: r.capitalAtRetirement,
      valueInCurrentTerms: r.valueInCurrentTerms,
      key: `ir-${r.id}`,
    })),
    ...incomeProvided.map((r) => ({
      category: "Income provided",
      description: r.description,
      capitalAtRetirement: r.capitalAtRetirement,
      valueInCurrentTerms: r.valueInCurrentTerms,
      key: `ip-${r.id}`,
    })),
  ];

  return (
    <div className="w-full px-6 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
        {/* LEFT: Surplus rows + Coverage chart + summary + recommendation */}
        <Card className="px-5 py-4 border-0 shadow-none bg-transparent max-w-md mx-auto w-full">
          <CoverageBars
            capitalProvided={capitalProvided}
            capitalRequired={capitalRequired}
            coverage={coverage}
            adjustedCapital={adjustedCapital}
            adjustedCoverage={adjustedCoverage}
          />
        </Card>

        {/* RIGHT: Tabs — Tune contributions (what-if), Breakdown (per-vehicle
            detail), Assumptions (editable rates). Tuner state is lifted to the
            parent so the CoverageBars on the left reflect the user's choice. */}
        <DetailTabsPanel
          flatRows={flatRows}
          shortfall={shortfall}
          yearsToRetirement={yearsToRetirement}
          scenario={scenario}
          onScenarioChange={setScenario}
          mixVoluntaryPct={mixVoluntaryPct}
          onMixVoluntaryPctChange={setMixVoluntaryPct}
          scenarioAmounts={scenarioAmounts}
          onScenarioAmountsChange={setScenarioAmounts}
          recommended={{
            voluntary: recVoluntary,
            ra: recRa,
            mixVol: recMixVol,
            mixRa: recMixRa,
            lumpsum: recLumpSum,
          }}
          effective={{
            voluntary: effVoluntary,
            ra: effRa,
            mixVol: effMixVol,
            mixRa: effMixRa,
            lumpsum: effLumpSum,
          }}
          raTax={RA_TAX}
          growthPct={growthPct}
          onGrowthPctChange={setGrowthPct}
          increasePct={increasePct}
          onIncreasePctChange={setIncreasePct}
          raTaxPct={raTaxPct}
          onRaTaxPctChange={setRaTaxPct}
        />
      </div>
    </div>
  );
}

type Amounts = {
  voluntary: number;
  ra: number;
  mixVol: number;
  mixRa: number;
  lumpsum: number;
};

function DetailTabsPanel({
  flatRows,
  shortfall,
  yearsToRetirement,
  scenario,
  onScenarioChange,
  mixVoluntaryPct,
  onMixVoluntaryPctChange,
  scenarioAmounts,
  onScenarioAmountsChange,
  recommended,
  effective,
  raTax,
  growthPct,
  onGrowthPctChange,
  increasePct,
  onIncreasePctChange,
  raTaxPct,
  onRaTaxPctChange,
}: {
  flatRows: {
    category: string;
    description: string;
    capitalAtRetirement: number;
    valueInCurrentTerms: number;
    key: string;
  }[];
  shortfall: number;
  yearsToRetirement: number;
  scenario: Scenario;
  onScenarioChange: (s: Scenario) => void;
  mixVoluntaryPct: number;
  onMixVoluntaryPctChange: (n: number) => void;
  scenarioAmounts: ScenarioAmounts;
  onScenarioAmountsChange: (a: ScenarioAmounts) => void;
  recommended: Amounts;
  effective: Amounts;
  raTax: number;
  growthPct: number;
  onGrowthPctChange: (n: number) => void;
  increasePct: number;
  onIncreasePctChange: (n: number) => void;
  raTaxPct: number;
  onRaTaxPctChange: (n: number) => void;
}) {
  const [active, setActive] = useState<"tuner" | "breakdown" | "assumptions">(
    "tuner"
  );

  return (
    <Card className="p-6 border-0 shadow-sm">
      <CustomTabs
        tabs={[
          { id: "tuner", label: "Tune contributions" },
          { id: "assumptions", label: "Assumptions" },
          { id: "breakdown", label: "Breakdown" },
        ]}
        activeTab={active}
        onTabChange={(id) =>
          setActive(id as "tuner" | "breakdown" | "assumptions")
        }
        className="mb-3"
      />
      {active === "breakdown" ? (
        <div className="rounded-md overflow-hidden">
          <table className="w-full text-xs no-row-borders">
            <thead>
              <tr
                style={{
                  color: "var(--ew-gray-700)",
                  backgroundColor: "var(--ew-row-tint)",
                }}
              >
                <th className="px-3 py-2 text-left font-medium uppercase tracking-wide w-[140px]">
                  Category
                </th>
                <th className="px-3 py-2 text-left font-medium uppercase tracking-wide">
                  Description
                </th>
                <th className="px-3 py-2 text-right font-medium uppercase tracking-wide w-[140px]">
                  At retirement
                </th>
                <th className="px-3 py-2 text-right font-medium uppercase tracking-wide w-[140px]">
                  Today's terms
                </th>
              </tr>
            </thead>
            <tbody>
              {flatRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-3 text-xs text-center"
                    style={{ color: "var(--ew-gray-700)" }}
                  >
                    No entries yet.
                  </td>
                </tr>
              ) : (
                flatRows.map((r, idx) => (
                  <tr
                    key={r.key}
                    style={{
                      backgroundColor:
                        idx % 2 === 0 ? "white" : "var(--ew-row-tint)",
                    }}
                  >
                    <td
                      className="px-3 py-1.5 text-xs uppercase tracking-wide"
                      style={{ color: "var(--ew-blue)" }}
                    >
                      {r.category}
                    </td>
                    <td
                      className="px-3 py-1.5 truncate"
                      style={{ color: "var(--ew-primary-navy)" }}
                    >
                      {r.description || "(untitled)"}
                    </td>
                    <td
                      className="px-3 py-1.5 text-right tabular-nums font-medium"
                      style={{ color: "var(--ew-gray-900)" }}
                    >
                      {rand(r.capitalAtRetirement)}
                    </td>
                    <td
                      className="px-3 py-1.5 text-right tabular-nums"
                      style={{ color: "var(--ew-gray-700)" }}
                    >
                      {rand(r.valueInCurrentTerms)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : active === "assumptions" ? (
        <AssumptionsPanel
          growthPct={growthPct}
          onGrowthChange={onGrowthPctChange}
          increasePct={increasePct}
          onIncreaseChange={onIncreasePctChange}
          raTaxPct={raTaxPct}
          onRaTaxChange={onRaTaxPctChange}
        />
      ) : (
        <ContributionsTuner
          scenario={scenario}
          onScenarioChange={onScenarioChange}
          mixVoluntaryPct={mixVoluntaryPct}
          onMixVoluntaryPctChange={onMixVoluntaryPctChange}
          scenarioAmounts={scenarioAmounts}
          onScenarioAmountsChange={onScenarioAmountsChange}
          recommended={recommended}
          effective={effective}
          raTax={raTax}
        />
      )}
    </Card>
  );
}

function ContributionsTuner({
  scenario,
  onScenarioChange,
  mixVoluntaryPct,
  onMixVoluntaryPctChange,
  scenarioAmounts,
  onScenarioAmountsChange,
  recommended,
  effective,
  raTax,
}: {
  scenario: Scenario;
  onScenarioChange: (s: Scenario) => void;
  mixVoluntaryPct: number;
  onMixVoluntaryPctChange: (n: number) => void;
  scenarioAmounts: ScenarioAmounts;
  onScenarioAmountsChange: (a: ScenarioAmounts) => void;
  recommended: Amounts;
  effective: Amounts;
  raTax: number;
}) {
  const setAmount = (key: keyof ScenarioAmounts, value: number | null) =>
    onScenarioAmountsChange({ ...scenarioAmounts, [key]: value });

  // Tax saving on the EFFECTIVE RA contribution (scales with what the user
  // actually plans to put in, not the recommended).
  const raOnlyTaxSaving = effective.ra * 12 * raTax;
  const mixTaxSaving = effective.mixRa * 12 * raTax;

  const hasOverrides =
    scenarioAmounts.voluntary !== null ||
    scenarioAmounts.ra !== null ||
    scenarioAmounts.mixVol !== null ||
    scenarioAmounts.mixRa !== null ||
    scenarioAmounts.lumpsum !== null ||
    mixVoluntaryPct !== 50 ||
    scenario !== "voluntary";

  const handleReset = () => {
    onScenarioChange("voluntary");
    onMixVoluntaryPctChange(50);
    onScenarioAmountsChange({
      voluntary: null,
      ra: null,
      mixVol: null,
      mixRa: null,
      lumpsum: null,
    });
  };

  return (
    <div className="space-y-3 pt-4 pb-6">
      <div className="flex items-center justify-end -mt-2 mb-1">
        <button
          type="button"
          onClick={handleReset}
          disabled={!hasOverrides}
          className="text-xs disabled:opacity-40"
          style={{ color: "var(--ew-blue)" }}
        >
          Reset to recommended
        </button>
      </div>

      <ScenarioOption
        selected={scenario === "voluntary"}
        onSelect={() => onScenarioChange("voluntary")}
        label="Voluntary investments only"
        primary={`${formatCurrencyValue(
          Math.round(effective.voluntary).toString()
        )} / mo`}
        secondary="no tax benefit"
      >
        {scenario === "voluntary" && (
          <AmountAdjuster
            label="Monthly contribution"
            suffix="/ mo"
            value={effective.voluntary}
            recommended={recommended.voluntary}
            onChange={(v) => setAmount("voluntary", v)}
          />
        )}
      </ScenarioOption>

      <ScenarioOption
        selected={scenario === "ra"}
        onSelect={() => onScenarioChange("ra")}
        label="Retirement annuity only"
        primary={`${formatCurrencyValue(
          Math.round(effective.ra).toString()
        )} / mo`}
        secondary={`${formatCurrencyValue(
          Math.round(raOnlyTaxSaving).toString()
        )} tax saving / yr`}
      >
        {scenario === "ra" && (
          <AmountAdjuster
            label="Monthly contribution"
            suffix="/ mo"
            value={effective.ra}
            recommended={recommended.ra}
            onChange={(v) => setAmount("ra", v)}
          />
        )}
      </ScenarioOption>

      <ScenarioOption
        selected={scenario === "mixed"}
        onSelect={() => onScenarioChange("mixed")}
        label="Mix of both"
        primary={
          scenario === "mixed"
            ? `${formatCurrencyValue(
                Math.round(effective.mixVol + effective.mixRa).toString()
              )} / mo total`
            : "pick a split"
        }
        secondary={
          scenario === "mixed"
            ? `${formatCurrencyValue(
                Math.round(mixTaxSaving).toString()
              )} tax saving / yr`
            : undefined
        }
      >
        {scenario === "mixed" && (
          <div className="pt-3 mt-2 space-y-3">
            <div>
              <div
                className="flex items-baseline justify-between text-xs mb-1.5"
                style={{ color: "var(--ew-gray-700)" }}
              >
                <span>Voluntary {mixVoluntaryPct}%</span>
                <span>RA {100 - mixVoluntaryPct}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={mixVoluntaryPct}
                onChange={(e) =>
                  onMixVoluntaryPctChange(parseInt(e.target.value))
                }
                className="w-full"
                aria-label="Voluntary / RA split"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <AmountAdjuster
                label="Voluntary"
                suffix="/ mo"
                value={effective.mixVol}
                recommended={recommended.mixVol}
                onChange={(v) => setAmount("mixVol", v)}
              />
              <AmountAdjuster
                label="Retirement annuity"
                suffix="/ mo"
                value={effective.mixRa}
                recommended={recommended.mixRa}
                onChange={(v) => setAmount("mixRa", v)}
              />
            </div>
          </div>
        )}
      </ScenarioOption>

      <ScenarioOption
        selected={scenario === "lumpsum"}
        onSelect={() => onScenarioChange("lumpsum")}
        label="Lump sum today"
        primary={`${formatCurrencyValue(
          Math.round(effective.lumpsum).toString()
        )} one-off`}
        secondary="no tax benefit"
      >
        {scenario === "lumpsum" && (
          <AmountAdjuster
            label="One-off deposit"
            suffix="today"
            value={effective.lumpsum}
            recommended={recommended.lumpsum}
            onChange={(v) => setAmount("lumpsum", v)}
          />
        )}
      </ScenarioOption>
    </div>
  );
}

function AmountAdjuster({
  label,
  suffix,
  value,
  recommended,
  onChange,
}: {
  label: string;
  suffix: string;
  value: number;
  recommended: number;
  onChange: (v: number | null) => void;
}) {
  const isRecommended = Math.round(value) === Math.round(recommended);
  return (
    <div
      className="pt-3 mt-2"
      style={{ borderTop: "1px solid var(--ew-blue-tertiary-100)" }}
    >
      <label
        className="block text-xs uppercase tracking-wide font-medium mb-1.5"
        style={{ color: "var(--ew-blue)" }}
      >
        {label}
      </label>
      <div className="flex items-baseline gap-2">
        <span
          className="text-sm font-medium"
          style={{ color: "var(--ew-primary-navy)" }}
        >
          R
        </span>
        <input
          type="number"
          value={Math.round(value)}
          onChange={(e) => {
            const n = parseFloat(e.target.value);
            onChange(isNaN(n) ? 0 : n);
          }}
          className="table-input tabular-nums text-right"
          style={{ width: "140px" }}
          min={0}
        />
        <span className="text-sm" style={{ color: "var(--ew-gray-700)" }}>
          {suffix}
        </span>
        {!isRecommended && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs underline ml-2"
            style={{ color: "var(--ew-blue)" }}
          >
            Reset to R
            {formatCurrencyValue(Math.round(recommended).toString()).replace(
              /^R\s*/,
              ""
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function AssumptionsPanel({
  growthPct,
  onGrowthChange,
  increasePct,
  onIncreaseChange,
  raTaxPct,
  onRaTaxChange,
}: {
  growthPct: number;
  onGrowthChange: (n: number) => void;
  increasePct: number;
  onIncreaseChange: (n: number) => void;
  raTaxPct: number;
  onRaTaxChange: (n: number) => void;
}) {
  return (
    <div className="space-y-5">
      <p className="text-sm" style={{ color: "var(--ew-gray-700)" }}>
        These apply to every scenario in the Tune contributions tab.
      </p>

      <AssumptionField
        label="Growth rate"
        value={growthPct}
        onChange={onGrowthChange}
        help="The annual growth rate assumed for your investments before retirement."
      />
      <AssumptionField
        label="Contribution escalation"
        value={increasePct}
        onChange={onIncreaseChange}
        help="The annual increase in your monthly contribution amount."
      />
      <AssumptionField
        label="RA marginal tax rate"
        value={raTaxPct}
        onChange={onRaTaxChange}
        help="Your marginal income tax rate, used to compute the tax saving on RA contributions."
      />
    </div>
  );
}

function AssumptionField({
  label,
  value,
  onChange,
  help,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  help: string;
}) {
  return (
    <div className="space-y-1.5">
      <label
        className="block text-sm font-medium uppercase tracking-wide"
        style={{ color: "var(--ew-blue)" }}
      >
        {label}
      </label>
      <div className="flex items-baseline gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="table-input tabular-nums text-right"
          style={{ width: "90px" }}
          min={0}
          step={0.5}
        />
        <span
          className="text-sm font-medium"
          style={{ color: "var(--ew-primary-navy)" }}
        >
          %
        </span>
      </div>
      <p className="text-xs" style={{ color: "var(--ew-gray-700)" }}>
        {help}
      </p>
    </div>
  );
}

function ScenarioOption({
  selected,
  onSelect,
  label,
  primary,
  secondary,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
  primary: string;
  secondary?: string;
  children?: React.ReactNode;
}) {
  return (
    <label
      className="block rounded-md px-4 py-3 cursor-pointer transition-colors"
      style={{
        backgroundColor: selected ? "var(--ew-blue-tertiary-50)" : "#F5F5F5",
      }}
    >
      <div className="flex items-baseline gap-3">
        <input
          type="radio"
          checked={selected}
          onChange={onSelect}
          className="mt-1"
        />
        <div className="flex-1 flex items-baseline justify-between gap-3">
          <div
            className="text-sm font-medium"
            style={{ color: "var(--ew-primary-navy)" }}
          >
            {label}
          </div>
          <div className="text-right">
            <div
              className="text-base font-semibold tabular-nums"
              style={{ color: "var(--ew-primary-navy)" }}
            >
              {primary}
            </div>
            {secondary && (
              <div className="text-xs" style={{ color: "var(--ew-gray-700)" }}>
                {secondary}
              </div>
            )}
          </div>
        </div>
      </div>
      {children}
    </label>
  );
}

function CoverageBars({
  capitalProvided,
  capitalRequired,
  coverage,
  adjustedCapital,
  adjustedCoverage,
}: {
  capitalProvided: number;
  capitalRequired: number;
  coverage: number;
  adjustedCapital: number;
  adjustedCoverage: number;
}) {
  const currentPct = Math.min(100, Math.max(0, coverage * 100));
  const adjustedPct = Math.min(100, Math.max(0, adjustedCoverage * 100));
  const currentShortfall = Math.max(0, capitalRequired - capitalProvided);
  const adjustedShortfall = Math.max(0, capitalRequired - adjustedCapital);

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between">
        <span
          className="text-xs uppercase tracking-wide font-medium"
          style={{ color: "var(--ew-blue)" }}
        >
          Capital required
        </span>
        <span
          className="text-base font-semibold tabular-nums"
          style={{ color: "var(--ew-primary-navy)" }}
        >
          {formatCurrencyValue(Math.round(capitalRequired).toString())}
        </span>
      </div>

      <Bar
        label="Current"
        amount={capitalProvided}
        percentage={currentPct}
        rightLabel={
          currentShortfall > 0
            ? `Shortfall ${formatCurrencyValue(
                Math.round(currentShortfall).toString()
              )}`
            : undefined
        }
        rightTone="var(--ew-tangerine)"
      />

      <div className="pt-10">
        <Bar
          label="Adjusted"
          amount={adjustedCapital}
          percentage={adjustedPct}
          rightLabel={
            adjustedShortfall > 0
              ? `Shortfall ${formatCurrencyValue(
                  Math.round(adjustedShortfall).toString()
                )}`
              : "Gap closed"
          }
          rightTone={adjustedShortfall > 0 ? "var(--ew-tangerine)" : undefined}
        />
      </div>
    </div>
  );
}

function Bar({
  label,
  amount,
  percentage,
  rightLabel,
  rightTone,
}: {
  label: string;
  amount: number;
  percentage: number;
  rightLabel?: string;
  rightTone?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span
          className="text-xs uppercase tracking-wide font-medium"
          style={{ color: "var(--ew-blue)" }}
        >
          {label}
        </span>
        <span
          className="text-xs tabular-nums font-medium"
          style={{ color: "var(--ew-primary-navy)" }}
        >
          {Math.round(percentage)}%
        </span>
      </div>
      <div
        className="h-3 rounded-full overflow-hidden"
        style={{ backgroundColor: "var(--chart-secondary-blue-light)" }}
      >
        <div
          className="h-full transition-all"
          style={{
            width: `${Math.min(100, Math.max(0, percentage))}%`,
            backgroundColor: "var(--chart-primary-blue)",
          }}
        />
      </div>
      <div className="flex items-baseline justify-between mt-1.5">
        <span
          className="text-sm font-semibold tabular-nums"
          style={{ color: "var(--ew-primary-navy)" }}
        >
          {formatCurrencyValue(Math.round(amount).toString())}
        </span>
        {rightLabel && (
          <span
            className="text-xs tabular-nums font-medium"
            style={{ color: rightTone ?? "var(--ew-gray-700)" }}
          >
            {rightLabel}
          </span>
        )}
      </div>
    </div>
  );
}
