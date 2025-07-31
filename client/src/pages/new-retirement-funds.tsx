import { useState, useMemo, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RetirementFund, UpdateRetirementFund } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { CalculatorHeader } from "@/components/ui/calculator-header";
import { RetirementFundsSummary } from "@/components/retirement-funds/retirement-funds-summary";
import { NewRetirementTable } from "@/components/retirement-funds/new-retirement-table";
import { AdditionalDetails } from "@/components/retirement-funds/additional-details";
import { useDebouncedUpdate } from "@/hooks/use-debounced-update";


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
    onSuccess: () => {
      // Force fresh data reload after every update to ensure synchronization
      queryClient.invalidateQueries({ queryKey: ["/api/retirement-funds"] });
    },
  });

  // Base update handler
  const executeUpdate = useCallback((id: number, field: string, value: any) => {
    updateMutation.mutate({ id, updates: { [field]: value } });
  }, [updateMutation]);

  // Debounced update for text fields to prevent race conditions
  const debouncedUpdate = useDebouncedUpdate(executeUpdate, 300);

  // Smart field update that uses debouncing for text fields, immediate for arrays
  const handleFieldUpdate = useCallback((id: number, field: string, value: any) => {
    // Use immediate updates for array fields to prevent synchronization issues
    const arrayFields = ['owners', 'ownershipPercentages', 'unapprovedBeneficiaries', 
                        'unapprovedPercentageSplits', 'unapprovedCoverSplits',
                        'fundValueBeneficiaries', 'fundValuePercentageSplits', 
                        'fundValueCoverSplits'];
    
    if (arrayFields.includes(field)) {
      executeUpdate(id, field, value);
    } else {
      debouncedUpdate(id, field, value);
    }
  }, [executeUpdate, debouncedUpdate]);

  const handleAddFund = useCallback(() => {
    const newFund = {}; // Send empty object to use database defaults
    addMutation.mutate(newFund as Omit<RetirementFund, 'id'>);
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
        {/* Combined Header, Summary and Table */}
        <CalculatorHeader
          title="Retirement Funds"
          onAddItem={handleAddFund}
          addButtonText="Add Fund"
          isAddingItem={addMutation.isPending}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          showTableFlowsSwitcher={viewMode === "table"}
          tableMode={tableMode}
          onTableModeChange={setTableMode}
          className="mb-6"
        >
          {/* Summary with max width constraint */}
          <div className="max-w-6xl">
            <RetirementFundsSummary />
          </div>
          
          {/* Table with full width and margin */}
          <div className="table-container-wrapper">
            {/* Table View */}
            {viewMode === "table" && (
              <NewRetirementTable
                funds={funds}
                onFieldUpdate={handleFieldUpdate}
                onRemoveFund={handleRemoveFund}
                onDuplicateFund={handleDuplicateFund}
                onAddFund={handleAddFund}
                isUpdating={updateMutation.isPending}
              />
            )}

            {/* Hybrid View - Using same table for now */}
            {viewMode === "hybrid" && (
              <NewRetirementTable
                funds={funds}
                onFieldUpdate={handleFieldUpdate}
                onRemoveFund={handleRemoveFund}
                onDuplicateFund={handleDuplicateFund}
                onAddFund={handleAddFund}
                isUpdating={updateMutation.isPending}
              />
            )}
          </div>
        </CalculatorHeader>
      </div>
    </div>
  );
}