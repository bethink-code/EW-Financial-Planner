import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Copy } from "lucide-react";
import { getFieldClass, getFieldWidth } from "@/lib/design-tokens";
import { getValueClass, isDefaultValue, handleDefaultValueFocus, createEnhancedBlurHandler } from "@/lib/formatting";
import { apiRequest } from "@/lib/queryClient";
import { AddButton, DuplicateButton, DeleteButton, ActionButtonGroup } from "@/components/ui/action-buttons";
import type { Assurance, InsertAssurance } from "@shared/schema";

interface AssuranceTableProps {}

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

export function AssuranceTable({}: AssuranceTableProps) {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

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
          owner: policy.owner,
          additionalOwners: policy.additionalOwners,
          lifeAssured: policy.lifeAssured,
          deathBenefit: policy.deathBenefit,
          beneficiary: policy.beneficiary,
          benefitSplit: policy.benefitSplit,
          additionalBeneficiaries: policy.additionalBeneficiaries,
          additionalInfo: policy.additionalInfo,
          amount: policy.amount,
          buySell: policy.buySell,
          keyMan: policy.keyMan,
          premiumsByOthers: policy.premiumsByOthers,
          collateralSession: policy.collateralSession,
          excludedFromEstateDuty: policy.excludedFromEstateDuty,
          excludedFromProvisions: policy.excludedFromProvisions
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
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  // Note: Policy deletion removed - only individual owners/beneficiaries can be deleted

  const handleInputBlur = useCallback((id: number, field: keyof Assurance, value: string, element: HTMLInputElement) => {
    const formattedValue = formatCurrencyValue(value, field);
    if (formattedValue !== value) {
      element.value = formattedValue;
    }
    handleUpdatePolicy(id, field, formattedValue);
  }, [handleUpdatePolicy]);

  // Add owner to policy with sequential numbering
  const handleAddOwner = useCallback((id: number) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy) {
      let currentOwners = [];
      try {
        currentOwners = JSON.parse(policy.additionalOwners || "[]");
      } catch {
        currentOwners = [];
      }
      // Add new owner with next sequential number (length + 2 since O1 is main owner)
      const nextId = currentOwners.length + 2;
      const newOwnerId = `O${nextId}`;
      const newOwners = [...currentOwners, { id: newOwnerId, name: "Enter here ..." }];
      setIsUpdating(true);
      updateMutation.mutate({ id, updates: { additionalOwners: JSON.stringify(newOwners) } });
    }
  }, [policies, updateMutation]);

  // Remove specific owner by ID - keep original numbering
  const handleRemoveOwner = useCallback((id: number, ownerId: string) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy) {
      let currentOwners = [];
      try {
        currentOwners = JSON.parse(policy.additionalOwners || "[]");
      } catch {
        currentOwners = [];
      }
      // Filter out the deleted owner - keep original numbering for remaining owners
      const filteredOwners = currentOwners.filter((owner: any) => owner.id !== ownerId);
      
      setIsUpdating(true);
      updateMutation.mutate({ id, updates: { additionalOwners: JSON.stringify(filteredOwners) } });
    }
  }, [policies, updateMutation]);

  // Add beneficiary to policy with sequential numbering
  const handleAddBeneficiary = useCallback((id: number) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy) {
      let currentBeneficiaries = [];
      try {
        currentBeneficiaries = JSON.parse(policy.additionalBeneficiaries || "[]");
      } catch {
        currentBeneficiaries = [];
      }
      // Add new beneficiary with next sequential number (length + 2 since B1 is main beneficiary)
      const nextId = currentBeneficiaries.length + 2;
      const newBeneficiaryId = `B${nextId}`;
      const newBeneficiaries = [...currentBeneficiaries, { id: newBeneficiaryId, name: "Enter here ...", split: "0" }];
      setIsUpdating(true);
      updateMutation.mutate({ id, updates: { additionalBeneficiaries: JSON.stringify(newBeneficiaries) } });
    }
  }, [policies, updateMutation]);

  // Remove specific beneficiary by ID - keep original numbering
  const handleRemoveBeneficiary = useCallback((id: number, beneficiaryId: string) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy) {
      let currentBeneficiaries = [];
      try {
        currentBeneficiaries = JSON.parse(policy.additionalBeneficiaries || "[]");
      } catch {
        currentBeneficiaries = [];
      }
      // Filter out the deleted beneficiary - keep original numbering for remaining beneficiaries
      const filteredBeneficiaries = currentBeneficiaries.filter((beneficiary: any) => beneficiary.id !== beneficiaryId);
      
      setIsUpdating(true);
      updateMutation.mutate({ id, updates: { additionalBeneficiaries: JSON.stringify(filteredBeneficiaries) } });
    }
  }, [policies, updateMutation]);

  // Use policies directly without filtering
  const filteredPolicies = policies;

  // Calculate totals
  const totals = useMemo(() => {
    return {
      deathBenefit: filteredPolicies.reduce((sum: number, policy: Assurance) => {
        const value = parseFloat(policy.deathBenefit.replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      amount: filteredPolicies.reduce((sum: number, policy: Assurance) => {
        const value = parseFloat(policy.amount.replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      premiumsByOthers: filteredPolicies.reduce((sum: number, policy: Assurance) => {
        const value = parseFloat(policy.premiumsByOthers.replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      collateralSession: filteredPolicies.reduce((sum: number, policy: Assurance) => {
        const value = parseFloat(policy.collateralSession.replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0)
    };
  }, [filteredPolicies]);

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="text-neutral-500">Loading assurance policies...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Note: Add Policy Button moved to parent component header */}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-neutral-200 rounded-lg shadow-sm">
          <thead>
            <tr className="bg-primary/10 border-b border-border">
              <th className="px-3 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider w-16">Actions</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Description</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Owner</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Life Assured</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Death Benefit</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Beneficiary</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Additional Info</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Benefit Split</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Amount</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Buy/Sell</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Key Man</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Excluded Estate Duty</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Excluded Provisions</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Premiums by Others</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Collateral Session</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {filteredPolicies.map((policy: Assurance) => {
              // Parse additional owners with fallback for old format
              let additionalOwners = [];
              try {
                const parsed = JSON.parse(policy.additionalOwners || "[]");
                additionalOwners = Array.isArray(parsed) && parsed.every(item => typeof item === 'object' && item.id) 
                  ? parsed 
                  : parsed.map((name: string, index: number) => ({ id: `O${index + 2}`, name }));
              } catch {
                // Old format: string array, convert to new format
                additionalOwners = [];
              }
              const allOwners = [{ id: "O1", name: policy.owner }, ...additionalOwners];
              
              // Parse additional beneficiaries with fallback for old format
              let additionalBeneficiaries = [];
              try {
                const parsed = JSON.parse(policy.additionalBeneficiaries || "[]");
                additionalBeneficiaries = Array.isArray(parsed) && parsed.every(item => typeof item === 'object' && item.id) 
                  ? parsed 
                  : parsed.map((name: string, index: number) => ({ id: `B${index + 2}`, name, split: "0" }));
              } catch {
                // Old format: string array, convert to new format
                additionalBeneficiaries = [];
              }
              const allBeneficiaries = [
                { id: "B1", name: policy.beneficiary, split: policy.benefitSplit },
                ...additionalBeneficiaries
              ];
              
              // Calculate the maximum rows needed for this policy
              const maxRows = Math.max(allOwners.length, allBeneficiaries.length);
              
              return Array.from({ length: maxRows }, (_, rowIndex) => {
                // Create policy-specific variables to avoid cross-contamination
                const currentOwners = allOwners;
                const currentBeneficiaries = allBeneficiaries;
                
                return (
                <tr key={`${policy.id}-row-${rowIndex}`} className="hover:bg-neutral-50">
                  {/* Actions - rowSpan for main policy data - FIRST COLUMN */}
                  {rowIndex === 0 && (
                    <td rowSpan={maxRows} className="px-3 py-2 text-center align-top">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleDuplicatePolicy(policy)}
                          className="h-6 w-6 p-0 bg-white text-primary hover:text-primary hover:bg-blue-50 border border-primary rounded"
                          title="Duplicate policy"
                          disabled={isUpdating || duplicateMutation.isPending}
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeletePolicy(policy.id)}
                          className="h-6 w-6 p-0 bg-white text-[#4F4F4F] hover:text-red-600 hover:bg-red-50 border border-gray-300 rounded"
                          title="Delete policy"
                          disabled={isUpdating || deleteMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  )}
                  
                  {/* Description - rowSpan for main policy data */}
                  {rowIndex === 0 && (
                    <td rowSpan={maxRows} className="px-3 py-2 align-top">
                      <input
                        type="text"
                        defaultValue={policy.description || "Enter here ..."}
                        onFocus={handleDefaultValueFocus}
                        onBlur={createEnhancedBlurHandler(
                          (e) => handleUpdatePolicy(policy.id, 'description', e.target.value),
                          'text'
                        )}
                        className={`${getFieldClass("text")} ${getValueClass(policy.description || "Enter here ...", 'text')}`} 
                        disabled={isUpdating}
                      />
                    </td>
                  )}
                  
                  {/* Owner column */}
                  <td className="px-3 py-2">
                    {rowIndex < currentOwners.length ? (
                      <div className="flex items-center space-x-1">
                        {rowIndex > 0 && (
                          <span className="text-blue-500 mr-1">↳</span>
                        )}
                        {rowIndex === 0 && (
                          <AddButton
                            onClick={() => handleAddOwner(policy.id)}
                            className="mr-1"
                          />
                        )}
                        <input
                          type="text"
                          key={`owner-${policy.id}-${rowIndex}-${currentOwners[rowIndex].id}`}
                          defaultValue={currentOwners[rowIndex].name || "Enter here ..."}
                          onFocus={handleDefaultValueFocus}
                          onBlur={createEnhancedBlurHandler((e) => {
                            if (rowIndex === 0) {
                              handleUpdatePolicy(policy.id, 'owner', e.target.value);
                            } else {
                              let ownersToUpdate = [];
                              try {
                                ownersToUpdate = JSON.parse(policy.additionalOwners || "[]");
                              } catch {
                                ownersToUpdate = [];
                              }
                              const updatedOwners = ownersToUpdate.map((o: any) => 
                                o.id === currentOwners[rowIndex].id ? { ...o, name: e.target.value } : o
                              );
                              updateMutation.mutate({ id: policy.id, updates: { additionalOwners: JSON.stringify(updatedOwners) } });
                            }
                          }, 'text')}
                          className={`${getFieldClass("text")} ${getValueClass(currentOwners[rowIndex].name || "Enter here ...", 'text')}`} 
                          disabled={isUpdating}
                        />
                        {rowIndex > 0 && rowIndex < currentOwners.length && currentOwners[rowIndex] && (
                          <DeleteButton
                            onClick={() => handleRemoveOwner(policy.id, currentOwners[rowIndex].id)}
                          />
                        )}
                      </div>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>
                  {/* Life Assured - rowSpan for main policy data */}
                  {rowIndex === 0 && (
                    <td rowSpan={maxRows} className="px-3 py-2 align-top">
                      <input
                        type="text"
                        defaultValue={policy.lifeAssured || "Enter here ..."}
                        onFocus={handleDefaultValueFocus}
                        onBlur={createEnhancedBlurHandler(
                          (e) => handleUpdatePolicy(policy.id, 'lifeAssured', e.target.value),
                          'text'
                        )}
                        className={`${getFieldClass("text")} ${getValueClass(policy.lifeAssured || "Enter here ...", 'text')}`} 
                        disabled={isUpdating}
                      />
                    </td>
                  )}
                  
                  {/* Death Benefit - rowSpan for main policy data */}
                  {rowIndex === 0 && (
                    <td rowSpan={maxRows} className="px-3 py-2 align-top">
                      <input
                        type="text"
                        defaultValue={formatCurrencyValue(policy.deathBenefit, 'deathBenefit')}
                        onBlur={(e) => handleInputBlur(policy.id, 'deathBenefit', e.target.value, e.target)}
                        className={`${getFieldClass("amount")} ${getValueClass(formatCurrencyValue(policy.deathBenefit, 'deathBenefit'), 'currency')}`} 
                        disabled={isUpdating}
                      />
                    </td>
                  )}
                  
                  {/* Beneficiary column */}
                  <td className="px-3 py-2">
                    {rowIndex < currentBeneficiaries.length ? (
                      <div className="flex items-center space-x-1">
                        {rowIndex > 0 && (
                          <span className="text-green-500 mr-1">↳</span>
                        )}
                        {rowIndex === 0 && (
                          <AddButton
                            onClick={() => handleAddBeneficiary(policy.id)}
                            className="mr-1"
                          />
                        )}
                        <input
                          type="text"
                          key={`beneficiary-${policy.id}-${rowIndex}-${currentBeneficiaries[rowIndex].id}`}
                          defaultValue={currentBeneficiaries[rowIndex].name || "Enter here ..."}
                          onFocus={handleDefaultValueFocus}
                          onBlur={createEnhancedBlurHandler((e) => {
                            if (rowIndex === 0) {
                              handleUpdatePolicy(policy.id, 'beneficiary', e.target.value);
                            } else {
                              let beneficiariesToUpdate = [];
                              try {
                                beneficiariesToUpdate = JSON.parse(policy.additionalBeneficiaries || "[]");
                              } catch {
                                beneficiariesToUpdate = [];
                              }
                              const updatedBeneficiaries = beneficiariesToUpdate.map((b: any) => 
                                b.id === currentBeneficiaries[rowIndex].id ? { ...b, name: e.target.value } : b
                              );
                              updateMutation.mutate({ id: policy.id, updates: { additionalBeneficiaries: JSON.stringify(updatedBeneficiaries) } });
                            }
                          }, 'text')}
                          className={`${getFieldClass("text")} ${getValueClass(currentBeneficiaries[rowIndex].name || "Enter here ...", 'text')}`} 
                          disabled={isUpdating}
                        />
                        {rowIndex > 0 && rowIndex < currentBeneficiaries.length && currentBeneficiaries[rowIndex] && (
                          <DeleteButton
                            onClick={() => handleRemoveBeneficiary(policy.id, currentBeneficiaries[rowIndex].id)}
                          />
                        )}
                      </div>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>
                  
                  {/* Additional Info - rowSpan for main policy data */}
                  {rowIndex === 0 && (
                    <td rowSpan={maxRows} className="px-3 py-2 align-top">
                      <input
                        type="text"
                        defaultValue={policy.additionalInfo || "Enter here ..."}
                        onFocus={handleDefaultValueFocus}
                        onBlur={createEnhancedBlurHandler(
                          (e) => handleUpdatePolicy(policy.id, 'additionalInfo', e.target.value),
                          'text'
                        )}
                        className={`${getFieldClass("text")} ${getValueClass(policy.additionalInfo || "Enter here ...", 'text')}`} 
                        disabled={isUpdating}
                      />
                    </td>
                  )}
                  
                  {/* Benefit Split */}
                  <td className="px-3 py-2 text-sm text-neutral-700 text-right bg-neutral-100">
                    {rowIndex < currentBeneficiaries.length ? 
                      formatCurrencyValue(currentBeneficiaries[rowIndex].split, 'percentage') : 
                      '-'
                    }
                  </td>
                  
                  {/* Amount - rowSpan for main policy data */}
                  {rowIndex === 0 && (
                    <td rowSpan={maxRows} className="px-3 py-2 align-top">
                      <input
                        type="text"
                        defaultValue={formatCurrencyValue(policy.amount, 'amount')}
                        onBlur={(e) => handleInputBlur(policy.id, 'amount', e.target.value, e.target)}
                        className={`${getFieldClass("amount")} ${getValueClass(formatCurrencyValue(policy.amount, 'amount'), 'currency')}`} 
                        disabled={isUpdating}
                      />
                    </td>
                  )}
                  
                  {/* Checkboxes - rowSpan for main policy data */}
                  {rowIndex === 0 && (
                    <>
                      <td rowSpan={maxRows} className="px-3 py-2 text-center align-top">
                        <input
                          type="checkbox"
                          checked={policy.buySell}
                          onChange={(e) => handleUpdatePolicy(policy.id, 'buySell', e.target.checked)}
                          className="h-4 w-4 text-blue-600 bg-primary/5 border-neutral-300 rounded focus:ring-primary focus:ring-2"
                          disabled={isUpdating}
                        />
                      </td>
                      <td rowSpan={maxRows} className="px-3 py-2 text-center align-top">
                        <input
                          type="checkbox"
                          checked={policy.keyMan}
                          onChange={(e) => handleUpdatePolicy(policy.id, 'keyMan', e.target.checked)}
                          className="h-4 w-4 text-blue-600 bg-primary/5 border-neutral-300 rounded focus:ring-primary focus:ring-2"
                          disabled={isUpdating}
                        />
                      </td>
                      <td rowSpan={maxRows} className="px-3 py-2 text-center align-top">
                        <input
                          type="checkbox"
                          checked={policy.excludedFromEstateDuty}
                          onChange={(e) => handleUpdatePolicy(policy.id, 'excludedFromEstateDuty', e.target.checked)}
                          className="h-4 w-4 text-blue-600 bg-white border-neutral-300 rounded focus:ring-primary focus:ring-2"
                          disabled={isUpdating}
                        />
                      </td>
                      <td rowSpan={maxRows} className="px-3 py-2 text-center align-top">
                        <input
                          type="checkbox"
                          checked={policy.excludedFromProvisions}
                          onChange={(e) => handleUpdatePolicy(policy.id, 'excludedFromProvisions', e.target.checked)}
                          className="h-4 w-4 text-blue-600 bg-white border-neutral-300 rounded focus:ring-primary focus:ring-2"
                          disabled={isUpdating}
                        />
                      </td>
                      <td rowSpan={maxRows} className="px-3 py-2 align-top">
                        <input
                          type="text"
                          defaultValue={formatCurrencyValue(policy.premiumsByOthers, 'premiumsByOthers')}
                          onBlur={(e) => handleInputBlur(policy.id, 'premiumsByOthers', e.target.value, e.target)}
                          className={`${getFieldClass("amount")} ${getValueClass(formatCurrencyValue(policy.premiumsByOthers, 'premiumsByOthers'), 'currency')}`} 
                          disabled={isUpdating}
                        />
                      </td>
                      <td rowSpan={maxRows} className="px-3 py-2 align-top">
                        <input
                          type="text"
                          defaultValue={formatCurrencyValue(policy.collateralSession, 'collateralSession')}
                          onBlur={(e) => handleInputBlur(policy.id, 'collateralSession', e.target.value, e.target)}
                          className={`${getFieldClass("amount")} ${getValueClass(formatCurrencyValue(policy.collateralSession, 'collateralSession'), 'currency')}`} 
                          disabled={isUpdating}
                        />
                      </td>
                    </>
                  )}
                </tr>
                );
              });
            })}
            
            {/* Total Row */}
            {filteredPolicies.length > 0 && (
              <tr className="bg-neutral-100 border-t-2 border-neutral-300 font-bold">
                <td className="px-3 py-2"></td> {/* Actions column - empty */}
                <td className="px-3 py-2 text-sm font-bold text-neutral-800">Total</td> {/* Description */}
                <td colSpan={3} className="px-3 py-2"></td> {/* Owner, Life Assured, Death Benefit */}
                <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                  {formatCurrencyValue(totals.deathBenefit.toString(), 'amount')}
                </td>
                <td colSpan={3} className="px-3 py-2"></td> {/* Beneficiary, Additional Info, Benefit Split */}
                <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                  {formatCurrencyValue(totals.amount.toString(), 'amount')}
                </td>
                <td colSpan={4} className="px-3 py-2"></td> {/* Buy/Sell, Key Man, Excluded Estate Duty, Excluded Provisions */}
                <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                  {formatCurrencyValue(totals.premiumsByOthers.toString(), 'amount')}
                </td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                  {formatCurrencyValue(totals.collateralSession.toString(), 'amount')}
                </td>
              </tr>
            )}
            
            {filteredPolicies.length === 0 && (
              <tr>
                <td colSpan={15} className="px-3 py-8 text-center text-neutral-500">
                  No assurance policies found. Add new policies using the header button.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssuranceTable;