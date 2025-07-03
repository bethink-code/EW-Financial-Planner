import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RetirementFund, UpdateRetirementFund } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { NewTableControls } from "@/components/retirement-funds/new-table-controls";
import { NewGroupedTableView } from "@/components/retirement-funds/new-grouped-table-view";
import { CardsView } from "@/components/retirement-funds/cards-view";
import { DetailedView } from "@/components/retirement-funds/detailed-view";
import { Input } from "@/components/ui/input";

type ViewMode = "grouped" | "cards" | "detailed";

interface ColumnVisibility {
  overview: boolean;
  unapprovedLifeCover: boolean;
  monthlyDeathBenefit: boolean;
  fundValue: boolean;
  fundValueBeneficiaries: boolean;
}

export default function NewRetirementFunds() {
  const [viewMode, setViewMode] = useState<ViewMode>("grouped");
  const [tableMode, setTableMode] = useState<"inputs" | "flows">("inputs");
  const [searchQuery, setSearchQuery] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    overview: true,
    unapprovedLifeCover: true,
    monthlyDeathBenefit: true,
    fundValue: true,
    fundValueBeneficiaries: true,
  });

  const { data: funds = [], isLoading } = useQuery<RetirementFund[]>({
    queryKey: ["/api/retirement-funds"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: UpdateRetirementFund }) => {
      return apiRequest("PATCH", `/api/retirement-funds/${id}`, updates);
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
    <div className="min-h-screen" style={{ backgroundColor: '#EFF2F5' }}>
      <div className="p-4 max-w-full">
        <NewTableControls
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          tableMode={tableMode}
          onTableModeChange={setTableMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          columnVisibility={columnVisibility}
          onToggleColumnGroup={handleToggleColumnGroup}
          fundsCount={filteredFunds.length}
        />

        {viewMode === "grouped" && (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
              <NewGroupedTableView
                funds={filteredFunds}
                columnVisibility={columnVisibility}
                tableMode={tableMode}
                onFieldUpdate={handleFieldUpdate}
                isUpdating={updateMutation.isPending}
              />
            </div>
            
            {/* Additional fields for inputs mode */}
            {tableMode === "inputs" && (
              <div className="mt-4 bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                <h3 className="text-lg font-medium text-neutral-900 mb-4">Additional Details</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700">
                      Lump Sum Death
                    </label>
                    <Input
                      value={filteredFunds[0]?.lumpSumDeath || "0"}
                      onChange={(e) => handleFieldUpdate(filteredFunds[0]?.id || 1, "lumpSumDeath", e.target.value)}
                      className="w-full"
                      disabled={updateMutation.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700">
                      Previous Lump Sums
                    </label>
                    <Input
                      value={filteredFunds[0]?.previousLumpSums || "0"}
                      onChange={(e) => handleFieldUpdate(filteredFunds[0]?.id || 1, "previousLumpSums", e.target.value)}
                      className="w-full"
                      disabled={updateMutation.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700">
                      Additional Tax Free Amount
                    </label>
                    <Input
                      value={filteredFunds[0]?.additionalTaxFreeAmount || "0"}
                      onChange={(e) => handleFieldUpdate(filteredFunds[0]?.id || 1, "additionalTaxFreeAmount", e.target.value)}
                      className="w-full"
                      disabled={updateMutation.isPending}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {viewMode === "cards" && (
          <CardsView
            funds={filteredFunds}
            columnVisibility={columnVisibility}
            onFieldUpdate={handleFieldUpdate}
            isUpdating={updateMutation.isPending}
            tableMode={tableMode}
          />
        )}

        {viewMode === "detailed" && (
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
            <DetailedView
              funds={filteredFunds}
              columnVisibility={columnVisibility}
              onFieldUpdate={handleFieldUpdate}
              isUpdating={updateMutation.isPending}
            />
          </div>
        )}
      </div>
    </div>
  );
}