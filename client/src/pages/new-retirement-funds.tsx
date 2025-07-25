import { useState, useMemo, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RetirementFund, UpdateRetirementFund } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { CalculatorHeader } from "@/components/ui/calculator-header";
import { RetirementFundsSummary } from "@/components/retirement-funds/retirement-funds-summary";
import { ClassicRetirementTable } from "@/components/retirement-funds/classic-retirement-table";
import RoughTableDemo from "@/components/retirement-funds/rough-table-demo";
import { DetailedView } from "@/components/retirement-funds/detailed-view";
import { AdditionalDetails } from "@/components/retirement-funds/additional-details";


type ViewMode = "table" | "hybrid";

interface ColumnVisibility {
  overview: boolean;
  unapprovedLifeCover: boolean;
  monthlyDeathBenefit: boolean;
  fundValue: boolean;
  fundValueBeneficiaries: boolean;
}

export default function NewRetirementFunds() {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
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

  const addMutation = useMutation({
    mutationFn: async (newFund: Omit<RetirementFund, 'id'>) => {
      return apiRequest("POST", "/api/retirement-funds", newFund);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/retirement-funds"] });
    },
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
    // Removed onSettled to prevent invalidation from overriding optimistic updates
  });

  // Immediate field update without debouncing to fix input issues
  const handleFieldUpdate = useCallback((id: number, field: keyof UpdateRetirementFund, value: string) => {
    updateMutation.mutate({ id, updates: { [field]: value } });
  }, [updateMutation]);

  const handleAddFund = useCallback(() => {
    const newFund: Omit<RetirementFund, 'id'> = {
      description: "Enter details ...",
      owner: "Donald Edwards",
      additionalOwners: [],
      coverAmount: "R 0",
      termYears: "0 years",
      increasePercentage: "0%",
      approvedLifeCover: "R 0",
      fundValue: "R 0",
      fundValueAtDeath: "R 0",
      beneficiaryName: "Enter details ...",
      name: "Enter details ...",
      amount: "R 0",
      beneficiary: "Enter details ...",
      benefitSplit: "0%",
      additionalBeneficiaries: [],
      additionalBenefitSplits: [],
      lumpSumTaken: "R 0",
      fundValueAfterLumpSum: "R 0",
      nondeductibleContribution: "R 0",
      livingAnnuity: "R 0",
      monthlyIncome: "R 0",
      incomeTerm: "0 years"
    };
    addMutation.mutate(newFund);
  }, [addMutation]);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/retirement-funds/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/retirement-funds"] });
    },
  });

  const handleRemoveFund = useCallback((id: number) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  const handleDuplicateFund = useCallback((fund: RetirementFund) => {
    const { id, ...fundWithoutId } = fund;
    const duplicatedFund = {
      ...fundWithoutId,
      description: `${fund.description} (Copy)`,
    };
    addMutation.mutate(duplicatedFund);
  }, [addMutation]);

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
    <div className="">
      <div className="w-full px-6 py-6">
        {/* Combined Header and Summary */}
        <div className="mb-6">
          <CalculatorHeader
            title="Retirement Funds"
            itemCount={funds.length}
            itemLabel="funds"
            onAddItem={handleAddFund}
            addButtonText="Add Fund"
            isAddingItem={addMutation.isPending}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            showTableFlowsSwitcher={viewMode === "table"}
            tableMode={tableMode}
            onTableModeChange={setTableMode}
          >
            <RetirementFundsSummary />
          </CalculatorHeader>
        </div>

        {/* Rough Table Demo */}
        {viewMode === "table" && (
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
            <RoughTableDemo />
          </div>
        )}

        {/* Hybrid View */}
        {viewMode === "hybrid" && (
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
            <DetailedView
              funds={funds}
              columnVisibility={columnVisibility}
              onFieldUpdate={handleFieldUpdate}
              isUpdating={updateMutation.isPending}
              tableMode={tableMode}
              onAddFund={handleAddFund}
            />
          </div>
        )}

        {/* Remove Add Fund Dialog - now handled directly */}
      </div>
    </div>
  );
}