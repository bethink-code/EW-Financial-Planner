import React, { useState, useCallback, useMemo, memo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Copy, X } from "lucide-react";
import { getFieldClass, getFieldWidth } from "@/lib/design-tokens";
import { getCellClass } from "@/lib/field-types";
import { formatTextValue, getValueClass, isDefaultValue, handleDefaultValueFocus } from "@/lib/formatting";
import { apiRequest } from "@/lib/queryClient";
import { AddButton, DuplicateButton, DeleteButton, ActionButtonGroup } from "@/components/ui/action-buttons";
import { TableHeaderAddButton } from "@/components/ui/table-header-add-button";
import EntityOwnerSelector from "@/components/common/entity-owner-selector";
import EntityBeneficiarySelector from "@/components/common/entity-beneficiary-selector";
import { useDebouncedUpdate } from "@/hooks/use-debounced-update";
import { SafeFragment } from "@/lib/safe-fragment";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  // Update policy mutation
  const updateMutation = useMutation({
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

  // Delete policy mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest("DELETE", `/api/assurance/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assurance"] });
    },
  });

  // Duplicate policy mutation
  const duplicateMutation = useMutation({
    mutationFn: async (policy: Assurance) => {
      try {
        const newPolicy: InsertAssurance = {
          description: policy.description + " (Copy)",
          owners: [...policy.owners],
          beneficiaries: [...policy.beneficiaries],
          deathBenefit: policy.deathBenefit,
          amount: policy.amount,
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

  const handleInputBlur = useCallback((id: number, field: keyof Assurance, value: string, element: HTMLInputElement, fieldType: string) => {
    const formattedValue = formatCurrencyValue(value, fieldType);
    
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

  // Add owner to policy
  const handleAddOwner = useCallback((id: number) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy) {
      const newOwners = [...policy.owners, ""];
      const newOwnershipPercentages = [...(policy.ownershipPercentages || []), "0%"];
      handleUpdatePolicy(id, 'owners', newOwners);
      handleUpdatePolicy(id, 'ownershipPercentages', newOwnershipPercentages);
    }
  }, [policies, handleUpdatePolicy]);

  // Remove specific owner by index using splice method
  const handleRemoveOwner = useCallback((id: number, ownerIndex: number) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy && policy.owners.length > 1 && ownerIndex > 0) { // Protect first owner
      const newOwners = [...policy.owners];
      const newOwnershipPercentages = [...(policy.ownershipPercentages || [])];
      newOwners.splice(ownerIndex, 1);
      newOwnershipPercentages.splice(ownerIndex, 1);
      handleUpdatePolicy(id, 'owners', newOwners);
      handleUpdatePolicy(id, 'ownershipPercentages', newOwnershipPercentages);
    }
  }, [policies, handleUpdatePolicy]);

  // Add beneficiary to policy
  const handleAddBeneficiary = useCallback((id: number) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy) {
      const newBeneficiaries = [...policy.beneficiaries, ""];
      const newBeneficiaryPercentages = [...(policy.beneficiaryPercentages || []), "0%"];
      handleUpdatePolicy(id, 'beneficiaries', newBeneficiaries);
      handleUpdatePolicy(id, 'beneficiaryPercentages', newBeneficiaryPercentages);
    }
  }, [policies, handleUpdatePolicy]);

  // Remove specific beneficiary by index using splice method
  const handleRemoveBeneficiary = useCallback((id: number, beneficiaryIndex: number) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy && policy.beneficiaries.length > 1 && beneficiaryIndex > 0) { // Protect first beneficiary
      const newBeneficiaries = [...policy.beneficiaries];
      const newBeneficiaryPercentages = [...(policy.beneficiaryPercentages || [])];
      newBeneficiaries.splice(beneficiaryIndex, 1);
      newBeneficiaryPercentages.splice(beneficiaryIndex, 1);
      handleUpdatePolicy(id, 'beneficiaries', newBeneficiaries);
      handleUpdatePolicy(id, 'beneficiaryPercentages', newBeneficiaryPercentages);
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
      const value = parseFloat(policy.deathBenefit.replace(/[^\d.-]/g, '')) || 0;
      return sum + value;
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

  // Hybrid view data preparation functions
  const getSummaryItems = useCallback((totals: Record<string, number>, policies: Assurance[]) => [
    { label: 'Total Death Benefit', value: `R ${totals.deathBenefit.toLocaleString()}` },
    { label: 'Total Amount', value: `R ${totals.amount.toLocaleString()}` },
    { label: 'Premiums by Others', value: `R ${totals.premiumsByOthers.toLocaleString()}` },
    { label: 'Total Policies', value: policies.length.toString() }
  ], []);

  const getItemPreview = useCallback((policy: Assurance) => ({
    id: policy.id,
    title: formatTextValue(policy.description) || `Policy #${policy.id}`,
    subtitle: `Owner: ${policy.owners[0] || 'Unassigned'}`,
    primaryValue: policy.deathBenefit,
    secondaryInfo: policy.amount !== 'R 0' ? `Amount: ${policy.amount}` : undefined
  }), []);

  // Prepare summary items and preview items
  const summaryItems = useMemo(() => getSummaryItems(totals, filteredPolicies), [getSummaryItems, totals, filteredPolicies]);
  const previewItems = useMemo(() => filteredPolicies.slice(0, 5).map(getItemPreview), [filteredPolicies, getItemPreview]);
  const hasMoreItems = filteredPolicies.length > 5;
  const remainingCount = filteredPolicies.length - 5;

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
              <th>Description</th>
              <th>Owner</th>
              <th>Life Assured</th>
              <th>Death Benefit</th>
              <th>Beneficiary</th>
              <th>Amount</th>
              <th>Buy/Sell</th>
              <th>Key Man</th>
              <th>Excluded Estate Duty</th>
              <th>Excluded Provisions</th>
              <th>Premiums by Others</th>
              <th>Collateral Session</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filteredPolicies.map((policy: Assurance) => {
              // Calculate max rows needed for this policy
              const maxRows = Math.max(policy.owners.length, policy.beneficiaries.length);
              
              return (
                <SafeFragment key={policy.id}>
                  {Array.from({ length: maxRows }, (_, rowIndex) => (
                    <tr 
                      key={`${policy.id}-${rowIndex}`} 
                      className="hover:bg-neutral-50"
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

                  {/* Life Assured - only show on first row */}
                  {rowIndex === 0 && (
                    <td className="border border-neutral-300 p-1 align-top" rowSpan={maxRows}>
                      <input
                        key={`life-assured-${policy.id}`}
                        type="text"
                        defaultValue=""
                        placeholder="Enter details ..."
                        className={`table-input ${getFieldClass('text')} ${getValueClass("", 'text')}`}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => handleUpdatePolicy(policy.id, 'description', e.target.value)}
                      />
                    </td>
                  )}

                  {/* Death Benefit - only show on first row */}
                  {rowIndex === 0 && (
                    <td className="border border-neutral-300 p-1 align-top" rowSpan={maxRows}>
                      <input
                        key={`death-benefit-${policy.id}`}
                        type="text"
                        defaultValue={policy.deathBenefit}
                        className={`table-input ${getFieldClass('currency')} ${getValueClass(policy.deathBenefit, 'currency')}`}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => handleInputBlur(policy.id, 'deathBenefit', e.target.value, e.target, 'deathBenefit')}
                      />
                    </td>
                  )}

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

                  {/* Amount - only show on first row */}
                  {rowIndex === 0 && (
                    <td className="border border-neutral-300 p-1 align-top" rowSpan={maxRows}>
                      <input
                        key={`amount-${policy.id}`}
                        type="text"
                        defaultValue={policy.amount}
                        className={`table-input ${getFieldClass('currency')} ${getValueClass(policy.amount, 'currency')}`}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => handleInputBlur(policy.id, 'amount', e.target.value, e.target, 'amount')}
                      />
                    </td>
                  )}

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
          
          {/* Totals Footer */}
          <tfoot>
            <tr>
              <td className="totals-cell-label text-right" colSpan={4}>Totals</td>
              <td className="totals-cell-value">R {totals.deathBenefit.toLocaleString()}</td>
              <td className="totals-cell-label"></td>
              <td className="totals-cell-value">R {totals.amount.toLocaleString()}</td>
              <td className="totals-cell-label"></td>
              <td className="totals-cell-label"></td>
              <td className="totals-cell-label"></td>
              <td className="totals-cell-label"></td>
              <td className="totals-cell-value">R {totals.premiumsByOthers.toLocaleString()}</td>
              <td className="totals-cell-value">R {totals.collateralSession.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    );



  // Summary cards for hybrid view
  const summaryCards = (
    <>
      <HybridSummaryCard
        title="Assurance Summary"
        items={summaryItems}
        variant="default"
      />
      <div className="space-y-3">
        {previewItems.map((item) => (
          <HybridItemPreviewCard
            key={item.id}
            title={item.title}
            subtitle={item.subtitle}
            primaryValue={item.primaryValue}
            secondaryInfo={item.secondaryInfo}
            variant="blue"
          />
        ))}
        {hasMoreItems && (
          <div className="text-center text-sm text-neutral-600">
            +{remainingCount} more policies
          </div>
        )}
      </div>
    </>
  );

  // Detail forms for hybrid view
  const detailForms = (
    <>
      {filteredPolicies.map((policy: Assurance) => (
        <HybridDetailCard
          key={`form-${policy.id}`}
          title={formatTextValue(policy.description) || `Policy #${policy.id}`}
          onDuplicate={() => handleDuplicatePolicy(policy)}
          onDelete={() => handleDeletePolicy(policy.id)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <input
                  type="text"
                  defaultValue={policy.description}
                  className={`w-full table-input ${getValueClass(policy.description, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(policy.id, 'description', e.target.value, e.target, 'description')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Death Benefit</label>
                <input
                  type="text"
                  defaultValue={policy.deathBenefit}
                  className={`w-full table-input ${getValueClass(policy.deathBenefit, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(policy.id, 'deathBenefit', e.target.value, e.target, 'deathBenefit')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Amount</label>
                <input
                  type="text"
                  defaultValue={policy.amount}
                  className={`w-full table-input ${getValueClass(policy.amount, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(policy.id, 'amount', e.target.value, e.target, 'amount')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Premiums by Others</label>
                <input
                  type="text"
                  defaultValue={policy.premiumsByOthers}
                  className={`w-full table-input ${getValueClass(policy.premiumsByOthers, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(policy.id, 'premiumsByOthers', e.target.value, e.target, 'premiumsByOthers')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Collateral Session</label>
                <input
                  type="text"
                  defaultValue={policy.collateralSession}
                  className={`w-full table-input ${getValueClass(policy.collateralSession, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(policy.id, 'collateralSession', e.target.value, e.target, 'collateralSession')}
                />
              </div>
            </div>

            {/* Entity Management */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Life Assured</label>
                <input
                  type="text"
                  defaultValue={policy.lifeAssured}
                  className={`w-full table-input ${getValueClass(policy.lifeAssured, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(policy.id, 'lifeAssured', e.target.value, e.target, 'lifeAssured')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Owners</label>
                <EntityOwnerSelector
                  policyId={policy.id}
                  owners={policy.owners}
                  ownershipPercentages={policy.ownershipPercentages || []}
                  onOwnerChange={handleOwnerChange}
                  onOwnershipPercentageChange={handleOwnershipPercentageChange}
                  onAddOwner={handleAddOwner}
                  onRemoveOwner={handleRemoveOwner}
                  rowIndex={0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Beneficiaries</label>
                <EntityBeneficiarySelector
                  policyId={policy.id}
                  beneficiaries={policy.beneficiaries}
                  beneficiaryPercentages={policy.beneficiaryPercentages || []}
                  onBeneficiaryChange={handleBeneficiaryChange}
                  onBeneficiaryPercentageChange={handleBeneficiaryPercentageChange}
                  onAddBeneficiary={handleAddBeneficiary}
                  onRemoveBeneficiary={handleRemoveBeneficiary}
                  rowIndex={0}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Buy/Sell</label>
                  <Select
                    defaultValue={policy.buySell}
                    onValueChange={(value) => handleSelectChange(policy.id, 'buySell', value)}
                  >
                    <SelectTrigger className="table-input">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Key Man</label>
                  <Select
                    defaultValue={policy.keyMan}
                    onValueChange={(value) => handleSelectChange(policy.id, 'keyMan', value)}
                  >
                    <SelectTrigger className="table-input">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Excluded Estate Duty</label>
                  <Select
                    defaultValue={policy.excludedEstateDuty}
                    onValueChange={(value) => handleSelectChange(policy.id, 'excludedEstateDuty', value)}
                  >
                    <SelectTrigger className="table-input">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Excluded Provisions</label>
                <Select
                  defaultValue={policy.excludedProvisions}
                  onValueChange={(value) => handleSelectChange(policy.id, 'excludedProvisions', value)}
                >
                  <SelectTrigger className="table-input">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </HybridDetailCard>
      ))}
    </>
  );

  // Use the global hybrid view wrapper
  return (
    <HybridViewWrapper
      viewMode={viewMode}
      tableComponent={tableComponent}
      summaryCards={summaryCards}
      detailForms={detailForms}
      onAddItem={onAddPolicy}
      addButtonLabel="Add Policy"
      isUpdating={isUpdating}
      isEmpty={filteredPolicies.length === 0}
      emptyStateMessage="No assurance policies found"
    />
  );
}

export default AssuranceTable;