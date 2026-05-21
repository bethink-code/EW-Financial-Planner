import { useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AssuranceDetailForm } from "@/components/assurance/assurance-detail-form";
import { AssuranceSummary } from "@/components/assurance/simple-assurance-summary";
import { useDebouncedUpdate } from "@/hooks/use-debounced-update";
import { useLoadingMutation } from "@/hooks/use-loading-mutation";
import { HybridViewWrapper } from "@/components/common/hybrid-view-wrapper";
import { HybridHeaderBar } from "@/components/common/hybrid-header-bar";
import { HybridSidebar } from "@/components/common/hybrid-sidebar";
import type { Assurance, InsertAssurance, ClientDetails } from "@shared/schema";

interface AssuranceTableProps {
  onAddPolicy?: () => void;
}

export function AssuranceTable({ onAddPolicy }: AssuranceTableProps) {
  const queryClient = useQueryClient();

  useQuery<ClientDetails[]>({
    queryKey: ["/api/client-details"],
  });

  const { data: policies = [], isLoading } = useQuery<Assurance[]>({
    queryKey: ["/api/assurance"],
    queryFn: async () => {
      const response = await fetch("/api/assurance");
      if (!response.ok) throw new Error('Failed to fetch assurance policies');
      return response.json();
    },
  });

  const updateMutation = useLoadingMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Assurance> }) => {
      const response = await apiRequest("PATCH", `/api/assurance/${id}`, updates);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assurance"] });
      queryClient.refetchQueries({ queryKey: ["/api/assurance"] });
    },
  });

  const deleteMutation = useLoadingMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/assurance/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assurance"] });
    },
  });

  const duplicateMutation = useLoadingMutation({
    mutationFn: async (policy: Assurance) => {
      const newPolicy: InsertAssurance = {
        description: policy.description ? `${policy.description} (Copy)` : '',
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
        additionalInfo: policy.additionalInfo,
      };
      const response = await apiRequest("POST", "/api/assurance", newPolicy);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assurance"] });
    },
  });

  type FieldValue = string | boolean | string[] | boolean[];

  const executeUpdate = useCallback((id: number, field: keyof Assurance, value: FieldValue) => {
    updateMutation.mutate({ id, updates: { [field]: value } });
  }, [updateMutation]);

  const debouncedUpdate = useDebouncedUpdate(executeUpdate, 300);

  const handleUpdatePolicy = useCallback((id: number, field: keyof Assurance, value: FieldValue) => {
    const arrayFields = ['owners', 'beneficiaries', 'ownershipPercentages', 'beneficiaryPercentages', 'lifeAssured', 'deathBenefits', 'amountToggles', 'amountYearsValues', 'amountIncreaseValues'];
    if (arrayFields.includes(field)) {
      executeUpdate(id, field, value);
    } else {
      debouncedUpdate(id, field, value);
    }
  }, [executeUpdate, debouncedUpdate]);

  const [selectedPolicyId, setSelectedPolicyId] = useState<number | null>(null);

  useEffect(() => {
    if (policies.length > 0 && selectedPolicyId === null) {
      setSelectedPolicyId(policies[0].id);
    }
  }, [policies, selectedPolicyId]);

  const handleDeletePolicy = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      if (id === selectedPolicyId) setSelectedPolicyId(null);
      deleteMutation.mutate(id);
    }
  }, [deleteMutation, selectedPolicyId]);

  const handleDuplicatePolicy = useCallback((policy: Assurance) => {
    duplicateMutation.mutate(policy);
  }, [duplicateMutation]);

  // Array-field helpers — owners, life assured, death benefits, and ownership %
  // travel together as a tuple per row, so add/remove must update all four.
  const handleAddOwner = useCallback((id: number) => {
    const policy = policies.find(p => p.id === id);
    if (!policy) return;
    handleUpdatePolicy(id, 'owners', [...policy.owners, ""]);
    handleUpdatePolicy(id, 'lifeAssured', [...(policy.lifeAssured || []), ""]);
    handleUpdatePolicy(id, 'deathBenefits', [...(policy.deathBenefits || []), "R 0"]);
    handleUpdatePolicy(id, 'ownershipPercentages', [...(policy.ownershipPercentages || []), "0%"]);
  }, [policies, handleUpdatePolicy]);

  const handleRemoveOwner = useCallback((id: number, ownerIndex: number) => {
    const policy = policies.find(p => p.id === id);
    if (!policy || policy.owners.length <= 1 || ownerIndex === 0) return;
    const cut = <T,>(arr: T[]) => { const x = [...arr]; x.splice(ownerIndex, 1); return x; };
    handleUpdatePolicy(id, 'owners', cut(policy.owners));
    handleUpdatePolicy(id, 'lifeAssured', cut(policy.lifeAssured || []));
    handleUpdatePolicy(id, 'deathBenefits', cut(policy.deathBenefits || []));
    handleUpdatePolicy(id, 'ownershipPercentages', cut(policy.ownershipPercentages || []));
  }, [policies, handleUpdatePolicy]);

  const handleAddBeneficiary = useCallback((id: number) => {
    const policy = policies.find(p => p.id === id);
    if (!policy) return;
    handleUpdatePolicy(id, 'beneficiaries', [...policy.beneficiaries, ""]);
    handleUpdatePolicy(id, 'beneficiaryPercentages', [...(policy.beneficiaryPercentages || []), "0%"]);
    handleUpdatePolicy(id, 'amountToggles', [...(policy.amountToggles || []), true]);
    handleUpdatePolicy(id, 'amountYearsValues', [...(policy.amountYearsValues || []), "0 years"]);
    handleUpdatePolicy(id, 'amountIncreaseValues', [...(policy.amountIncreaseValues || []), "0%"]);
  }, [policies, handleUpdatePolicy]);

  const handleRemoveBeneficiary = useCallback((id: number, beneficiaryIndex: number) => {
    const policy = policies.find(p => p.id === id);
    if (!policy || policy.beneficiaries.length <= 1 || beneficiaryIndex === 0) return;
    const cut = <T,>(arr: T[]) => { const x = [...arr]; x.splice(beneficiaryIndex, 1); return x; };
    handleUpdatePolicy(id, 'beneficiaries', cut(policy.beneficiaries));
    handleUpdatePolicy(id, 'beneficiaryPercentages', cut(policy.beneficiaryPercentages || []));
    handleUpdatePolicy(id, 'amountToggles', cut(policy.amountToggles || []));
    handleUpdatePolicy(id, 'amountYearsValues', cut(policy.amountYearsValues || []));
    handleUpdatePolicy(id, 'amountIncreaseValues', cut(policy.amountIncreaseValues || []));
  }, [policies, handleUpdatePolicy]);

  const handleOwnerChange = useCallback((id: number, ownerIndex: number, value: string) => {
    const policy = policies.find(p => p.id === id);
    if (!policy) return;
    const next = [...policy.owners];
    next[ownerIndex] = value;
    handleUpdatePolicy(id, 'owners', next);
  }, [policies, handleUpdatePolicy]);

  const handleBeneficiaryChange = useCallback((id: number, beneficiaryIndex: number, value: string) => {
    const policy = policies.find(p => p.id === id);
    if (!policy) return;
    const next = [...policy.beneficiaries];
    next[beneficiaryIndex] = value;
    handleUpdatePolicy(id, 'beneficiaries', next);
  }, [policies, handleUpdatePolicy]);

  const handleLifeAssuredChange = useCallback((id: number, lifeAssuredIndex: number, value: string) => {
    const policy = policies.find(p => p.id === id);
    if (!policy) return;
    const next = [...(policy.lifeAssured || [])];
    next[lifeAssuredIndex] = value;
    handleUpdatePolicy(id, 'lifeAssured', next);
  }, [policies, handleUpdatePolicy]);

  const handleDeathBenefitChange = useCallback((id: number, deathBenefitIndex: number, value: string) => {
    const policy = policies.find(p => p.id === id);
    if (!policy) return;
    const next = [...(policy.deathBenefits || [])];
    next[deathBenefitIndex] = value;
    handleUpdatePolicy(id, 'deathBenefits', next);
  }, [policies, handleUpdatePolicy]);

  const handleOwnershipPercentageChange = useCallback((id: number, ownerIndex: number, value: string) => {
    const policy = policies.find(p => p.id === id);
    if (!policy) return;
    const next = [...(policy.ownershipPercentages || [])];
    next[ownerIndex] = value;
    handleUpdatePolicy(id, 'ownershipPercentages', next);
  }, [policies, handleUpdatePolicy]);

  const handleBeneficiaryPercentageChange = useCallback((id: number, beneficiaryIndex: number, value: string) => {
    const policy = policies.find(p => p.id === id);
    if (!policy) return;
    const next = [...(policy.beneficiaryPercentages || [])];
    next[beneficiaryIndex] = value;
    handleUpdatePolicy(id, 'beneficiaryPercentages', next);
  }, [policies, handleUpdatePolicy]);

  const selectedPolicy = selectedPolicyId
    ? policies.find(p => p.id === selectedPolicyId) ?? null
    : null;

  const titleFor = (p: Assurance) =>
    p.description?.trim() || `Policy #${p.id}`;

  const summaryCards = (
    <HybridSidebar
      items={policies}
      selectedId={selectedPolicyId}
      onSelect={setSelectedPolicyId}
      getId={(p) => p.id}
      getTitle={titleFor}
      renderActive={(p) => {
        const owners = (p.owners || []).filter(o => o?.trim());
        const lines: string[] = [];
        if (owners.length > 0) {
          lines.push(`Owners: ${owners.join(', ')}`);
        }
        const beneficiaries = (p.beneficiaries || []).filter(b => b?.trim());
        if (beneficiaries.length > 0) {
          lines.push(`Beneficiaries: ${beneficiaries.length}`);
        }
        const total = parseFloat(p.deathBenefit?.replace(/[^\d.-]/g, '') || '0') || 0;
        return {
          subtitle: lines.join('\n') || 'No details entered',
          primaryValue: `R ${total.toLocaleString()}`,
          secondaryInfo: p.amount && p.amount !== 'R 0' ? `Amount: ${p.amount}` : undefined,
        };
      }}
    />
  );

  const detailForms = selectedPolicy ? (
    <AssuranceDetailForm
      key={`form-${selectedPolicy.id}-${selectedPolicy.owners.length}-${selectedPolicy.beneficiaries.length}`}
      policy={selectedPolicy}
      onUpdate={handleUpdatePolicy}
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
  ) : null;

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="text-neutral-500">Loading assurance policies...</div>
      </div>
    );
  }

  const isUpdating = deleteMutation.isPending || duplicateMutation.isPending;

  return (
    <HybridViewWrapper
      summary={<AssuranceSummary />}
      header={
        <HybridHeaderBar
          add={onAddPolicy ? { label: 'Add Policy', onClick: onAddPolicy } : undefined}
          title={selectedPolicy?.description}
          emptyTitle={selectedPolicy ? 'Untitled Policy' : undefined}
          onDuplicate={selectedPolicy ? () => handleDuplicatePolicy(selectedPolicy) : undefined}
          onDelete={selectedPolicy ? () => handleDeletePolicy(selectedPolicy.id) : undefined}
          disabled={isUpdating}
        />
      }
      summaryCards={summaryCards}
      detailForms={detailForms}
      isEmpty={policies.length === 0}
      emptyStateMessage="No assurance policies yet. Click 'Add Policy' to create your first policy."
    />
  );
}

export default AssuranceTable;
