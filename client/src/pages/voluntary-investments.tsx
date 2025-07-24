import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import VoluntaryInvestmentsTable from "../components/voluntary-investments/voluntary-investments-table";
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
        owner: "Donald Edwards",
        additionalOwners: "[]",
        currentValue: "0",
        growthRate: "0%",
        beneficiary: "Enter here ...",
        beneficiaryPercentage: "0%",
        additionalBeneficiaries: "[]"
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Standardized Calculator Header */}
        <CalculatorHeader
          title="Voluntary Investments"
          itemCount={investments.length}
          itemLabel="investments"
          onAddItem={handleAddInvestment}
          addButtonText="Add Investment"
          isAddingItem={addMutation.isPending}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />
        
        <VoluntaryInvestmentsTable />
      </div>
    </div>
  );
}