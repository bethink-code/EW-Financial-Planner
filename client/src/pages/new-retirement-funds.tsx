import { useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RetirementFund, UpdateRetirementFund, ClientDetails } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { RetirementFundTable } from "@/components/retirement-funds/retirement-fund-table";
import { useDebouncedUpdate } from "@/hooks/use-debounced-update";
import {
  getDefaultOwners,
  getDefaultOwnershipPercentages,
  getDefaultBeneficiaries,
  getDefaultBeneficiaryPercentages,
} from "@/lib/entity-utils";

export default function NewRetirementFunds() {
  const [location] = useLocation();
  const isRetirementNeed = location.startsWith("/needs/retirement");

  const { data: funds = [], isLoading } = useQuery<RetirementFund[]>({
    queryKey: ["/api/retirement-funds"],
  });

  const { data: clientDetails = [] } = useQuery<ClientDetails[]>({
    queryKey: ["/api/client-details"],
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
      queryClient.invalidateQueries({ queryKey: ["/api/retirement-funds"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/retirement-funds/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/retirement-funds"] });
    },
  });

  const executeUpdate = useCallback((id: number, field: string, value: any) => {
    updateMutation.mutate({ id, updates: { [field]: value } });
  }, [updateMutation]);

  const debouncedUpdate = useDebouncedUpdate(executeUpdate, 300);

  // Arrays update immediately to keep paired data (owners + percentages,
  // beneficiaries + splits) in sync; text fields debounce.
  const handleFieldUpdate = useCallback((id: number, field: string, value: any) => {
    const arrayFields = ['owners', 'ownershipPercentages', 'additionalOwners',
                        'unapprovedBeneficiaries', 'unapprovedPercentageSplits', 'unapprovedCoverSplits',
                        'fundValueBeneficiaries', 'fundValuePercentageSplits', 'fundValueCoverSplits',
                        'additionalBeneficiaries', 'additionalBenefitSplits'];
    if (arrayFields.includes(field)) {
      executeUpdate(id, field, value);
    } else {
      debouncedUpdate(id, field, value);
    }
  }, [executeUpdate, debouncedUpdate]);

  const handleAddFund = useCallback(() => {
    const newFund = {
      owners: getDefaultOwners(clientDetails),
      ownershipPercentages: getDefaultOwnershipPercentages(),
      unapprovedBeneficiaries: getDefaultBeneficiaries(clientDetails),
      unapprovedPercentageSplits: getDefaultBeneficiaryPercentages(),
      fundValueBeneficiaries: getDefaultBeneficiaries(clientDetails),
      fundValuePercentageSplits: getDefaultBeneficiaryPercentages(),
    };
    addMutation.mutate(newFund as Omit<RetirementFund, 'id'>);
  }, [addMutation, clientDetails]);

  const handleRemoveFund = useCallback((id: number) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  const handleDuplicateFund = useCallback((fund: RetirementFund) => {
    const { id, ...fundWithoutId } = fund;
    addMutation.mutate({
      ...fundWithoutId,
      description: fund.description ? `${fund.description} (Copy)` : '',
    });
  }, [addMutation]);

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
    <div className="w-full px-6 pb-6">
      <div className="w-[1320px] max-w-full">
        <RetirementFundTable
          funds={funds}
          onUpdate={handleFieldUpdate}
          onDuplicate={handleDuplicateFund}
          onDelete={handleRemoveFund}
          onAddFund={handleAddFund}
          disabled={updateMutation.isPending || addMutation.isPending}
          showSummary={!isRetirementNeed}
        />
      </div>
    </div>
  );
}
