import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import VoluntaryInvestmentsTable from "../components/voluntary-investments/voluntary-investments-table";
import { VoluntaryInvestmentHybridTable } from "../components/voluntary-investments/voluntary-investment-hybrid-table";
import { VoluntaryInvestmentsSummary } from "@/components/voluntary-investments/voluntary-investments-summary";
import { CalculatorHeader } from "@/components/ui/calculator-header";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getDefaultOwners, getDefaultOwnershipPercentages } from "@/lib/entity-utils";
import type { InsertVoluntaryInvestment, ClientDetails } from "@shared/schema";
import { useViewMode } from '@/contexts/view-mode-context';

export default function VoluntaryInvestments() {
  const { viewMode, setViewMode } = useViewMode();

  // Fetch investments for count
  const { data: investments = [] } = useQuery({
    queryKey: ["/api/voluntary-investments"],  
    queryFn: async () => {
      const response = await fetch("/api/voluntary-investments");
      if (!response.ok) throw new Error('Failed to fetch voluntary investments');
      return response.json();
    }
  });

  // Fetch client details for default entity
  const { data: clientDetails = [] } = useQuery<ClientDetails[]>({
    queryKey: ["/api/client-details"]
  });

  // Add new investment mutation with Primary entity default
  const addMutation = useMutation({
    mutationFn: async () => {
      const newInvestment: InsertVoluntaryInvestment = {
        description: "",
        owners: getDefaultOwners(clientDetails),
        ownershipPercentages: getDefaultOwnershipPercentages(),
        baseCost: "R 0",
        marketValue: "R 0",
        liquidationPercentage: "0%",
        spouse: "R 0",
        others: "R 0",
        excludedFromJointEstate: false,
        excludedFromEstateDuty: false,
        excludedFromCGT: false,
        excludedFromExecutorsFees: false
      };
      return apiRequest("POST", "/api/voluntary-investments", newInvestment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voluntary-investments"] });
    },
  });

  const handleViewModeChange = useCallback((newMode: 'table' | 'hybrid') => {
    setViewMode(newMode);
  }, [setViewMode]);

  const handleAddInvestment = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  return (
    <div className="">
      <div className="w-full px-6 py-6">
        {/* Combined Header, Summary and Table */}
        <CalculatorHeader
          title="Voluntary Investments"
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
          
          {/* Table with full width and margin */}
          <div className="table-container-wrapper">
            {viewMode === 'hybrid' ? (
              <VoluntaryInvestmentHybridTable onAddInvestment={handleAddInvestment} />
            ) : (
              <VoluntaryInvestmentsTable viewMode={viewMode} onAddInvestment={handleAddInvestment} />
            )}
          </div>
        </CalculatorHeader>
      </div>
    </div>
  );
}