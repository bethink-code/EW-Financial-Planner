import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DefinedBenefitFundsTable from "../components/defined-benefit-funds/defined-benefit-funds-table-correct-stable";
import { DefinedBenefitFundsSummary } from "@/components/defined-benefit-funds/defined-benefit-funds-summary";
import { CalculatorHeader } from "@/components/ui/calculator-header";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertDefinedBenefitFund } from "@shared/schema";

type ViewMode = "table" | "hybrid";

export default function DefinedBenefitFunds() {
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Fetch funds for count
  const { data: funds = [] } = useQuery({
    queryKey: ["/api/defined-benefit-funds"],  
    queryFn: async () => {
      const response = await fetch("/api/defined-benefit-funds");
      if (!response.ok) throw new Error('Failed to fetch defined benefit funds');
      return response.json();
    }
  });

  // Add new fund mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      const newFund: InsertDefinedBenefitFund = {
        description: "",
        owners: ["Donald Edwards"],
        ownershipPercentages: ["100%"],
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

  const handleViewModeChange = useCallback((newMode: ViewMode) => {
    setViewMode(newMode);
  }, []);

  const handleAddFund = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  return (
    <div className="">
      <div className="w-full px-6 py-6">
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
            <DefinedBenefitFundsTable onAddFund={handleAddFund} />
          </div>
        </CalculatorHeader>
      </div>
    </div>
  );
}