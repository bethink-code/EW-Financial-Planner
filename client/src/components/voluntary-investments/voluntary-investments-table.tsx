import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, UserPlus, UserMinus } from "lucide-react";
import { AddButton, DeleteButton, DuplicateButton, ActionButtonGroup } from "@/components/ui/action-buttons";
import { getFieldClass, getFieldWidth } from "@/lib/design-tokens";
import { formatCurrencyValue, formatPercentageValue, getValueClass, isDefaultValue, handleDefaultValueFocus, createEnhancedBlurHandler } from "@/lib/formatting";
import type { VoluntaryInvestment, InsertVoluntaryInvestment } from "@shared/schema";

export default function VoluntaryInvestmentsTable() {
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
        ownershipPercentages: '["100%"]',
        baseCost: "0",
        marketValue: "0",
        liquidationPercentage: "0%",
        spouse: "0%",
        others: "0%",
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

  // No filtering needed - show all investments
  const filteredInvestments = investments;

  // Calculate totals
  const totals = useMemo(() => {
    return {
      count: investments.length,
      baseCost: investments.reduce((sum: number, investment: VoluntaryInvestment) => {
        const value = parseFloat(investment.baseCost.replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      marketValue: investments.reduce((sum: number, investment: VoluntaryInvestment) => {
        const value = parseFloat(investment.marketValue.replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
    };
  }, [investments]);

  const handleAddInvestment = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  const handleUpdateInvestment = useCallback((id: number, field: keyof VoluntaryInvestment, value: string | boolean) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof VoluntaryInvestment, value: string) => {
    // Determine field type and format accordingly
    let formattedValue: string;
    if (field === 'liquidationPercentage' || field === 'spouse' || field === 'others') {
      formattedValue = formatPercentageValue(value);
    } else {
      formattedValue = formatCurrencyValue(value);
    }
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

  const handleDuplicateInvestment = useCallback((investment: VoluntaryInvestment) => {
    const duplicatedInvestment: InsertVoluntaryInvestment = {
      description: investment.description,
      owners: investment.owners,
      ownershipPercentages: investment.ownershipPercentages,
      baseCost: investment.baseCost,
      marketValue: investment.marketValue,
      liquidationPercentage: investment.liquidationPercentage,
      spouse: investment.spouse,
      others: investment.others,
      excludedFromJointEstate: investment.excludedFromJointEstate,
      excludedFromEstateDuty: investment.excludedFromEstateDuty,
      excludedFromCGT: investment.excludedFromCGT,
      excludedFromExecutorsFees: investment.excludedFromExecutorsFees,
    };
    addMutation.mutate();
    
    // Alternative: create with all data immediately
    // fetch('/api/voluntary-investments', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(duplicatedInvestment),
    // }).then(() => queryClient.invalidateQueries({ queryKey: ['/api/voluntary-investments'] }));
  }, [addMutation]);

  // Owner management functions
  const handleAddOwner = useCallback((investmentId: number) => {
    const investment = filteredInvestments.find(inv => inv.id === investmentId);
    if (!investment) return;
    
    let owners: string[], percentages: string[];
    try {
      owners = JSON.parse(investment.owners || '["Donald Edwards"]');
      percentages = JSON.parse(investment.ownershipPercentages || '["100%"]');
    } catch (error) {
      owners = [investment.owners || 'Donald Edwards'];
      percentages = [investment.ownershipPercentages || '100%'];
    }
    
    owners.push('Donald Edwards');
    percentages.push('0%');
    
    handleUpdateInvestment(investmentId, 'owners', JSON.stringify(owners));
    handleUpdateInvestment(investmentId, 'ownershipPercentages', JSON.stringify(percentages));
  }, [filteredInvestments, handleUpdateInvestment]);

  const handleRemoveOwner = useCallback((investmentId: number, ownerIndex: number) => {
    const investment = filteredInvestments.find(inv => inv.id === investmentId);
    if (!investment) return;
    
    let owners: string[], percentages: string[];
    try {
      owners = JSON.parse(investment.owners || '["Donald Edwards"]');
      percentages = JSON.parse(investment.ownershipPercentages || '["100%"]');
    } catch (error) {
      owners = [investment.owners || 'Donald Edwards'];
      percentages = [investment.ownershipPercentages || '100%'];
    }
    
    if (owners.length <= 1) return; // Don't remove the last owner
    
    owners.splice(ownerIndex, 1);
    percentages.splice(ownerIndex, 1);
    
    handleUpdateInvestment(investmentId, 'owners', JSON.stringify(owners));
    handleUpdateInvestment(investmentId, 'ownershipPercentages', JSON.stringify(percentages));
  }, [filteredInvestments, handleUpdateInvestment]);

  const handleOwnerChange = useCallback((investmentId: number, ownerIndex: number, newOwner: string) => {
    const investment = filteredInvestments.find(inv => inv.id === investmentId);
    if (!investment) return;
    
    let owners: string[];
    try {
      owners = JSON.parse(investment.owners || '["Donald Edwards"]');
    } catch (error) {
      owners = [investment.owners || 'Donald Edwards'];
    }
    owners[ownerIndex] = newOwner;
    
    handleUpdateInvestment(investmentId, 'owners', JSON.stringify(owners));
  }, [filteredInvestments, handleUpdateInvestment]);

  const handlePercentageChange = useCallback((investmentId: number, ownerIndex: number, newPercentage: string) => {
    const investment = filteredInvestments.find(inv => inv.id === investmentId);
    if (!investment) return;
    
    let percentages: string[];
    try {
      percentages = JSON.parse(investment.ownershipPercentages || '["100%"]');
    } catch (error) {
      percentages = [investment.ownershipPercentages || '100%'];
    }
    const formattedValue = formatPercentageValue(newPercentage);
    percentages[ownerIndex] = formattedValue;
    
    handleUpdateInvestment(investmentId, 'ownershipPercentages', JSON.stringify(percentages));
  }, [filteredInvestments, handleUpdateInvestment]);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading voluntary investments...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading voluntary investments. Please try again.</div>;
  }

  return (
    <div >
      {/* Table */}
      <table className="min-w-full  border border-neutral-200 ">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider w-16">Actions</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider" colSpan={3}>Overview</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider" colSpan={5}>Bequeath To</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider" colSpan={4}>Exclusions</th>
            </tr>
            <tr className="border-b border-neutral-200">
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider"></th>
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
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {investments.map((investment: VoluntaryInvestment) => {
              let owners: string[], percentages: string[];
              try {
                owners = JSON.parse(investment.owners || '["Donald Edwards"]');
                percentages = JSON.parse(investment.ownershipPercentages || '["100%"]');
              } catch (error) {
                // Fallback for malformed JSON
                owners = [investment.owners || 'Donald Edwards'];
                percentages = [investment.ownershipPercentages || '100%'];
              }
              
              return owners.map((owner: string, ownerIndex: number) => (
                <tr key={`${investment.id}-${ownerIndex}`} >
                  {ownerIndex === 0 && (
                    <>
                      <td rowSpan={owners.length} className="table-actions-cell text-center">
                        <ActionButtonGroup>
                          <DuplicateButton
                            onClick={() => handleDuplicateInvestment(investment)}
                            disabled={isUpdating}
                          />
                          <DeleteButton
                            onClick={() => handleDeleteInvestment(investment.id)}
                            disabled={isUpdating || deleteMutation.isPending}
                          />
                        </ActionButtonGroup>
                      </td>
                      <td rowSpan={owners.length} className="px-3 py-2 border-r border-neutral-200">
                        <input
                          type="text"
                          defaultValue={investment.description}
                          onBlur={(e) => handleUpdateInvestment(investment.id, 'description', e.target.value)}
                          className={`${getFieldClass('description')} ${getValueClass(investment.description, 'text')}`}
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
                        <DeleteButton
                          onClick={() => handleRemoveOwner(investment.id, ownerIndex)}
                          disabled={isUpdating}
                        />
                      )}
                      {ownerIndex === owners.length - 1 && (
                        <AddButton
                          onClick={() => handleAddOwner(investment.id)}
                          disabled={isUpdating}
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      key={`percentage-${investment.id}-${ownerIndex}-${percentages[ownerIndex]}`}
                      defaultValue={percentages[ownerIndex] || '0%'}
                      onFocus={handleDefaultValueFocus}
                      onBlur={createEnhancedBlurHandler(
                        (e) => handlePercentageChange(investment.id, ownerIndex, e.target.value),
                        'percentage'
                      )}
                      className={`${getFieldClass('percentage')} ${getValueClass(percentages[ownerIndex] || '0%', 'percentage')}`}
                      disabled={isUpdating}
                    />
                  </td>
                  {ownerIndex === 0 && (
                    <>
                      <td rowSpan={owners.length} className="px-3 py-2 border-l border-neutral-200">
                        <input
                          key={`baseCost-${investment.id}-${investment.baseCost}`}
                          type="text"
                          defaultValue={formatCurrencyValue(investment.baseCost)}
                          onBlur={(e) => handleInputBlur(investment.id, 'baseCost', e.target.value)}
                          className={`${getFieldClass('amount')} ${getValueClass(formatCurrencyValue(investment.baseCost), 'currency')}`}
                          disabled={isUpdating}
                        />
                      </td>
                      <td rowSpan={owners.length} className="px-3 py-2">
                        <input
                          key={`marketValue-${investment.id}-${investment.marketValue}`}
                          type="text"
                          defaultValue={formatCurrencyValue(investment.marketValue)}
                          onBlur={(e) => handleInputBlur(investment.id, 'marketValue', e.target.value)}
                          className={`${getFieldClass('amount')} ${getValueClass(formatCurrencyValue(investment.marketValue), 'currency')}`}
                          disabled={isUpdating}
                        />
                      </td>
                      <td rowSpan={owners.length} className="px-3 py-2">
                        <input
                          key={`liquidationPercentage-${investment.id}-${investment.liquidationPercentage}`}
                          type="text"
                          defaultValue={investment.liquidationPercentage || "0%"}
                          onFocus={handleDefaultValueFocus}
                          onBlur={createEnhancedBlurHandler(
                            (e) => handleInputBlur(investment.id, 'liquidationPercentage', e.target.value),
                            'percentage'
                          )}
                          className={`${getFieldClass('percentage')} ${getValueClass(investment.liquidationPercentage || "0%", 'percentage')}`}
                          disabled={isUpdating}
                        />
                      </td>
                      <td rowSpan={owners.length} className="px-3 py-2">
                        <input
                          key={`spouse-${investment.id}-${investment.spouse}`}
                          type="text"
                          defaultValue={investment.spouse || "0%"}
                          onFocus={handleDefaultValueFocus}
                          onBlur={createEnhancedBlurHandler(
                            (e) => handleInputBlur(investment.id, 'spouse', e.target.value),
                            'percentage'
                          )}
                          className={`${getFieldClass('percentage')} ${getValueClass(investment.spouse || "0%", 'percentage')}`}
                          disabled={isUpdating}
                        />
                      </td>
                      <td rowSpan={owners.length} className="px-3 py-2 border-r border-neutral-200">
                        <input
                          key={`others-${investment.id}-${investment.others}`}
                          type="text"
                          defaultValue={investment.others || "0%"}
                          onFocus={handleDefaultValueFocus}
                          onBlur={createEnhancedBlurHandler(
                            (e) => handleInputBlur(investment.id, 'others', e.target.value),
                            'percentage'
                          )}
                          className={`${getFieldClass('percentage')} ${getValueClass(investment.others || "0%", 'percentage')}`}
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
                    </>
                  )}
                </tr>
              ));
            })}
            
            {/* Total Row */}
            {investments.length > 0 && (
              <tr className="border-t-2 border-neutral-300 font-bold">
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-800">Total</td>
                <td colSpan={2} className="px-3 py-2"></td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                  {formatCurrencyValue(totals.baseCost.toString())}
                </td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                  {formatCurrencyValue(totals.marketValue.toString())}
                </td>
                <td colSpan={7} className="px-3 py-2"></td>
              </tr>
            )}
            
            {investments.length === 0 && (
              <tr>
                <td colSpan={13} className="px-3 py-8 text-center text-neutral-500">
                  No voluntary investments found. Add new investments using the header button.
                </td>
              </tr>
            )}
          </tbody>
      </table>
    </div>
  );
}