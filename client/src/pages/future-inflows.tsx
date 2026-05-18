import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { FutureInflow, InsertFutureInflow } from "@shared/schema";
import { formatCurrencyValue, handleDefaultValueFocus } from "@/lib/formatting";
import { RetirementProjectionRibbon } from "@/components/retirement/retirement-projection-ribbon";
import { useRetirementProjection } from "@/hooks/use-retirement-projection";

export default function FutureInflowsPage() {
  const [location] = useLocation();
  const isRetirementNeed = location.startsWith("/needs/retirement");

  const { data: inflows = [] } = useQuery<FutureInflow[]>({
    queryKey: ["/api/future-inflows"],
  });

  const { data: projection } = useRetirementProjection();

  const addMutation = useMutation({
    mutationFn: async () => {
      const newInflow: InsertFutureInflow = {
        description: "",
        entity: "Donald Edwards",
        startYearsAfterRetirement: 0,
        currentValue: "R 0",
        calculateCgt: false,
        growthRate: "10%",
      };
      return apiRequest("POST", "/api/future-inflows", newInflow);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/future-inflows"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<FutureInflow> }) =>
      apiRequest("PATCH", `/api/future-inflows/${id}`, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/future-inflows"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/future-inflows/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/future-inflows"] }),
  });

  const formatRand = (n: number | undefined) =>
    formatCurrencyValue(Math.round(n ?? 0).toString());

  const findProjection = (id: number) =>
    projection?.futureInflows.find(f => f.id === id);

  const addButton = (
    <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending} size="sm" className="gap-1.5">
      <Plus className="w-3.5 h-3.5" />
      Add Inflow
    </Button>
  );

  return (
    <div className="w-full px-6 py-6">
      <Card className="p-6 bg-white">
        {/* Title is hidden on retirement (active tab announces the section).
            The cross-category projection ribbon now lives above the tabs in
            RetirementCategoryTabs, so we only render the Add button here. */}
        {isRetirementNeed ? (
          <div className="flex justify-end mb-4">{addButton}</div>
        ) : (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold" style={{ color: "var(--ew-primary-navy)" }}>
              Future inflows
            </h2>
            {addButton}
          </div>
        )}

        {inflows.length === 0 ? (
          <p className="text-center py-8" style={{ color: "var(--ew-gray-700)" }}>
            No future inflows yet. Click "Add Inflow" to start.
          </p>
        ) : (
          <table className="table-compact text-sm border-collapse">
            <thead>
              <tr style={{ color: "var(--ew-gray-700)" }}>
                <th className="text-left p-2 text-xs font-medium uppercase tracking-wide">Description</th>
                <th className="text-left p-2 text-xs font-medium uppercase tracking-wide">Entity</th>
                <th className="text-left p-2 text-xs font-medium uppercase tracking-wide">Start (yrs after)</th>
                <th className="text-right p-2 text-xs font-medium uppercase tracking-wide">Current Value</th>
                <th className="text-right p-2 text-xs font-medium uppercase tracking-wide">Growth Rate</th>
                <th className="text-center p-2 text-xs font-medium uppercase tracking-wide">CGT</th>
                {isRetirementNeed && (
                  <>
                    <th className="text-right p-2 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--ew-blue)" }}>
                      Capital at retirement
                    </th>
                    <th className="text-right p-2 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--ew-blue)" }}>
                      Value in current terms
                    </th>
                  </>
                )}
                <th className="p-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {inflows.map(inflow => {
                const proj = findProjection(inflow.id);
                return (
                  <tr key={inflow.id} style={{ borderTop: "1px solid var(--ew-border)" }}>
                    <td className="p-2">
                      <input
                        type="text"
                        defaultValue={inflow.description}
                        className="table-input w-full"
                        placeholder="Description"
                        onBlur={(e) => updateMutation.mutate({ id: inflow.id, updates: { description: e.target.value } })}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        defaultValue={inflow.entity}
                        className="table-input w-full"
                        onBlur={(e) => updateMutation.mutate({ id: inflow.id, updates: { entity: e.target.value } })}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        defaultValue={inflow.startYearsAfterRetirement}
                        className="table-input w-full text-right"
                        onBlur={(e) => updateMutation.mutate({ id: inflow.id, updates: { startYearsAfterRetirement: parseInt(e.target.value) || 0 } })}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        defaultValue={inflow.currentValue}
                        className="table-input w-full text-right"
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => updateMutation.mutate({ id: inflow.id, updates: { currentValue: formatCurrencyValue(e.target.value) } })}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        defaultValue={inflow.growthRate}
                        className="table-input w-full text-right"
                        onBlur={(e) => updateMutation.mutate({ id: inflow.id, updates: { growthRate: e.target.value } })}
                      />
                    </td>
                    <td className="p-2 text-center">
                      <Checkbox
                        checked={inflow.calculateCgt}
                        onCheckedChange={(c) => updateMutation.mutate({ id: inflow.id, updates: { calculateCgt: !!c } })}
                      />
                    </td>
                    {isRetirementNeed && (
                      <>
                        <td className="p-2">
                          <div className="calculated-field">{formatRand(proj?.capitalAtRetirement)}</div>
                        </td>
                        <td className="p-2">
                          <div className="calculated-field">{formatRand(proj?.valueInCurrentTerms)}</div>
                        </td>
                      </>
                    )}
                    <td className="p-2">
                      <button
                        onClick={() => deleteMutation.mutate(inflow.id)}
                        className="text-neutral-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
