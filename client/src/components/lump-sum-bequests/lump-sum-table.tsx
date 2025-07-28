import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { LumpSumBequests, InsertLumpSumBequests } from '@shared/schema';
import { AddButton, ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { getFieldClass, getCellClass } from '@/lib/field-types';
import { formatCurrencyValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';

interface LumpSumTableProps {
  viewMode: 'table' | 'hybrid';
  searchTerm?: string;
}

function LumpSumTable({ viewMode, searchTerm }: LumpSumTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Query for lump sum bequests
  const { data: bequests = [], isLoading, error } = useQuery<LumpSumBequests[]>({
    queryKey: ['/api/lump-sum-bequests'],
  });

  // Add bequest mutation
  const addMutation = useMutation({
    mutationFn: async (): Promise<LumpSumBequests> => {
      const newBequest: InsertLumpSumBequests = {
        description: "Enter details ...",
        beneficiary: "Enter beneficiary",
        amount: "R 0",
        additionalBeneficiaries: [],
      };
      
      const response = await fetch('/api/lump-sum-bequests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBequest),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add lump sum bequest');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lump-sum-bequests'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to add lump sum bequest:', error);
      setIsUpdating(false);
    }
  });

  // Update bequest mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<LumpSumBequests> }) => {
      const response = await fetch(`/api/lump-sum-bequests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update lump sum bequest');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lump-sum-bequests'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to update lump sum bequest:', error);
      setIsUpdating(false);
    }
  });

  // Delete bequest mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/lump-sum-bequests/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete lump sum bequest');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lump-sum-bequests'] });
    }
  });

  // Calculate totals
  const totals = useMemo(() => {
    return {
      count: bequests.length,
      amount: bequests.reduce((sum: number, bequest: LumpSumBequests) => {
        const value = parseFloat(bequest.amount.replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
    };
  }, [bequests]);

  const handleUpdateBequest = useCallback((id: number, field: keyof LumpSumBequests, value: string | string[]) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof LumpSumBequests, value: string) => {
    let formattedValue: string;
    if (field === 'amount') {
      formattedValue = formatCurrencyValue(value);
    } else {
      formattedValue = value;
    }
    handleUpdateBequest(id, field, formattedValue);
    
    // Update DOM element for immediate visual feedback
    const target = document.activeElement as HTMLInputElement;
    if (target && formattedValue !== value) {
      setTimeout(() => {
        target.value = formattedValue;
      }, 0);
    }
  }, [handleUpdateBequest]);

  const handleDeleteBequest = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this lump sum bequest?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading lump sum bequests...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading lump sum bequests. Please try again.</div>;
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
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-end">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {bequests.map((bequest: LumpSumBequests, index) => (
            <tr key={bequest.id} className="hover:bg-neutral-50">
              <td className="table-actions-cell p-1 text-center section-start section-end">
                <ActionButtonGroup>
                  <DuplicateButton
                    onClick={() => addMutation.mutate()}
                    disabled={isUpdating}
                  />
                  <DeleteButton
                    onClick={() => handleDeleteBequest(bequest.id)}
                    disabled={isUpdating}
                  />
                </ActionButtonGroup>
              </td>
              
              <td className="p-1 section-start">
                <input
                  type="text"
                  defaultValue={bequest.description}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(bequest.description, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(bequest.id, 'description', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1">
                <input
                  type="text"
                  defaultValue={bequest.beneficiary}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(bequest.beneficiary, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(bequest.id, 'beneficiary', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1 section-end">
                <input
                  key={`amount-${bequest.id}-${bequest.amount}`}
                  type="text"
                  defaultValue={bequest.amount}
                  className={`table-input ${getFieldClass('currency')} ${getValueClass(bequest.amount, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(bequest.id, 'amount', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
            </tr>
          ))}
        </tbody>
        
        {/* Totals Footer */}
        <tfoot>
          <tr>
            <td className="totals-cell-label text-right" colSpan={2}>Totals</td>
            <td className="totals-cell-value section-end">R {totals.amount.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export { LumpSumTable };