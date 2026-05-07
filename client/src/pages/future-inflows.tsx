import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { FutureInflow, InsertFutureInflow } from "@shared/schema";
import { formatCurrencyValue, parseCurrencyValue } from "@/lib/formatting";

export default function FutureInflowsPage() {
  const { data: inflows = [] } = useQuery<FutureInflow[]>({
    queryKey: ["/api/future-inflows"],
  });

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

  const totalCurrentValue = inflows.reduce((sum, i) => sum + parseCurrencyValue(i.currentValue), 0);

  return (
    <div className="w-full px-6 py-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Future inflows</h2>
          <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending}>
            <Plus className="w-4 h-4 mr-2" />
            Add Inflow
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="summary-card">
            <div className="text-xs font-medium text-teal-700 mb-1">Total Inflows</div>
            <div className="text-lg font-bold text-neutral-900">{inflows.length}</div>
          </div>
          <div className="summary-card">
            <div className="text-xs font-medium text-teal-700 mb-1">Total Current Value</div>
            <div className="text-lg font-bold text-neutral-900">{formatCurrencyValue(totalCurrentValue.toString())}</div>
          </div>
        </div>

        {inflows.length === 0 ? (
          <p className="text-center text-neutral-500 py-8">No future inflows yet. Click "Add Inflow" to start.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left p-2">Description</th>
                <th className="text-left p-2">Entity</th>
                <th className="text-left p-2">Start (yrs after retirement)</th>
                <th className="text-left p-2">Current Value</th>
                <th className="text-left p-2">Growth Rate</th>
                <th className="text-left p-2">Calculate CGT?</th>
                <th className="p-2 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {inflows.map(inflow => (
                <tr key={inflow.id} className="border-t border-neutral-200">
                  <td className="p-2">
                    <Input
                      value={inflow.description}
                      onChange={(e) => updateMutation.mutate({ id: inflow.id, updates: { description: e.target.value } })}
                      placeholder="Description"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      value={inflow.entity}
                      onChange={(e) => updateMutation.mutate({ id: inflow.id, updates: { entity: e.target.value } })}
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={inflow.startYearsAfterRetirement}
                      onChange={(e) => updateMutation.mutate({ id: inflow.id, updates: { startYearsAfterRetirement: parseInt(e.target.value) || 0 } })}
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      value={inflow.currentValue}
                      onChange={(e) => updateMutation.mutate({ id: inflow.id, updates: { currentValue: e.target.value } })}
                      onBlur={(e) => updateMutation.mutate({ id: inflow.id, updates: { currentValue: formatCurrencyValue(e.target.value) } })}
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      value={inflow.growthRate}
                      onChange={(e) => updateMutation.mutate({ id: inflow.id, updates: { growthRate: e.target.value } })}
                    />
                  </td>
                  <td className="p-2 text-center">
                    <Checkbox
                      checked={inflow.calculateCgt}
                      onCheckedChange={(c) => updateMutation.mutate({ id: inflow.id, updates: { calculateCgt: !!c } })}
                    />
                  </td>
                  <td className="p-2">
                    <button onClick={() => deleteMutation.mutate(inflow.id)} className="text-neutral-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
