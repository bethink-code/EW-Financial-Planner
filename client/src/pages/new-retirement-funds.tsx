import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RetirementFund, UpdateRetirementFund } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { NewTableControls } from "@/components/retirement-funds/new-table-controls";
import { NewGroupedTableView } from "@/components/retirement-funds/new-grouped-table-view";
import { DetailedView } from "@/components/retirement-funds/detailed-view";
import { Input } from "@/components/ui/input";

type ViewMode = "grouped" | "detailed";

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

  // Enhanced view mode change with transitions
  const handleViewModeChange = useCallback((newMode: ViewMode) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setViewMode(newMode);
      });
    } else {
      setViewMode(newMode);
    }
  }, []);
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

  const handleFieldUpdate = useCallback((id: number, field: keyof UpdateRetirementFund, value: string) => {
    updateMutation.mutate({ id, updates: { [field]: value } });
  }, [updateMutation]);

  const handleToggleColumnGroup = useCallback((group: keyof ColumnVisibility) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setColumnVisibility(prev => ({
          ...prev,
          [group]: !prev[group]
        }));
      });
    } else {
      setColumnVisibility(prev => ({
        ...prev,
        [group]: !prev[group]
      }));
    }
  }, []);

  // Memoized filter for performance
  const filteredFunds = useMemo(() => {
    if (!searchQuery) return funds;
    const query = searchQuery.toLowerCase();
    return funds.filter(fund => (
      fund.description.toLowerCase().includes(query) ||
      fund.owner.toLowerCase().includes(query) ||
      fund.beneficiary.toLowerCase().includes(query) ||
      fund.beneficiaryName.toLowerCase().includes(query)
    ));
  }, [funds, searchQuery]);

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
          onViewModeChange={handleViewModeChange}
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
            {/* Summary Section for Table View - Inputs */}
            {tableMode === "inputs" && (
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-4">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">Summary</h2>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div style={{ backgroundColor: '#F9F0E5' }} className="rounded-lg p-4 text-center">
                    <div className="text-xs font-medium text-neutral-600 mb-1">Cover Amount</div>
                    <div className="text-lg font-bold text-neutral-900">
                      R {filteredFunds.reduce((sum, fund) => {
                        const value = fund.coverAmount as string;
                        const amount = parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
                        return sum + amount;
                      }, 0).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#F9F0E5' }} className="rounded-lg p-4 text-center">
                    <div className="text-xs font-medium text-neutral-600 mb-1">Monthly Income</div>
                    <div className="text-lg font-bold text-neutral-900">
                      R {filteredFunds.reduce((sum, fund) => {
                        const value = fund.monthlyIncome as string;
                        const amount = parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
                        return sum + amount;
                      }, 0).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#F9F0E5' }} className="rounded-lg p-4 text-center">
                    <div className="text-xs font-medium text-neutral-600 mb-1">Approved Life Cover</div>
                    <div className="text-lg font-bold text-neutral-900">
                      R {filteredFunds.reduce((sum, fund) => {
                        const value = fund.approvedLifeCover as string;
                        const amount = parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
                        return sum + amount;
                      }, 0).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#F9F0E5' }} className="rounded-lg p-4 text-center">
                    <div className="text-xs font-medium text-neutral-600 mb-1">Fund Value</div>
                    <div className="text-lg font-bold text-neutral-900">
                      R {filteredFunds.reduce((sum, fund) => {
                        const value = fund.fundValue as string;
                        const amount = parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
                        return sum + amount;
                      }, 0).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#F9F0E5' }} className="rounded-lg p-4 text-center">
                    <div className="text-xs font-medium text-neutral-600 mb-1">Fund Value at Death</div>
                    <div className="text-lg font-bold text-neutral-900">
                      R {filteredFunds.reduce((sum, fund) => {
                        const value = fund.fundValueAtDeath as string;
                        const amount = parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
                        return sum + amount;
                      }, 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-neutral-200" style={{ viewTransitionName: 'table-view' }}>
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

            {/* Summary Section for Table View - Flows */}
            {tableMode === "flows" && (
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-4">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">Flows Summary</h2>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div style={{ backgroundColor: '#F9F0E5' }} className="rounded-lg p-4 text-center">
                    <div className="text-xs font-medium text-neutral-600 mb-1">Total Provisions</div>
                    <div className="text-lg font-bold text-neutral-900">
                      R {filteredFunds.reduce((sum, fund) => {
                        const value = fund.lumpSumLeftOverProvisions as string;
                        const amount = parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
                        return sum + amount;
                      }, 0).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#F0F9FF' }} className="rounded-lg p-4 text-center">
                    <div className="text-xs font-medium text-neutral-600 mb-1">Monthly Income</div>
                    <div className="text-lg font-bold text-neutral-900">
                      R {filteredFunds.reduce((sum, fund) => {
                        const value = fund.monthlyProvisionOffered as string;
                        const amount = parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
                        return sum + amount;
                      }, 0).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#F0F9F0' }} className="rounded-lg p-4 text-center">
                    <div className="text-xs font-medium text-neutral-600 mb-1">Annual Income</div>
                    <div className="text-lg font-bold text-neutral-900">
                      R {filteredFunds.reduce((sum, fund) => {
                        const value = fund.currentAnnualIncome as string;
                        const amount = parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
                        return sum + amount;
                      }, 0).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#FFF0F0' }} className="rounded-lg p-4 text-center">
                    <div className="text-xs font-medium text-neutral-600 mb-1">Estate Costs</div>
                    <div className="text-lg font-bold text-neutral-900">
                      R {filteredFunds.reduce((sum, fund) => {
                        const value = fund.estateDeploymentDeceased as string;
                        const amount = parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
                        return sum + amount;
                      }, 0).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#F5F0FF' }} className="rounded-lg p-4 text-center">
                    <div className="text-xs font-medium text-neutral-600 mb-1">Total Fees</div>
                    <div className="text-lg font-bold text-neutral-900">
                      R {filteredFunds.reduce((sum, fund) => {
                        const executors = parseFloat((fund.executorsFee as string).replace(/[^\d.-]/g, '')) || 0;
                        const masters = parseFloat((fund.mastersFee as string).replace(/[^\d.-]/g, '')) || 0;
                        return sum + executors + masters;
                      }, 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <NewGroupedTableView
              funds={filteredFunds}
              columnVisibility={columnVisibility}
              tableMode={tableMode}
              onFieldUpdate={handleFieldUpdate}
              isUpdating={updateMutation.isPending}
            />
          </>
        )}

        {viewMode === "detailed" && (
          <>
            {/* Summary Section for Hybrid View */}
            {tableMode === "inputs" && (
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-4">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">Summary</h2>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div style={{ backgroundColor: '#F9F0E5' }} className="rounded-lg p-4 text-center">
                    <div className="text-xs font-medium text-neutral-600 mb-1">Cover Amount</div>
                    <div className="text-lg font-bold text-neutral-900">
                      R {filteredFunds.reduce((sum, fund) => {
                        const value = fund.coverAmount as string;
                        const amount = parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
                        return sum + amount;
                      }, 0).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#F9F0E5' }} className="rounded-lg p-4 text-center">
                    <div className="text-xs font-medium text-neutral-600 mb-1">Monthly Income</div>
                    <div className="text-lg font-bold text-neutral-900">
                      R {filteredFunds.reduce((sum, fund) => {
                        const value = fund.monthlyIncome as string;
                        const amount = parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
                        return sum + amount;
                      }, 0).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#F9F0E5' }} className="rounded-lg p-4 text-center">
                    <div className="text-xs font-medium text-neutral-600 mb-1">Approved Life Cover</div>
                    <div className="text-lg font-bold text-neutral-900">
                      R {filteredFunds.reduce((sum, fund) => {
                        const value = fund.approvedLifeCover as string;
                        const amount = parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
                        return sum + amount;
                      }, 0).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#F9F0E5' }} className="rounded-lg p-4 text-center">
                    <div className="text-xs font-medium text-neutral-600 mb-1">Fund Value</div>
                    <div className="text-lg font-bold text-neutral-900">
                      R {filteredFunds.reduce((sum, fund) => {
                        const value = fund.fundValue as string;
                        const amount = parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
                        return sum + amount;
                      }, 0).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#F9F0E5' }} className="rounded-lg p-4 text-center">
                    <div className="text-xs font-medium text-neutral-600 mb-1">Fund Value at Death</div>
                    <div className="text-lg font-bold text-neutral-900">
                      R {filteredFunds.reduce((sum, fund) => {
                        const value = fund.fundValueAtDeath as string;
                        const amount = parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
                        return sum + amount;
                      }, 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-neutral-200" style={{ viewTransitionName: 'detailed-view' }}>
              <DetailedView
                funds={filteredFunds}
                columnVisibility={columnVisibility}
                onFieldUpdate={handleFieldUpdate}
                isUpdating={updateMutation.isPending}
                tableMode={tableMode}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}