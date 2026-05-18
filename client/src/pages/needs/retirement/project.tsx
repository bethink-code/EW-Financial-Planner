import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { GaugeChart } from "@/components/project/charts/gauge-chart";
import { CustomTabs } from "@/components/ui/custom-tabs";
import { formatCurrencyValue, handleDefaultValueFocus } from "@/lib/formatting";
import { additionalMonthlyContribution, type RetirementProjection } from "@shared/retirement-calculations";

function parsePct(value: string): number {
  const cleaned = value.replace(/[^\d.-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n / 100;
}

const PLAN_ID = 1;

function rand(n: number): string {
  return formatCurrencyValue(Math.round(n).toString());
}

export default function RetirementProject() {
  const { data: projection, isLoading } = useQuery<RetirementProjection & { ready: boolean }>({
    queryKey: [`/api/retirement-projection/${PLAN_ID}`],
    queryFn: () => fetch(`/api/retirement-projection/${PLAN_ID}`).then(r => r.json()),
  });

  if (isLoading || !projection) {
    return <div className="px-6 py-4 text-neutral-500">Loading projection…</div>;
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
    additionalMonthlyContribution,
    yearsToRetirement,
    yearsAfterRetirement,
  } = projection;

  const flatRows: { category: string; description: string; capitalAtRetirement: number; valueInCurrentTerms: number; key: string }[] = [
    ...retirementFunds.map(r => ({ category: "Retirement funds", description: r.description, capitalAtRetirement: r.capitalAtRetirement, valueInCurrentTerms: r.valueInCurrentTerms, key: `rf-${r.id}` })),
    ...definedBenefitFunds.map(r => ({ category: "Defined benefit", description: r.description, capitalAtRetirement: r.capitalAtRetirement, valueInCurrentTerms: r.valueInCurrentTerms, key: `db-${r.id}` })),
    ...voluntaryInvestments.map(r => ({ category: "Voluntary", description: r.description, capitalAtRetirement: r.capitalAtRetirement, valueInCurrentTerms: r.valueInCurrentTerms, key: `vi-${r.id}` })),
    ...futureInflows.map(r => ({ category: "Future inflow", description: r.description, capitalAtRetirement: r.capitalAtRetirement, valueInCurrentTerms: r.valueInCurrentTerms, key: `fi-${r.id}` })),
    ...lumpSumNeeds.map(r => ({ category: "Lump sum need", description: r.description, capitalAtRetirement: r.capitalAtRetirement, valueInCurrentTerms: r.valueInCurrentTerms, key: `ls-${r.id}` })),
    ...incomeRequired.map(r => ({ category: "Income required", description: r.description, capitalAtRetirement: r.capitalAtRetirement, valueInCurrentTerms: r.valueInCurrentTerms, key: `ir-${r.id}` })),
    ...incomeProvided.map(r => ({ category: "Income provided", description: r.description, capitalAtRetirement: r.capitalAtRetirement, valueInCurrentTerms: r.valueInCurrentTerms, key: `ip-${r.id}` })),
  ];

  return (
    <div className="w-full px-6 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT: Coverage chart + summary + recommendation */}
        <Card className="px-5 py-4 border-0 shadow-none bg-transparent self-start">
          <div className="mb-3 pb-2 border-b flex items-end justify-between" style={{ borderColor: "var(--ew-border)" }}>
            <div className="flex items-baseline gap-3">
              <h2 className="text-base font-bold tracking-tight uppercase" style={{ color: "var(--ew-primary-navy)" }}>
                Coverage
              </h2>
            </div>
            <span className="text-xs tabular-nums" style={{ color: "var(--ew-gray-700)" }}>
              {yearsToRetirement} yrs &middot; {yearsAfterRetirement} after
            </span>
          </div>

          <div className="flex items-center justify-center -mt-4 -mb-8">
            <GaugeChart
              title="Coverage"
              data={{
                provided: capitalProvided,
                required: capitalRequired,
                surplus,
                percentage: coverage * 100,
              }}
            />
          </div>

          <div className="max-w-md mx-auto">
            <div className="space-y-1">
              <SummaryRow label="Capital provided" value={capitalProvided} />
              <SummaryRow label="Capital required" value={capitalRequired} />
              <SummaryRow
                label={surplus >= 0 ? "Surplus" : "Shortfall"}
                value={Math.abs(surplus)}
                tone={surplus >= 0 ? "positive" : "negative"}
              />
            </div>

            {additionalMonthlyContribution > 0 && (
              <div className="mt-3 rounded-md px-3 py-2 border-l-4" style={{ backgroundColor: "var(--ew-blue-tertiary-50)", borderLeftColor: "var(--ew-blue)" }}>
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <div className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--ew-blue)" }}>
                      Recommended top-up
                    </div>
                    <div className="text-xs" style={{ color: "var(--ew-gray-700)" }}>to close the shortfall by retirement</div>
                  </div>
                  <div className="text-lg font-bold tabular-nums tracking-tight whitespace-nowrap" style={{ color: "var(--ew-primary-navy)" }}>
                    {rand(additionalMonthlyContribution)} <span className="text-xs font-normal" style={{ color: "var(--ew-gray-700)" }}>/ mo</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* RIGHT: Tabs — Breakdown of per-vehicle outputs, or the contributions
            tuner where planners can play with assumptions and see the
            recommended top-up move. Lets the user see the chart on the left
            while flipping between detail and what-if on the right. */}
        <DetailTabsPanel
          flatRows={flatRows}
          shortfall={Math.max(0, -surplus)}
          yearsToRetirement={yearsToRetirement}
        />
      </div>
    </div>
  );
}

function DetailTabsPanel({
  flatRows,
  shortfall,
  yearsToRetirement,
}: {
  flatRows: { category: string; description: string; capitalAtRetirement: number; valueInCurrentTerms: number; key: string }[];
  shortfall: number;
  yearsToRetirement: number;
}) {
  const [active, setActive] = useState<"breakdown" | "tuner">("breakdown");

  return (
    <Card className="p-6 border-0 shadow-sm">
      <CustomTabs
        tabs={[
          { id: "breakdown", label: "Breakdown" },
          { id: "tuner", label: "Tune contributions" },
        ]}
        activeTab={active}
        onTabChange={(id) => setActive(id as "breakdown" | "tuner")}
        className="mb-3"
      />
      {active === "breakdown" ? (
        <div className="rounded-md overflow-hidden">
          <table className="w-full text-xs no-row-borders">
            <thead>
              <tr style={{ color: "var(--ew-gray-700)", backgroundColor: "var(--ew-row-tint)" }}>
                <th className="px-3 py-2 text-left font-medium uppercase tracking-wide w-[140px]">Category</th>
                <th className="px-3 py-2 text-left font-medium uppercase tracking-wide">Description</th>
                <th className="px-3 py-2 text-right font-medium uppercase tracking-wide w-[140px]">At retirement</th>
                <th className="px-3 py-2 text-right font-medium uppercase tracking-wide w-[140px]">Today's terms</th>
              </tr>
            </thead>
            <tbody>
              {flatRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-3 text-xs text-center" style={{ color: "var(--ew-gray-700)" }}>
                    No entries yet.
                  </td>
                </tr>
              ) : (
                flatRows.map((r, idx) => (
                  <tr key={r.key} style={{ backgroundColor: idx % 2 === 0 ? "white" : "var(--ew-row-tint)" }}>
                    <td className="px-3 py-1.5 text-xs uppercase tracking-wide" style={{ color: "var(--ew-blue)" }}>{r.category}</td>
                    <td className="px-3 py-1.5 truncate" style={{ color: "var(--ew-primary-navy)" }}>{r.description || "(untitled)"}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums font-medium" style={{ color: "var(--ew-gray-900)" }}>{rand(r.capitalAtRetirement)}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums" style={{ color: "var(--ew-gray-700)" }}>{rand(r.valueInCurrentTerms)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <ContributionsTuner shortfall={shortfall} yearsToRetirement={yearsToRetirement} />
      )}
    </Card>
  );
}

function ContributionsTuner({
  shortfall,
  yearsToRetirement,
}: {
  shortfall: number;
  yearsToRetirement: number;
}) {
  const [volGrowth, setVolGrowth] = useState("10%");
  const [volIncrease, setVolIncrease] = useState("6%");
  const [volSplit, setVolSplit] = useState("100%");
  const [raGrowth, setRaGrowth] = useState("10%");
  const [raTax, setRaTax] = useState("25%");
  const [raIncrease, setRaIncrease] = useState("6%");

  const volSplitFrac = parsePct(volSplit);
  const raSplitFrac = Math.max(0, 1 - volSplitFrac);

  const volMonthly = additionalMonthlyContribution({
    shortfallAtRetirement: shortfall * volSplitFrac,
    growthRate: parsePct(volGrowth),
    contributionEscalation: parsePct(volIncrease),
    yearsToRetirement,
  });
  const raMonthly = additionalMonthlyContribution({
    shortfallAtRetirement: shortfall * raSplitFrac,
    growthRate: parsePct(raGrowth),
    contributionEscalation: parsePct(raIncrease),
    yearsToRetirement,
  });
  const raTaxSavingAnnual = raMonthly * 12 * parsePct(raTax);

  return (
    <div className="space-y-3">
      <p className="text-xs" style={{ color: "var(--ew-gray-700)" }}>
        Tune the assumptions to see how the recommended top-up moves. Shortfall: <span className="tabular-nums font-medium" style={{ color: "var(--ew-tangerine)" }}>{formatCurrencyValue(Math.round(shortfall).toString())}</span>
      </p>

      <AllocationForm
        title="Voluntary investments"
        growth={volGrowth} onGrowthChange={setVolGrowth}
        increase={volIncrease} onIncreaseChange={setVolIncrease}
        split={volSplit} onSplitChange={setVolSplit}
        monthly={volMonthly}
      />

      <AllocationForm
        title="Retirement funds (RA)"
        growth={raGrowth} onGrowthChange={setRaGrowth}
        tax={raTax} onTaxChange={setRaTax}
        increase={raIncrease} onIncreaseChange={setRaIncrease}
        splitReadOnly={`${(raSplitFrac * 100).toFixed(0)}%`}
        monthly={raMonthly}
        taxSavingAnnual={raTaxSavingAnnual}
      />
    </div>
  );
}

function AllocationForm({
  title,
  growth, onGrowthChange,
  tax, onTaxChange,
  increase, onIncreaseChange,
  split, onSplitChange,
  splitReadOnly,
  monthly,
  taxSavingAnnual,
}: {
  title: string;
  growth: string; onGrowthChange: (v: string) => void;
  tax?: string; onTaxChange?: (v: string) => void;
  increase: string; onIncreaseChange: (v: string) => void;
  split?: string; onSplitChange?: (v: string) => void;
  splitReadOnly?: string;
  monthly: number;
  taxSavingAnnual?: number;
}) {
  return (
    <div className="rounded-md border" style={{ borderColor: "var(--ew-border)" }}>
      <h4
        className="text-xs font-bold uppercase tracking-wide px-3 py-2"
        style={{
          color: "var(--ew-blue)",
          backgroundColor: "var(--ew-blue-tertiary-50)",
          borderBottom: "1px solid var(--ew-border)",
        }}
      >
        {title}
      </h4>
      <div className="p-3 grid grid-cols-2 gap-x-4 gap-y-3">
        <FormFieldRow label="Growth rate %">
          <input
            type="text"
            value={growth}
            className="table-input field-percentage"
            onFocus={handleDefaultValueFocus}
            onChange={(e) => onGrowthChange(e.target.value)}
          />
        </FormFieldRow>
        <FormFieldRow label="Tax %">
          {onTaxChange ? (
            <input
              type="text"
              value={tax ?? ""}
              className="table-input field-percentage"
              onFocus={handleDefaultValueFocus}
              onChange={(e) => onTaxChange(e.target.value)}
            />
          ) : (
            <div className="calculated-field text-right" style={{ width: 64 }}>—</div>
          )}
        </FormFieldRow>
        <FormFieldRow label="Increase %">
          <input
            type="text"
            value={increase}
            className="table-input field-percentage"
            onFocus={handleDefaultValueFocus}
            onChange={(e) => onIncreaseChange(e.target.value)}
          />
        </FormFieldRow>
        <FormFieldRow label="Split %">
          {onSplitChange ? (
            <input
              type="text"
              value={split ?? ""}
              className="table-input field-percentage"
              onFocus={handleDefaultValueFocus}
              onChange={(e) => onSplitChange(e.target.value)}
            />
          ) : (
            <div className="calculated-field text-right" style={{ width: 64 }}>{splitReadOnly}</div>
          )}
        </FormFieldRow>
      </div>
      <div
        className="px-3 py-2 grid grid-cols-2 gap-4 text-xs"
        style={{ borderTop: "1px solid var(--ew-border)", backgroundColor: "var(--ew-row-tint)" }}
      >
        <div>
          <div className="uppercase tracking-wide font-medium mb-0.5" style={{ color: "var(--ew-blue)" }}>Top-up / mo</div>
          <div className="text-base font-semibold tabular-nums" style={{ color: "var(--ew-primary-navy)" }}>
            {formatCurrencyValue(Math.round(monthly).toString())}
          </div>
        </div>
        {taxSavingAnnual !== undefined && (
          <div>
            <div className="uppercase tracking-wide font-medium mb-0.5" style={{ color: "var(--ew-blue)" }}>Tax saving / yr</div>
            <div className="text-base font-semibold tabular-nums" style={{ color: "var(--ew-primary-navy)" }}>
              {formatCurrencyValue(Math.round(taxSavingAnnual).toString())}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FormFieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium" style={{ color: "var(--ew-primary-navy)" }}>{label}</label>
      {children}
    </div>
  );
}

function SummaryRow({ label, value, tone }: { label: string; value: number; tone?: "positive" | "negative" }) {
  const valueColor =
    tone === "positive" ? "var(--ew-positive-symbol)" :
    tone === "negative" ? "var(--ew-tangerine)" :
    "var(--ew-primary-navy)";
  return (
    <div className="flex items-baseline justify-between py-1 border-b last:border-b-0" style={{ borderColor: "var(--ew-border)" }}>
      <span className="text-sm" style={{ color: "var(--ew-gray-700)" }}>{label}</span>
      <span className="text-sm font-semibold tabular-nums" style={{ color: valueColor }}>
        {formatCurrencyValue(Math.round(value).toString())}
      </span>
    </div>
  );
}
