import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import IncomeNeedsTable from "../components/income-needs/income-needs-table";
import { IncomeNeedsSummary } from "@/components/income-needs/income-needs-summary";
import { CalculatorHeader } from "@/components/ui/calculator-header";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertIncomeNeeds } from "@shared/schema";
import { useViewMode } from '@/contexts/view-mode-context';

export default function IncomeNeeds() {
  const { viewMode, setViewMode } = useViewMode();

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
      const newNeed = {}; // Send empty object to use database defaults
      return apiRequest("POST", "/api/income-needs", newNeed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/income-needs"] });
    },
  });

  const handleViewModeChange = useCallback((newMode: 'table' | 'hybrid') => {
    setViewMode(newMode);
  }, [setViewMode]);

  const handleAddNeed = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  return (
    <div className="">
      <div className="w-full px-6 py-6">
        <div className="w-[1320px]">
          {/* Combined Header, Summary and Table */}
          <CalculatorHeader
          title="Income Needs"
          onAddItem={handleAddNeed}
          addButtonText="Add Need"
          isAddingItem={addMutation.isPending}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          className="mb-6"
        >
          {/* Summary with max width constraint */}
          <div className="max-w-6xl">
            <IncomeNeedsSummary />
          </div>
          
          {/* Table with full width and margin */}
          <div className="table-container-wrapper">
            <IncomeNeedsTable viewMode={viewMode} onAddIncomeNeed={handleAddNeed} />
          </div>
        </CalculatorHeader>
        </div>
      </div>
    </div>
  );
}