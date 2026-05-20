import { useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { VoluntaryInvestmentTable } from "../components/voluntary-investments/voluntary-investment-table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getDefaultOwners, getDefaultOwnershipPercentages } from "@/lib/entity-utils";
import type { InsertVoluntaryInvestment, ClientDetails } from "@shared/schema";

export default function VoluntaryInvestments() {
  const [location] = useLocation();
  const isRetirementNeed = location.startsWith("/needs/retirement");

  const { data: clientDetails = [] } = useQuery<ClientDetails[]>({
    queryKey: ["/api/client-details"],
  });

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
        excludedFromExecutorsFees: false,
      };
      return apiRequest("POST", "/api/voluntary-investments", newInvestment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voluntary-investments"] });
    },
  });

  const handleAddInvestment = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  return (
    <div className="w-full px-6 pb-6">
      <div className="w-[1320px] max-w-full">
        <VoluntaryInvestmentTable
          onAddInvestment={handleAddInvestment}
          showSummary={!isRetirementNeed}
        />
      </div>
    </div>
  );
}
