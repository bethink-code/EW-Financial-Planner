import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
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
    mutationFn: () => {
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
      return apiRequest("/api/assurance", "POST", newPolicy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assurance"] });
    },
  });

  // Update policy mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Assurance> }) => {
      return apiRequest(`/api/assurance/${id}`, "PATCH", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assurance"] });
      setIsUpdating(false);
    },
  });

  // Delete policy mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/assurance/${id}`, "DELETE");
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
    
    let updates: Partial<Assurance> = {};
    
    // Handle auto-calculation for amount field
    if (field === 'deathBenefit' || field === 'benefitSplit') {
      const policy = policies.find((p: Assurance) => p.id === id);
      if (policy) {
        const deathBenefit = field === 'deathBenefit' ? 
          parseFloat(String(value).replace(/[^\d.-]/g, '')) : 
          parseFloat(policy.deathBenefit.replace(/[^\d.-]/g, ''));
        const benefitSplit = field === 'benefitSplit' ? 
          parseFloat(String(value).replace(/[^\d.-]/g, '')) : 
          parseFloat(policy.benefitSplit.replace(/[^\d.-]/g, ''));
        
        const calculatedAmount = (deathBenefit * benefitSplit / 100).toString();
        updates.amount = calculatedAmount;
      }
    }
    
    (updates as any)[field] = value;
    updateMutation.mutate({ id, updates });
  }, [policies, updateMutation]);

  const handleDeletePolicy = useCallback((id: number) => {
    if (confirm('Are you sure you want to delete this policy?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof Assurance, value: string) => {
    const formattedValue = formatCurrencyValue(value, field);
    handleUpdatePolicy(id, field, formattedValue);
  }, [handleUpdatePolicy]);

  // Add owner to policy
  const handleAddOwner = useCallback((id: number) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy) {
      const newOwners = [...(policy.additionalOwners || []), ""];
      handleUpdatePolicy(id, 'additionalOwners', newOwners);
    }
  }, [policies, handleUpdatePolicy]);

  // Add beneficiary to policy
  const handleAddBeneficiary = useCallback((id: number) => {
    const policy = policies.find((p: Assurance) => p.id === id);
    if (policy) {
      const newBeneficiaries = [...(policy.additionalBeneficiaries || []), ""];
      const newSplits = [...(policy.additionalBenefitSplits || []), "0"];
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
        <button
          onClick={handleAddPolicy}
          disabled={addMutation.isPending}
          className="inline-flex items-center px-4 py-2 bg-[#016991] text-white text-sm font-medium rounded-lg hover:bg-[#014a66] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          {addMutation.isPending ? "Adding Policy..." : "Add Policy"}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-neutral-200 rounded-lg shadow-sm">
          <thead>
            <tr className="bg-[#E0F2FE] border-b border-neutral-200">
              <th className="px-3 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Description</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Owner</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Life Assured</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Death Benefit</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Beneficiary</th>
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
            {filteredPolicies.map((policy: Assurance) => (
              <tr key={policy.id} className="hover:bg-neutral-50">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    defaultValue={policy.description}
                    onBlur={(e) => handleUpdatePolicy(policy.id, 'description', e.target.value)}
                    className="table-input w-full px-2 py-1 text-sm border border-neutral-300 rounded bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center space-x-1">
                    <input
                      type="text"
                      defaultValue={policy.owner}
                      onBlur={(e) => handleUpdatePolicy(policy.id, 'owner', e.target.value)}
                      className="table-input w-full px-2 py-1 text-sm border border-neutral-300 rounded bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isUpdating}
                    />
                    <button
                      onClick={() => handleAddOwner(policy.id)}
                      className="text-[#1B5C82] hover:text-[#0d4660] transition-colors"
                      title="Add owner"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    defaultValue={policy.lifeAssured}
                    onBlur={(e) => handleUpdatePolicy(policy.id, 'lifeAssured', e.target.value)}
                    className="table-input w-full px-2 py-1 text-sm border border-neutral-300 rounded bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    defaultValue={policy.deathBenefit}
                    onBlur={(e) => handleInputBlur(policy.id, 'deathBenefit', e.target.value)}
                    className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center space-x-1">
                    <input
                      type="text"
                      defaultValue={policy.beneficiary}
                      onBlur={(e) => handleUpdatePolicy(policy.id, 'beneficiary', e.target.value)}
                      className="table-input w-full px-2 py-1 text-sm border border-neutral-300 rounded bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isUpdating}
                    />
                    <button
                      onClick={() => handleAddBeneficiary(policy.id)}
                      className="text-[#1B5C82] hover:text-[#0d4660] transition-colors"
                      title="Add beneficiary"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    defaultValue={policy.benefitSplit}
                    onBlur={(e) => handleInputBlur(policy.id, 'benefitSplit', e.target.value)}
                    className="table-input w-20 px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2 text-sm text-neutral-700 text-right bg-neutral-100">
                  {formatCurrencyValue(policy.amount, 'amount')}
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={policy.buySell}
                    onChange={(e) => handleUpdatePolicy(policy.id, 'buySell', e.target.checked)}
                    className="h-4 w-4 text-blue-600 bg-[#E3F2FD] border-neutral-300 rounded focus:ring-blue-500 focus:ring-2"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={policy.keyMan}
                    onChange={(e) => handleUpdatePolicy(policy.id, 'keyMan', e.target.checked)}
                    className="h-4 w-4 text-blue-600 bg-[#E3F2FD] border-neutral-300 rounded focus:ring-blue-500 focus:ring-2"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={policy.excludedFromEstateDuty}
                    onChange={(e) => handleUpdatePolicy(policy.id, 'excludedFromEstateDuty', e.target.checked)}
                    className="h-4 w-4 text-blue-600 bg-white border-neutral-300 rounded focus:ring-blue-500 focus:ring-2"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={policy.excludedFromProvisions}
                    onChange={(e) => handleUpdatePolicy(policy.id, 'excludedFromProvisions', e.target.checked)}
                    className="h-4 w-4 text-blue-600 bg-white border-neutral-300 rounded focus:ring-blue-500 focus:ring-2"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    defaultValue={policy.premiumsByOthers}
                    onBlur={(e) => handleInputBlur(policy.id, 'premiumsByOthers', e.target.value)}
                    className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    defaultValue={policy.collateralSession}
                    onBlur={(e) => handleInputBlur(policy.id, 'collateralSession', e.target.value)}
                    className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => handleDeletePolicy(policy.id)}
                    className="text-[#4F4F4F] hover:text-red-600 transition-colors"
                    title="Delete policy"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            
            {filteredPolicies.length === 0 && (
              <tr>
                <td colSpan={14} className="px-3 py-8 text-center text-neutral-500">
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