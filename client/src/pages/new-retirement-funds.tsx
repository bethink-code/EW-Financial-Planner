import { useState, useMemo, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RetirementFund, UpdateRetirementFund } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { NewTableControls } from "@/components/retirement-funds/new-table-controls";
import { NewGroupedTableView } from "@/components/retirement-funds/new-grouped-table-view";
import { SimpleTableWithBeneficiaries } from "@/components/retirement-funds/simple-table-with-beneficiaries";
import { DetailedView } from "@/components/retirement-funds/detailed-view";
import { SummarySection } from "@/components/retirement-funds/summary-section";
import { AddFundDialog } from "@/components/retirement-funds/add-fund-dialog";
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
  const [showAddDialog, setShowAddDialog] = useState(false);

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
    onMutate: async ({ id, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/retirement-funds"] });
      
      // Snapshot the previous value
      const previousFunds = queryClient.getQueryData<RetirementFund[]>(["/api/retirement-funds"]);
      
      // Optimistically update the cache
      queryClient.setQueryData<RetirementFund[]>(["/api/retirement-funds"], (old) => {
        if (!old) return old;
        return old.map((fund) => 
          fund.id === id ? { ...fund, ...updates } : fund
        );
      });
      
      return { previousFunds };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousFunds) {
        queryClient.setQueryData(["/api/retirement-funds"], context.previousFunds);
      }
    },
    onSettled: () => {
      // Sync with server after mutation completes
      queryClient.invalidateQueries({ queryKey: ["/api/retirement-funds"] });
    },
  });

  // Immediate field update without debouncing to fix input issues
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
    return funds.filter(fund => {
      const basicMatch = fund.description.toLowerCase().includes(query) ||
        fund.owner.toLowerCase().includes(query) ||
        fund.beneficiaryName.toLowerCase().includes(query);
      
      // Search in beneficiaries JSON array
      const beneficiariesMatch = (() => {
        try {
          const beneficiaries = JSON.parse(fund.beneficiaries || "[]");
          return beneficiaries.some((b: any) => b.name?.toLowerCase().includes(query));
        } catch {
          return false;
        }
      })();
      
      return basicMatch || beneficiariesMatch;
    });
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
    <div className="min-h-screen bg-[#eff2f5]">
      <div className="py-4">
        <div className="px-4">
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
            onAddFund={() => setShowAddDialog(true)}
          />
        </div>

        {viewMode === "grouped" && (
          <>
            {/* Summary Section for Table View - Inputs */}
            {tableMode === "inputs" && (
              <div className="mx-4 bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-4">
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

            {/* Summary Section for Table View - Flows */}
            {tableMode === "flows" && (
              <div className="mx-4 bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-4">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">Flows Summary</h2>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div style={{ backgroundColor: '#E0F2FE' }} className="rounded-lg p-4 text-center">
                    <div className="text-xs font-medium text-teal-700 mb-1">Estate Provisions</div>
                    <div className="text-lg font-bold text-neutral-900">
                      R {filteredFunds.reduce((sum, fund) => {
                        const value = fund.lumpSumLeftOverProvisions as string;
                        const amount = parseFloat(value?.replace(/[^\d.-]/g, '') || '0') || 0;
                        return sum + amount;
                      }, 0).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#E0F2FE' }} className="rounded-lg p-4 text-center">
                    <div className="text-xs font-medium text-teal-700 mb-1">Term (Years)</div>
                    <div className="text-lg font-bold text-neutral-900">
                      {filteredFunds.reduce((sum, fund) => {
                        const value = fund.incomeTerm as string;
                        const amount = parseFloat(value?.replace(/[^\d.-]/g, '') || '0') || 0;
                        return sum + amount;
                      }, 0).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#E0F2FE' }} className="rounded-lg p-4 text-center">
                    <div className="text-xs font-medium text-teal-700 mb-1">Monthly Payments</div>
                    <div className="text-lg font-bold text-neutral-900">
                      R {filteredFunds.reduce((sum, fund) => {
                        const value = fund.monthlyProvisionOffered as string;
                        const amount = parseFloat(value?.replace(/[^\d.-]/g, '') || '0') || 0;
                        return sum + amount;
                      }, 0).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#E0F2FE' }} className="rounded-lg p-4 text-center">
                    <div className="text-xs font-medium text-teal-700 mb-1">Estate Duties</div>
                    <div className="text-lg font-bold text-neutral-900">
                      R {filteredFunds.reduce((sum, fund) => {
                        const value = fund.estateDeploymentDeceased as string;
                        const amount = parseFloat(value?.replace(/[^\d.-]/g, '') || '0') || 0;
                        return sum + amount;
                      }, 0).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#E0F2FE' }} className="rounded-lg p-4 text-center">
                    <div className="text-xs font-medium text-teal-700 mb-1">Total Percentages</div>
                    <div className="text-lg font-bold text-neutral-900">
                      100%
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mx-4 bg-white rounded-lg shadow-sm border border-neutral-200" style={{ viewTransitionName: 'table-view' }}>
              {tableMode === "inputs" ? (
                <SimpleTableWithBeneficiaries
                  funds={filteredFunds}
                  columnVisibility={columnVisibility}
                  tableMode={tableMode}
                  onFieldUpdate={handleFieldUpdate}
                  isUpdating={updateMutation.isPending}
                />
              ) : (
                <NewGroupedTableView
                  funds={filteredFunds}
                  columnVisibility={columnVisibility}
                  tableMode={tableMode}
                  onFieldUpdate={handleFieldUpdate}
                  isUpdating={updateMutation.isPending}
                />
              )}
            </div>
            




          </>
        )}

        {viewMode === "detailed" && (
          <>
            {/* Summary Section for Hybrid View */}
            {tableMode === "inputs" && (
              <div className="mx-4 bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-4">
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

            <div className="mx-4 bg-white rounded-lg shadow-sm border border-neutral-200" style={{ viewTransitionName: 'detailed-view' }}>
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

        {/* Add Fund Dialog */}
        <AddFundDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
        />
      </div>
    </div>
  );
}