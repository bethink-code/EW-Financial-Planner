import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { formatCurrencyValue, handleDefaultValueFocus } from "@/lib/formatting";
import { RetirementProjectionRibbon } from "@/components/retirement/retirement-projection-ribbon";
import { useRetirementProjection } from "@/hooks/use-retirement-projection";

const FREQUENCIES = ["Single", "Monthly", "Quarterly", "Annual"] as const;

export default function RetirementLumpSumNeedsPage() {
  const [location] = useLocation();
  const isRetirementNeed = location.startsWith("/needs/retirement");

  const { data: needs = [] } = useQuery<RetirementLumpSumNeed[]>({
    queryKey: ["/api/retirement-lump-sum-needs"],
  });

  const { data: projection } = useRetirementProjection();

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

  const formatRand = (n: number | undefined) =>
    formatCurrencyValue(Math.round(n ?? 0).toString());
  const findProjection = (id: number) =>
    projection?.lumpSumNeeds.find(n => n.id === id);

  const addButton = (
    <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending} size="sm" className="gap-1.5">
      <Plus className="w-3.5 h-3.5" />
      Add Need
    </Button>
  );

  return (
    <div className="w-full px-6 py-6">
      <Card className="p-6 bg-white">
        {/* Title is hidden on retirement (active tab announces the section).
            The ribbon lives above the tabs now, so we only render the Add
            button here. */}
        {isRetirementNeed ? (
          <div className="flex justify-end mb-4">{addButton}</div>
        ) : (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold" style={{ color: "var(--ew-primary-navy)" }}>
              Lump sum needs (at or after retirement)
            </h2>
            {addButton}
          </div>
        )}

        {needs.length === 0 ? (
          <p className="text-center py-8" style={{ color: "var(--ew-gray-700)" }}>
            No lump sum needs yet. Click "Add Need" to start.
          </p>
        ) : (
          <table className="table-compact text-sm border-collapse">
            <thead>
              <tr style={{ color: "var(--ew-gray-700)" }}>
                <th className="text-left p-2 text-xs font-medium uppercase tracking-wide">Description</th>
                <th className="text-right p-2 text-xs font-medium uppercase tracking-wide">Start (yrs)</th>
                <th className="text-right p-2 text-xs font-medium uppercase tracking-wide">Term (yrs)</th>
                <th className="text-right p-2 text-xs font-medium uppercase tracking-wide">Increase %</th>
                <th className="text-left p-2 text-xs font-medium uppercase tracking-wide">Frequency</th>
                <th className="text-right p-2 text-xs font-medium uppercase tracking-wide">Amount</th>
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
              {needs.map(need => {
                const proj = findProjection(need.id);
                return (
                  <tr key={need.id} style={{ borderTop: "1px solid var(--ew-border)" }}>
                    <td className="p-2">
                      <input
                        type="text"
                        defaultValue={need.description}
                        className="table-input w-full"
                        placeholder="Description"
                        onBlur={(e) => updateMutation.mutate({ id: need.id, updates: { description: e.target.value } })}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        defaultValue={need.startYears}
                        className="table-input w-full text-right"
                        onBlur={(e) => updateMutation.mutate({ id: need.id, updates: { startYears: parseInt(e.target.value) || 0 } })}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        defaultValue={need.termYears}
                        className="table-input w-full text-right"
                        onBlur={(e) => updateMutation.mutate({ id: need.id, updates: { termYears: parseInt(e.target.value) || 0 } })}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        defaultValue={need.increasePercentage}
                        className="table-input w-full text-right"
                        onBlur={(e) => updateMutation.mutate({ id: need.id, updates: { increasePercentage: e.target.value } })}
                      />
                    </td>
                    <td className="p-2">
                      <Select value={need.frequency} onValueChange={(v) => updateMutation.mutate({ id: need.id, updates: { frequency: v } })}>
                        <SelectTrigger className="table-input"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FREQUENCIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        defaultValue={need.amount}
                        className="table-input w-full text-right"
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => updateMutation.mutate({ id: need.id, updates: { amount: formatCurrencyValue(e.target.value) } })}
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
                        onClick={() => deleteMutation.mutate(need.id)}
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
