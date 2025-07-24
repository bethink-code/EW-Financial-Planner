import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import IncomeProvisionsTable from "../components/income-provisions/income-provisions-table";
import { IncomeProvisionsSummary } from "@/components/income-provisions/income-provisions-summary";
import { CalculatorHeader } from "@/components/ui/calculator-header";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertIncomeProvision } from "@shared/schema";

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
      const newProvision: InsertIncomeProvision = {
        entity: "Donald Edwards",
        description: "Enter here ...",
        amount: "0",
        start: "0",
        termYears: "0",
        termEditable: true,
        increasePercentage: "0%",
        cpi: false,
        frequency: "monthly",
        capitalisedAmount: "0",
        taxPercentage: "0%"
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
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Combined Header and Summary */}
        <div className="mb-6">
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
        
        <IncomeProvisionsTable />
      </div>
    </div>
  );
}