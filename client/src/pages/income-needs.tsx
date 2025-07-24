import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import IncomeNeedsTable from "../components/income-needs/income-needs-table";
import { IncomeNeedsSummary } from "@/components/income-needs/income-needs-summary";
import { CalculatorHeader } from "@/components/ui/calculator-header";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertIncomeNeed } from "@shared/schema";

type ViewMode = "table" | "hybrid";

export default function IncomeNeeds() {
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Fetch needs for count
  const { data: needs = [] } = useQuery({
    queryKey: ["/api/income-needs"],  
    queryFn: async () => {
      const response = await fetch("/api/income-needs");
      if (!response.ok) throw new Error('Failed to fetch income needs');
      return response.json();
    }
  });

  // Add new need mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      const newNeed: InsertIncomeNeed = {
        entity: "Donald Edwards",
        description: "Enter here ...",
        amount: "0",
        start: "0",
        termYears: "0",
        termEditable: true,
        increasePercentage: "0%",
        cpi: false,
        frequency: "monthly",
        capitalisedAmount: "0"
      };
      return apiRequest("POST", "/api/income-needs", newNeed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/income-needs"] });
    },
  });

  const handleViewModeChange = useCallback((newMode: ViewMode) => {
    setViewMode(newMode);
  }, []);

  const handleAddNeed = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  return (
    <div className="">
      <div className="w-full px-6 py-6">
        {/* Combined Header and Summary */}
        <div className="mb-6 max-w-6xl">
          <CalculatorHeader
            title="Income Needs"
            itemCount={needs.length}
            itemLabel="needs"
            onAddItem={handleAddNeed}
            addButtonText="Add Need"
            isAddingItem={addMutation.isPending}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          >
            <IncomeNeedsSummary />
          </CalculatorHeader>
        </div>
        
        <IncomeNeedsTable />
      </div>
    </div>
  );
}