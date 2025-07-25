import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { IncomeProvisions, InsertIncomeProvisions } from '@shared/schema';
import { ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { getFieldClass, getFieldWidth } from '@/lib/field-types';
import { formatCurrencyValue, formatPercentageValue, isDefaultValue, getValueClass } from '@/lib/formatting';
import { handleDefaultValueFocus, createEnhancedBlurHandler } from '@/lib/formatting';

interface IncomeProvisionsTableProps {
  viewMode: 'table' | 'hybrid';
  searchTerm?: string;
}

export default function IncomeProvisionsTable({ viewMode, searchTerm }: IncomeProvisionsTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Query for income provisions
  const { data: provisions = [], isLoading, error } = useQuery<IncomeProvisions[]>({
    queryKey: ['/api/income-provisions'],
  });

  // Add provision mutation
  const addMutation = useMutation({
    mutationFn: async (): Promise<IncomeProvisions> => {
      const newProvision: InsertIncomeProvisions = {
        description: "Enter details ...",
        amount: "R 0",
        increasePercentage: "0%",
      };
      
      const response = await fetch('/api/income-provisions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProvision),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add income provision');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-provisions'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to add income provision:', error);
      setIsUpdating(false);
    }
  });

  // Update provision mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<IncomeProvisions> }) => {
      const response = await fetch(`/api/income-provisions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update income provision');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-provisions'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to update income provision:', error);
      setIsUpdating(false);
    }
  });

  // Delete provision mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/income-provisions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete income provision');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-provisions'] });
    }
  });

  // Calculate totals
  const totals = useMemo(() => {
    return {
      count: provisions.length,
      amount: provisions.reduce((sum: number, provision: IncomeProvisions) => {
        const value = parseFloat(provision.amount.replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
    };
  }, [provisions]);

  const handleAddProvision = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  const handleUpdateProvision = useCallback((id: number, field: keyof IncomeProvisions, value: string | string[]) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof IncomeProvisions, value: string) => {
    let formattedValue: string;
    if (field === 'increasePercentage') {
      formattedValue = formatPercentageValue(value);
    } else if (field === 'amount') {
      formattedValue = formatCurrencyValue(value);
    } else {
      formattedValue = value;
    }
    handleUpdateProvision(id, field, formattedValue);
    
    // Update DOM element for immediate visual feedback
    const target = document.activeElement as HTMLInputElement;
    if (target && formattedValue !== value) {
      setTimeout(() => {
        target.value = formattedValue;
      }, 0);
    }
  }, [handleUpdateProvision]);

  const handleDeleteProvision = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this income provision?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading income provisions...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading income provisions. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      <table>
        <thead>
          <tr className="border-b border-border">
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start section-end" rowSpan={2}>Actions</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={1}>Overview</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start section-end" colSpan={2}>Financial Details</th>
          </tr>
          <tr className="border-b border-border">
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start border-b border-neutral-200">Description</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start border-b border-neutral-200">Amount</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-end border-b border-neutral-200">Increase %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {provisions.map((provision: IncomeProvisions, provisionIndex) => (
            <tr key={provision.id} className="hover:bg-neutral-50">
              <td className="table-actions-cell p-1 text-center section-start section-end">
                <ActionButtonGroup>
                  <DuplicateButton
                    onClick={() => addMutation.mutate()}
                    disabled={isUpdating}
                  />
                  <DeleteButton
                    onClick={() => handleDeleteProvision(provision.id)}
                    disabled={isUpdating}
                  />
                </ActionButtonGroup>
              </td>
              
              <td className="p-1 section-start">
                <input
                  type="text"
                  defaultValue={provision.description}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(provision.description, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(provision.id, 'description', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1 section-start">
                <input
                  key={`amount-${provision.id}-${provision.amount}`}
                  type="text"
                  defaultValue={provision.amount}
                  className={`table-input ${getFieldClass('currency')} ${getValueClass(provision.amount, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(provision.id, 'amount', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1 section-end">
                <input
                  key={`increasePercentage-${provision.id}-${provision.increasePercentage}`}
                  type="text"
                  defaultValue={provision.increasePercentage}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(provision.increasePercentage, 'percentage')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(provision.id, 'increasePercentage', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
            </tr>
          ))}
          
          {/* Totals Row */}
          <tr className="table-total-row bg-neutral-100 font-bold">
            <td className="section-start section-end p-1 text-center font-bold">TOTALS</td>
            <td className="section-start p-1 font-bold">-</td>
            <td className="section-start p-1 font-bold">R {totals.amount.toLocaleString()}</td>
            <td className="section-end p-1 font-bold">-</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}