import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { VoluntaryInvestment, InsertVoluntaryInvestment } from '@shared/schema';
import { ActionButtonGroup, DuplicateButton, DeleteButton, AddButton } from '@/components/ui/action-buttons';
import { getFieldClass } from '@/lib/field-types';
import { formatCurrencyValue, formatPercentageValue, isDefaultValue, getValueClass } from '@/lib/formatting';
import { handleDefaultValueFocus } from '@/lib/formatting';
import { UserPlus, UserMinus } from 'lucide-react';

interface VoluntaryInvestmentsTableProps {
  viewMode: 'table' | 'hybrid';
  searchTerm?: string;
}

const OWNER_OPTIONS = [
  { value: "Donald Edwards", label: "Donald Edwards" },
  { value: "Betty Edwards", label: "Betty Edwards" },
  { value: "Both", label: "Both" },
];

export default function VoluntaryInvestmentsTable({ viewMode, searchTerm }: VoluntaryInvestmentsTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Query for voluntary investments
  const { data: investments = [], isLoading, error } = useQuery<VoluntaryInvestment[]>({
    queryKey: ['/api/voluntary-investments'],
  });

  // Add investment mutation
  const addMutation = useMutation({
    mutationFn: async (): Promise<VoluntaryInvestment> => {
      const newInvestment: InsertVoluntaryInvestment = {
        description: "Enter details ...",
        owners: ["Donald Edwards"],
        ownershipPercentages: ["100%"],
        baseCost: "R 0",
        marketValue: "R 0",
        liquidationPercentage: "0%",
        spouse: "R 0",
        others: "R 0",
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
        throw new Error('Failed to add voluntary investment');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/voluntary-investments'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to add voluntary investment:', error);
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
        throw new Error('Failed to update voluntary investment');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/voluntary-investments'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to update voluntary investment:', error);
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
        throw new Error('Failed to delete voluntary investment');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/voluntary-investments'] });
    }
  });

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
      spouse: investments.reduce((sum: number, investment: VoluntaryInvestment) => {
        const value = parseFloat(investment.spouse.replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      others: investments.reduce((sum: number, investment: VoluntaryInvestment) => {
        const value = parseFloat(investment.others.replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
    };
  }, [investments]);

  const handleUpdateInvestment = useCallback((id: number, field: keyof VoluntaryInvestment, value: string | boolean) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof VoluntaryInvestment, value: string) => {
    let formattedValue: string;
    if (field === 'liquidationPercentage') {
      formattedValue = formatPercentageValue(value);
    } else if (['baseCost', 'marketValue', 'spouse', 'others'].includes(field as string)) {
      formattedValue = formatCurrencyValue(value);
    } else {
      formattedValue = value;
    }
    handleUpdateInvestment(id, field, formattedValue);
    
    // Update DOM element for immediate visual feedback
    const target = document.activeElement as HTMLInputElement;
    if (target && formattedValue !== value) {
      setTimeout(() => {
        target.value = formattedValue;
      }, 0);
    }
  }, [handleUpdateInvestment]);

  const handleCheckboxChange = useCallback((id: number, field: keyof VoluntaryInvestment, checked: boolean) => {
    handleUpdateInvestment(id, field, checked);
  }, [handleUpdateInvestment]);

  const handleDeleteInvestment = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this voluntary investment?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  // Owner management functions
  const handleAddOwner = useCallback((investmentId: number, investment: VoluntaryInvestment) => {
    const newOwners = [...investment.owners, "Donald Edwards"];
    const newPercentages = [...investment.ownershipPercentages, "0%"];
    
    updateMutation.mutate({ 
      id: investmentId, 
      updates: { 
        owners: newOwners,
        ownershipPercentages: newPercentages
      } 
    });
  }, [updateMutation]);

  const handleDeleteOwner = useCallback((investmentId: number, ownerIndex: number, investment: VoluntaryInvestment) => {
    if (investment.owners.length <= 1) return; // Keep at least one owner
    
    const newOwners = [...investment.owners];
    const newPercentages = [...investment.ownershipPercentages];
    newOwners.splice(ownerIndex, 1);
    newPercentages.splice(ownerIndex, 1);
    
    updateMutation.mutate({ 
      id: investmentId, 
      updates: { 
        owners: newOwners,
        ownershipPercentages: newPercentages
      } 
    });
  }, [updateMutation]);

  const handleOwnerChange = useCallback((investmentId: number, ownerIndex: number, value: string, investment: VoluntaryInvestment) => {
    const newOwners = [...investment.owners];
    newOwners[ownerIndex] = value;
    
    updateMutation.mutate({ 
      id: investmentId, 
      updates: { owners: newOwners } 
    });
  }, [updateMutation]);

  const handleOwnerPercentageBlur = useCallback((investmentId: number, ownerIndex: number, value: string, investment: VoluntaryInvestment) => {
    const formattedValue = formatPercentageValue(value);
    const newPercentages = [...investment.ownershipPercentages];
    newPercentages[ownerIndex] = formattedValue;
    
    updateMutation.mutate({ 
      id: investmentId, 
      updates: { ownershipPercentages: newPercentages } 
    });
    
    // Update DOM element for immediate visual feedback
    const target = document.activeElement as HTMLInputElement;
    if (target && formattedValue !== value) {
      setTimeout(() => {
        target.value = formattedValue;
      }, 0);
    }
  }, [updateMutation]);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading voluntary investments...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading voluntary investments. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      <table>
        <thead>
          <tr className="border-b border-border">
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start section-end" rowSpan={2}>Actions</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={3}>Overview</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={3}>Investment Details</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={2}>Bequeath To</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start section-end" colSpan={4}>Exclusions</th>
          </tr>
          <tr className="border-b border-border">
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start border-b border-neutral-200">Description</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Owner</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Ownership %</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start border-b border-neutral-200">Base Cost</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Market Value</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Liquidation %</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start border-b border-neutral-200">Spouse</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Others</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start border-b border-neutral-200">Joint Estate</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Estate Duty</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">CGT</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-end border-b border-neutral-200">Executor Fees</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {investments.map((investment: VoluntaryInvestment) => {
            const maxRows = Math.max(investment.owners.length, 1);
            
            return Array.from({ length: maxRows }, (_, rowIndex) => (
              <tr key={`${investment.id}-${rowIndex}-${investment.owners.length}`} className="hover:bg-neutral-50">
                {rowIndex === 0 && (
                  <td rowSpan={maxRows} className="table-actions-cell p-1 text-center section-start section-end align-top">
                    <div className="mt-2">
                      <ActionButtonGroup>
                        <DuplicateButton
                          onClick={() => addMutation.mutate()}
                          disabled={isUpdating}
                        />
                        <DeleteButton
                          onClick={() => handleDeleteInvestment(investment.id)}
                          disabled={isUpdating}
                        />
                      </ActionButtonGroup>
                    </div>
                  </td>
                )}
                
                {rowIndex === 0 && (
                  <td rowSpan={maxRows} className="p-1 section-start align-top">
                    <input
                      type="text"
                      defaultValue={investment.description}
                      className={`table-input ${getFieldClass('text')} ${getValueClass(investment.description, 'text')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(investment.id, 'description', e.target.value)}
                      disabled={isUpdating}
                    />
                  </td>
                )}
                
                <td className="p-1">
                  {rowIndex < investment.owners.length && (
                    <div className="flex items-center gap-1">
                      <input
                        key={`owner-${investment.id}-${rowIndex}-${investment.owners[rowIndex]}`}
                        type="text"
                        defaultValue={investment.owners[rowIndex] || "Enter details ..."}
                        className={`table-input ${getFieldClass('text')} ${getValueClass(investment.owners[rowIndex] || "Enter details ...", 'text')} flex-1`}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => handleOwnerChange(investment.id, rowIndex, e.target.value, investment)}
                        disabled={isUpdating}
                      />
                      {rowIndex === 0 ? (
                        <AddButton
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddOwner(investment.id, investment);
                          }}
                          size="sm"
                          disabled={isUpdating}
                        />
                      ) : (
                        <DeleteButton
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteOwner(investment.id, rowIndex, investment);
                          }}
                          size="sm"
                          disabled={isUpdating}
                        />
                      )}
                    </div>
                  )}
                </td>
                
                <td className="p-1">
                  {rowIndex < investment.ownershipPercentages.length && (
                    <input
                      key={`ownershipPercentage-${investment.id}-${rowIndex}-${investment.ownershipPercentages[rowIndex]}`}
                      type="text"
                      defaultValue={investment.ownershipPercentages[rowIndex] || "0%"}
                      className={`table-input ${getFieldClass('percentage')} ${getValueClass(investment.ownershipPercentages[rowIndex] || "0%", 'percentage')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleOwnerPercentageBlur(investment.id, rowIndex, e.target.value, investment)}
                      disabled={isUpdating}
                    />
                  )}
                </td>
                
                {rowIndex === 0 && (
                  <td rowSpan={maxRows} className="p-1 section-start align-top">
                    <input
                      key={`baseCost-${investment.id}-${investment.baseCost}`}
                      type="text"
                      defaultValue={investment.baseCost}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(investment.baseCost, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(investment.id, 'baseCost', e.target.value)}
                      disabled={isUpdating}
                    />
                  </td>
                )}
                
                {rowIndex === 0 && (
                  <td rowSpan={maxRows} className="p-1 align-top">
                    <input
                      key={`marketValue-${investment.id}-${investment.marketValue}`}
                      type="text"
                      defaultValue={investment.marketValue}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(investment.marketValue, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(investment.id, 'marketValue', e.target.value)}
                      disabled={isUpdating}
                    />
                  </td>
                )}
                
                {rowIndex === 0 && (
                  <td rowSpan={maxRows} className="p-1 align-top">
                    <input
                      key={`liquidationPercentage-${investment.id}-${investment.liquidationPercentage}`}
                      type="text"
                      defaultValue={investment.liquidationPercentage}
                      className={`table-input ${getFieldClass('percentage')} ${getValueClass(investment.liquidationPercentage, 'percentage')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(investment.id, 'liquidationPercentage', e.target.value)}
                      disabled={isUpdating}
                    />
                  </td>
                )}
                
                {rowIndex === 0 && (
                  <td rowSpan={maxRows} className="p-1 section-start align-top">
                    <input
                      key={`spouse-${investment.id}-${investment.spouse}`}
                      type="text"
                      defaultValue={investment.spouse}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(investment.spouse, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(investment.id, 'spouse', e.target.value)}
                      disabled={isUpdating}
                    />
                  </td>
                )}
                
                {rowIndex === 0 && (
                  <td rowSpan={maxRows} className="p-1 align-top">
                    <input
                      key={`others-${investment.id}-${investment.others}`}
                      type="text"
                      defaultValue={investment.others}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(investment.others, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(investment.id, 'others', e.target.value)}
                      disabled={isUpdating}
                    />
                  </td>
                )}
                
                {rowIndex === 0 && (
                  <td rowSpan={maxRows} className="p-1 text-center section-start align-top">
                    <input
                      type="checkbox"
                      checked={investment.excludedFromJointEstate}
                      onChange={(e) => handleCheckboxChange(investment.id, 'excludedFromJointEstate', e.target.checked)}
                      className="w-4 h-4 mt-2"
                      disabled={isUpdating}
                    />
                  </td>
                )}
                
                {rowIndex === 0 && (
                  <td rowSpan={maxRows} className="p-1 text-center align-top">
                    <input
                      type="checkbox"
                      checked={investment.excludedFromEstateDuty}
                      onChange={(e) => handleCheckboxChange(investment.id, 'excludedFromEstateDuty', e.target.checked)}
                      className="w-4 h-4 mt-2"
                      disabled={isUpdating}
                    />
                  </td>
                )}
                
                {rowIndex === 0 && (
                  <td rowSpan={maxRows} className="p-1 text-center align-top">
                    <input
                      type="checkbox"
                      checked={investment.excludedFromCGT}
                      onChange={(e) => handleCheckboxChange(investment.id, 'excludedFromCGT', e.target.checked)}
                      className="w-4 h-4 mt-2"
                      disabled={isUpdating}
                    />
                  </td>
                )}
                
                {rowIndex === 0 && (
                  <td rowSpan={maxRows} className="p-1 text-center section-end align-top">
                    <input
                      type="checkbox"
                      checked={investment.excludedFromExecutorsFees}
                      onChange={(e) => handleCheckboxChange(investment.id, 'excludedFromExecutorsFees', e.target.checked)}
                      className="w-4 h-4 mt-2"
                      disabled={isUpdating}
                    />
                  </td>
                )}
              </tr>
            ));
          }).flat()}
          
          {/* Totals Row */}
          <tr className="table-total-row bg-neutral-100 font-bold">
            <td className="section-start section-end p-1 text-center font-bold">TOTALS</td>
            <td className="section-start p-1 font-bold">-</td>
            <td className="p-1 font-bold">-</td>
            <td className="p-1 font-bold">-</td>
            <td className="section-start p-1 font-bold">R {totals.baseCost.toLocaleString()}</td>
            <td className="p-1 font-bold">R {totals.marketValue.toLocaleString()}</td>
            <td className="p-1 font-bold">-</td>
            <td className="section-start p-1 font-bold">R {totals.spouse.toLocaleString()}</td>
            <td className="p-1 font-bold">R {totals.others.toLocaleString()}</td>
            <td className="section-start p-1 font-bold">-</td>
            <td className="p-1 font-bold">-</td>
            <td className="p-1 font-bold">-</td>
            <td className="section-end p-1 font-bold">-</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}