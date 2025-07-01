import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RetirementFund, UpdateRetirementFund } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { NewTableControls } from "@/components/retirement-funds/new-table-controls";
import { NewGroupedTableView } from "@/components/retirement-funds/new-grouped-table-view";
import { CardsView } from "@/components/retirement-funds/cards-view";
import { DetailedView } from "@/components/retirement-funds/detailed-view";

type ViewMode = "grouped" | "cards" | "detailed";

interface ColumnVisibility {
  overview: boolean;
  unapprovedLifeCover: boolean;
  monthlyDeathBenefit: boolean;
  fundValueBeneficiaries: boolean;
}

export default function NewRetirementFunds() {
  const [viewMode, setViewMode] = useState<ViewMode>("grouped");
  const [searchQuery, setSearchQuery] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    overview: true,
    unapprovedLifeCover: true,
    monthlyDeathBenefit: true,
    fundValueBeneficiaries: true,
  });

  const { data: funds = [], isLoading } = useQuery<RetirementFund[]>({
    queryKey: ["/api/retirement-funds"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: UpdateRetirementFund }) => {
      return apiRequest(`/api/retirement-funds/${id}`, "PATCH", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/retirement-funds"] });
    },
  });

  const handleFieldUpdate = (id: number, field: keyof UpdateRetirementFund, value: string) => {
    updateMutation.mutate({ id, updates: { [field]: value } });
  };

  const handleToggleColumnGroup = (group: keyof ColumnVisibility) => {
    setColumnVisibility(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  // Filter funds based on search query
  const filteredFunds = funds.filter(fund => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      fund.description.toLowerCase().includes(query) ||
      fund.owner.toLowerCase().includes(query) ||
      fund.beneficiary.toLowerCase().includes(query) ||
      fund.beneficiaryName.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
          <div className="h-32 bg-neutral-200 rounded"></div>
          <div className="h-64 bg-neutral-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-full">
      <NewTableControls
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        columnVisibility={columnVisibility}
        onToggleColumnGroup={handleToggleColumnGroup}
        fundsCount={filteredFunds.length}
      />

      {viewMode === "grouped" && (
        <div className="bg-white rounded shadow-sm border border-neutral-200">
          <NewGroupedTableView
            funds={filteredFunds}
            columnVisibility={columnVisibility}
            onFieldUpdate={handleFieldUpdate}
            isUpdating={updateMutation.isPending}
          />
        </div>
      )}

      {viewMode === "cards" && (
        <CardsView
          funds={filteredFunds}
          onFieldUpdate={handleFieldUpdate}
          isUpdating={updateMutation.isPending}
        />
      )}

      {viewMode === "detailed" && (
        <DetailedView
          funds={filteredFunds}
          onFieldUpdate={handleFieldUpdate}
          isUpdating={updateMutation.isPending}
        />
      )}
    </div>
  );
}