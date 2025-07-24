import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import IncomeNeedsTable from "../components/income-needs/income-needs-table";
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
        description: "Enter here ...",
        entity: "Donald Edwards",
        additionalEntities: "[]",
        monthlyAmount: "0",
        yearsRequired: "0",
        inflationRate: "0%",
        discountRate: "0%",
        capitalisedValue: "0"
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
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Standardized Calculator Header */}
        <CalculatorHeader
          title="Income Needs"
          itemCount={needs.length}
          itemLabel="needs"
          onAddItem={handleAddNeed}
          addButtonText="Add Need"
          isAddingItem={addMutation.isPending}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />
        
        <IncomeNeedsTable />
      </div>
    </div>
  );
}