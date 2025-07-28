import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { IncomeNeeds, InsertIncomeNeeds } from '@shared/schema';
import { AddButton, ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { getFieldClass, getCellClass } from '@/lib/field-types';
import { formatCurrencyValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';

interface IncomeNeedsTableProps {
  viewMode: 'table' | 'hybrid';
  searchTerm?: string;
}

function IncomeNeedsTable({ viewMode, searchTerm }: IncomeNeedsTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: incomeNeeds = [], isLoading, error } = useQuery<IncomeNeeds[]>({
    queryKey: ['/api/income-needs'],
  });

  const addMutation = useMutation({
    mutationFn: async (): Promise<IncomeNeeds> => {
      const newIncomeNeed: InsertIncomeNeeds = {
        description: "Enter details ...",
        beneficiary: "Enter beneficiary",
        monthlyAmount: "R 0",
        additionalBeneficiaries: [],
      };
      
      const response = await fetch('/api/income-needs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newIncomeNeed),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add income need');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-needs'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to add income need:', error);
      setIsUpdating(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<IncomeNeeds> }) => {
      const response = await fetch(`/api/income-needs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update income need');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-needs'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to update income need:', error);
      setIsUpdating(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/income-needs/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete income need');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-needs'] });
    }
  });

  const totals = useMemo(() => {
    return {
      count: incomeNeeds.length,
      monthlyAmount: incomeNeeds.reduce((sum: number, incomeNeed: IncomeNeeds) => {
        const value = parseFloat((incomeNeed.monthlyAmount || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
    };
  }, [incomeNeeds]);

  const handleUpdateIncomeNeed = useCallback((id: number, field: keyof IncomeNeeds, value: string | string[]) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof IncomeNeeds, value: string) => {
    let formattedValue: string;
    if (field === 'monthlyAmount') {
      formattedValue = formatCurrencyValue(value);
    } else {
      formattedValue = value;
    }
    handleUpdateIncomeNeed(id, field, formattedValue);
    
    const target = document.activeElement as HTMLInputElement;
    if (target && formattedValue !== value) {
      setTimeout(() => {
        target.value = formattedValue;
      }, 0);
    }
  }, [handleUpdateIncomeNeed]);

  const handleDeleteIncomeNeed = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this income need?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading income needs...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading income needs. Please try again.</div>;
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
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start section-end">Financial Details</th>
          </tr>
          <tr>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Description</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Beneficiary</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-end">Monthly Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {incomeNeeds.map((incomeNeed: IncomeNeeds, index) => (
            <tr key={incomeNeed.id} className="hover:bg-neutral-50">
              <td className="table-actions-cell p-1 text-center section-start section-end">
                <ActionButtonGroup>
                  <DuplicateButton onClick={() => addMutation.mutate()} disabled={isUpdating} />
                  <DeleteButton onClick={() => handleDeleteIncomeNeed(incomeNeed.id)} disabled={isUpdating} />
                </ActionButtonGroup>
              </td>
              
              <td className="p-1 section-start">
                <input
                  type="text"
                  defaultValue={incomeNeed.description}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(incomeNeed.description, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(incomeNeed.id, 'description', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1">
                <input
                  type="text"
                  defaultValue={incomeNeed.beneficiary}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(incomeNeed.beneficiary, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(incomeNeed.id, 'beneficiary', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1 section-end">
                <input
                  key={`monthlyAmount-${incomeNeed.id}-${incomeNeed.monthlyAmount}`}
                  type="text"
                  defaultValue={incomeNeed.monthlyAmount}
                  className={`table-input ${getFieldClass('currency')} ${getValueClass(incomeNeed.monthlyAmount, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(incomeNeed.id, 'monthlyAmount', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
            </tr>
          ))}
        </tbody>
        
        <tfoot>
          <tr>
            <td className="totals-cell-label text-right" colSpan={2}>Totals</td>
            <td className="totals-cell-value section-end">R {totals.monthlyAmount.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default IncomeNeedsTable;