import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { RetirementLumpSumNeed, InsertRetirementLumpSumNeed } from "@shared/schema";
import { formatCurrencyValue, parseCurrencyValue } from "@/lib/formatting";

const FREQUENCIES = ["Single", "Monthly", "Quarterly", "Annual"] as const;

export default function RetirementLumpSumNeedsPage() {
  const { data: needs = [] } = useQuery<RetirementLumpSumNeed[]>({
    queryKey: ["/api/retirement-lump-sum-needs"],
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const newNeed: InsertRetirementLumpSumNeed = {
        description: "",
        startYears: 0,
        termYears: 0,
        increasePercentage: "0%",
        frequency: "Single",
        frequencyValue: 1,
        amount: "R 0",
      };
      return apiRequest("POST", "/api/retirement-lump-sum-needs", newNeed);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/retirement-lump-sum-needs"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<RetirementLumpSumNeed> }) =>
      apiRequest("PATCH", `/api/retirement-lump-sum-needs/${id}`, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/retirement-lump-sum-needs"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/retirement-lump-sum-needs/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/retirement-lump-sum-needs"] }),
  });

  const totalAmount = needs.reduce((sum, n) => sum + parseCurrencyValue(n.amount), 0);

  return (
    <div className="w-full px-6 py-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Lump sum needs (at or after retirement)</h2>
          <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending}>
            <Plus className="w-4 h-4 mr-2" />
            Add Need
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="summary-card">
            <div className="text-xs font-medium text-teal-700 mb-1">Total Needs</div>
            <div className="text-lg font-bold text-neutral-900">{needs.length}</div>
          </div>
          <div className="summary-card">
            <div className="text-xs font-medium text-teal-700 mb-1">Total Amount</div>
            <div className="text-lg font-bold text-neutral-900">{formatCurrencyValue(totalAmount.toString())}</div>
          </div>
        </div>

        {needs.length === 0 ? (
          <p className="text-center text-neutral-500 py-8">No lump sum needs yet. Click "Add Need" to start.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left p-2">Description</th>
                <th className="text-left p-2">Start (yrs)</th>
                <th className="text-left p-2">Term (yrs)</th>
                <th className="text-left p-2">Increase %</th>
                <th className="text-left p-2">Frequency</th>
                <th className="text-left p-2">Amount</th>
                <th className="p-2 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {needs.map(need => (
                <tr key={need.id} className="border-t border-neutral-200">
                  <td className="p-2">
                    <Input
                      value={need.description}
                      onChange={(e) => updateMutation.mutate({ id: need.id, updates: { description: e.target.value } })}
                      placeholder="Description"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={need.startYears}
                      onChange={(e) => updateMutation.mutate({ id: need.id, updates: { startYears: parseInt(e.target.value) || 0 } })}
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      value={need.termYears}
                      onChange={(e) => updateMutation.mutate({ id: need.id, updates: { termYears: parseInt(e.target.value) || 0 } })}
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      value={need.increasePercentage}
                      onChange={(e) => updateMutation.mutate({ id: need.id, updates: { increasePercentage: e.target.value } })}
                    />
                  </td>
                  <td className="p-2">
                    <Select value={need.frequency} onValueChange={(v) => updateMutation.mutate({ id: need.id, updates: { frequency: v } })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FREQUENCIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-2">
                    <Input
                      value={need.amount}
                      onChange={(e) => updateMutation.mutate({ id: need.id, updates: { amount: e.target.value } })}
                      onBlur={(e) => updateMutation.mutate({ id: need.id, updates: { amount: formatCurrencyValue(e.target.value) } })}
                    />
                  </td>
                  <td className="p-2">
                    <button onClick={() => deleteMutation.mutate(need.id)} className="text-neutral-400 hover:text-red-600">
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
