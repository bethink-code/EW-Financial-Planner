import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { formatCurrencyValue } from "@/lib/formatting";
import type { RetirementProjection } from "@shared/retirement-calculations";

const PLAN_ID = 1;

export default function RetirementImplement() {
  const { data: projection, isLoading } = useQuery<RetirementProjection & { ready: boolean }>({
    queryKey: [`/api/retirement-projection/${PLAN_ID}`],
    queryFn: () => fetch(`/api/retirement-projection/${PLAN_ID}`).then(r => r.json()),
  });

  if (isLoading || !projection) {
    return <div className="px-6 py-6 text-neutral-500">Loading recommendation…</div>;
  }

  const { surplus, additionalMonthlyContribution, yearsToRetirement } = projection;
  const goalFunded = surplus >= 0;

  return (
    <div className="w-full px-6 py-6">
      <Card className="p-6 max-w-3xl">
        <h2 className="text-xl font-semibold mb-2">Implement</h2>
        <p className="text-sm text-neutral-600 mb-6">Recommended action to close the gap to retirement.</p>

        {goalFunded ? (
          <div className="bg-green-50 border border-green-200 rounded p-6">
            <div className="text-2xl font-semibold text-green-800 mb-1">Goal funded</div>
            <div className="text-sm text-green-700">
              Projected capital at retirement exceeds the requirement by {formatCurrencyValue(Math.round(surplus).toString())}.
              No additional monthly contribution is required.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded p-6">
              <div className="text-xs uppercase tracking-wide text-amber-700 font-medium mb-1">Recommended top-up contribution</div>
              <div className="text-3xl font-semibold text-amber-900 mb-1">
                {formatCurrencyValue(Math.round(additionalMonthlyContribution).toString())} <span className="text-lg font-normal">/ month</span>
              </div>
              <div className="text-sm text-amber-800">
                Required for {yearsToRetirement} years (escalating at 6% p.a., assumed 10% p.a. growth) to close a {formatCurrencyValue(Math.round(Math.abs(surplus)).toString())} shortfall by retirement.
              </div>
            </div>

            <div className="text-sm text-neutral-600">
              The recommendation assumes the contribution can be split across vehicles you choose. Per-vehicle splitting and
              vehicle-specific tax treatment will be added in a follow-up.
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
