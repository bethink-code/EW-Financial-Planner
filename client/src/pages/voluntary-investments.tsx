import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import VoluntaryInvestmentsTable from "../components/voluntary-investments/voluntary-investments-table";
import { VoluntaryInvestmentsSummary } from "@/components/voluntary-investments/voluntary-investments-summary";
import { CalculatorHeader } from "@/components/ui/calculator-header";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertVoluntaryInvestment } from "@shared/schema";

type ViewMode = "table" | "hybrid";

export default function VoluntaryInvestments() {
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Fetch investments for count
  const { data: investments = [] } = useQuery({
    queryKey: ["/api/voluntary-investments"],  
    queryFn: async () => {
      const response = await fetch("/api/voluntary-investments");
      if (!response.ok) throw new Error('Failed to fetch voluntary investments');
      return response.json();
    }
  });

  // Add new investment mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      const newInvestment: InsertVoluntaryInvestment = {
        description: "Enter here ...",
        owners: "Donald Edwards",
        excludedFromEstateDuty: false,
        baseCost: "0",
        marketValue: "0",
        liquidationPercentage: "0%",

        taxableLiquidationValue: "0",
        executorsFees: "0",
        excludedFromExecutorsFees: false
      };
      return apiRequest("POST", "/api/voluntary-investments", newInvestment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voluntary-investments"] });
    },
  });

  const handleViewModeChange = useCallback((newMode: ViewMode) => {
    setViewMode(newMode);
  }, []);

  const handleAddInvestment = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="w-full px-6 py-6">
        {/* Combined Header and Summary */}
        <div className="mb-6">
          <CalculatorHeader
            title="Voluntary Investments"
            itemCount={investments.length}
            itemLabel="investments"
            onAddItem={handleAddInvestment}
            addButtonText="Add Investment"
            isAddingItem={addMutation.isPending}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          >
            <VoluntaryInvestmentsSummary />
          </CalculatorHeader>
        </div>
        
        <VoluntaryInvestmentsTable />
      </div>
    </div>
  );
}