import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { GaugeChart } from "@/components/project/charts/gauge-chart";
import { formatCurrencyValue } from "@/lib/formatting";
import type { RetirementProjection } from "@shared/retirement-calculations";

const PLAN_ID = 1;

export default function RetirementProject() {
  const { data: projection, isLoading } = useQuery<RetirementProjection & { ready: boolean }>({
    queryKey: [`/api/retirement-projection/${PLAN_ID}`],
    queryFn: () => fetch(`/api/retirement-projection/${PLAN_ID}`).then(r => r.json()),
  });

  if (isLoading || !projection) {
    return <div className="px-6 py-6 text-neutral-500">Loading projection…</div>;
  }

  const { capitalProvided, capitalRequired, surplus, coverage, retirementFunds, definedBenefitFunds, voluntaryInvestments, futureInflows, lumpSumNeeds, incomeRequired, incomeProvided, additionalMonthlyContribution, yearsToRetirement, yearsAfterRetirement } = projection;

  return (
    <div className="w-full px-6 py-6 space-y-6">
      <Card className="p-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-semibold">Retirement projection</h2>
          <span className="text-sm text-neutral-600">{yearsToRetirement} years to retirement · {yearsAfterRetirement} years after</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div className="space-y-3">
            <SummaryRow label="Capital provided" value={capitalProvided} />
            <SummaryRow label="Capital required" value={capitalRequired} />
            <SummaryRow label={surplus >= 0 ? "Surplus" : "Shortfall"} value={Math.abs(surplus)} tone={surplus >= 0 ? "positive" : "negative"} />
            {additionalMonthlyContribution > 0 && (
              <div className="pt-3 border-t border-neutral-200">
                <div className="text-xs font-medium text-amber-700 uppercase tracking-wide">Recommended top-up</div>
                <div className="text-lg font-semibold text-neutral-900">
                  {formatCurrencyValue(Math.round(additionalMonthlyContribution).toString())} / month
                </div>
                <div className="text-xs text-neutral-500">to close the shortfall by retirement</div>
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
  const color = tone === "positive" ? "text-green-700" : tone === "negative" ? "text-red-700" : "text-neutral-900";
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-sm text-neutral-600">{label}</span>
      <span className={`text-lg font-semibold ${color}`}>{formatCurrencyValue(Math.round(value).toString())}</span>
    </div>
  );
}

function VehicleTable({ title, rows }: { title: string; rows: { id: number; description: string; capitalAtRetirement: number; valueInCurrentTerms: number }[] }) {
  if (rows.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-neutral-400">No entries.</p>
      </Card>
    );
  }
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-2">{title}</h3>
      <table className="w-full text-sm">
        <thead className="text-neutral-500 text-xs uppercase">
          <tr>
            <th className="text-left p-1">Description</th>
            <th className="text-right p-1">At retirement</th>
            <th className="text-right p-1">In today's terms</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className="border-t border-neutral-100">
              <td className="p-1">{r.description || "(untitled)"}</td>
              <td className="p-1 text-right">{formatCurrencyValue(Math.round(r.capitalAtRetirement).toString())}</td>
              <td className="p-1 text-right text-neutral-500">{formatCurrencyValue(Math.round(r.valueInCurrentTerms).toString())}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
