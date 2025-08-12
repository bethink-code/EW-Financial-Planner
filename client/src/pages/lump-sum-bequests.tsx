import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { LumpSumTable } from "@/components/lump-sum-bequests/lump-sum-table";
import { LumpSumHybridTable } from "@/components/lump-sum-bequests/lump-sum-hybrid-table";
import { LumpSumSummary } from "@/components/lump-sum-bequests/lump-sum-summary";
import { CalculatorHeader } from "@/components/ui/calculator-header";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertLumpSumBequest } from "@shared/schema";
import { useViewMode } from '@/contexts/view-mode-context';

export default function LumpSumBequests() {
  const { viewMode, setViewMode } = useViewMode();

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

  const handleViewModeChange = useCallback((newMode: 'table' | 'hybrid') => {
    setViewMode(newMode);
  }, [setViewMode]);

  const handleAddBequest = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  return (
    <div className="">
      <div className="w-full px-6 py-6">
        <div className="w-[1320px]">
          {/* Combined Header, Summary and Table */}
          <CalculatorHeader
          title="Lump Sum Needs and Cash Bequests"
          onAddItem={handleAddBequest}
          addButtonText="Add Bequest"
          isAddingItem={addMutation.isPending}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          className="mb-6"
        >
          {/* Summary with max width constraint */}
          <div className="max-w-6xl">
            <LumpSumSummary />
          </div>
          
          {/* Table with full width and margin */}
          <div className="table-container-wrapper">
            {viewMode === 'hybrid' ? (
              <LumpSumHybridTable onAddBequest={handleAddBequest} />
            ) : (
              <LumpSumTable viewMode={viewMode} onAddBequest={handleAddBequest} />
            )}
          </div>
        </CalculatorHeader>
        </div>
      </div>
    </div>
  );
}