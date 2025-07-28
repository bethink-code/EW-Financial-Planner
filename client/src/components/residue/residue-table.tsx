import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Residue, InsertResidue } from '@shared/schema';
import { AddButton, ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { getFieldClass, getCellClass } from '@/lib/field-types';
import { formatCurrencyValue, formatPercentageValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';

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
        beneficiary: "Enter beneficiary",
        percentage: "0%",
        additionalBeneficiaries: [],
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
      percentage: residues.reduce((sum: number, residue: Residue) => {
        const value = parseFloat((residue.percentage || '').replace(/[^\d.-]/g, '')) || 0;
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
    let formattedValue: string;
    if (field === 'percentage') {
      formattedValue = formatPercentageValue(value);
    } else {
      formattedValue = value;
    }
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
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start section-end" rowSpan={2}>
              <AddButton onClick={() => addMutation.mutate()} disabled={isUpdating} />
            </th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={2}>Overview</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start section-end">Distribution</th>
          </tr>
          <tr>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Description</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Beneficiary</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-end">Percentage</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {residues.map((residue: Residue, index) => (
            <tr key={residue.id} className="hover:bg-neutral-50">
              <td className="table-actions-cell p-1 text-center section-start section-end">
                <ActionButtonGroup>
                  <DuplicateButton onClick={() => addMutation.mutate()} disabled={isUpdating} />
                  <DeleteButton onClick={() => handleDeleteResidue(residue.id)} disabled={isUpdating} />
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
              
              <td className="p-1">
                <input
                  type="text"
                  defaultValue={residue.beneficiary}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(residue.beneficiary, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(residue.id, 'beneficiary', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1 section-end">
                <input
                  key={`percentage-${residue.id}-${residue.percentage}`}
                  type="text"
                  defaultValue={residue.percentage}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(residue.percentage, 'percentage')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(residue.id, 'percentage', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
            </tr>
          ))}
        </tbody>
        
        <tfoot>
          <tr>
            <td className="totals-cell-label text-right" colSpan={2}>Totals</td>
            <td className="totals-cell-value section-end">{totals.percentage}%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default ResidueTable;