import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { AddButton } from "@/components/ui/action-buttons";
import type { Assurance, InsertAssurance } from "@shared/schema";

interface AssuranceTableProps {
  searchTerm: string;
}

// Format currency value with R prefix and proper formatting
const formatCurrencyValue = (value: string, fieldType: string): string => {
  if (!value?.trim()) return value;
  
  // Remove existing formatting
  const cleanValue = value.replace(/[^\d.-]/g, '');
  if (!cleanValue || isNaN(parseFloat(cleanValue))) return value;
  
  const numValue = parseFloat(cleanValue);
  
  if (fieldType.includes('percentage') || fieldType.includes('Percentage') || fieldType.includes('Split')) {
    return `${numValue}%`;
  }
  
  // Currency fields
  if (fieldType.includes('amount') || fieldType.includes('Amount') || fieldType.includes('benefit') || fieldType.includes('Benefit') || fieldType.includes('premium') || fieldType.includes('Premium') || fieldType.includes('collateral') || fieldType.includes('Collateral')) {
    return `R ${numValue.toLocaleString()}`;
  }
  
  return value;
};

export function AssuranceTable({ searchTerm }: AssuranceTableProps) {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch assurance policies
  const { data: policies = [], isLoading } = useQuery({
    queryKey: ["/api/assurance", { search: searchTerm }],
    queryFn: async () => {
      const response = await fetch("/api/assurance" + (searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ""));
      if (!response.ok) throw new Error('Failed to fetch assurance policies');
      return response.json();
    }
  });

  // Add new policy mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      try {
        const newPolicy: InsertAssurance = {
          description: "",
          owner: "Donald Edwards",
          additionalOwners: [],
          lifeAssured: "",
          deathBenefit: "0",
          beneficiary: "",
          benefitSplit: "0",
          additionalBeneficiaries: [],
          additionalBenefitSplits: [],
          amount: "0",
          buySell: false,
          keyMan: false,
          premiumsByOthers: "0",
          collateralSession: "0",
          excludedFromEstateDuty: false,
          excludedFromProvisions: false
        };
        const response = await apiRequest("POST", "/api/assurance", newPolicy);
        return await response.json();
      } catch (error) {
        console.error('Add policy error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assurance"] });
    },
    onError: (error) => {
      console.error('Add mutation error:', error);
    }
  });

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
      queryClient.invalidateQueries({ queryKey: ["/api/assurance"] });
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

  const handleAddPolicy = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  const handleUpdatePolicy = useCallback((id: number, field: keyof Assurance, value: string | boolean | string[]) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  // Note: Policy deletion removed - only individual owners/beneficiaries can be deleted

  const handleInputBlur = useCallback((id: number, field: keyof Assurance, value: string) => {
    const formattedValue = formatCurrencyValue(value, field);
    handleUpdatePolicy(id, field, formattedValue);
  }, [handleUpdatePolicy]);

  // Add owner to policy
  const handleAddOwner = useCallback((id: number) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy) {
      const newOwners = [...(policy.additionalOwners || []), "New Owner"];
      setIsUpdating(true);
      updateMutation.mutate({ id, updates: { additionalOwners: newOwners } });
    }
  }, [policies, updateMutation]);

  // Remove specific owner
  const handleRemoveOwner = useCallback((id: number, ownerIndex: number) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy && ownerIndex > 0) { // Can't remove main owner (index 0)
      const newOwners = [...(policy.additionalOwners || [])];
      newOwners.splice(ownerIndex - 1, 1); // Convert to additional owners array index
      setIsUpdating(true);
      updateMutation.mutate({ id, updates: { additionalOwners: newOwners } });
    }
  }, [policies, updateMutation]);

  // Add beneficiary to policy  
  const handleAddBeneficiary = useCallback((id: number) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy) {
      const newBeneficiaries = [...(policy.additionalBeneficiaries || []), "New Beneficiary"];
      const newSplits = [...(policy.additionalBenefitSplits || []), "0"];
      setIsUpdating(true);
      updateMutation.mutate({ 
        id, 
        updates: { 
          additionalBeneficiaries: newBeneficiaries,
          additionalBenefitSplits: newSplits
        }
      });
    }
  }, [policies, updateMutation]);

  // Remove specific beneficiary
  const handleRemoveBeneficiary = useCallback((id: number, beneficiaryIndex: number) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy && beneficiaryIndex > 0) { // Can't remove main beneficiary (index 0)
      const newBeneficiaries = [...(policy.additionalBeneficiaries || [])];
      const newSplits = [...(policy.additionalBenefitSplits || [])];
      newBeneficiaries.splice(beneficiaryIndex - 1, 1); // Convert to additional beneficiaries array index
      newSplits.splice(beneficiaryIndex - 1, 1);
      setIsUpdating(true);
      updateMutation.mutate({ 
        id, 
        updates: { 
          additionalBeneficiaries: newBeneficiaries,
          additionalBenefitSplits: newSplits
        }
      });
    }
  }, [policies, updateMutation]);

  // Filter policies based on search term
  const filteredPolicies = useMemo(() => {
    if (!searchTerm.trim()) return policies;
    
    const lowerQuery = searchTerm.toLowerCase();
    return policies.filter((policy: Assurance) =>
      policy.description.toLowerCase().includes(lowerQuery) ||
      policy.owner.toLowerCase().includes(lowerQuery) ||
      policy.lifeAssured.toLowerCase().includes(lowerQuery) ||
      policy.beneficiary.toLowerCase().includes(lowerQuery)
    );
  }, [policies, searchTerm]);

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
      {/* Add Policy Button */}
      <div className="flex justify-start">
        <AddButton
          onClick={handleAddPolicy}
          disabled={addMutation.isPending}
          className="px-4 py-2"
        >
          {addMutation.isPending ? "Adding Policy..." : "Add Policy"}
        </AddButton>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-neutral-200 rounded-lg shadow-sm">
          <thead>
            <tr className="bg-primary/10 border-b border-border">
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
              <th className="px-3 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {filteredPolicies.map((policy: Assurance) => {
              const allOwners = [policy.owner, ...(policy.additionalOwners || [])];
              const allBeneficiaries = [
                { name: policy.beneficiary, split: policy.benefitSplit },
                ...(policy.additionalBeneficiaries || []).map((name, index) => ({
                  name,
                  split: (policy.additionalBenefitSplits || [])[index] || "0"
                }))
              ];
              
              return allOwners.map((owner, ownerIndex) => (
                <tr key={`${policy.id}-owner-${ownerIndex}`} className="hover:bg-neutral-50">
                  {/* Description - rowSpan for main policy data */}
                  {ownerIndex === 0 && (
                    <td rowSpan={allOwners.length} className="px-3 py-2 align-top">
                      <input
                        type="text"
                        defaultValue={policy.description}
                        onBlur={(e) => handleUpdatePolicy(policy.id, 'description', e.target.value)}
                        className="table-input w-full px-2 py-1 text-sm"
                        disabled={isUpdating}
                      />
                    </td>
                  )}
                  
                  {/* Owner column with visual indicators for additional owners */}
                  <td className="px-3 py-2">
                    <div className="flex items-center space-x-1">
                      {ownerIndex > 0 && (
                        <span className="text-blue-500 mr-1">↳</span>
                      )}
                      <input
                        type="text"
                        defaultValue={owner}
                        onBlur={(e) => {
                          if (ownerIndex === 0) {
                            handleUpdatePolicy(policy.id, 'owner', e.target.value);
                          } else {
                            const newOwners = [...(policy.additionalOwners || [])];
                            newOwners[ownerIndex - 1] = e.target.value;
                            updateMutation.mutate({ id: policy.id, updates: { additionalOwners: newOwners } });
                          }
                        }}
                        className="table-input w-full px-2 py-1 text-sm border border-neutral-300 rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={isUpdating}
                      />
                      {ownerIndex === 0 && (
                        <button
                          onClick={() => handleAddOwner(policy.id)}
                          className="h-6 w-6 p-0 bg-blue-50 text-primary hover:bg-blue-100 border-0 rounded"
                          title="Add owner"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      )}
                      {ownerIndex > 0 && (
                        <button
                          onClick={() => handleRemoveOwner(policy.id, ownerIndex)}
                          className="h-6 w-6 p-0 bg-white text-[#4F4F4F] hover:text-red-600 hover:bg-red-50 border border-gray-300 rounded"
                          title="Remove owner"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </td>
                  {/* Life Assured - rowSpan for main policy data */}
                  {ownerIndex === 0 && (
                    <td rowSpan={allOwners.length} className="px-3 py-2 align-top">
                      <input
                        type="text"
                        defaultValue={policy.lifeAssured}
                        onBlur={(e) => handleUpdatePolicy(policy.id, 'lifeAssured', e.target.value)}
                        className="table-input w-full px-2 py-1 text-sm border border-neutral-300 rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={isUpdating}
                      />
                    </td>
                  )}
                  
                  {/* Death Benefit - rowSpan for main policy data */}
                  {ownerIndex === 0 && (
                    <td rowSpan={allOwners.length} className="px-3 py-2 align-top">
                      <input
                        type="text"
                        defaultValue={policy.deathBenefit}
                        onBlur={(e) => handleInputBlur(policy.id, 'deathBenefit', e.target.value)}
                        className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={isUpdating}
                      />
                    </td>
                  )}
                  
                  {/* Beneficiary - show based on owner index */}
                  <td className="px-3 py-2">
                    {ownerIndex < allBeneficiaries.length ? (
                      <div className="flex items-center space-x-1">
                        {ownerIndex > 0 && (
                          <span className="text-green-500 mr-1">↳</span>
                        )}
                        <input
                          type="text"
                          defaultValue={allBeneficiaries[ownerIndex].name}
                          onBlur={(e) => {
                            if (ownerIndex === 0) {
                              handleUpdatePolicy(policy.id, 'beneficiary', e.target.value);
                            } else {
                              const newBeneficiaries = [...(policy.additionalBeneficiaries || [])];
                              newBeneficiaries[ownerIndex - 1] = e.target.value;
                              updateMutation.mutate({ id: policy.id, updates: { additionalBeneficiaries: newBeneficiaries } });
                            }
                          }}
                          className="table-input w-full px-2 py-1 text-sm border border-neutral-300 rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          disabled={isUpdating}
                        />
                        {ownerIndex === 0 && (
                          <button
                            onClick={() => handleAddBeneficiary(policy.id)}
                            className="h-6 w-6 p-0 bg-blue-50 text-primary hover:bg-blue-100 border-0 rounded"
                            title="Add beneficiary"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        )}
                        {ownerIndex > 0 && (
                          <button
                            onClick={() => handleRemoveBeneficiary(policy.id, ownerIndex)}
                            className="h-6 w-6 p-0 bg-white text-[#4F4F4F] hover:text-red-600 hover:bg-red-50 border border-gray-300 rounded"
                            title="Remove beneficiary"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>
                  
                  {/* Additional Info - rowSpan for main policy data */}
                  {ownerIndex === 0 && (
                    <td rowSpan={allOwners.length} className="px-3 py-2 align-top">
                      <input
                        type="text"
                        defaultValue=""
                        onBlur={(e) => handleUpdatePolicy(policy.id, 'description', e.target.value)}
                        className="table-input w-full px-2 py-1 text-sm border border-neutral-300 rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={isUpdating}
                      />
                    </td>
                  )}
                  
                  {/* Benefit Split - show based on owner index */}
                  <td className="px-3 py-2 text-sm text-neutral-700 text-right bg-neutral-100">
                    {ownerIndex < allBeneficiaries.length ? 
                      formatCurrencyValue(allBeneficiaries[ownerIndex].split, 'percentage') : 
                      '-'
                    }
                  </td>
                  
                  {/* Amount - rowSpan for main policy data */}
                  {ownerIndex === 0 && (
                    <td rowSpan={allOwners.length} className="px-3 py-2 align-top">
                      <input
                        type="text"
                        defaultValue={policy.amount}
                        onBlur={(e) => handleInputBlur(policy.id, 'amount', e.target.value)}
                        className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={isUpdating}
                      />
                    </td>
                  )}
                  
                  {/* Checkboxes - rowSpan for main policy data */}
                  {ownerIndex === 0 && (
                    <>
                      <td rowSpan={allOwners.length} className="px-3 py-2 text-center align-top">
                        <input
                          type="checkbox"
                          checked={policy.buySell}
                          onChange={(e) => handleUpdatePolicy(policy.id, 'buySell', e.target.checked)}
                          className="h-4 w-4 text-blue-600 bg-primary/5 border-neutral-300 rounded focus:ring-primary focus:ring-2"
                          disabled={isUpdating}
                        />
                      </td>
                      <td rowSpan={allOwners.length} className="px-3 py-2 text-center align-top">
                        <input
                          type="checkbox"
                          checked={policy.keyMan}
                          onChange={(e) => handleUpdatePolicy(policy.id, 'keyMan', e.target.checked)}
                          className="h-4 w-4 text-blue-600 bg-primary/5 border-neutral-300 rounded focus:ring-primary focus:ring-2"
                          disabled={isUpdating}
                        />
                      </td>
                      <td rowSpan={allOwners.length} className="px-3 py-2 text-center align-top">
                        <input
                          type="checkbox"
                          checked={policy.excludedFromEstateDuty}
                          onChange={(e) => handleUpdatePolicy(policy.id, 'excludedFromEstateDuty', e.target.checked)}
                          className="h-4 w-4 text-blue-600 bg-white border-neutral-300 rounded focus:ring-primary focus:ring-2"
                          disabled={isUpdating}
                        />
                      </td>
                      <td rowSpan={allOwners.length} className="px-3 py-2 text-center align-top">
                        <input
                          type="checkbox"
                          checked={policy.excludedFromProvisions}
                          onChange={(e) => handleUpdatePolicy(policy.id, 'excludedFromProvisions', e.target.checked)}
                          className="h-4 w-4 text-blue-600 bg-white border-neutral-300 rounded focus:ring-primary focus:ring-2"
                          disabled={isUpdating}
                        />
                      </td>
                      <td rowSpan={allOwners.length} className="px-3 py-2 align-top">
                        <input
                          type="text"
                          defaultValue={policy.premiumsByOthers}
                          onBlur={(e) => handleInputBlur(policy.id, 'premiumsByOthers', e.target.value)}
                          className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          disabled={isUpdating}
                        />
                      </td>
                      <td rowSpan={allOwners.length} className="px-3 py-2 align-top">
                        <input
                          type="text"
                          defaultValue={policy.collateralSession}
                          onBlur={(e) => handleInputBlur(policy.id, 'collateralSession', e.target.value)}
                          className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          disabled={isUpdating}
                        />
                      </td>
                      <td rowSpan={allOwners.length} className="px-3 py-2 text-center align-top">
                        {/* Actions column - no policy delete button */}
                        <span className="text-neutral-400">-</span>
                      </td>
                    </>
                  )}
                </tr>
              ));
            })}
            
            {/* Total Row */}
            {filteredPolicies.length > 0 && (
              <tr className="bg-neutral-100 border-t-2 border-neutral-300 font-bold">
                <td className="px-3 py-2 text-sm font-bold text-neutral-800">Total</td>
                <td colSpan={3} className="px-3 py-2"></td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                  {formatCurrencyValue(totals.deathBenefit.toString(), 'amount')}
                </td>
                <td colSpan={3} className="px-3 py-2"></td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                  {formatCurrencyValue(totals.amount.toString(), 'amount')}
                </td>
                <td colSpan={4} className="px-3 py-2"></td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                  {formatCurrencyValue(totals.premiumsByOthers.toString(), 'amount')}
                </td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                  {formatCurrencyValue(totals.collateralSession.toString(), 'amount')}
                </td>
                <td className="px-3 py-2"></td>
              </tr>
            )}
            
            {filteredPolicies.length === 0 && (
              <tr>
                <td colSpan={15} className="px-3 py-8 text-center text-neutral-500">
                  {searchTerm ? "No assurance policies found matching your search." : "No assurance policies found. Click 'Add Policy' to get started."}
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