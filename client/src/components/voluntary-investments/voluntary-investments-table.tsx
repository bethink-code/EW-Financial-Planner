import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { VoluntaryInvestment, InsertVoluntaryInvestment } from '@shared/schema';
import { AddButton, ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { getFieldClass, getCellClass } from '@/lib/field-types';
import { formatCurrencyValue, formatPercentageValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';

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
        description: "Enter details ...",
        owners: ["Donald Edwards"],
        ownershipPercentages: ["100%"],
        baseCost: "R 0",
        marketValue: "R 0",
        liquidationPercentage: "100%",
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
      amount: investments.reduce((sum: number, investment: VoluntaryInvestment) => {
        const value = parseFloat((investment.marketValue || '0').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
    };
  }, [investments]);

  const handleUpdateInvestment = useCallback((id: number, field: keyof VoluntaryInvestment, value: string | string[]) => {
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
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={2}>Overview</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start section-end" colSpan={2}>Financial Details</th>
          </tr>
          <tr>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Description</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Owner</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Amount</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-end">Increase %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {investments.map((investment: VoluntaryInvestment, index) => (
            <tr key={investment.id} className="hover:bg-neutral-50">
              <td className="table-actions-cell p-1 text-center section-start section-end">
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
              
              <td className="p-1 section-start">
                <input
                  type="text"
                  defaultValue={investment.description}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(investment.description, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(investment.id, 'description', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1">
                <input
                  type="text"
                  defaultValue={investment.owners?.[0] || "Enter details ..."}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(investment.owners?.[0] || "Enter details ...", 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleUpdateInvestment(investment.id, 'owners', [e.target.value])}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1 section-start">
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
              
              <td className="p-1 section-end">
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
            </tr>
          ))}
        </tbody>
        
        {/* Totals Footer */}
        <tfoot>
          <tr>
            <td className="totals-cell-label text-right" colSpan={3}>Totals</td>
            <td className="totals-cell-value section-start">R {totals.amount.toLocaleString()}</td>
            <td className="totals-cell-label section-end"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default VoluntaryInvestmentsTable;