import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AssetsAndLiabilities, InsertAssetsAndLiabilities } from '@shared/schema';
import { AddButton, ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { getFieldClass, getCellClass } from '@/lib/field-types';
import { formatCurrencyValue, formatPercentageValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';

interface LiabilitiesTableProps {
  viewMode: 'table' | 'hybrid';
  searchTerm?: string;
}

function LiabilitiesTable({ viewMode, searchTerm }: LiabilitiesTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Query for liabilities
  const { data: liabilities = [], isLoading, error } = useQuery<AssetsAndLiabilities[]>({
    queryKey: ['/api/liabilities'],
  });

  // Add liability mutation
  const addMutation = useMutation({
    mutationFn: async (): Promise<AssetsAndLiabilities> => {
      const newLiability: InsertAssetsAndLiabilities = {
        description: "Enter details ...",
        owner: "Donald Edwards",
        amount: "R 0",
        increasePercentage: "0%",
        additionalOwners: [],
      };
      
      const response = await fetch('/api/liabilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLiability),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add liability');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/liabilities'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to add liability:', error);
      setIsUpdating(false);
    }
  });

  // Update liability mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<AssetsAndLiabilities> }) => {
      const response = await fetch(`/api/liabilities/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update liability');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/liabilities'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to update liability:', error);
      setIsUpdating(false);
    }
  });

  // Delete liability mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/liabilities/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete liability');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/liabilities'] });
    }
  });

  // Calculate totals
  const totals = useMemo(() => {
    return {
      count: liabilities.length,
      amount: liabilities.reduce((sum: number, liability: AssetsAndLiabilities) => {
        const value = parseFloat((liability.amount || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
    };
  }, [liabilities]);

  const handleUpdateLiability = useCallback((id: number, field: keyof AssetsAndLiabilities, value: string | string[]) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof AssetsAndLiabilities, value: string) => {
    let formattedValue: string;
    if (field === 'increasePercentage') {
      formattedValue = formatPercentageValue(value);
    } else if (field === 'amount') {
      formattedValue = formatCurrencyValue(value);
    } else {
      formattedValue = value;
    }
    handleUpdateLiability(id, field, formattedValue);
    
    // Update DOM element for immediate visual feedback
    const target = document.activeElement as HTMLInputElement;
    if (target && formattedValue !== value) {
      setTimeout(() => {
        target.value = formattedValue;
      }, 0);
    }
  }, [handleUpdateLiability]);

  const handleDeleteLiability = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this liability?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading liabilities...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading liabilities. Please try again.</div>;
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
          {liabilities.map((liability: AssetsAndLiabilities, index) => (
            <tr key={liability.id} className="hover:bg-neutral-50">
              <td className="table-actions-cell p-1 text-center section-start section-end">
                <ActionButtonGroup>
                  <DuplicateButton
                    onClick={() => addMutation.mutate()}
                    disabled={isUpdating}
                  />
                  <DeleteButton
                    onClick={() => handleDeleteLiability(liability.id)}
                    disabled={isUpdating}
                  />
                </ActionButtonGroup>
              </td>
              
              <td className="p-1 section-start">
                <input
                  type="text"
                  defaultValue={liability.description}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(liability.description, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(liability.id, 'description', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1">
                <input
                  type="text"
                  defaultValue={liability.owner}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(liability.owner, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(liability.id, 'owner', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1 section-start">
                <input
                  key={`amount-${liability.id}-${liability.amount}`}
                  type="text"
                  defaultValue={liability.amount}
                  className={`table-input ${getFieldClass('currency')} ${getValueClass(liability.amount, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(liability.id, 'amount', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1 section-end">
                <input
                  key={`increasePercentage-${liability.id}-${liability.increasePercentage}`}
                  type="text"
                  defaultValue={liability.increasePercentage}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(liability.increasePercentage, 'percentage')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(liability.id, 'increasePercentage', e.target.value)}
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

export { LiabilitiesTable };