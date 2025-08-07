import React, { useState, useCallback, useMemo, useEffect, memo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Copy, X } from "lucide-react";
import { getFieldClass, getFieldWidth } from "@/lib/design-tokens";
import { getCellClass } from "@/lib/field-types";
import { formatTextValue, getValueClass, isDefaultValue, handleDefaultValueFocus } from "@/lib/formatting";
import { apiRequest } from "@/lib/queryClient";
import { AddButton, DuplicateButton, DeleteButton, ActionButtonGroup } from "@/components/ui/action-buttons";
import { TableHeaderAddButton } from "@/components/ui/table-header-add-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EntityOwnerSelector from "@/components/common/entity-owner-selector";
import AssuranceOwnerSelector from "@/components/common/assurance-owner-selector";
import EntityLifeAssuredSelector from "@/components/common/entity-life-assured-selector";
import EntityBeneficiarySelector from "@/components/common/entity-beneficiary-selector";
import { AssuranceDetailForm } from "@/components/assurance/assurance-detail-form";
import { useDebouncedUpdate } from "@/hooks/use-debounced-update";
import { useLoadingMutation } from "@/hooks/use-loading-mutation";
import { SafeFragment } from "@/lib/safe-fragment";
import { Button } from "@/components/ui/button";
import { HybridViewWrapper } from "@/components/common/hybrid-view-wrapper";
import { HybridSummaryCard } from "@/components/common/hybrid-summary-card";
import { HybridDetailCard } from "@/components/common/hybrid-detail-card";
import { HybridItemPreviewCard } from "@/components/common/hybrid-item-preview-card";
import type { Assurance, InsertAssurance, ClientDetails } from "@shared/schema";

interface AssuranceTableProps {
  viewMode?: 'table' | 'hybrid';
  onAddPolicy?: () => void;
}

// Format currency value with R prefix and proper formatting
const formatCurrencyValue = (value: string, fieldType: string): string => {
  if (!value?.trim()) return "R 0";
  
  // Remove existing formatting
  const cleanValue = value.replace(/[^\d.-]/g, '');
  if (!cleanValue) return "R 0";
  if (isNaN(parseFloat(cleanValue))) return "R 0";
  
  const numValue = parseFloat(cleanValue);
  
  if (fieldType.includes('percentage') || fieldType.includes('Percentage') || fieldType.includes('Split')) {
    return `${numValue}%`;
  }
  
  // Currency fields
  if (fieldType.includes('amount') || fieldType.includes('Amount') || fieldType.includes('benefit') || fieldType.includes('Benefit') || fieldType.includes('premium') || fieldType.includes('Premium') || fieldType.includes('collateral') || fieldType.includes('Collateral')) {
    return `R ${numValue.toLocaleString()}`;
  }
  
  return "R 0";
};

// Years/% Toggle Pattern Helper Functions for Amount field - Per Beneficiary
const hasAmountValue = (policy: Assurance) => {
  const amount = policy.amount || "";
  const cleanValue = amount.replace(/[^\d]/g, '');
  return cleanValue && cleanValue !== "0";
};

const getAmountControlsEnabled = (policy: Assurance, isUpdating: boolean) => {
  return hasAmountValue(policy) && !isUpdating;
};

// Toggle shows "Years" when checked (true), "%" when unchecked (false) - Per Beneficiary
const isAmountYearsMode = (policy: Assurance, beneficiaryIndex: number) => {
  const toggles = policy.amountToggles || [true];
  return toggles[beneficiaryIndex] !== false; // Default to true if undefined
};

// Format years value with proper suffix
const formatYearsValue = (value: string): string => {
  if (!value || value === "0" || value.trim() === "") {
    return "0 years";
  }
  
  const cleanValue = value.toString().replace(/\s*years?\s*/gi, '').trim();
  if (cleanValue === "" || cleanValue === "0") {
    return "0 years";
  }
  
  const numValue = parseFloat(cleanValue);
  if (isNaN(numValue)) {
    return "0 years";
  }
  
  return `${numValue} years`;
};

// Format percentage value with proper suffix
const formatPercentageValue = (value: string): string => {
  if (!value || value === "0" || value.trim() === "") {
    return "0%";
  }
  
  const cleanValue = value.toString().replace(/[^\d.-]/g, '').trim();
  if (cleanValue === "" || cleanValue === "0") {
    return "0%";
  }
  
  const numValue = parseFloat(cleanValue);
  if (isNaN(numValue)) {
    return "0%";
  }
  
  return `${numValue}%`;
};

export function AssuranceTable({ viewMode = 'table', onAddPolicy }: AssuranceTableProps) {
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

  // Note: Add policy functionality moved to parent component

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
  
  // Track which field is being edited to prevent jumping
  const [editingField, setEditingField] = useState<string | null>(null);

  // Note: handleAddPolicy moved to parent component

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

  // Note: Policy deletion removed - only individual owners/beneficiaries can be deleted

  const handleInputBlur = useCallback((id: number, field: keyof Assurance, value: string, element: HTMLInputElement, fieldType?: string) => {
    let formattedValue;
    
    // Special handling for years fields
    if (fieldType === 'years') {
      formattedValue = formatYearsValue(value);
    } else if (fieldType === 'percentage') {
      formattedValue = formatPercentageValue(value);
    } else {
      formattedValue = formatCurrencyValue(value, fieldType || '');
    }
    
    // Update the DOM directly to avoid re-render jump
    if (formattedValue !== value) {
      element.value = formattedValue;
    }
    
    // Only update if the actual value changed (not just formatting)
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy && policy[field] !== formattedValue) {
      handleUpdatePolicy(id, field, formattedValue);
    }
  }, [policies, handleUpdatePolicy]);

  // Handle per-beneficiary array updates for toggle values
  const handleArrayFieldUpdate = useCallback((id: number, field: keyof Assurance, index: number, value: string | boolean) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (!policy) return;

    let updatedArray;
    if (field === 'amountToggles') {
      updatedArray = [...(policy.amountToggles || [true])];
      updatedArray[index] = value as boolean;
    } else if (field === 'amountYearsValues') {
      updatedArray = [...(policy.amountYearsValues || ["0 years"])];
      updatedArray[index] = value as string;
    } else if (field === 'amountIncreaseValues') {
      updatedArray = [...(policy.amountIncreaseValues || ["0%"])];
      updatedArray[index] = value as string;
    } else {
      return;
    }

    executeUpdate(id, field, updatedArray);
  }, [policies, executeUpdate]);

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

  // Calculate totals - defined as separate function to avoid hook ordering issues
  const getTotals = useCallback((policies: Assurance[]) => ({
    deathBenefit: policies.reduce((sum, policy) => {
      // Sum all death benefits from the array
      const deathBenefitTotal = (policy.deathBenefits || []).reduce((benefitSum, benefit) => {
        return benefitSum + (parseFloat(benefit?.replace(/[^\d.-]/g, '') || '0') || 0);
      }, 0);
      return sum + deathBenefitTotal;
    }, 0),
    benefitSplit: policies.reduce((sum, policy) => {
      // Calculate total benefit split for this policy
      const totalDeathBenefit = (policy.deathBenefits || []).reduce((benefitSum, benefit) => {
        return benefitSum + (parseFloat(benefit?.replace(/[^\d.-]/g, '') || '0') || 0);
      }, 0);
      
      const policyBenefitSplitTotal = (policy.beneficiaryPercentages || []).reduce((benefitSum, percentage) => {
        const percentageValue = parseFloat(percentage.replace('%', '')) || 0;
        const benefitSplit = Math.round((totalDeathBenefit * percentageValue) / 100);
        return benefitSum + benefitSplit;
      }, 0);
      
      return sum + policyBenefitSplitTotal;
    }, 0),
    amount: policies.reduce((sum, policy) => {
      const value = parseFloat(policy.amount.replace(/[^\d.-]/g, '')) || 0;
      return sum + value;
    }, 0),
    premiumsByOthers: policies.reduce((sum, policy) => {
      const value = parseFloat(policy.premiumsByOthers.replace(/[^\d.-]/g, '')) || 0;
      return sum + value;
    }, 0),
    collateralSession: policies.reduce((sum, policy) => {
      const value = parseFloat(policy.collateralSession.replace(/[^\d.-]/g, '')) || 0;
      return sum + value;
    }, 0)
  }), []);

  // Calculate totals for this render
  const totals = useMemo(() => getTotals(filteredPolicies), [filteredPolicies, getTotals]);

  // Selection state for hybrid view
  const [selectedPolicyId, setSelectedPolicyId] = useState<number | null>(null);

  // Set default selection to first policy when entering hybrid view
  useEffect(() => {
    if (viewMode === 'hybrid' && filteredPolicies.length > 0 && selectedPolicyId === null) {
      setSelectedPolicyId(filteredPolicies[0].id);
    }
  }, [viewMode, filteredPolicies, selectedPolicyId]);

  // Hybrid view data preparation functions
  const getItemPreview = useCallback((policy: Assurance, isSelected: boolean) => {
    // Use the consolidated death benefit field rather than summing the array
    // This matches what's displayed in the main table
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

  // Table component
  const tableComponent = (
    <div className="space-y-6">
      {/* Note: Add Policy Button moved to parent component header */}

      {/* Table */}
      <table >
          <thead>
            <tr className="single-row-header">
              <th className="table-actions-cell">
                {onAddPolicy && (
                  <TableHeaderAddButton
                    onClick={onAddPolicy}
                    title="Add new policy"
                  />
                )}
              </th>
              <th className="table-header-base">Description</th>
              <th className="table-header-base">Owner</th>
              <th className="table-header-base">Life Assured</th>
              <th className="table-header-base">Death Benefit</th>
              <th className="table-header-base">Beneficiary</th>
              <th className="table-header-base">Benefit Split</th>
              <th className="table-header-base">Amount</th>
              <th className="table-header-base">Toggle</th>
              <th className="table-header-base">Years / %</th>
              <th className="table-header-base">Buy/Sell</th>
              <th className="table-header-base">Key Man</th>
              <th className="table-header-base">Excluded Estate Duty</th>
              <th className="table-header-base">Excluded Provisions</th>
              <th className="table-header-base">Premiums by Others</th>
              <th className="table-header-base">Collateral Session</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filteredPolicies.map((policy: Assurance, policyIndex: number) => {
              // Calculate max rows needed for this policy
              const maxRows = Math.max(policy.owners.length, policy.beneficiaries.length);
              
              return (
                <SafeFragment key={policy.id}>
                  {Array.from({ length: maxRows }, (_, rowIndex) => (
                    <tr 
                      key={`${policy.id}-${rowIndex}`} 
                      className={`hover:bg-neutral-50 ${
                        rowIndex === 0 && policyIndex > 0 ? 'policy-first-row' : ''
                      } ${
                        rowIndex === maxRows - 1 ? 'policy-last-row' : ''
                      }`}
                    >
                  {/* Actions - only show on first row */}
                  {rowIndex === 0 && (
                    <td className="table-actions-cell p-1 text-center align-top" rowSpan={maxRows}>
                      <ActionButtonGroup>
                        <DuplicateButton 
                          onClick={() => handleDuplicatePolicy(policy)} 
                          disabled={duplicateMutation.isPending}
                        />
                        <DeleteButton 
                          onClick={() => handleDeletePolicy(policy.id)} 
                          disabled={deleteMutation.isPending}
                        />
                      </ActionButtonGroup>
                    </td>
                  )}

                  {/* Description - only show on first row */}
                  {rowIndex === 0 && (
                    <td className="border border-neutral-300 p-1 align-top" rowSpan={maxRows}>
                      <input
                        key={`desc-${policy.id}`}
                        type="text"
                        defaultValue={formatTextValue(policy.description)}
                        placeholder="Enter details ..."
                        className={`table-input ${getFieldClass('text')} ${getValueClass(policy.description, 'text')}`}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => handleUpdatePolicy(policy.id, 'description', e.target.value)}
                      />
                    </td>
                  )}

                  {/* Owner */}
                  <td className="border border-neutral-300 p-1">
                    <EntityOwnerSelector
                      policyId={policy.id}
                      owners={policy.owners}
                      ownershipPercentages={policy.ownershipPercentages || ["100%"]}
                      onOwnerChange={handleOwnerChange}
                      onOwnershipPercentageChange={handleOwnershipPercentageChange}
                      onAddOwner={handleAddOwner}
                      onRemoveOwner={handleRemoveOwner}
                      rowIndex={rowIndex}
                      disabled={updateMutation.isPending}
                    />
                  </td>

                  {/* Life Assured */}
                  <td className="border border-neutral-300 p-1">
                    <div className="w-full min-w-[250px]">
                      <Select
                        value={(policy.lifeAssured || [])[rowIndex] || "none"}
                        onValueChange={(value) => {
                          const valueToStore = value === "none" ? "" : value;
                          handleLifeAssuredChange(policy.id, rowIndex, valueToStore);
                        }}
                        disabled={updateMutation.isPending}
                      >
                        <SelectTrigger className="w-full table-input">
                          <SelectValue placeholder="Select life assured..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Select life assured...</SelectItem>
                          {entities.map((client) => (
                            <SelectItem key={client.id} value={client.entityName}>
                              {client.entityName}
                              {client.entityType === "Primary entity" && " (Primary entity)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </td>

                  {/* Death Benefit */}
                  <td className="border border-neutral-300 p-1">
                    <input
                      type="text"
                      defaultValue={((policy.deathBenefits || [])[rowIndex] || "R 0")}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(((policy.deathBenefits || [])[rowIndex] || "R 0"), 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => {
                        let value = e.target.value.trim();
                        value = value.replace(/[^\d.-]/g, '');
                        
                        if (value === '' || value === '0') {
                          handleDeathBenefitChange(policy.id, rowIndex, 'R 0');
                          e.target.value = 'R 0';
                          return;
                        }
                        
                        if (!isNaN(parseFloat(value))) {
                          const numValue = parseFloat(value);
                          const formattedValue = `R ${numValue.toLocaleString()}`;
                          handleDeathBenefitChange(policy.id, rowIndex, formattedValue);
                          e.target.value = formattedValue;
                        } else {
                          handleDeathBenefitChange(policy.id, rowIndex, 'R 0');
                          e.target.value = 'R 0';
                        }
                      }}
                      disabled={updateMutation.isPending}
                    />
                  </td>



                  {/* Beneficiary */}
                  <td className="border border-neutral-300 p-1">
                    <EntityBeneficiarySelector
                      policyId={policy.id}
                      beneficiaries={policy.beneficiaries}
                      beneficiaryPercentages={policy.beneficiaryPercentages || ["100%"]}
                      onBeneficiaryChange={handleBeneficiaryChange}
                      onBeneficiaryPercentageChange={handleBeneficiaryPercentageChange}
                      onAddBeneficiary={handleAddBeneficiary}
                      onRemoveBeneficiary={handleRemoveBeneficiary}
                      rowIndex={rowIndex}
                      disabled={updateMutation.isPending}
                    />
                  </td>

                  {/* Benefit Split - calculated read-only field */}
                  <td className="border border-neutral-300 p-1">
                    {(() => {
                      const currentPercentage = (policy.beneficiaryPercentages || ["100%"])[rowIndex] || "0%";
                      // Calculate total death benefit across all Life Assured entries for this policy
                      const totalDeathBenefit = (policy.deathBenefits || []).reduce((sum, benefit) => {
                        return sum + (parseFloat(benefit?.replace(/[^\d.-]/g, '') || '0') || 0);
                      }, 0);
                      const percentage = parseFloat(currentPercentage.replace('%', '')) || 0;
                      const benefitSplit = Math.round((totalDeathBenefit * percentage) / 100);
                      
                      return (
                        <div className="calculated-field min-w-[100px] max-w-[140px] text-right">
                          R {benefitSplit.toLocaleString()}
                        </div>
                      );
                    })()}
                  </td>

                  {/* Amount - show for every beneficiary row */}
                  <td className="border border-neutral-300 p-1">
                    <input
                      key={`amount-${policy.id}-${rowIndex}`}
                      type="text"
                      defaultValue={policy.amount}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(policy.amount, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(policy.id, 'amount', e.target.value, e.target, 'amount')}
                      disabled={updateMutation.isPending}
                    />
                  </td>

                  {/* Toggle Button - show for every beneficiary row */}
                  <td className="border border-neutral-300 p-1">
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          const currentToggle = isAmountYearsMode(policy, rowIndex);
                          handleArrayFieldUpdate(policy.id, 'amountToggles', rowIndex, !currentToggle);
                        }}
                        className={`h-8 px-3 min-w-[48px] bg-[#E8F3F8] border border-[#E0E0E0] text-[#016991] hover:bg-[#D1E7F0] rounded-md flex items-center justify-center transition-colors text-sm font-medium ${
                          !getAmountControlsEnabled(policy, updateMutation.isPending) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                        disabled={!getAmountControlsEnabled(policy, updateMutation.isPending)}
                      >
                        {isAmountYearsMode(policy, rowIndex) ? 'Years' : '%'}
                      </button>
                    </div>
                  </td>

                  {/* Dynamic Field (Years OR Percentage) - show for every beneficiary row */}
                  <td className="border border-neutral-300 p-1">
                    {isAmountYearsMode(policy, rowIndex) ? (
                      // Years Mode
                      <input
                        key={`amount-years-${policy.id}-${rowIndex}`}
                        type="text"
                        defaultValue={formatYearsValue((policy.amountYearsValues || ["0 years"])[rowIndex] || "0 years")}
                        className={`table-input ${getFieldClass('years')} ${getValueClass((policy.amountYearsValues || ["0 years"])[rowIndex] || "0 years", 'years')} ${
                          !getAmountControlsEnabled(policy, updateMutation.isPending) ? 'bg-neutral-100 cursor-not-allowed' : ''
                        }`}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => {
                          const formattedValue = formatYearsValue(e.target.value);
                          e.target.value = formattedValue;
                          handleArrayFieldUpdate(policy.id, 'amountYearsValues', rowIndex, formattedValue);
                        }}
                        disabled={!getAmountControlsEnabled(policy, updateMutation.isPending)}
                      />
                    ) : (
                      // Percentage Mode
                      <input
                        key={`amount-increase-${policy.id}-${rowIndex}`}
                        type="text"
                        defaultValue={(policy.amountIncreaseValues || ["0%"])[rowIndex] || "0%"}
                        className={`table-input ${getFieldClass('percentage')} ${getValueClass((policy.amountIncreaseValues || ["0%"])[rowIndex] || "0%", 'percentage')} ${
                          !getAmountControlsEnabled(policy, updateMutation.isPending) ? 'bg-neutral-100 cursor-not-allowed' : ''
                        }`}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => {
                          const formattedValue = formatPercentageValue(e.target.value);
                          e.target.value = formattedValue;
                          handleArrayFieldUpdate(policy.id, 'amountIncreaseValues', rowIndex, formattedValue);
                        }}
                        disabled={!getAmountControlsEnabled(policy, updateMutation.isPending)}
                      />
                    )}
                  </td>

                  {/* Buy/Sell - only show on first row */}
                  <td className="border border-neutral-300 p-1 text-center">
                    {rowIndex === 0 && (
                      <input
                        key={`buy-sell-${policy.id}`}
                        type="checkbox"
                        defaultChecked={false}
                        className="rounded border-neutral-300"
                        onChange={(e) => handleUpdatePolicy(policy.id, 'description', e.target.checked ? 'checked' : 'unchecked')}
                      />
                    )}
                  </td>

                  {/* Key Man - only show on first row */}
                  <td className="border border-neutral-300 p-1 text-center">
                    {rowIndex === 0 && (
                      <input
                        key={`key-man-${policy.id}`}
                        type="checkbox"
                        defaultChecked={false}
                        className="rounded border-neutral-300"
                        onChange={(e) => handleUpdatePolicy(policy.id, 'description', e.target.checked ? 'checked' : 'unchecked')}
                      />
                    )}
                  </td>

                  {/* Excluded Estate Duty - only show on first row */}
                  <td className="border border-neutral-300 p-1 text-center">
                    {rowIndex === 0 && (
                      <input
                        key={`excluded-estate-${policy.id}`}
                        type="checkbox"
                        defaultChecked={false}
                        className="rounded border-neutral-300"
                        onChange={(e) => handleUpdatePolicy(policy.id, 'description', e.target.checked ? 'checked' : 'unchecked')}
                      />
                    )}
                  </td>

                  {/* Excluded Provisions - only show on first row */}
                  <td className="border border-neutral-300 p-1 text-center">
                    {rowIndex === 0 && (
                      <input
                        key={`excluded-provisions-${policy.id}`}
                        type="checkbox"
                        defaultChecked={false}
                        className="rounded border-neutral-300"
                        onChange={(e) => handleUpdatePolicy(policy.id, 'description', e.target.checked ? 'checked' : 'unchecked')}
                      />
                    )}
                  </td>

                  {/* Premiums by Others - only show on first row */}
                  <td className="border border-neutral-300 p-1">
                    {rowIndex === 0 && (
                      <input
                        key={`premiums-${policy.id}`}
                        type="text"
                        defaultValue={policy.premiumsByOthers}
                        className={`table-input ${getFieldClass('currency')} ${getValueClass(policy.premiumsByOthers, 'currency')}`}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => handleInputBlur(policy.id, 'premiumsByOthers', e.target.value, e.target, 'premiumsByOthers')}
                      />
                    )}
                  </td>

                  {/* Collateral Session - only show on first row */}
                  <td className="border border-neutral-300 p-1">
                    {rowIndex === 0 && (
                      <input
                        key={`collateral-${policy.id}`}
                        type="text"
                        defaultValue={policy.collateralSession}
                        className={`table-input ${getFieldClass('currency')} ${getValueClass(policy.collateralSession, 'currency')}`}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => handleInputBlur(policy.id, 'collateralSession', e.target.value, e.target, 'collateralSession')}
                      />
                    )}
                  </td>
                </tr>
                  ))}
                </SafeFragment>
              );
            })}
          </tbody>
          
          {/* Totals Footer - Match exact table structure */}
          <tfoot>
            <tr>
              {/* Actions column */}
              <td className="totals-cell-label"></td>
              {/* Description column */}
              <td className="totals-cell-label"></td>
              {/* Owner column */}
              <td className="totals-cell-label"></td>
              {/* Life Assured column */}
              <td className="totals-cell-label text-right">Totals</td>
              {/* Death Benefit column */}
              <td className="totals-cell-value">R {totals.deathBenefit.toLocaleString()}</td>
              {/* Beneficiary column */}
              <td className="totals-cell-label"></td>
              {/* Benefit Split column */}
              <td className="totals-cell-value">R {totals.benefitSplit.toLocaleString()}</td>
              {/* Amount column */}
              <td className="totals-cell-value">R {totals.amount.toLocaleString()}</td>
              {/* Toggle column */}
              <td className="totals-cell-label"></td>
              {/* Years/% column */}
              <td className="totals-cell-label"></td>
              {/* Buy/Sell column */}
              <td className="totals-cell-label"></td>
              {/* Key Man column */}
              <td className="totals-cell-label"></td>
              {/* Excluded Estate Duty column */}
              <td className="totals-cell-label"></td>
              {/* Excluded Provisions column */}
              <td className="totals-cell-label"></td>
              {/* Premiums by Others column */}
              <td className="totals-cell-value">R {totals.premiumsByOthers.toLocaleString()}</td>
              {/* Collateral Session column */}
              <td className="totals-cell-value">R {totals.collateralSession.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    );



  // Summary cards for hybrid view - clickable policy tabs
  const summaryCards = (
    <div>
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
        />
      ))}
    </div>
  );

  // Detail form for selected policy only - now using structured groups
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

  // Use the global hybrid view wrapper
  return (
    <HybridViewWrapper
      viewMode={viewMode}
      tableComponent={tableComponent}
      summaryCards={summaryCards}
      detailForms={detailForms}
      isUpdating={isUpdating}
      isEmpty={filteredPolicies.length === 0}
      emptyStateMessage="No assurance policies found"
    />
  );
}

export default AssuranceTable;