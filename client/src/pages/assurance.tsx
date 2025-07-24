import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AssuranceTable } from "@/components/assurance/working-assurance-table";
import { AssuranceSummary } from "@/components/assurance/simple-assurance-summary";
import { CalculatorHeader } from "@/components/ui/calculator-header";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertAssurance } from "@shared/schema";

type ViewMode = "table" | "hybrid";

export default function Assurance() {
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Fetch policies for count
  const { data: policies = [] } = useQuery({
    queryKey: ["/api/assurance"],  
    queryFn: async () => {
      const response = await fetch("/api/assurance");
      if (!response.ok) throw new Error('Failed to fetch assurance policies');
      return response.json();
    }
  });

  // Add new policy mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      const newPolicy: InsertAssurance = {
        description: "Enter here ...",
        owner: "Donald Edwards",
        additionalOwners: "[]",
        lifeAssured: "Enter here ...",
        deathBenefit: "0",
        beneficiary: "Enter here ...",
        benefitSplit: "0",
        additionalBeneficiaries: "[]",
        additionalInfo: "Enter here ...",
        amount: "0",
        buySell: false,
        keyMan: false,
        premiumsByOthers: "0",
        collateralSession: "0",
        excludedFromEstateDuty: false,
        excludedFromProvisions: false
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

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Combined Header and Summary */}
        <div className="mb-6">
          <CalculatorHeader
            title="Assurance"
            itemCount={policies.length}
            itemLabel="policies"
            onAddItem={handleAddPolicy}
            addButtonText="Add Policy"
            isAddingItem={addMutation.isPending}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          >
            <AssuranceSummary />
          </CalculatorHeader>
        </div>

        {/* Main Table */}
        <AssuranceTable />
      </div>
    </div>
  );
}