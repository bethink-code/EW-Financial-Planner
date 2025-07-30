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
      const newInvestment = {}; // Send empty object to use database defaults
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
    <div className="">
      <div className="w-full px-6 py-6">
        {/* Combined Header, Summary and Table */}
        <CalculatorHeader
          title="Voluntary Investments"
          itemCount={investments.length}
          itemLabel="investments"
          onAddItem={handleAddInvestment}
          addButtonText="Add Investment"
          isAddingItem={addMutation.isPending}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          className="mb-6"
        >
          {/* Summary with max width constraint */}
          <div className="max-w-6xl">
            <VoluntaryInvestmentsSummary />
          </div>
          
          {/* Table with full width */}
          <div className="mt-6">
            <VoluntaryInvestmentsTable viewMode={viewMode} onAddInvestment={handleAddInvestment} />
          </div>
        </CalculatorHeader>
      </div>
    </div>
  );
}