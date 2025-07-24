import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Search, UserPlus, UserMinus } from "lucide-react";
import { getFieldClass, getFieldWidth } from "@/lib/design-tokens";
import type { VoluntaryInvestment, InsertVoluntaryInvestment } from "@shared/schema";

// Utility function for formatting currency values
const formatCurrencyValue = (value: string, fieldType: string): string => {
  if (!value || value.trim() === '') return value;
  
  // Remove existing formatting
  const cleanValue = value.replace(/[^\d.-]/g, '');
  if (!cleanValue || isNaN(parseFloat(cleanValue))) return value;
  
  const numValue = parseFloat(cleanValue);
  
  if (fieldType === 'percentage' || fieldType.includes('percentage')) {
    return `${numValue}%`;
  }
  
  // Currency formatting
  if (numValue === 0) return 'R 0';
  
  // Format with thousands separators
  const formatted = new Intl.NumberFormat('en-ZA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(numValue));
  
  return `R ${formatted}`;
};

export default function VoluntaryInvestmentsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  // Fetch voluntary investments
  const { data: investments = [], isLoading, error } = useQuery<VoluntaryInvestment[]>({
    queryKey: ['/api/voluntary-investments'],
    queryFn: async () => {
      const response = await fetch('/api/voluntary-investments');
      if (!response.ok) {
        throw new Error('Failed to fetch voluntary investments');
      }
      return response.json();
    }
  });

  // Add new investment mutation
  const addMutation = useMutation({
    mutationFn: async (): Promise<VoluntaryInvestment> => {
      const newInvestment: InsertVoluntaryInvestment = {
        description: "",
        owners: '["Donald Edwards"]',
        ownershipPercentages: '["100"]',
        baseCost: "0",
        marketValue: "0",
        liquidationPercentage: "0",
        spouse: "0",
        others: "0",
        excludedFromJointEstate: false,
        excludedFromEstateDuty: false,
        excludedFromCGT: false,
        excludedFromExecutorsFees: false,
      };
      
      const response = await fetch('/api/voluntary-investments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newInvestment),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create investment');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/voluntary-investments'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to add investment:', error);
      setIsUpdating(false);
    }
  });

  // Update investment mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<VoluntaryInvestment> }) => {
      const response = await fetch(`/api/voluntary-investments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update investment');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/voluntary-investments'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to update investment:', error);
      setIsUpdating(false);
    }
  });

  // Delete investment mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/voluntary-investments/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete investment');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/voluntary-investments'] });
    }
  });

  // Filter investments based on search term
  const filteredInvestments = useMemo(() => {
    if (!searchTerm.trim()) return investments;
    
    const lowerQuery = searchTerm.toLowerCase();
    return investments.filter(investment => {
      const owners = JSON.parse(investment.owners || '[]');
      return investment.description.toLowerCase().includes(lowerQuery) ||
             owners.some((owner: string) => owner.toLowerCase().includes(lowerQuery));
    });
  }, [investments, searchTerm]);

  // Calculate totals
  const totals = useMemo(() => {
    return {
      count: filteredInvestments.length,
      baseCost: filteredInvestments.reduce((sum: number, investment: VoluntaryInvestment) => {
        const value = parseFloat(investment.baseCost.replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      marketValue: filteredInvestments.reduce((sum: number, investment: VoluntaryInvestment) => {
        const value = parseFloat(investment.marketValue.replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
    };
  }, [filteredInvestments]);

  const handleAddInvestment = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  const handleUpdateInvestment = useCallback((id: number, field: keyof VoluntaryInvestment, value: string | boolean) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof VoluntaryInvestment, value: string) => {
    const formattedValue = formatCurrencyValue(value, field);
    handleUpdateInvestment(id, field, formattedValue);
    
    // Update DOM element directly for immediate visual feedback
    const target = document.activeElement as HTMLInputElement;
    if (target && formattedValue !== value) {
      setTimeout(() => {
        target.value = formattedValue;
      }, 0);
    }
  }, [handleUpdateInvestment]);

  const handleDeleteInvestment = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  // Owner management functions
  const handleAddOwner = useCallback((investmentId: number) => {
    const investment = filteredInvestments.find(inv => inv.id === investmentId);
    if (!investment) return;
    
    const owners = JSON.parse(investment.owners || '[]');
    const percentages = JSON.parse(investment.ownershipPercentages || '[]');
    
    owners.push('Donald Edwards');
    percentages.push('0');
    
    handleUpdateInvestment(investmentId, 'owners', JSON.stringify(owners));
    handleUpdateInvestment(investmentId, 'ownershipPercentages', JSON.stringify(percentages));
  }, [filteredInvestments, handleUpdateInvestment]);

  const handleRemoveOwner = useCallback((investmentId: number, ownerIndex: number) => {
    const investment = filteredInvestments.find(inv => inv.id === investmentId);
    if (!investment) return;
    
    const owners = JSON.parse(investment.owners || '[]');
    const percentages = JSON.parse(investment.ownershipPercentages || '[]');
    
    if (owners.length <= 1) return; // Don't remove the last owner
    
    owners.splice(ownerIndex, 1);
    percentages.splice(ownerIndex, 1);
    
    handleUpdateInvestment(investmentId, 'owners', JSON.stringify(owners));
    handleUpdateInvestment(investmentId, 'ownershipPercentages', JSON.stringify(percentages));
  }, [filteredInvestments, handleUpdateInvestment]);

  const handleOwnerChange = useCallback((investmentId: number, ownerIndex: number, newOwner: string) => {
    const investment = filteredInvestments.find(inv => inv.id === investmentId);
    if (!investment) return;
    
    const owners = JSON.parse(investment.owners || '[]');
    owners[ownerIndex] = newOwner;
    
    handleUpdateInvestment(investmentId, 'owners', JSON.stringify(owners));
  }, [filteredInvestments, handleUpdateInvestment]);

  const handlePercentageChange = useCallback((investmentId: number, ownerIndex: number, newPercentage: string) => {
    const investment = filteredInvestments.find(inv => inv.id === investmentId);
    if (!investment) return;
    
    const percentages = JSON.parse(investment.ownershipPercentages || '[]');
    percentages[ownerIndex] = newPercentage;
    
    handleUpdateInvestment(investmentId, 'ownershipPercentages', JSON.stringify(percentages));
  }, [filteredInvestments, handleUpdateInvestment]);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading voluntary investments...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading voluntary investments. Please try again.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Search Controls */}
      <div className="flex justify-start items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search voluntary investments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Summary Section */}
      {filteredInvestments.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-primary/10 px-4 py-3 border-b border-neutral-200">
            <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">Summary</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-neutral-50 p-3 rounded-lg">
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Number of Investments</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {totals.count}
                </p>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg">
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Total Base Cost</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {formatCurrencyValue(totals.baseCost.toString(), 'baseCost')}
                </p>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg">
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Total Market Value</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {formatCurrencyValue(totals.marketValue.toString(), 'marketValue')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Investment Button */}
      <div className="flex justify-start mb-4">
        <button
          onClick={handleAddInvestment}
          disabled={addMutation.isPending}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-[#014d6b] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Investment
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-neutral-200 rounded-lg shadow-sm">
          <thead>
            <tr className="bg-primary/10 border-b border-neutral-200">
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider" colSpan={3}>Overview</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider" colSpan={5}>Bequeath To</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider" colSpan={4}>Exclusions</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Actions</th>
            </tr>
            <tr className="bg-primary/10 border-b border-neutral-200">
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Description</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Owner</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Percentage</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Base Cost</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Market Value</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Liquidation %</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Spouse</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Others</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Joint Estate</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Estate Duty</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">CGT</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Executor's Fees</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {filteredInvestments.map((investment: VoluntaryInvestment) => {
              const owners = JSON.parse(investment.owners || '[]');
              const percentages = JSON.parse(investment.ownershipPercentages || '[]');
              
              return owners.map((owner: string, ownerIndex: number) => (
                <tr key={`${investment.id}-${ownerIndex}`} className="hover:bg-neutral-50">
                  {ownerIndex === 0 && (
                    <>
                      <td rowSpan={owners.length} className="px-3 py-2 border-r border-neutral-200">
                        <input
                          type="text"
                          defaultValue={investment.description}
                          onBlur={(e) => handleUpdateInvestment(investment.id, 'description', e.target.value)}
                          className={getFieldClass('description')}
                          style={getFieldWidth('description')}
                          disabled={isUpdating}
                        />
                      </td>
                    </>
                  )}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={owner}
                        onChange={(e) => handleOwnerChange(investment.id, ownerIndex, e.target.value)}
                        className="table-input flex-1 px-2 py-1 text-sm border border-neutral-300 rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={isUpdating}
                      >
                        <option value="Donald Edwards">Donald Edwards</option>
                        <option value="Betty Edwards">Betty Edwards</option>
                      </select>
                      {owners.length > 1 && (
                        <button
                          onClick={() => handleRemoveOwner(investment.id, ownerIndex)}
                          className="text-[#4F4F4F] hover:text-red-600 transition-colors"
                          title="Remove owner"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      )}
                      {ownerIndex === owners.length - 1 && (
                        <button
                          onClick={() => handleAddOwner(investment.id)}
                          className="text-primary hover:text-blue-700 transition-colors"
                          title="Add owner"
                        >
                          <UserPlus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      key={`percentage-${investment.id}-${ownerIndex}-${percentages[ownerIndex]}`}
                      defaultValue={percentages[ownerIndex] || '0'}
                      onBlur={(e) => handlePercentageChange(investment.id, ownerIndex, e.target.value)}
                      className={getFieldClass('percentage')}
                      disabled={isUpdating}
                    />
                  </td>
                  {ownerIndex === 0 && (
                    <>
                      <td rowSpan={owners.length} className="px-3 py-2 border-l border-neutral-200">
                        <input
                          key={`baseCost-${investment.id}-${investment.baseCost}`}
                          type="text"
                          defaultValue={formatCurrencyValue(investment.baseCost, 'baseCost')}
                          onBlur={(e) => handleInputBlur(investment.id, 'baseCost', e.target.value)}
                          className={getFieldClass('amount')}
                          disabled={isUpdating}
                        />
                      </td>
                      <td rowSpan={owners.length} className="px-3 py-2">
                        <input
                          key={`marketValue-${investment.id}-${investment.marketValue}`}
                          type="text"
                          defaultValue={formatCurrencyValue(investment.marketValue, 'marketValue')}
                          onBlur={(e) => handleInputBlur(investment.id, 'marketValue', e.target.value)}
                          className={getFieldClass('amount')}
                          disabled={isUpdating}
                        />
                      </td>
                      <td rowSpan={owners.length} className="px-3 py-2">
                        <input
                          key={`liquidationPercentage-${investment.id}-${investment.liquidationPercentage}`}
                          type="text"
                          defaultValue={investment.liquidationPercentage}
                          onBlur={(e) => handleInputBlur(investment.id, 'liquidationPercentage', e.target.value)}
                          className={getFieldClass('percentage')}
                          disabled={isUpdating}
                        />
                      </td>
                      <td rowSpan={owners.length} className="px-3 py-2">
                        <input
                          key={`spouse-${investment.id}-${investment.spouse}`}
                          type="text"
                          defaultValue={investment.spouse}
                          onBlur={(e) => handleInputBlur(investment.id, 'spouse', e.target.value)}
                          className={getFieldClass('percentage')}
                          disabled={isUpdating}
                        />
                      </td>
                      <td rowSpan={owners.length} className="px-3 py-2 border-r border-neutral-200">
                        <input
                          key={`others-${investment.id}-${investment.others}`}
                          type="text"
                          defaultValue={investment.others}
                          onBlur={(e) => handleInputBlur(investment.id, 'others', e.target.value)}
                          className={getFieldClass('percentage')}
                          disabled={isUpdating}
                        />
                      </td>
                      <td rowSpan={owners.length} className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={investment.excludedFromJointEstate}
                          onChange={(e) => handleUpdateInvestment(investment.id, 'excludedFromJointEstate', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-primary border-gray-300 rounded"
                          disabled={isUpdating}
                        />
                      </td>
                      <td rowSpan={owners.length} className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={investment.excludedFromEstateDuty}
                          onChange={(e) => handleUpdateInvestment(investment.id, 'excludedFromEstateDuty', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-primary border-gray-300 rounded"
                          disabled={isUpdating}
                        />
                      </td>
                      <td rowSpan={owners.length} className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={investment.excludedFromCGT}
                          onChange={(e) => handleUpdateInvestment(investment.id, 'excludedFromCGT', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-primary border-gray-300 rounded"
                          disabled={isUpdating}
                        />
                      </td>
                      <td rowSpan={owners.length} className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={investment.excludedFromExecutorsFees}
                          onChange={(e) => handleUpdateInvestment(investment.id, 'excludedFromExecutorsFees', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-primary border-gray-300 rounded"
                          disabled={isUpdating}
                        />
                      </td>
                      <td rowSpan={owners.length} className="px-3 py-2 text-center">
                        <button
                          onClick={() => handleDeleteInvestment(investment.id)}
                          className="text-[#4F4F4F] hover:text-red-600 transition-colors"
                          title="Delete investment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ));
            })}
            
            {/* Total Row */}
            {filteredInvestments.length > 0 && (
              <tr className="bg-neutral-100 border-t-2 border-neutral-300 font-bold">
                <td className="px-3 py-2 text-sm font-bold text-neutral-800">Total</td>
                <td colSpan={2} className="px-3 py-2"></td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                  {formatCurrencyValue(totals.baseCost.toString(), 'baseCost')}
                </td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                  {formatCurrencyValue(totals.marketValue.toString(), 'marketValue')}
                </td>
                <td colSpan={8} className="px-3 py-2"></td>
              </tr>
            )}
            
            {filteredInvestments.length === 0 && (
              <tr>
                <td colSpan={13} className="px-3 py-8 text-center text-neutral-500">
                  {searchTerm ? "No voluntary investments found matching your search." : "No voluntary investments found. Click 'Add Investment' to get started."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}