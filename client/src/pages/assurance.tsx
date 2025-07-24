import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { AssuranceTable } from "@/components/assurance/working-assurance-table";
import { AssuranceSummary } from "@/components/assurance/simple-assurance-summary";
import { CalculatorHeader } from "@/components/ui/calculator-header";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertAssurance } from "@shared/schema";

type ViewMode = "table" | "hybrid";

export default function Assurance() {
  const [searchTerm, setSearchTerm] = useState("");
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

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleViewModeChange = useCallback((newMode: ViewMode) => {
    setViewMode(newMode);
  }, []);

  const handleAddPolicy = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Standardized Calculator Header */}
        <CalculatorHeader
          title="Assurance"
          itemCount={policies.length}
          itemLabel="policies"
          onAddItem={handleAddPolicy}
          addButtonText="Add Policy"
          isAddingItem={addMutation.isPending}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          additionalControls={
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search policies..."
                className="w-80 pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
          }
        />

        {/* Summary Section */}
        <div className="mb-8">
          <AssuranceSummary />
        </div>

        {/* Main Table */}
        <AssuranceTable searchTerm={searchTerm} />
      </div>
    </div>
  );
}