import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import IncomeProvisionsTable from "../components/income-provisions/income-provisions-table-new";
import { IncomeProvisionsSummary } from "@/components/income-provisions/income-provisions-summary";
import { CalculatorHeader } from "@/components/ui/calculator-header";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertIncomeProvisions } from "@shared/schema";

type ViewMode = "table" | "hybrid";

export default function IncomeProvisions() {
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Fetch provisions for count
  const { data: provisions = [] } = useQuery({
    queryKey: ["/api/income-provisions"],  
    queryFn: async () => {
      const response = await fetch("/api/income-provisions");
      if (!response.ok) throw new Error('Failed to fetch income provisions');
      return response.json();
    }
  });

  // Add new provision mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      const newProvision: InsertIncomeProvisions = {
        description: "Enter details ...",
        personName: "Enter details ...",
        startDate: "Enter details ...",
        termYears: "0 years",
        increasePercentage: "0%",
        cpi: false,
        frequency: "monthly",
        amount: "R 0",
        capitalisedAmount: "R 0",
        taxPercentage: "0%",
        taxRate: "0%",
      };
      return apiRequest("POST", "/api/income-provisions", newProvision);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/income-provisions"] });
    },
  });

  const handleViewModeChange = useCallback((newMode: ViewMode) => {
    setViewMode(newMode);
  }, []);

  const handleAddProvision = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  return (
    <div className="">
      <div className="w-full px-6 py-6">
        {/* Combined Header and Summary */}
        <div className="mb-6 max-w-6xl">
          <CalculatorHeader
            title="Income Provisions"
            itemCount={provisions.length}
            itemLabel="provisions"
            onAddItem={handleAddProvision}
            addButtonText="Add Provision"
            isAddingItem={addMutation.isPending}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          >
            <IncomeProvisionsSummary />
          </CalculatorHeader>
        </div>
        
        <IncomeProvisionsTable viewMode={viewMode} />
      </div>
    </div>
  );
}