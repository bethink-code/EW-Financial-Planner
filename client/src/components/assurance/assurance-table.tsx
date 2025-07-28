import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { DeleteButton } from "@/components/ui/action-buttons";
import { apiRequest } from "@/lib/queryClient";
import { getFieldClass, getFieldWidth } from "@/lib/design-tokens";
import { formatCurrencyValue, formatTextValue, getValueClass, isDefaultValue } from "@/lib/formatting";
import type { Assurance, InsertAssurance } from "@shared/schema";

interface AssuranceTableProps {
  searchTerm: string;
}

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
        description: "New Policy",
        owner: "Donald Edwards",
        lifeAssured: "Life Assured",
        deathBenefit: "1000000",
        beneficiary: "Beneficiary",
        benefitSplit: "100",
        amount: "1000000",
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

  const handleInputBlur = useCallback((id: number, field: keyof Assurance, value: string | boolean) => {
    setIsUpdating(true);
    
    let processedValue = value;
    
    // Calculate amount when death benefit or benefit split changes
    if (field === "deathBenefit" || field === "benefitSplit") {
      const policy = policies.find(p => p.id === id);
      if (policy) {
        const deathBenefit = field === "deathBenefit" ? parseFloat(String(value).replace(/[^0-9.]/g, '')) : parseFloat(policy.deathBenefit.replace(/[^0-9.]/g, ''));
        const benefitSplit = field === "benefitSplit" ? parseFloat(String(value).replace(/[^0-9.]/g, '')) : parseFloat(policy.benefitSplit.replace(/[^0-9.]/g, ''));
        
        if (!isNaN(deathBenefit) && !isNaN(benefitSplit)) {
          const amount = (deathBenefit * benefitSplit / 100).toString();
          
          updateMutation.mutate({
            id,
            updates: {
              [field]: String(processedValue),
              amount: amount
            }
          });
          return;
        }
      }
    }
    
    updateMutation.mutate({
      id,
      updates: { [field]: processedValue }
    });
  }, [policies, updateMutation]);

  // Format currency values
  const formatCurrencyValue = (value: string, fieldType: string): string => {
    if (!value || value === "0") return "0";
    
    const numericValue = value.replace(/[^0-9.]/g, "");
    const number = parseFloat(numericValue);
    
    if (isNaN(number)) return "0";
    
    if (fieldType === "benefitSplit") {
      return `${number}%`;
    }
    
    return `R ${number.toLocaleString()}`;
  };

  // Calculate totals
  const totalDeathBenefits = policies.reduce((sum, policy) => {
    const amount = parseFloat(policy.amount.replace(/[^0-9.]/g, "")) || 0;
    return sum + amount;
  }, 0);

  const totalExcludedFromEstateDuty = policies.filter(policy => policy.excludedFromEstateDuty).length;

  if (isLoading) {
    return <div className="text-center py-4">Loading policies...</div>;
  }

  return (
    <div >
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleAddPolicy}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-[#014d73] rounded-md transition-colors"
          disabled={addMutation.isPending}
        >
          <Plus size={16} />
          Add Policy
        </button>
        <h3 className="text-lg font-semibold text-neutral-900">Details</h3>
      </div>

      {/* Main Table */}
      <div className="rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead>
              <tr className="border-b border-neutral-300">
                <th className="p-3 text-center text-xs font-semibold text-neutral-700 uppercase tracking-wider w-16">
                  <AddButton onClick={handleAddPolicy} disabled={addMutation.isPending} />
                </th>
                <th className="p-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider min-w-[200px]">Description</th>
                <th className="p-3 text-center text-xs font-semibold text-neutral-700 uppercase tracking-wider min-w-[140px]">Owner</th>
                <th className="p-3 text-center text-xs font-semibold text-neutral-700 uppercase tracking-wider min-w-[140px]">Life Assured</th>
                <th className="p-3 text-center text-xs font-semibold text-neutral-700 uppercase tracking-wider min-w-[140px]">Death Benefit</th>
                <th className="p-3 text-center text-xs font-semibold text-neutral-700 uppercase tracking-wider min-w-[120px]">Beneficiary</th>
                <th className="p-3 text-center text-xs font-semibold text-neutral-700 uppercase tracking-wider min-w-[100px]">Benefit Split</th>
                <th className="p-3 text-center text-xs font-semibold text-neutral-700 uppercase tracking-wider min-w-[140px]">Amount</th>
                <th className="p-3 text-center text-xs font-semibold text-neutral-700 uppercase tracking-wider min-w-[120px]">Excluded Estate Duty</th>
                <th className="p-3 text-center text-xs font-semibold text-neutral-700 uppercase tracking-wider min-w-[120px]">Excluded Provisions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {policies.map((policy: Assurance) => (
                <tr key={policy.id} >
                  <td className="p-2 text-center">
                    <DeleteButton
                      onClick={() => deleteMutation.mutate(policy.id)}
                      disabled={deleteMutation.isPending}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      key={`description-${policy.id}-${policy.description}`}
                      defaultValue={formatTextValue(policy.description)}
                      onBlur={(e) => {
                        handleInputBlur(policy.id, "description", e.target.value);
                      }}
                      className={`table-input h-7 text-sm bg-primary/5 border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm ${getValueClass(policy.description || "Enter here ...", 'text')}`}
                      style={{ textAlign: "left" }}
                      disabled={isUpdating}
                      placeholder="Policy name"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <select
                      defaultValue={policy.owner || "Donald Edwards"}
                      onChange={(e) => {
                        handleInputBlur(policy.id, "owner", e.target.value);
                      }}
                      className={getFieldClass("description")} style={getFieldWidth("description")}
                      disabled={isUpdating}
                    >
                      <option value="Donald Edwards">Donald Edwards</option>
                      <option value="Betty Edwards">Betty Edwards</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      key={`lifeAssured-${policy.id}-${policy.lifeAssured}`}
                      defaultValue={formatTextValue(policy.lifeAssured)}
                      onBlur={(e) => {
                        handleInputBlur(policy.id, "lifeAssured", e.target.value);
                      }}
                      className={`table-input h-7 text-sm bg-primary/5 border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm ${getValueClass(policy.lifeAssured || "Enter here ...", 'text')}`}
                      style={{ textAlign: "left" }}
                      disabled={isUpdating}
                      placeholder="Insured person"
                    />
                  </td>
                  <td className="p-2 text-right">
                    <input
                      key={`deathBenefit-${policy.id}-${policy.deathBenefit}`}
                      defaultValue={formatCurrencyValue(policy.deathBenefit, 'deathBenefit')}
                      onBlur={(e) => {
                        const formattedValue = formatCurrencyValue(e.target.value, 'deathBenefit');
                        if (formattedValue !== e.target.value) {
                          e.target.value = formattedValue;
                        }
                        handleInputBlur(policy.id, "deathBenefit", e.target.value);
                      }}
                      className={`table-input h-7 text-sm bg-primary/5 border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm ${getValueClass(formatCurrencyValue(policy.deathBenefit, 'deathBenefit'), 'currency')}`}
                      style={{ textAlign: "right", minWidth: "100px" }}
                      placeholder="R 0"
                      disabled={isUpdating}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      key={`beneficiary-${policy.id}-${policy.beneficiary}`}
                      defaultValue={formatTextValue(policy.beneficiary)}
                      onBlur={(e) => {
                        handleInputBlur(policy.id, "beneficiary", e.target.value);
                      }}
                      className={`table-input h-7 text-sm bg-primary/5 border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm ${getValueClass(policy.beneficiary || "Enter here ...", 'text')}`}
                      style={{ textAlign: "left" }}
                      disabled={isUpdating}
                      placeholder="Beneficiary name"
                    />
                  </td>
                  <td className="p-2 text-right">
                    <input
                      defaultValue={policy.benefitSplit || ""}
                      onBlur={(e) => {
                        const formattedValue = formatCurrencyValue(e.target.value, "benefitSplit");
                        if (formattedValue !== e.target.value) {
                          e.target.value = formattedValue;
                        }
                        handleInputBlur(policy.id, "benefitSplit", e.target.value);
                      }}
                      className="table-input h-7 text-sm bg-primary/5 border-gray-200 focus:border-primary w-16 px-2 py-1 border rounded-md text-sm"
                      style={{ textAlign: "right" }}
                      placeholder="0%"
                      disabled={isUpdating}
                    />
                  </td>
                  <td className="p-2 text-right">
                    <div className="text-sm text-neutral-700">
                      {formatCurrencyValue(policy.amount, "amount")}
                    </div>
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      defaultChecked={policy.excludedFromEstateDuty}
                      onChange={(e) => {
                        handleInputBlur(policy.id, "excludedFromEstateDuty", e.target.checked);
                      }}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                      disabled={isUpdating}
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      defaultChecked={policy.excludedFromProvisions}
                      onChange={(e) => {
                        handleInputBlur(policy.id, "excludedFromProvisions", e.target.checked);
                      }}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                      disabled={isUpdating}
                    />
                  </td>
                </tr>
              ))}
              
              {/* Total Row */}
              <tr className="bg-[#F5F5F5] border-t-2 border-neutral-300">
                <td className="p-2"></td>
                <td className="p-2 text-left font-bold text-neutral-900" style={{ fontFamily: "system-ui, -apple-system, sans-serif", fontWeight: 700 }}>
                  Total
                </td>
                <td className="p-2"></td>
                <td className="p-2"></td>
                <td className="p-2"></td>
                <td className="p-2"></td>
                <td className="p-2"></td>
                <td className="p-2 text-right font-bold text-neutral-900" style={{ fontFamily: "system-ui, -apple-system, sans-serif", fontWeight: 700 }}>
                  R {totalDeathBenefits.toLocaleString()}
                </td>
                <td className="p-2 text-center font-bold text-neutral-900" style={{ fontFamily: "system-ui, -apple-system, sans-serif", fontWeight: 700 }}>
                  {totalExcludedFromEstateDuty}
                </td>
                <td className="p-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}