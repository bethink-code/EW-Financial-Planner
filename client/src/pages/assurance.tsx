import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AssuranceTable } from "@/components/assurance/working-assurance-table";
import { AssuranceSummary } from "@/components/assurance/simple-assurance-summary";
import { CalculatorHeader } from "@/components/ui/calculator-header";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getDefaultOwners, getDefaultOwnershipPercentages, getDefaultBeneficiaries, getDefaultBeneficiaryPercentages } from "@/lib/entity-utils";
import type { InsertAssurance, ClientDetails } from "@shared/schema";

type ViewMode = "table" | "hybrid";

export default function Assurance() {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch policies for count
  const { data: policies = [], refetch } = useQuery({
    queryKey: ["/api/assurance"],  
    queryFn: async () => {
      const response = await fetch("/api/assurance");
      if (!response.ok) throw new Error('Failed to fetch assurance policies');
      return response.json();
    }
  });

  // Fetch client details for default entity
  const { data: clientDetails = [] } = useQuery<ClientDetails[]>({
    queryKey: ["/api/client-details"]
  });

  // Add new policy mutation with Primary entity defaults
  const addMutation = useMutation({
    mutationFn: async () => {
      const newPolicy: InsertAssurance = {
        description: "",
        owners: getDefaultOwners(clientDetails),
        ownershipPercentages: getDefaultOwnershipPercentages(),
        beneficiaries: getDefaultBeneficiaries(clientDetails),
        beneficiaryPercentages: getDefaultBeneficiaryPercentages(),
        assuredAmount: "R 0",
        monthlyPremium: "R 0",
        premiumEscalation: "0%",
        entryAge: "0",
        termToAge: "0",
        yearsRemaining: "0 years",
        paidUp: "R 0",
        currentCashValue: "R 0"
      };
      return apiRequest("POST", "/api/assurance", newPolicy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assurance"] });
    },
  });

  const handleViewModeChange = useCallback((newMode: ViewMode) => {
    setViewMode(newMode);
  }, []);

  const handleAddPolicy = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  return (
    <div className="">
      <div className="w-full px-6">
        {/* Combined Header, Summary and Table */}
        <CalculatorHeader
          title="Assurance"
          onAddItem={handleAddPolicy}
          addButtonText="Add Policy"
          isAddingItem={addMutation.isPending}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          className="mb-6"
        >
          {/* Summary with max width constraint */}
          <div className="max-w-6xl">
            <AssuranceSummary />
          </div>
          
          {/* Table with full width and margin */}
          <div className="table-container-wrapper">
            <AssuranceTable onAddPolicy={handleAddPolicy} />
          </div>
        </CalculatorHeader>
      </div>
    </div>
  );
}