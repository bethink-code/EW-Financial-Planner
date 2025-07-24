import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DefinedBenefitFundsTable from "../components/defined-benefit-funds/defined-benefit-funds-table";
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
        description: "Enter here ...",
        owner: "Donald Edwards",
        yearsOfService: "0",
        finalMonthlySalary: "0",
        deathLumpSum: "0",
        additionalTaxFreeAmount: "0",
        pensionIncomeAmount: "0",
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
    <div className="bg-neutral-50">
      <div className="w-full px-6 py-6 bg-[#d7d9dc00]">
        {/* Combined Header and Summary */}
        <div className="mb-6 max-w-6xl">
          <CalculatorHeader
            title="Defined Benefit Funds"
            itemCount={funds.length}
            itemLabel="funds"
            onAddItem={handleAddFund}
            addButtonText="Add Fund"
            isAddingItem={addMutation.isPending}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          >
            <DefinedBenefitFundsSummary />
          </CalculatorHeader>
        </div>
        
        <DefinedBenefitFundsTable />
      </div>
    </div>
  );
}