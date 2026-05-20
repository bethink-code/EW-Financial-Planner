import React, { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DefinedBenefitFundTable } from "../components/defined-benefit-funds/defined-benefit-fund-table";
import { DefinedBenefitFundsSummary } from "@/components/defined-benefit-funds/defined-benefit-funds-summary";
import { RetirementProjectionRibbon } from "@/components/retirement/retirement-projection-ribbon";
import { CalculatorHeader } from "@/components/ui/calculator-header";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getDefaultOwners, getDefaultOwnershipPercentages } from "@/lib/entity-utils";
import type { InsertDefinedBenefitFund, ClientDetails } from "@shared/schema";

export default function DefinedBenefitFunds() {
  const [location] = useLocation();
  const isRetirementNeed = location.startsWith("/needs/retirement");

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

  const handleAddFund = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  return (
    <div className="w-full px-6 pb-6">
      <div className="w-[1320px] max-w-full">
        <CalculatorHeader>
          {/* Per-domain summary on non-retirement routes only. Retirement
              renders its cross-category ribbon above the tabs. */}
          {!isRetirementNeed && (
            <div className="max-w-6xl">
              <DefinedBenefitFundsSummary />
            </div>
          )}
          <DefinedBenefitFundTable onAddFund={handleAddFund} />
        </CalculatorHeader>
      </div>
    </div>
  );
}