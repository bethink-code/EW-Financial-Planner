import { useState, useCallback, useMemo, memo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { getFieldClass, getFieldWidth } from "@/lib/design-tokens";
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

// Owner Row Manager Component
const OwnerRowManager = memo(({ policy, onUpdate, onDelete }: { 
  policy: Assurance; 
  onUpdate: (id: number, updates: Partial<Assurance>) => void;
  onDelete: (id: number) => void;
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const additionalOwners = policy.additionalOwners || [];

  const handleOwnerUpdate = useCallback((field: string, value: string, index?: number) => {
    setIsUpdating(true);
    let updates: Partial<Assurance> = {};

    if (field === 'owner') {
      updates.owner = value;
    } else if (field === 'additionalOwner' && index !== undefined) {
      const newOwners = [...additionalOwners];
      newOwners[index] = value;
      updates.additionalOwners = newOwners;
    }

    onUpdate(policy.id, updates);
    setTimeout(() => setIsUpdating(false), 300);
  }, [policy.id, additionalOwners, onUpdate]);

  const handleAddOwner = useCallback(() => {
    const newOwners = [...additionalOwners, ""];
    onUpdate(policy.id, { additionalOwners: newOwners });
  }, [policy.id, additionalOwners, onUpdate]);

  const handleRemoveOwner = useCallback((index: number) => {
    const newOwners = additionalOwners.filter((_, i) => i !== index);
    onUpdate(policy.id, { additionalOwners: newOwners });
  }, [policy.id, additionalOwners, onUpdate]);

  return (
    <>
      {/* Main Owner Row */}
      <tr className="hover:bg-neutral-50 border-b border-neutral-200">
        <td className="px-3 py-2">
          <input
            key={`description-${policy.id}`}
            type="text"
            defaultValue={policy.description}
            onBlur={(e) => onUpdate(policy.id, { description: e.target.value })}
            className={getFieldClass("text")} style={getFieldWidth("text")}
            disabled={isUpdating}
          />
        </td>
        <td className="px-3 py-2">
          <input
            key={`owner-${policy.id}`}
            type="text"
            defaultValue={policy.owner}
            onBlur={(e) => handleOwnerUpdate('owner', e.target.value)}
            className={getFieldClass("text")} style={getFieldWidth("text")}
            disabled={isUpdating}
          />
          <button
            onClick={handleAddOwner}
            className="ml-2 text-primary hover:text-primary/80 transition-colors"
            title="Add owner"
          >
            <Plus className="h-4 w-4" />
          </button>
        </td>
        <td className="px-3 py-2">
          <input
            key={`lifeAssured-${policy.id}`}
            type="text"
            defaultValue={policy.lifeAssured}
            onBlur={(e) => onUpdate(policy.id, { lifeAssured: e.target.value })}
            className={getFieldClass("text")} style={getFieldWidth("text")}
            disabled={isUpdating}
          />
        </td>
        <td className="px-3 py-2">
          <input
            key={`deathBenefit-${policy.id}`}
            type="text"
            defaultValue={policy.deathBenefit}
            onBlur={(e) => {
              const formattedValue = formatCurrencyValue(e.target.value, 'deathBenefit');
              e.target.value = formattedValue;
              onUpdate(policy.id, { deathBenefit: formattedValue });
            }}
            className={getFieldClass("amount")} style={getFieldWidth("amount")}
            disabled={isUpdating}
          />
        </td>
        <td className="px-3 py-2">
          <input
            key={`beneficiary-${policy.id}`}
            type="text"
            defaultValue={policy.beneficiary}
            onBlur={(e) => onUpdate(policy.id, { beneficiary: e.target.value })}
            className={getFieldClass("text")} style={getFieldWidth("text")}
            disabled={isUpdating}
          />
        </td>
        <td className="px-3 py-2">
          <input
            key={`benefitSplit-${policy.id}`}
            type="text"
            defaultValue={policy.benefitSplit}
            onBlur={(e) => {
              const formattedValue = formatCurrencyValue(e.target.value, 'benefitSplit');
              e.target.value = formattedValue;
              const newAmount = ((parseFloat(policy.deathBenefit.replace(/[^\d.-]/g, '')) || 0) * (parseFloat(formattedValue.replace(/[^\d.-]/g, '')) || 0) / 100).toString();
              onUpdate(policy.id, { benefitSplit: formattedValue, amount: newAmount });
            }}
            className="table-input w-20 px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isUpdating}
          />
        </td>
        <td className="px-3 py-2 text-sm text-neutral-700 text-right bg-neutral-100">
          {formatCurrencyValue(policy.amount, 'amount')}
        </td>
        <td className="px-3 py-2">
          <input
            key={`buySell-${policy.id}`}
            type="checkbox"
            defaultChecked={policy.buySell}
            onChange={(e) => onUpdate(policy.id, { buySell: e.target.checked })}
            className="h-4 w-4 text-blue-600 bg-primary/5 border-neutral-300 rounded focus:ring-primary focus:ring-2"
            disabled={isUpdating}
          />
        </td>
        <td className="px-3 py-2">
          <input
            key={`keyMan-${policy.id}`}
            type="checkbox"
            defaultChecked={policy.keyMan}
            onChange={(e) => onUpdate(policy.id, { keyMan: e.target.checked })}
            className="h-4 w-4 text-blue-600 bg-primary/5 border-neutral-300 rounded focus:ring-primary focus:ring-2"
            disabled={isUpdating}
          />
        </td>
        <td className="px-3 py-2">
          <input
            key={`excludedFromEstateDuty-${policy.id}`}
            type="checkbox"
            defaultChecked={policy.excludedFromEstateDuty}
            onChange={(e) => onUpdate(policy.id, { excludedFromEstateDuty: e.target.checked })}
            className="h-4 w-4 text-blue-600 bg-white border-neutral-300 rounded focus:ring-primary focus:ring-2"
            disabled={isUpdating}
          />
        </td>
        <td className="px-3 py-2">
          <input
            key={`excludedFromProvisions-${policy.id}`}
            type="checkbox"
            defaultChecked={policy.excludedFromProvisions}
            onChange={(e) => onUpdate(policy.id, { excludedFromProvisions: e.target.checked })}
            className="h-4 w-4 text-blue-600 bg-white border-neutral-300 rounded focus:ring-primary focus:ring-2"
            disabled={isUpdating}
          />
        </td>
        <td className="px-3 py-2">
          <input
            key={`premiumsByOthers-${policy.id}`}
            type="text"
            defaultValue={policy.premiumsByOthers}
            onBlur={(e) => {
              const formattedValue = formatCurrencyValue(e.target.value, 'premiumsByOthers');
              e.target.value = formattedValue;
              onUpdate(policy.id, { premiumsByOthers: formattedValue });
            }}
            className={getFieldClass("amount")} style={getFieldWidth("amount")}
            disabled={isUpdating}
          />
        </td>
        <td className="px-3 py-2">
          <input
            key={`collateralSession-${policy.id}`}
            type="text"
            defaultValue={policy.collateralSession}
            onBlur={(e) => {
              const formattedValue = formatCurrencyValue(e.target.value, 'collateralSession');
              e.target.value = formattedValue;
              onUpdate(policy.id, { collateralSession: formattedValue });
            }}
            className={getFieldClass("amount")} style={getFieldWidth("amount")}
            disabled={isUpdating}
          />
        </td>
        <td className="px-3 py-2">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this policy?')) {
                onDelete(policy.id);
              }
            }}
            className="text-[#4F4F4F] hover:text-red-600 transition-colors"
            title="Delete policy"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </td>
      </tr>

      {/* Additional Owner Rows */}
      {additionalOwners.map((owner, index) => (
        <tr key={`additional-owner-${index}`} className="hover:bg-neutral-50 border-b border-neutral-200">
          <td className="px-3 py-2 text-sm text-neutral-700"></td>
          <td className="px-3 py-2">
            <input
              key={`additional-owner-${policy.id}-${index}`}
              type="text"
              defaultValue={owner}
              onBlur={(e) => handleOwnerUpdate('additionalOwner', e.target.value, index)}
              className={getFieldClass("text")} style={getFieldWidth("text")}
              disabled={isUpdating}
            />
            <button
              onClick={() => handleRemoveOwner(index)}
              className="ml-2 text-[#4F4F4F] hover:text-red-600 transition-colors"
              title="Remove owner"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </td>
          <td colSpan={11} className="px-3 py-2 text-sm text-neutral-700"></td>
        </tr>
      ))}
    </>
  );
});

OwnerRowManager.displayName = "OwnerRowManager";

export function AssuranceTable({ searchTerm }: AssuranceTableProps) {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch assurance policies
  const { data: policies = [], isLoading } = useQuery({
    queryKey: ["/api/assurance", { search: searchTerm }],
    queryFn: async () => {
      const response = await fetch("/api/assurance" + (searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ""));
      if (!response.ok) throw new Error('Failed to fetch assurance policies');
      return response.json() as Promise<Assurance[]>;
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

  const handleUpdatePolicy = useCallback((id: number, updates: Partial<Assurance>) => {
    setIsUpdating(true);
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleDeletePolicy = useCallback((id: number) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  // Filter policies based on search term
  const filteredPolicies = useMemo(() => {
    if (!searchTerm.trim()) return policies;
    
    const lowerQuery = searchTerm.toLowerCase();
    return policies.filter(policy =>
      policy.description.toLowerCase().includes(lowerQuery) ||
      policy.owner.toLowerCase().includes(lowerQuery) ||
      policy.lifeAssured.toLowerCase().includes(lowerQuery) ||
      policy.beneficiary.toLowerCase().includes(lowerQuery) ||
      (policy.additionalOwners || []).some(owner => owner.toLowerCase().includes(lowerQuery)) ||
      (policy.additionalBeneficiaries || []).some(beneficiary => beneficiary.toLowerCase().includes(lowerQuery))
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
          className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          {addMutation.isPending ? "Adding Policy..." : "Add Policy"}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-neutral-200 rounded-lg shadow-sm">
          <thead>
            <tr className="bg-primary/10 border-b border-neutral-200">
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
            {filteredPolicies.map((policy) => (
              <OwnerRowManager
                key={policy.id}
                policy={policy}
                onUpdate={handleUpdatePolicy}
                onDelete={handleDeletePolicy}
              />
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