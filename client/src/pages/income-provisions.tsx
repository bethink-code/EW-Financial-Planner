import React, { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import IncomeProvisionsTable from "../components/income-provisions/income-provisions-table-new";
import { IncomeProvisionsHybridTable } from "@/components/income-provisions/income-provisions-hybrid-table";
import { IncomeProvisionsSummary } from "@/components/income-provisions/income-provisions-summary";
import { RetirementProjectionRibbon } from "@/components/retirement/retirement-projection-ribbon";
import { CalculatorHeader } from "@/components/ui/calculator-header";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertIncomeProvisions } from "@shared/schema";
import { useViewMode } from '@/contexts/view-mode-context';

export default function IncomeProvisions() {
  const { viewMode, setViewMode } = useViewMode();
  const [searchTerm, setSearchTerm] = useState("");
  const [location] = useLocation();
  const isRetirementNeed = location.startsWith("/needs/retirement");

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
      const newProvision = {}; // Send empty object to use database defaults
      return apiRequest("POST", "/api/income-provisions", newProvision);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/income-provisions"] });
    },
  });

  const handleViewModeChange = useCallback((newMode: 'table' | 'hybrid') => {
    setViewMode(newMode);
  }, [setViewMode]);

  const handleAddProvision = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  return (
    <div className="">
      <div className="w-full px-6 py-6">
        <div className={viewMode === 'table' ? 'w-full' : 'w-[1320px]'}>
          {/* Combined Header, Summary and Table */}
          <CalculatorHeader
            title="Income Provisions"
            onAddItem={handleAddProvision}
            addButtonText="Add Provision"
            isAddingItem={addMutation.isPending}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            className="mb-6"
          >
            {/* Per-domain summary on non-retirement routes only. Retirement
                renders its cross-category ribbon above the tabs. */}
            {!isRetirementNeed && (
              <div className="max-w-6xl">
                <IncomeProvisionsSummary searchTerm={searchTerm} />
              </div>
            )}
            
            {/* Table with full width and margin */}
            <div className="table-container-wrapper">
              {viewMode === 'hybrid' ? (
                <IncomeProvisionsHybridTable onAddProvision={handleAddProvision} searchTerm={searchTerm} />
              ) : (
                <IncomeProvisionsTable viewMode={viewMode} searchTerm={searchTerm} onAddProvision={handleAddProvision} />
              )}
            </div>
          </CalculatorHeader>
        </div>
      </div>
    </div>
  );
}