import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { formatTextValue } from "@/lib/formatting";
import { apiRequest } from "@/lib/queryClient";
import { AssuranceDetailForm } from "@/components/assurance/assurance-detail-form";
import { useDebouncedUpdate } from "@/hooks/use-debounced-update";
import { useLoadingMutation } from "@/hooks/use-loading-mutation";
import { Button } from "@/components/ui/button";
import { HybridViewWrapper } from "@/components/common/hybrid-view-wrapper";
import { HybridItemPreviewCard } from "@/components/common/hybrid-item-preview-card";
import type { Assurance, InsertAssurance, ClientDetails } from "@shared/schema";

interface AssuranceTableProps {
  onAddPolicy?: () => void;
}

export function AssuranceTable({ onAddPolicy }: AssuranceTableProps) {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch client details for entity options
  const { data: entities = [] } = useQuery<ClientDetails[]>({
    queryKey: ["/api/client-details"]
  });

  // Fetch assurance policies
  const { data: policies = [], isLoading } = useQuery({
    queryKey: ["/api/assurance"],
    queryFn: async () => {
      const response = await fetch("/api/assurance");
      if (!response.ok) throw new Error('Failed to fetch assurance policies');
      return response.json();
    }
  });

  // Update policy mutation with loading integration
  const updateMutation = useLoadingMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Assurance> }) => {
      try {
        const response = await apiRequest("PATCH", `/api/assurance/${id}`, updates);
        return await response.json();
      } catch (error) {
        console.error('Update policy error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Force a complete cache invalidation and refetch
      queryClient.invalidateQueries({ queryKey: ["/api/assurance"] });
      queryClient.refetchQueries({ queryKey: ["/api/assurance"] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Update mutation error:', error);
      setIsUpdating(false);
    }
  });

  // Delete policy mutation with loading integration
  const deleteMutation = useLoadingMutation({
    mutationFn: (id: number) => {
      return apiRequest("DELETE", `/api/assurance/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assurance"] });
    },
  });

  // Duplicate policy mutation with loading integration
  const duplicateMutation = useLoadingMutation({
    mutationFn: async (policy: Assurance) => {
      try {
        const newPolicy: InsertAssurance = {
          description: policy.description + " (Copy)",
          owners: [...policy.owners],
          beneficiaries: [...policy.beneficiaries],
          deathBenefit: policy.deathBenefit,
          amount: policy.amount,
          amountToggles: [...(policy.amountToggles || [true])],
          amountYearsValues: [...(policy.amountYearsValues || ["0 years"])],
          amountIncreaseValues: [...(policy.amountIncreaseValues || ["0%"])],
          premiumsByOthers: policy.premiumsByOthers,
          collateralSession: policy.collateralSession,
          benefitSplit: policy.benefitSplit,
          additionalInfo: policy.additionalInfo
        };
        const response = await apiRequest("POST", "/api/assurance", newPolicy);
        return await response.json();
      } catch (error) {
        console.error('Duplicate policy error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assurance"] });
    },
    onError: (error) => {
      console.error('Duplicate mutation error:', error);
    }
  });

  // Base update function
  const executeUpdate = useCallback((id: number, field: keyof Assurance, value: string | boolean | string[]) => {
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  // Debounced update for text fields
  const debouncedUpdate = useDebouncedUpdate(executeUpdate, 300);

  const handleDeletePolicy = useCallback((id: number) => {
    if (confirm('Are you sure you want to delete this policy?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const handleDuplicatePolicy = useCallback((policy: Assurance) => {
    duplicateMutation.mutate(policy);
  }, [duplicateMutation]);

  const handleUpdatePolicy = useCallback((id: number, field: keyof Assurance, value: string | boolean | string[]) => {
    // Use immediate updates for array fields to prevent synchronization issues
    const arrayFields = ['owners', 'beneficiaries', 'ownershipPercentages', 'beneficiaryPercentages'];

    if (arrayFields.includes(field)) {
      executeUpdate(id, field, value);
    } else {
      debouncedUpdate(id, field, value);
    }
  }, [executeUpdate, debouncedUpdate]);

  // Add owner to policy - includes life assured and death benefit pairing for Assurance
  const handleAddOwner = useCallback((id: number) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy) {
      const newOwners = [...policy.owners, ""];
      const newLifeAssured = [...(policy.lifeAssured || []), ""];
      const newDeathBenefits = [...(policy.deathBenefits || []), "R 0"];
      const newOwnershipPercentages = [...(policy.ownershipPercentages || []), "0%"];
      handleUpdatePolicy(id, 'owners', newOwners);
      handleUpdatePolicy(id, 'lifeAssured', newLifeAssured);
      handleUpdatePolicy(id, 'deathBenefits', newDeathBenefits);
      handleUpdatePolicy(id, 'ownershipPercentages', newOwnershipPercentages);
    }
  }, [policies, handleUpdatePolicy]);

  // Remove specific owner by index using splice method - includes life assured and death benefit pairing
  const handleRemoveOwner = useCallback((id: number, ownerIndex: number) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy && policy.owners.length > 1 && ownerIndex > 0) { // Protect first owner
      const newOwners = [...policy.owners];
      const newLifeAssured = [...(policy.lifeAssured || [])];
      const newDeathBenefits = [...(policy.deathBenefits || [])];
      const newOwnershipPercentages = [...(policy.ownershipPercentages || [])];
      newOwners.splice(ownerIndex, 1);
      newLifeAssured.splice(ownerIndex, 1);
      newDeathBenefits.splice(ownerIndex, 1);
      newOwnershipPercentages.splice(ownerIndex, 1);
      handleUpdatePolicy(id, 'owners', newOwners);
      handleUpdatePolicy(id, 'lifeAssured', newLifeAssured);
      handleUpdatePolicy(id, 'deathBenefits', newDeathBenefits);
      handleUpdatePolicy(id, 'ownershipPercentages', newOwnershipPercentages);
    }
  }, [policies, handleUpdatePolicy]);

  // Add beneficiary to policy - also expand toggle arrays
  const handleAddBeneficiary = useCallback((id: number) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy) {
      const newBeneficiaries = [...policy.beneficiaries, ""];
      const newBeneficiaryPercentages = [...(policy.beneficiaryPercentages || []), "0%"];
      const newToggles = [...(policy.amountToggles || []), true];
      const newYearsValues = [...(policy.amountYearsValues || []), "0 years"];
      const newIncreaseValues = [...(policy.amountIncreaseValues || []), "0%"];

      handleUpdatePolicy(id, 'beneficiaries', newBeneficiaries);
      handleUpdatePolicy(id, 'beneficiaryPercentages', newBeneficiaryPercentages);
      handleUpdatePolicy(id, 'amountToggles', newToggles);
      handleUpdatePolicy(id, 'amountYearsValues', newYearsValues);
      handleUpdatePolicy(id, 'amountIncreaseValues', newIncreaseValues);
    }
  }, [policies, handleUpdatePolicy]);

  // Remove specific beneficiary by index using splice method - also trim toggle arrays
  const handleRemoveBeneficiary = useCallback((id: number, beneficiaryIndex: number) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy && policy.beneficiaries.length > 1 && beneficiaryIndex > 0) { // Protect first beneficiary
      const newBeneficiaries = [...policy.beneficiaries];
      const newBeneficiaryPercentages = [...(policy.beneficiaryPercentages || [])];
      const newToggles = [...(policy.amountToggles || [])];
      const newYearsValues = [...(policy.amountYearsValues || [])];
      const newIncreaseValues = [...(policy.amountIncreaseValues || [])];

      newBeneficiaries.splice(beneficiaryIndex, 1);
      newBeneficiaryPercentages.splice(beneficiaryIndex, 1);
      newToggles.splice(beneficiaryIndex, 1);
      newYearsValues.splice(beneficiaryIndex, 1);
      newIncreaseValues.splice(beneficiaryIndex, 1);

      handleUpdatePolicy(id, 'beneficiaries', newBeneficiaries);
      handleUpdatePolicy(id, 'beneficiaryPercentages', newBeneficiaryPercentages);
      handleUpdatePolicy(id, 'amountToggles', newToggles);
      handleUpdatePolicy(id, 'amountYearsValues', newYearsValues);
      handleUpdatePolicy(id, 'amountIncreaseValues', newIncreaseValues);
    }
  }, [policies, handleUpdatePolicy]);

  // Update owner name
  const handleOwnerChange = useCallback((id: number, ownerIndex: number, newOwner: string) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy) {
      const updatedOwners = [...policy.owners];
      updatedOwners[ownerIndex] = newOwner;
      handleUpdatePolicy(id, 'owners', updatedOwners);
    }
  }, [policies, handleUpdatePolicy]);

  // Update beneficiary name
  const handleBeneficiaryChange = useCallback((id: number, beneficiaryIndex: number, newBeneficiary: string) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy) {
      const updatedBeneficiaries = [...policy.beneficiaries];
      updatedBeneficiaries[beneficiaryIndex] = newBeneficiary;
      handleUpdatePolicy(id, 'beneficiaries', updatedBeneficiaries);
    }
  }, [policies, handleUpdatePolicy]);

  // Update life assured name
  const handleLifeAssuredChange = useCallback((id: number, lifeAssuredIndex: number, newLifeAssured: string) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy) {
      const updatedLifeAssured = [...(policy.lifeAssured || [])];
      updatedLifeAssured[lifeAssuredIndex] = newLifeAssured;
      handleUpdatePolicy(id, 'lifeAssured', updatedLifeAssured);
    }
  }, [policies, handleUpdatePolicy]);

  // Update death benefit amount for specific index
  const handleDeathBenefitChange = useCallback((id: number, deathBenefitIndex: number, newDeathBenefit: string) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy) {
      const updatedDeathBenefits = [...(policy.deathBenefits || [])];
      updatedDeathBenefits[deathBenefitIndex] = newDeathBenefit;
      handleUpdatePolicy(id, 'deathBenefits', updatedDeathBenefits);
    }
  }, [policies, handleUpdatePolicy]);

  // Update ownership percentage
  const handleOwnershipPercentageChange = useCallback((id: number, ownerIndex: number, newPercentage: string) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy) {
      const updatedPercentages = [...(policy.ownershipPercentages || [])];
      updatedPercentages[ownerIndex] = newPercentage;
      handleUpdatePolicy(id, 'ownershipPercentages', updatedPercentages);
    }
  }, [policies, handleUpdatePolicy]);

  // Update beneficiary percentage
  const handleBeneficiaryPercentageChange = useCallback((id: number, beneficiaryIndex: number, newPercentage: string) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy) {
      const updatedPercentages = [...(policy.beneficiaryPercentages || [])];
      updatedPercentages[beneficiaryIndex] = newPercentage;
      handleUpdatePolicy(id, 'beneficiaryPercentages', updatedPercentages);
    }
  }, [policies, handleUpdatePolicy]);

  // Use policies directly without filtering
  const filteredPolicies = policies;

  // Selection state for the detail pane
  const [selectedPolicyId, setSelectedPolicyId] = useState<number | null>(null);

  // Default selection to the first policy
  useEffect(() => {
    if (filteredPolicies.length > 0 && selectedPolicyId === null) {
      setSelectedPolicyId(filteredPolicies[0].id);
    }
  }, [filteredPolicies, selectedPolicyId]);

  // Preview-card data preparation
  const getItemPreview = useCallback((policy: Assurance, isSelected: boolean) => {
    // Use the consolidated death benefit field rather than summing the array
    const totalDeathBenefit = parseFloat(policy.deathBenefit?.replace(/[^\d.-]/g, '') || '0') || 0;

    // Format owners list - show each owner on separate line with prefix
    const owners = policy.owners || [];
    const ownersDisplay = owners.length === 0
      ? 'Owner: Unassigned'
      : owners.map(owner => `Owner: ${owner}`).join('\n');

    return {
      id: policy.id,
      title: formatTextValue(policy.description) || `Policy #${policy.id}`,
      subtitle: ownersDisplay,
      primaryValue: `R ${totalDeathBenefit.toLocaleString()}`,
      secondaryInfo: policy.amount !== 'R 0' ? `Amount: ${policy.amount}` : undefined,
      isSelected
    };
  }, []);

  // Prepare preview items with selection state
  const previewItems = useMemo(() =>
    filteredPolicies.map((policy: Assurance) => getItemPreview(policy, policy.id === selectedPolicyId)),
    [filteredPolicies, getItemPreview, selectedPolicyId]
  );

  // Get selected policy for detail view
  const selectedPolicy = useMemo(() =>
    filteredPolicies.find((policy: Assurance) => policy.id === selectedPolicyId),
    [filteredPolicies, selectedPolicyId]
  );

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="text-neutral-500">Loading assurance policies...</div>
      </div>
    );
  }

  // Summary cards - clickable policy tabs
  const summaryCards = (
    <div>
      {/* Add Policy Button - Mandatory Pattern */}
      {onAddPolicy && (
        <div className="hybrid-add-button-container p-4 border-b border-neutral-200">
          <Button
            onClick={onAddPolicy}
            className="bg-white text-gray-700 border border-neutral-200 hover:bg-gray-50 hover:text-gray-900 font-normal"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Policy
          </Button>
        </div>
      )}

      {previewItems.map((item: {
        id: number;
        title: string;
        subtitle: string;
        primaryValue: string;
        secondaryInfo?: string;
        isSelected: boolean;
      }, index: number) => (
        <HybridItemPreviewCard
          key={item.id}
          title={item.title}
          subtitle={item.subtitle}
          primaryValue={item.primaryValue}
          secondaryInfo={item.secondaryInfo}
          variant={item.isSelected ? "active" : "blue"}
          onClick={() => setSelectedPolicyId(item.id)}
          isClickable={true}
          isFirst={index === 0}
          isLast={index === previewItems.length - 1}
        />
      ))}
    </div>
  );

  // Detail form for selected policy only
  const detailForms = selectedPolicy ? (
    <AssuranceDetailForm
      key={`form-${selectedPolicy.id}-${selectedPolicy.owners.length}-${selectedPolicy.beneficiaries.length}`}
      policy={selectedPolicy}
      onUpdate={handleUpdatePolicy}
      onDuplicate={handleDuplicatePolicy}
      onDelete={handleDeletePolicy}
      onOwnerChange={handleOwnerChange}
      onLifeAssuredChange={handleLifeAssuredChange}
      onDeathBenefitChange={handleDeathBenefitChange}
      onOwnershipPercentageChange={handleOwnershipPercentageChange}
      onAddOwner={handleAddOwner}
      onRemoveOwner={handleRemoveOwner}
      onBeneficiaryChange={handleBeneficiaryChange}
      onBeneficiaryPercentageChange={handleBeneficiaryPercentageChange}
      onAddBeneficiary={handleAddBeneficiary}
      onRemoveBeneficiary={handleRemoveBeneficiary}
      disabled={updateMutation.isPending}
    />
  ) : (
    <div className="text-center py-8">
      <p className="text-neutral-500">Select a policy from the left to view details</p>
    </div>
  );

  return (
    <HybridViewWrapper
      summaryCards={summaryCards}
      detailForms={detailForms}
      isUpdating={isUpdating}
      isEmpty={filteredPolicies.length === 0}
      emptyStateMessage="No assurance policies found"
    />
  );
}

export default AssuranceTable;
