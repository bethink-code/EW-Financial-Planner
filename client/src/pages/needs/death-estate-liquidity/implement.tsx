import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { formatCurrencyValue } from "@/lib/formatting";
import type { DelProjection } from "@shared/del-calculations";

const PLAN_ID = 1;

function rand(n: number): string {
  return formatCurrencyValue(Math.round(n).toString());
}

export default function DELImplementStep() {
  const { data: projection, isLoading } = useQuery<DelProjection>({
    queryKey: [`/api/del-projection/${PLAN_ID}`],
    queryFn: () => fetch(`/api/del-projection/${PLAN_ID}`).then(r => r.json()),
  });

  if (isLoading || !projection) {
    return <div className="px-6 py-6 text-neutral-500">Loading recommendation…</div>;
  }

  const { totalCapitalPosition, estatePosition, dependantsPosition, recommendedAdditionalCover } = projection;
  const goalFunded = recommendedAdditionalCover <= 0;

  return (
    <div className="w-full px-6 py-8">
      <Card className="p-8 max-w-4xl mx-auto border-0 shadow-sm">
        <div className="mb-8 pb-4 border-b" style={{ borderColor: "var(--ew-border)" }}>
          <div className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--ew-gray-700)" }}>
            Death with estate liquidity &nbsp;&rsaquo;&nbsp; Recommendation
          </div>
          <h2 className="text-2xl font-bold mt-1 tracking-tight" style={{ color: "var(--ew-primary-navy)" }}>
            IMPLEMENT
          </h2>
        </div>

        {goalFunded ? (
          <div className="rounded-md p-6 flex items-start gap-4" style={{ backgroundColor: "var(--ew-positive-bg)" }}>
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: "var(--ew-positive-symbol)" }}>
              ✓
            </div>
            <div>
              <div className="text-lg font-semibold mb-1" style={{ color: "var(--ew-primary-navy)" }}>Estate liquidity met</div>
              <div className="text-sm" style={{ color: "var(--ew-gray-900)" }}>
                Total capital provided exceeds requirement by <span className="font-semibold tabular-nums">{rand(totalCapitalPosition.surplus)}</span>.
                No additional life cover is recommended.
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Recommended cover — hero callout */}
            <div className="rounded-md p-6 border-l-4" style={{ backgroundColor: "var(--ew-blue-tertiary-50)", borderLeftColor: "var(--ew-blue)" }}>
              <div className="text-xs font-medium tracking-wide uppercase mb-2" style={{ color: "var(--ew-blue)" }}>
                Recommended additional life cover
              </div>
              <div className="text-4xl font-bold tracking-tight tabular-nums mb-2" style={{ color: "var(--ew-primary-navy)" }}>
                {rand(recommendedAdditionalCover)}
              </div>
              <div className="text-sm" style={{ color: "var(--ew-gray-900)" }}>
                Closes the <span className="font-semibold tabular-nums">{rand(Math.abs(totalCapitalPosition.surplus))}</span> total capital shortfall at death.
              </div>
            </div>

            {/* Position shortfall table */}
            <div>
              <div className="text-xs font-medium tracking-wide uppercase mb-3" style={{ color: "var(--ew-blue)" }}>
                Where the shortfall sits
              </div>

              <div className="rounded-md overflow-hidden" style={{ backgroundColor: "var(--ew-row-tint)" }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ color: "var(--ew-gray-700)" }}>
                      <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide">Position</th>
                      <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide">Provided</th>
                      <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide">Required</th>
                      <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wide">Shortfall</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ backgroundColor: "white" }}>
                      <td className="px-5 py-4 font-medium" style={{ color: "var(--ew-primary-navy)" }}>Estate</td>
                      <td className="px-5 py-4 text-right tabular-nums" style={{ color: "var(--ew-gray-900)" }}>{rand(estatePosition.provided)}</td>
                      <td className="px-5 py-4 text-right tabular-nums" style={{ color: "var(--ew-gray-900)" }}>{rand(estatePosition.required)}</td>
                      <td className="px-5 py-4 text-right tabular-nums font-medium" style={estatePosition.surplus < 0 ? { color: "var(--ew-negative-symbol)" } : { color: "var(--ew-gray-600)" }}>
                        {estatePosition.surplus < 0 ? rand(Math.abs(estatePosition.surplus)) : "—"}
                      </td>
                    </tr>
                    <tr style={{ backgroundColor: "var(--ew-row-tint)" }}>
                      <td className="px-5 py-4 font-medium" style={{ color: "var(--ew-primary-navy)" }}>Dependants</td>
                      <td className="px-5 py-4 text-right tabular-nums" style={{ color: "var(--ew-gray-900)" }}>{rand(dependantsPosition.provided)}</td>
                      <td className="px-5 py-4 text-right tabular-nums" style={{ color: "var(--ew-gray-900)" }}>{rand(dependantsPosition.required)}</td>
                      <td className="px-5 py-4 text-right tabular-nums font-medium" style={dependantsPosition.surplus < 0 ? { color: "var(--ew-negative-symbol)" } : { color: "var(--ew-gray-600)" }}>
                        {dependantsPosition.surplus < 0 ? rand(Math.abs(dependantsPosition.surplus)) : "—"}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: "var(--ew-blue-tertiary-50)" }}>
                      <td className="px-5 py-3 font-semibold" style={{ color: "var(--ew-primary-navy)" }}>Total</td>
                      <td className="px-5 py-3 text-right tabular-nums font-bold" style={{ color: "var(--ew-primary-navy)" }}>{rand(totalCapitalPosition.provided)}</td>
                      <td className="px-5 py-3 text-right tabular-nums font-bold" style={{ color: "var(--ew-primary-navy)" }}>{rand(totalCapitalPosition.required)}</td>
                      <td className="px-5 py-3 text-right tabular-nums font-bold" style={{ color: "var(--ew-negative-symbol)" }}>{rand(recommendedAdditionalCover)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Context note — quiet at the bottom */}
            <div className="text-xs pt-4 border-t" style={{ color: "var(--ew-gray-700)", borderColor: "var(--ew-border)" }}>
              Life cover is the most common instrument to close estate liquidity shortfalls. Other options include
              splitting bequests, restructuring assets via trusts, or adjusting executor and master's fees by appointing
              a different executor. This recommendation assumes a single lump sum life cover policy.
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
