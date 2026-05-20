import { useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DefinedBenefitFundTable } from "../components/defined-benefit-funds/defined-benefit-fund-table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getDefaultOwners, getDefaultOwnershipPercentages } from "@/lib/entity-utils";
import type { InsertDefinedBenefitFund, ClientDetails } from "@shared/schema";

export default function DefinedBenefitFunds() {
  const [location] = useLocation();
  const isRetirementNeed = location.startsWith("/needs/retirement");

  const { data: clientDetails = [] } = useQuery<ClientDetails[]>({
    queryKey: ["/api/client-details"],
  });

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
        pensionIncomeIncrease: "0%",
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
        <DefinedBenefitFundTable
          onAddFund={handleAddFund}
          showSummary={!isRetirementNeed}
        />
      </div>
    </div>
  );
}
