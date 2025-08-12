import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DefinedBenefitFundsTable from "../components/defined-benefit-funds/defined-benefit-funds-table-correct-stable";
import { DefinedBenefitFundHybridTable } from "../components/defined-benefit-funds/defined-benefit-fund-hybrid-table";
import { DefinedBenefitFundsSummary } from "@/components/defined-benefit-funds/defined-benefit-funds-summary";
import { CalculatorHeader } from "@/components/ui/calculator-header";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getDefaultOwners, getDefaultOwnershipPercentages } from "@/lib/entity-utils";
import type { InsertDefinedBenefitFund, ClientDetails } from "@shared/schema";
import { useViewMode } from '@/contexts/view-mode-context';

export default function DefinedBenefitFunds() {
  const { viewMode, setViewMode } = useViewMode();

  // Fetch funds for count
  const { data: funds = [] } = useQuery({
    queryKey: ["/api/defined-benefit-funds"],  
    queryFn: async () => {
      const response = await fetch("/api/defined-benefit-funds");
      if (!response.ok) throw new Error('Failed to fetch defined benefit funds');
      return response.json();
    }
  });

  // Fetch client details for default entity
  const { data: clientDetails = [] } = useQuery<ClientDetails[]>({
    queryKey: ["/api/client-details"]
  });

  // Add new fund mutation with Primary entity default
  const addMutation = useMutation({
    mutationFn: async () => {
      const newFund: InsertDefinedBenefitFund = {
        description: "",
        owners: getDefaultOwners(clientDetails),
        ownershipPercentages: getDefaultOwnershipPercentages(),
        yearsOfService: "0 years",
        finalMonthlySalary: "R 0",
        deathLumpSum: "R 0",
        additionalTaxFreeAmount: "R 0",
        pensionIncomeAmount: "R 0",
        pensionIncomeIncrease: "0%"
      };
      return apiRequest("POST", "/api/defined-benefit-funds", newFund);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/defined-benefit-funds"] });
    },
  });

  const handleViewModeChange = useCallback((newMode: 'table' | 'hybrid') => {
    setViewMode(newMode);
  }, [setViewMode]);

  const handleAddFund = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  return (
    <div className="">
      <div className="w-full px-6 py-6">
        <div className="w-[1320px]">
          {/* Combined Header, Summary and Table */}
          <CalculatorHeader
          title="Defined Benefit Funds"
          onAddItem={handleAddFund}
          addButtonText="Add Fund"
          isAddingItem={addMutation.isPending}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          className="mb-6"
        >
          {/* Summary with max width constraint */}
          <div className="max-w-6xl">
            <DefinedBenefitFundsSummary />
          </div>
          
          {/* Table with full width and margin */}
          <div className="table-container-wrapper">
            {viewMode === 'hybrid' ? (
              <DefinedBenefitFundHybridTable onAddFund={handleAddFund} />
            ) : (
              <DefinedBenefitFundsTable onAddFund={handleAddFund} />
            )}
          </div>
        </CalculatorHeader>
        </div>
      </div>
    </div>
  );
}