import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { GaugeChart } from "@/components/project/charts/gauge-chart";
import { formatCurrencyValue } from "@/lib/formatting";
import type { RetirementProjection } from "@shared/retirement-calculations";

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
    return <div className="px-6 py-6 text-neutral-500">Loading projection…</div>;
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

  return (
    <div className="w-full px-6 py-8 space-y-6">
      <Card className="p-8 border-0 shadow-sm">
        <div className="mb-6 pb-4 border-b flex items-end justify-between" style={{ borderColor: "var(--ew-border)" }}>
          <div>
            <div className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--ew-gray-700)" }}>
              Retirement &nbsp;&rsaquo;&nbsp; Projection
            </div>
            <h2 className="text-2xl font-bold mt-1 tracking-tight" style={{ color: "var(--ew-primary-navy)" }}>
              COVERAGE
            </h2>
          </div>
          <span className="text-xs tabular-nums" style={{ color: "var(--ew-gray-700)" }}>
            {yearsToRetirement} years to retirement &middot; {yearsAfterRetirement} years after
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex items-center justify-center">
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
          <div className="space-y-2">
            <SummaryRow label="Capital provided" value={capitalProvided} />
            <SummaryRow label="Capital required" value={capitalRequired} />
            <SummaryRow
              label={surplus >= 0 ? "Surplus" : "Shortfall"}
              value={Math.abs(surplus)}
              tone={surplus >= 0 ? "positive" : "negative"}
            />
            {additionalMonthlyContribution > 0 && (
              <div className="mt-4 rounded-md p-4 border-l-4" style={{ backgroundColor: "var(--ew-blue-tertiary-50)", borderLeftColor: "var(--ew-blue)" }}>
                <div className="text-xs font-medium tracking-wide uppercase mb-1" style={{ color: "var(--ew-blue)" }}>
                  Recommended top-up
                </div>
                <div className="text-2xl font-bold tabular-nums tracking-tight" style={{ color: "var(--ew-primary-navy)" }}>
                  {rand(additionalMonthlyContribution)} <span className="text-sm font-normal" style={{ color: "var(--ew-gray-700)" }}>/ month</span>
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--ew-gray-700)" }}>to close the shortfall by retirement</div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VehicleTable title="Retirement funds" rows={retirementFunds} />
        <VehicleTable title="Defined benefit funds" rows={definedBenefitFunds} />
        <VehicleTable title="Voluntary investments" rows={voluntaryInvestments} />
        <VehicleTable title="Future inflows" rows={futureInflows} />
        <VehicleTable title="Lump sum needs" rows={lumpSumNeeds} />
        <VehicleTable title="Income required" rows={incomeRequired} />
        <VehicleTable title="Income provided" rows={incomeProvided} />
      </div>
    </div>
  );
}

function SummaryRow({ label, value, tone }: { label: string; value: number; tone?: "positive" | "negative" }) {
  const valueColor =
    tone === "positive" ? "var(--ew-positive-symbol)" :
    tone === "negative" ? "var(--ew-negative-symbol)" :
    "var(--ew-primary-navy)";
  return (
    <div className="flex items-baseline justify-between py-1.5 border-b last:border-b-0" style={{ borderColor: "var(--ew-border)" }}>
      <span className="text-sm" style={{ color: "var(--ew-gray-700)" }}>{label}</span>
      <span className="text-lg font-semibold tabular-nums" style={{ color: valueColor }}>
        {formatCurrencyValue(Math.round(value).toString())}
      </span>
    </div>
  );
}

function VehicleTable({
  title,
  rows,
}: {
  title: string;
  rows: { id: number; description: string; capitalAtRetirement: number; valueInCurrentTerms: number }[];
}) {
  if (rows.length === 0) {
    return (
      <Card className="p-5 border-0 shadow-sm">
        <h3 className="text-xs font-medium tracking-wide uppercase mb-2" style={{ color: "var(--ew-blue)" }}>{title}</h3>
        <p className="text-sm" style={{ color: "var(--ew-gray-600)" }}>No entries.</p>
      </Card>
    );
  }
  return (
    <Card className="p-5 border-0 shadow-sm">
      <h3 className="text-xs font-medium tracking-wide uppercase mb-3" style={{ color: "var(--ew-blue)" }}>{title}</h3>
      <div className="rounded-md overflow-hidden" style={{ backgroundColor: "var(--ew-row-tint)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ color: "var(--ew-gray-700)" }}>
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide">Description</th>
              <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide">At retirement</th>
              <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide">Today's terms</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.id} style={{ backgroundColor: idx % 2 === 0 ? "white" : "var(--ew-row-tint)" }}>
                <td className="px-3 py-2.5" style={{ color: "var(--ew-primary-navy)" }}>{r.description || "(untitled)"}</td>
                <td className="px-3 py-2.5 text-right tabular-nums font-medium" style={{ color: "var(--ew-gray-900)" }}>{rand(r.capitalAtRetirement)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums" style={{ color: "var(--ew-gray-700)" }}>{rand(r.valueInCurrentTerms)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
