import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { VoluntaryInvestment, InsertVoluntaryInvestment } from '@shared/schema';
import { AddButton, ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';

import { getFieldClass, getCellClass } from '@/lib/field-types';
import { formatCurrencyValue, formatPercentageValue, formatTextValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';

interface VoluntaryInvestmentsTableProps {
  viewMode: 'table' | 'hybrid';
  searchTerm?: string;
}

function VoluntaryInvestmentsTable({ viewMode, searchTerm }: VoluntaryInvestmentsTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Query for voluntary investments
  const { data: investments = [], isLoading, error } = useQuery<VoluntaryInvestment[]>({
    queryKey: ['/api/voluntary-investments'],
  });

  // Add investment mutation
  const addMutation = useMutation({
    mutationFn: async (): Promise<VoluntaryInvestment> => {
      const newInvestment: InsertVoluntaryInvestment = {
        description: "",
        owners: ["Enter details ..."],
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
        const value = parseFloat((investment.baseCost || '0').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      marketValue: investments.reduce((sum: number, investment: VoluntaryInvestment) => {
        const value = parseFloat((investment.marketValue || '0').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      spouse: investments.reduce((sum: number, investment: VoluntaryInvestment) => {
        const value = parseFloat((investment.spouse || '0').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      others: investments.reduce((sum: number, investment: VoluntaryInvestment) => {
        const value = parseFloat((investment.others || '0').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
    };
  }, [investments]);

  const handleUpdateInvestment = useCallback((id: number, field: keyof VoluntaryInvestment, value: string | string[] | boolean) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof VoluntaryInvestment, value: string) => {
    let formattedValue: string;
    if (field === 'liquidationPercentage' || field.includes('Percentage')) {
      formattedValue = formatPercentageValue(value);
    } else if (field === 'baseCost' || field === 'marketValue' || field === 'spouse' || field === 'others') {
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

  const handleDeleteInvestment = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this voluntary investment?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const handleAddOwner = useCallback((investmentId: number, currentOwners: string[], currentPercentages: string[]) => {
    const newOwners = [...currentOwners, "Enter details ..."];
    const newPercentages = [...currentPercentages, "0%"];
    handleUpdateInvestment(investmentId, 'owners', newOwners);
    handleUpdateInvestment(investmentId, 'ownershipPercentages', newPercentages);
  }, [handleUpdateInvestment]);

  const handleDeleteOwner = useCallback((investmentId: number, ownerIndex: number, currentOwners: string[], currentPercentages: string[]) => {
    if (currentOwners.length <= 1) return; // Don't delete the last owner
    
    const newOwners = currentOwners.filter((_, index) => index !== ownerIndex);
    const newPercentages = currentPercentages.filter((_, index) => index !== ownerIndex);
    handleUpdateInvestment(investmentId, 'owners', newOwners);
    handleUpdateInvestment(investmentId, 'ownershipPercentages', newPercentages);
  }, [handleUpdateInvestment]);

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
          <tr>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start section-end" rowSpan={2}>
              <AddButton onClick={() => addMutation.mutate()} disabled={isUpdating} />
            </th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={3}>Overview</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={3}>Investment Details</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={2}>Bequeath To</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start section-end" colSpan={4}>Exclusions</th>
          </tr>
          <tr>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Description</th>
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
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-end border-b border-neutral-200">Executor's Fees</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {investments.map((investment: VoluntaryInvestment) => {
            const owners = Array.isArray(investment.owners) ? investment.owners : JSON.parse(investment.owners || '["Enter details ..."]');
            const percentages = Array.isArray(investment.ownershipPercentages) ? investment.ownershipPercentages : JSON.parse(investment.ownershipPercentages || '["100%"]');
            const maxRows = Math.max(owners.length, 1);
            
            return owners.map((owner: string, ownerIndex: number) => (
              <tr key={`${investment.id}-${ownerIndex}`} className="hover:bg-neutral-50">
                {ownerIndex === 0 && (
                  <td className="table-actions-cell p-1 text-center section-start section-end" rowSpan={maxRows}>
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
                  </td>
                )}
                
                {ownerIndex === 0 && (
                  <td className="p-2 vertical-align-middle" rowSpan={maxRows}>
                    <input
                      type="text"
                      defaultValue={formatTextValue(investment.description)}
                      className={`table-input ${getFieldClass('text')} ${getValueClass(investment.description, 'text')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(investment.id, 'description', e.target.value)}
                      disabled={isUpdating}
                    />
                  </td>
                )}
                
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      defaultValue={formatTextValue(owner)}
                      className={`table-input ${getFieldClass('text')} ${getValueClass(owner, 'text')} flex-1`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => {
                        const newOwners = [...owners];
                        newOwners[ownerIndex] = e.target.value;
                        handleUpdateInvestment(investment.id, 'owners', newOwners);
                      }}
                      disabled={isUpdating}
                    />
                    {ownerIndex === 0 && (
                      <AddButton
                        onClick={() => handleAddOwner(investment.id, owners, percentages)}
                        disabled={isUpdating}
                        size="sm"
                      />
                    )}
                    {ownerIndex > 0 && (
                      <DeleteButton
                        onClick={() => handleDeleteOwner(investment.id, ownerIndex, owners, percentages)}
                        disabled={isUpdating}
                        size="sm"
                      />
                    )}
                  </div>
                </td>
                
                <td className="p-2">
                  <input
                    type="text"
                    defaultValue={percentages[ownerIndex] || "0%"}
                    className={`table-input ${getFieldClass('percentage')} ${getValueClass(percentages[ownerIndex] || "0%", 'percentage')}`}
                    onFocus={handleDefaultValueFocus}
                    onBlur={(e) => {
                      const newPercentages = [...percentages];
                      newPercentages[ownerIndex] = e.target.value;
                      handleUpdateInvestment(investment.id, 'ownershipPercentages', newPercentages);
                    }}
                    disabled={isUpdating}
                  />
                </td>
                
                {ownerIndex === 0 && (
                  <>
                    <td className="p-2 section-start vertical-align-middle" rowSpan={maxRows}>
                      <input
                        type="text"
                        defaultValue={investment.baseCost}
                        className={`table-input ${getFieldClass('currency')} ${getValueClass(investment.baseCost, 'currency')}`}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => handleInputBlur(investment.id, 'baseCost', e.target.value)}
                        disabled={isUpdating}
                      />
                    </td>
                    
                    <td className="p-2 vertical-align-middle" rowSpan={maxRows}>
                      <input
                        type="text"
                        defaultValue={investment.marketValue}
                        className={`table-input ${getFieldClass('currency')} ${getValueClass(investment.marketValue, 'currency')}`}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => handleInputBlur(investment.id, 'marketValue', e.target.value)}
                        disabled={isUpdating}
                      />
                    </td>
                    
                    <td className="p-2 vertical-align-middle" rowSpan={maxRows}>
                      <input
                        type="text"
                        defaultValue={investment.liquidationPercentage}
                        className={`table-input ${getFieldClass('percentage')} ${getValueClass(investment.liquidationPercentage, 'percentage')}`}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => handleInputBlur(investment.id, 'liquidationPercentage', e.target.value)}
                        disabled={isUpdating}
                      />
                    </td>
                    
                    <td className="p-2 section-start vertical-align-middle" rowSpan={maxRows}>
                      <input
                        type="text"
                        defaultValue={investment.spouse}
                        className={`table-input ${getFieldClass('currency')} ${getValueClass(investment.spouse, 'currency')}`}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => handleInputBlur(investment.id, 'spouse', e.target.value)}
                        disabled={isUpdating}
                      />
                    </td>
                    
                    <td className="p-2 vertical-align-middle" rowSpan={maxRows}>
                      <input
                        type="text"
                        defaultValue={investment.others}
                        className={`table-input ${getFieldClass('currency')} ${getValueClass(investment.others, 'currency')}`}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => handleInputBlur(investment.id, 'others', e.target.value)}
                        disabled={isUpdating}
                      />
                    </td>
                    
                    <td className="p-2 text-center section-start vertical-align-middle" rowSpan={maxRows}>
                      <input
                        type="checkbox"
                        checked={investment.excludedFromJointEstate}
                        onChange={(e) => handleUpdateInvestment(investment.id, 'excludedFromJointEstate', e.target.checked)}
                        disabled={isUpdating}
                        className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                      />
                    </td>
                    
                    <td className="p-2 text-center vertical-align-middle" rowSpan={maxRows}>
                      <input
                        type="checkbox"
                        checked={investment.excludedFromEstateDuty}
                        onChange={(e) => handleUpdateInvestment(investment.id, 'excludedFromEstateDuty', e.target.checked)}
                        disabled={isUpdating}
                        className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                      />
                    </td>
                    
                    <td className="p-2 text-center vertical-align-middle" rowSpan={maxRows}>
                      <input
                        type="checkbox"
                        checked={investment.excludedFromCGT}
                        onChange={(e) => handleUpdateInvestment(investment.id, 'excludedFromCGT', e.target.checked)}
                        disabled={isUpdating}
                        className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                      />
                    </td>
                    
                    <td className="p-2 text-center section-end vertical-align-middle" rowSpan={maxRows}>
                      <input
                        type="checkbox"
                        checked={investment.excludedFromExecutorsFees}
                        onChange={(e) => handleUpdateInvestment(investment.id, 'excludedFromExecutorsFees', e.target.checked)}
                        disabled={isUpdating}
                        className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                      />
                    </td>
                  </>
                )}
              </tr>
            ));
          })}
        </tbody>
        
        {/* Totals Footer */}
        <tfoot>
          <tr>
            <td className="totals-cell-label text-right" colSpan={4}>Totals</td>
            <td className="totals-cell-value section-start">R {totals.baseCost.toLocaleString()}</td>
            <td className="totals-cell-value">R {totals.marketValue.toLocaleString()}</td>
            <td className="totals-cell-label"></td>
            <td className="totals-cell-value section-start">R {totals.spouse.toLocaleString()}</td>
            <td className="totals-cell-value">R {totals.others.toLocaleString()}</td>
            <td className="totals-cell-label section-start section-end" colSpan={4}></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default VoluntaryInvestmentsTable;