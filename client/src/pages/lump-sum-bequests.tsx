import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { LumpSumTable } from "@/components/lump-sum-bequests/lump-sum-table";
import { LumpSumSummary } from "@/components/lump-sum-bequests/lump-sum-summary";
import { CalculatorHeader } from "@/components/ui/calculator-header";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertLumpSumBequest } from "@shared/schema";

type ViewMode = "table" | "hybrid";

export default function LumpSumBequests() {
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Fetch bequests for count
  const { data: bequests = [] } = useQuery({
    queryKey: ["/api/lump-sum-bequests"],  
    queryFn: async () => {
      const response = await fetch("/api/lump-sum-bequests");
      if (!response.ok) throw new Error('Failed to fetch lump sum bequests');
      return response.json();
    }
  });

  // Add new bequest mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      const newBequest: InsertLumpSumBequest = {
        description: "Enter details ...",
        entity: "Enter details ...",
        start: "Enter details ...",
        amount: "R 0",
        increasePercentage: "0%",
        cpi: false,
        valueAtDeath: "R 0"
      };
      return apiRequest("POST", "/api/lump-sum-bequests", newBequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lump-sum-bequests"] });
    },
  });

  const handleViewModeChange = useCallback((newMode: ViewMode) => {
    setViewMode(newMode);
  }, []);

  const handleAddBequest = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  return (
    <div className="">
      <div className="w-full px-6 py-6">
        {/* Combined Header and Summary */}
        <div className="mb-6 max-w-6xl">
          <CalculatorHeader
            title="Lump Sum Needs and Cash Bequests"
            itemCount={bequests.length}
            itemLabel="bequests"
            onAddItem={handleAddBequest}
            addButtonText="Add Bequest"
            isAddingItem={addMutation.isPending}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          >
            <LumpSumSummary />
          </CalculatorHeader>
        </div>

        {/* Main Table */}
        <LumpSumTable viewMode={viewMode} />
      </div>
    </div>
  );
}