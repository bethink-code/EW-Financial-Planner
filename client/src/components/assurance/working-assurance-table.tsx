import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Copy } from "lucide-react";
import { getFieldClass, getFieldWidth } from "@/lib/design-tokens";
import { getCellClass } from "@/lib/field-types";
import { formatTextValue, getValueClass, isDefaultValue, handleDefaultValueFocus } from "@/lib/formatting";
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

  // Add owner to policy
  const handleAddOwner = useCallback((id: number) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy) {
      const newOwners = [...policy.owners, ""];
      setIsUpdating(true);
      updateMutation.mutate({ id, updates: { owners: newOwners } });
    }
  }, [policies, updateMutation]);

  // Remove specific owner by index using splice method
  const handleRemoveOwner = useCallback((id: number, ownerIndex: number) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy && policy.owners.length > 1 && ownerIndex > 0) { // Protect first owner
      const newOwners = [...policy.owners];
      newOwners.splice(ownerIndex, 1);
      setIsUpdating(true);
      updateMutation.mutate({ id, updates: { owners: newOwners } });
    }
  }, [policies, updateMutation]);

  // Add beneficiary to policy
  const handleAddBeneficiary = useCallback((id: number) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy) {
      const newBeneficiaries = [...policy.beneficiaries, ""];
      setIsUpdating(true);
      updateMutation.mutate({ id, updates: { beneficiaries: newBeneficiaries } });
    }
  }, [policies, updateMutation]);

  // Remove specific beneficiary by index using splice method
  const handleRemoveBeneficiary = useCallback((id: number, beneficiaryIndex: number) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy && policy.beneficiaries.length > 1 && beneficiaryIndex > 0) { // Protect first beneficiary
      const newBeneficiaries = [...policy.beneficiaries];
      newBeneficiaries.splice(beneficiaryIndex, 1);
      setIsUpdating(true);
      updateMutation.mutate({ id, updates: { beneficiaries: newBeneficiaries } });
    }
  }, [policies, updateMutation]);

  // Update owner name
  const handleOwnerChange = useCallback((id: number, ownerIndex: number, newOwner: string) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy) {
      const updatedOwners = [...policy.owners];
      updatedOwners[ownerIndex] = newOwner;
      updateMutation.mutate({ id, updates: { owners: updatedOwners } });
    }
  }, [policies, updateMutation]);

  // Update beneficiary name
  const handleBeneficiaryChange = useCallback((id: number, beneficiaryIndex: number, newBeneficiary: string) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy) {
      const updatedBeneficiaries = [...policy.beneficiaries];
      updatedBeneficiaries[beneficiaryIndex] = newBeneficiary;
      updateMutation.mutate({ id, updates: { beneficiaries: updatedBeneficiaries } });
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
      <table >
          <thead>
            <tr className="border-b border-border">
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
          <tbody className="divide-y divide-neutral-200">
            {filteredPolicies.map((policy: Assurance) => {
              // Calculate max rows needed for this policy
              const maxRows = Math.max(policy.owners.length, policy.beneficiaries.length);
              
              return Array.from({ length: maxRows }, (_, rowIndex) => (
                <tr 
                  key={`${policy.id}-${rowIndex}-${policy.owners.length}-${policy.beneficiaries.length}`} 
                  className="hover:bg-neutral-50"
                >
                  {/* Actions - only show on first row */}
                  <td className="table-actions-cell p-1 text-center">
                    {rowIndex === 0 && (
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
                    )}
                  </td>

                  {/* Description - only show on first row */}
                  <td className="border border-neutral-300 p-1">
                    {rowIndex === 0 && (
                      <input
                        type="text"
                        defaultValue={formatTextValue(policy.description)}
                        placeholder="Enter details ..."
                        className={`table-input ${getFieldClass('text')} ${getValueClass(policy.description, 'text')}`}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => handleUpdatePolicy(policy.id, 'description', e.target.value)}
                      />
                    )}
                  </td>

                  {/* Owner */}
                  <td className="border border-neutral-300 p-1">
                    {rowIndex < policy.owners.length && (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          defaultValue={formatTextValue(policy.owners[rowIndex])}
                          placeholder="Enter details ..."
                          className={`table-input ${getFieldClass('text')} flex-1 ${getValueClass(policy.owners[rowIndex], 'text')}`}
                          onFocus={handleDefaultValueFocus}
                          onBlur={(e) => handleOwnerChange(policy.id, rowIndex, e.target.value)}
                        />
                        {rowIndex === 0 ? (
                          <AddButton
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddOwner(policy.id);
                            }}
                            size="sm"
                          />
                        ) : (
                          <DeleteButton
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRemoveOwner(policy.id, rowIndex);
                            }}
                            size="sm"
                          />
                        )}
                      </div>
                    )}
                  </td>

                  {/* Life Assured - only show on first row */}
                  <td className="border border-neutral-300 p-1">
                    {rowIndex === 0 && (
                      <input
                        type="text"
                        defaultValue=""
                        placeholder="Enter details ..."
                        className={`table-input ${getFieldClass('text')} ${getValueClass("", 'text')}`}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => handleUpdatePolicy(policy.id, 'description', e.target.value)}
                      />
                    )}
                  </td>

                  {/* Death Benefit - only show on first row */}
                  <td className="border border-neutral-300 p-1">
                    {rowIndex === 0 && (
                      <input
                        type="text"
                        defaultValue={policy.deathBenefit}
                        className={`table-input ${getFieldClass('currency')} ${getValueClass(policy.deathBenefit, 'currency')}`}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => handleInputBlur(policy.id, 'deathBenefit', e.target.value, e.target)}
                      />
                    )}
                  </td>

                  {/* Beneficiary */}
                  <td className="border border-neutral-300 p-1">
                    {rowIndex < policy.beneficiaries.length && (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          defaultValue={formatTextValue(policy.beneficiaries[rowIndex])}
                          placeholder="Enter details ..."
                          className={`table-input ${getFieldClass('text')} flex-1 ${getValueClass(policy.beneficiaries[rowIndex], 'text')}`}
                          onFocus={handleDefaultValueFocus}
                          onBlur={(e) => handleBeneficiaryChange(policy.id, rowIndex, e.target.value)}
                        />
                        {rowIndex === 0 ? (
                          <AddButton
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddBeneficiary(policy.id);
                            }}
                            size="sm"
                          />
                        ) : (
                          <DeleteButton
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRemoveBeneficiary(policy.id, rowIndex);
                            }}
                            size="sm"
                          />
                        )}
                      </div>
                    )}
                  </td>

                  {/* Additional Info - only show on first row */}
                  <td className="border border-neutral-300 p-1">
                    {rowIndex === 0 && (
                      <input
                        type="text"
                        defaultValue={policy.additionalInfo}
                        placeholder="Enter details ..."
                        className={`table-input ${getFieldClass('text')} ${getValueClass(policy.additionalInfo, 'text')}`}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => handleUpdatePolicy(policy.id, 'additionalInfo', e.target.value)}
                      />
                    )}
                  </td>

                  {/* Benefit Split - only show on first row */}
                  <td className="border border-neutral-300 p-1">
                    {rowIndex === 0 && (
                      <input
                        type="text"
                        defaultValue={policy.benefitSplit}
                        className={`table-input ${getFieldClass('percentage')} ${getValueClass(policy.benefitSplit, 'percentage')}`}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => handleInputBlur(policy.id, 'benefitSplit', e.target.value, e.target)}
                      />
                    )}
                  </td>

                  {/* Amount - only show on first row */}
                  <td className="border border-neutral-300 p-1">
                    {rowIndex === 0 && (
                      <input
                        type="text"
                        defaultValue={policy.amount}
                        className={`table-input ${getFieldClass('currency')} ${getValueClass(policy.amount, 'currency')}`}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => handleInputBlur(policy.id, 'amount', e.target.value, e.target)}
                      />
                    )}
                  </td>

                  {/* Buy/Sell - only show on first row */}
                  <td className="border border-neutral-300 p-1 text-center">
                    {rowIndex === 0 && (
                      <input
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
                        type="text"
                        defaultValue={policy.premiumsByOthers}
                        className={`table-input ${getFieldClass('currency')} ${getValueClass(policy.premiumsByOthers, 'currency')}`}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => handleInputBlur(policy.id, 'premiumsByOthers', e.target.value, e.target)}
                      />
                    )}
                  </td>

                  {/* Collateral Session - only show on first row */}
                  <td className="border border-neutral-300 p-1">
                    {rowIndex === 0 && (
                      <input
                        type="text"
                        defaultValue={policy.collateralSession}
                        className={`table-input ${getFieldClass('currency')} ${getValueClass(policy.collateralSession, 'currency')}`}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => handleInputBlur(policy.id, 'collateralSession', e.target.value, e.target)}
                      />
                    )}
                  </td>
                </tr>
              ));
            }).flat()}

          </tbody>
          
          {/* Totals Footer */}
          <tfoot>
            <tr>
              <td className="totals-cell-label text-right" colSpan={4}>Totals</td>
              <td className="totals-cell-value">R {totals.deathBenefit.toLocaleString()}</td>
              <td className="totals-cell-label"></td>
              <td className="totals-cell-label"></td>
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
}

export default AssuranceTable;