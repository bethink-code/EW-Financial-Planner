import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { formatCurrencyValue } from "@/lib/formatting";
import type { RetirementProjection } from "@shared/retirement-calculations";

const PLAN_ID = 1;

function rand(n: number): string {
  return formatCurrencyValue(Math.round(n).toString());
}

export default function RetirementImplement() {
  const { data: projection, isLoading } = useQuery<
    RetirementProjection & { ready: boolean }
  >({
    queryKey: [`/api/retirement-projection/${PLAN_ID}`],
    queryFn: () =>
      fetch(`/api/retirement-projection/${PLAN_ID}`).then((r) => r.json()),
  });

  if (isLoading || !projection) {
    return (
      <div className="px-6 py-6 text-neutral-500">Loading recommendation…</div>
    );
  }

  const {
    surplus,
    additionalMonthlyContribution,
    yearsToRetirement,
    contributionAllocation,
    annualTaxableIncome,
    currentMonthlyRaContribution,
  } = projection;
  const goalFunded = surplus >= 0;

  return (
    <div className="w-full px-6 py-8">
      <Card className="p-8 max-w-4xl mx-auto border-0 shadow-sm">
        <div
          className="mb-8 pb-4 border-b"
          style={{ borderColor: "var(--ew-border)" }}
        >
          <div
            className="text-xs font-medium"
            style={{ color: "var(--ew-gray-700)" }}
          >
            Retirement &nbsp;&rsaquo;&nbsp; Recommendation
          </div>
          <h2
            className="text-2xl font-bold mt-1 tracking-tight"
            style={{ color: "var(--ew-primary-navy)" }}
          >
            Implement
          </h2>
        </div>

        {goalFunded ? (
          <div
            className="rounded-md p-6 flex items-start gap-4"
            style={{ backgroundColor: "var(--ew-positive-bg)" }}
          >
            <div
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: "var(--ew-positive-symbol)" }}
            >
              ✓
            </div>
            <div>
              <div
                className="text-lg font-semibold mb-1"
                style={{ color: "var(--ew-primary-navy)" }}
              >
                Goal funded
              </div>
              <div className="text-sm" style={{ color: "var(--ew-gray-900)" }}>
                Projected capital at retirement exceeds the requirement by{" "}
                <span className="font-semibold tabular-nums">
                  {rand(surplus)}
                </span>
                . No additional monthly contribution is required.
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Recommended top-up — hero callout, restrained */}
            <div
              className="rounded-md p-6 border-l-4"
              style={{
                backgroundColor: "var(--ew-blue-tertiary-50)",
                borderLeftColor: "var(--ew-blue)",
              }}
            >
              <div
                className="text-xs font-medium mb-2"
                style={{ color: "var(--ew-blue)" }}
              >
                Recommended top-up contribution
              </div>
              <div className="flex items-baseline gap-3 mb-2">
                <div
                  className="text-4xl font-bold tracking-tight tabular-nums"
                  style={{ color: "var(--ew-primary-navy)" }}
                >
                  {rand(additionalMonthlyContribution)}
                </div>
                <div
                  className="text-base font-normal"
                  style={{ color: "var(--ew-gray-700)" }}
                >
                  / month
                </div>
              </div>
              <div className="text-sm" style={{ color: "var(--ew-gray-900)" }}>
                Required for {yearsToRetirement} years (escalating at 6% p.a.,
                assumed 10% p.a. growth) to close a&nbsp;
                <span className="font-semibold tabular-nums">
                  {rand(Math.abs(surplus))}
                </span>{" "}
                shortfall by retirement.
              </div>
            </div>

            {contributionAllocation && (
              <>
                {/* Allocation table */}
                <div>
                  <div
                    className="text-xs font-medium mb-3"
                    style={{ color: "var(--ew-blue)" }}
                  >
                    Allocation across vehicles
                  </div>

                  <div
                    className="rounded-md overflow-hidden"
                    style={{ backgroundColor: "var(--ew-row-tint)" }}
                  >
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ color: "var(--ew-gray-700)" }}>
                          <th className="px-5 py-3 text-left text-xs font-medium">
                            Vehicle
                          </th>
                          <th className="px-5 py-3 text-right text-xs font-medium">
                            Monthly top-up
                          </th>
                          <th className="px-5 py-3 text-right text-xs font-medium">
                            Annual
                          </th>
                          <th className="px-5 py-3 text-right text-xs font-medium">
                            Tax-deductible
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ backgroundColor: "white" }}>
                          <td className="px-5 py-4">
                            <div
                              className="font-medium"
                              style={{ color: "var(--ew-primary-navy)" }}
                            >
                              Retirement funds (RA)
                            </div>
                            <div
                              className="text-xs mt-0.5"
                              style={{ color: "var(--ew-gray-700)" }}
                            >
                              Tax-deductible up to{" "}
                              {formatCurrencyValue(
                                Math.round(
                                  contributionAllocation.raDeductionCap
                                ).toString()
                              )}{" "}
                              / year
                            </div>
                          </td>
                          <td
                            className="px-5 py-4 text-right tabular-nums font-medium"
                            style={{ color: "var(--ew-gray-900)" }}
                          >
                            {rand(contributionAllocation.raMonthly)}
                          </td>
                          <td
                            className="px-5 py-4 text-right tabular-nums"
                            style={{ color: "var(--ew-gray-900)" }}
                          >
                            {rand(contributionAllocation.raMonthly * 12)}
                          </td>
                          <td
                            className="px-5 py-4 text-right tabular-nums font-medium"
                            style={{ color: "var(--ew-positive-symbol)" }}
                          >
                            {rand(contributionAllocation.raAnnualDeduction)}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: "var(--ew-row-tint)" }}>
                          <td className="px-5 py-4">
                            <div
                              className="font-medium"
                              style={{ color: "var(--ew-primary-navy)" }}
                            >
                              Voluntary investments
                            </div>
                            <div
                              className="text-xs mt-0.5"
                              style={{ color: "var(--ew-gray-700)" }}
                            >
                              Allocated after RA deduction cap
                            </div>
                          </td>
                          <td
                            className="px-5 py-4 text-right tabular-nums font-medium"
                            style={{ color: "var(--ew-gray-900)" }}
                          >
                            {rand(contributionAllocation.voluntaryMonthly)}
                          </td>
                          <td
                            className="px-5 py-4 text-right tabular-nums"
                            style={{ color: "var(--ew-gray-900)" }}
                          >
                            {rand(contributionAllocation.voluntaryMonthly * 12)}
                          </td>
                          <td
                            className="px-5 py-4 text-right"
                            style={{ color: "var(--ew-gray-600)" }}
                          >
                            —
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr
                          style={{
                            backgroundColor: "var(--ew-blue-tertiary-50)",
                          }}
                        >
                          <td
                            className="px-5 py-3 font-semibold"
                            style={{ color: "var(--ew-primary-navy)" }}
                          >
                            Total
                          </td>
                          <td
                            className="px-5 py-3 text-right tabular-nums font-bold"
                            style={{ color: "var(--ew-primary-navy)" }}
                          >
                            {rand(additionalMonthlyContribution)}
                          </td>
                          <td
                            className="px-5 py-3 text-right tabular-nums font-bold"
                            style={{ color: "var(--ew-primary-navy)" }}
                          >
                            {rand(additionalMonthlyContribution * 12)}
                          </td>
                          <td
                            className="px-5 py-3 text-right tabular-nums font-bold"
                            style={{ color: "var(--ew-positive-symbol)" }}
                          >
                            {rand(contributionAllocation.raAnnualDeduction)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Tax saving callout */}
                <div
                  className="rounded-md p-5 flex items-center justify-between"
                  style={{ backgroundColor: "var(--ew-positive-bg)" }}
                >
                  <div>
                    <div
                      className="text-xs font-medium mb-1"
                      style={{ color: "var(--ew-positive-symbol)" }}
                    >
                      Estimated annual tax saving
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--ew-gray-900)" }}
                    >
                      At marginal rate of{" "}
                      {(contributionAllocation.marginalRate * 100).toFixed(0)}%
                      on the tax-deductible portion.
                    </div>
                  </div>
                  <div
                    className="text-2xl font-bold tabular-nums"
                    style={{ color: "var(--ew-primary-navy)" }}
                  >
                    {rand(contributionAllocation.annualTaxSavingFromTopUp)}
                  </div>
                </div>

                {/* Context — quiet meta info at the bottom */}
                <div
                  className="text-xs pt-4 border-t space-y-1.5"
                  style={{
                    color: "var(--ew-gray-700)",
                    borderColor: "var(--ew-border)",
                  }}
                >
                  <div className="flex justify-between">
                    <span>Current annual taxable income</span>
                    <span
                      className="font-medium tabular-nums"
                      style={{ color: "var(--ew-gray-900)" }}
                    >
                      {rand(annualTaxableIncome)}
                    </span>
                  </div>
                  {annualTaxableIncome <= 0 && (
                    <div
                      className="rounded p-2 my-1"
                      style={{
                        backgroundColor: "var(--ew-negative-bg)",
                        color: "var(--ew-negative-symbol)",
                      }}
                    >
                      Set annual taxable income on the Setup &rsaquo; Parameters
                      page to enable RA deduction allocation.
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Current monthly RA contribution</span>
                    <span
                      className="font-medium tabular-nums"
                      style={{ color: "var(--ew-gray-900)" }}
                    >
                      {rand(currentMonthlyRaContribution)}
                    </span>
                  </div>
                  <div className="pt-1" style={{ color: "var(--ew-gray-700)" }}>
                    RA deduction cap is 27.5% of taxable income, limited to
                    R&nbsp;350&nbsp;000 per year (SA 2025/26).
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
