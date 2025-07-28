import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Residue, InsertResidue } from '@shared/schema';
import { AddButton, ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { getFieldClass, getCellClass } from '@/lib/field-types';
import { formatCurrencyValue, formatPercentageValue, isDefaultValue, getValueClass } from '@/lib/formatting';
import { handleDefaultValueFocus } from '@/lib/formatting';

interface ResidueTableProps {
  viewMode: 'table' | 'hybrid';
  searchTerm?: string;
}

export default function ResidueTable({ viewMode, searchTerm }: ResidueTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Query for residue
  const { data: residues = [], isLoading, error } = useQuery<Residue[]>({
    queryKey: ['/api/residue'],
  });

  // Add residue mutation
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

  // Update residue mutation
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

  // Delete residue mutation
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

  // Calculate totals
  const totals = useMemo(() => {
    return {
      count: residues.length,
      amount: residues.reduce((sum: number, residue: Residue) => {
        const value = parseFloat(residue.amount.replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
    };
  }, [residues]);

  const handleAddResidue = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  const handleUpdateResidue = useCallback((id: number, field: keyof Residue, value: string | string[]) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof Residue, value: string) => {
    let formattedValue: string;
    if (field === 'increasePercentage') {
      formattedValue = formatPercentageValue(value);
    } else if (field === 'amount') {
      formattedValue = formatCurrencyValue(value);
    } else {
      formattedValue = value;
    }
    handleUpdateResidue(id, field, formattedValue);
    
    // Update DOM element for immediate visual feedback
    const target = document.activeElement as HTMLInputElement;
    if (target && formattedValue !== value) {
      setTimeout(() => {
        target.value = formattedValue;
      }, 0);
    }
  }, [handleUpdateResidue]);

  const handleDeleteResidue = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this residue entry?')) {
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
          <tr className="border-b border-border">
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start section-end" rowSpan={2}>
              <AddButton onClick={handleAddResidue} disabled={isUpdating} />
            </th>
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
          {residues.map((residue: Residue, residueIndex) => (
            <tr key={residue.id} className="hover:bg-neutral-50">
              <td className="table-actions-cell p-1 text-center section-start section-end">
                <ActionButtonGroup>
                  <DuplicateButton
                    onClick={() => addMutation.mutate()}
                    disabled={isUpdating}
                  />
                  <DeleteButton
                    onClick={() => handleDeleteResidue(residue.id)}
                    disabled={isUpdating}
                  />
                </ActionButtonGroup>
              </td>
              
              <td className="p-1 section-start">
                <input
                  type="text"
                  defaultValue={residue.description}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(residue.description, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(residue.id, 'description', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1 section-start">
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
              
              <td className="p-1 section-end">
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
        
        {/* Totals Footer */}
        <tfoot className="bg-neutral-50 border-t border-neutral-300">
          <tr>
            <td className="p-1 text-right text-neutral-700" colSpan={2} style={{ fontSize: '0.875rem' }}>Totals</td>
            <td className="text-right" style={{ padding: '0.6rem 0.8rem' }}>
              <span style={{ fontFamily: 'inherit', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                R {totals.amount.toLocaleString()}
              </span>
            </td>
            <td className="p-1"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}