import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Residue, InsertResidue } from '@shared/schema';
import { AddButton, ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { getFieldClass, getCellClass } from '@/lib/field-types';
import { formatCurrencyValue, formatPercentageValue, getValueClass, handleDefaultValueFocus, createEnhancedBlurHandler } from '@/lib/formatting';

interface ResidueTableProps {
  viewMode: 'table' | 'hybrid';
  searchTerm?: string;
}

function ResidueTable({ viewMode, searchTerm }: ResidueTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: residues = [], isLoading, error } = useQuery<Residue[]>({
    queryKey: ['/api/residue'],
  });

  const addMutation = useMutation({
    mutationFn: async (): Promise<Residue> => {
      const newResidue: InsertResidue = {
        description: "Enter details ...",
        amount: "R 0",
        increasePercentage: "0%",
      };
      
      const response = await fetch('/api/residue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newResidue),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add residue');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/residue'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to add residue:', error);
      setIsUpdating(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Residue> }) => {
      const response = await fetch(`/api/residue/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update residue');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/residue'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to update residue:', error);
      setIsUpdating(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/residue/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete residue');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/residue'] });
    }
  });

  const totals = useMemo(() => {
    return {
      count: residues.length,
      amount: residues.reduce((sum: number, residue: Residue) => {
        const value = parseFloat((residue.amount || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      increasePercentage: residues.reduce((sum: number, residue: Residue) => {
        const value = parseFloat((residue.increasePercentage || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
    };
  }, [residues]);

  const handleUpdateResidue = useCallback((id: number, field: keyof Residue, value: string | string[]) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof Residue, value: string) => {
    const enhancedBlurHandler = createEnhancedBlurHandler(field);
    const formattedValue = enhancedBlurHandler(value);
    handleUpdateResidue(id, field, formattedValue);
    
    const target = document.activeElement as HTMLInputElement;
    if (target && formattedValue !== value) {
      setTimeout(() => {
        target.value = formattedValue;
      }, 0);
    }
  }, [handleUpdateResidue]);

  const handleDeleteResidue = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this residue?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading residue...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading residue. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      <table>
        <thead>
          <tr>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center" rowSpan={2}>
              <AddButton onClick={() => addMutation.mutate()} disabled={isUpdating} />
            </th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={1}>Overview</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={2}>Financial Details</th>
          </tr>
          <tr>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Description</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Amount</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-end">Increase %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {residues.map((residue: Residue, index) => (
            <tr key={residue.id} className="hover:bg-neutral-50">
              <td className="table-actions-cell p-2 text-center">
                <ActionButtonGroup>
                  <DuplicateButton onClick={() => addMutation.mutate()} disabled={isUpdating} />
                  <DeleteButton onClick={() => handleDeleteResidue(residue.id)} disabled={isUpdating} />
                </ActionButtonGroup>
              </td>
              
              <td className="p-2 text-left">
                <input
                  type="text"
                  defaultValue={residue.description}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(residue.description, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(residue.id, 'description', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-right">
                <input
                  key={`amount-${residue.id}-${residue.amount}`}
                  type="text"
                  defaultValue={residue.amount}
                  className={`table-input ${getFieldClass('currency')} ${getValueClass(residue.amount, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(residue.id, 'amount', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-center">
                <input
                  key={`increasePercentage-${residue.id}-${residue.increasePercentage}`}
                  type="text"
                  defaultValue={residue.increasePercentage}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(residue.increasePercentage, 'percentage')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(residue.id, 'increasePercentage', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
            </tr>
          ))}
        </tbody>
        
        <tfoot>
          <tr>
            <td className="totals-cell-label text-right" colSpan={2}>Totals</td>
            <td className="totals-cell-value">R {totals.amount.toLocaleString()}</td>
            <td className="totals-cell-value">{totals.increasePercentage}%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default ResidueTable;