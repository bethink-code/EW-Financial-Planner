import { useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AssuranceTable } from "@/components/assurance/assurance-table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  getDefaultOwners,
  getDefaultOwnershipPercentages,
  getDefaultBeneficiaries,
  getDefaultBeneficiaryPercentages,
} from "@/lib/entity-utils";
import type { InsertAssurance, ClientDetails } from "@shared/schema";

export default function Assurance() {
  const { data: clientDetails = [] } = useQuery<ClientDetails[]>({
    queryKey: ["/api/client-details"],
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const newPolicy: InsertAssurance = {
        description: "",
        owners: getDefaultOwners(clientDetails),
        ownershipPercentages: getDefaultOwnershipPercentages(),
        lifeAssured: [""],
        deathBenefits: ["R 0"],
        beneficiaries: getDefaultBeneficiaries(clientDetails),
        beneficiaryPercentages: getDefaultBeneficiaryPercentages(),
        deathBenefit: "R 0",
        amount: "R 0",
        amountToggles: [true],
        amountYearsValues: ["0 years"],
        amountIncreaseValues: ["0%"],
        premiumsByOthers: "R 0",
        collateralSession: "R 0",
        benefitSplit: "0%",
        additionalInfo: "",
      };
      return apiRequest("POST", "/api/assurance", newPolicy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assurance"] });
    },
  });

  const handleAddPolicy = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  return (
    <div className="w-full px-6 pb-6">
      <div className="w-[1320px] max-w-full">
        <AssuranceTable onAddPolicy={handleAddPolicy} />
      </div>
    </div>
  );
}
