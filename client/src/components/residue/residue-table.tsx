import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Residue } from '@shared/schema';
import { getFieldClass, getCellClass } from '@/lib/field-types';
import { formatPercentageValue, formatTextValue, getValueClass, handleDefaultValueFocus, createEnhancedBlurHandler } from '@/lib/formatting';
import { SafeFragment } from '@/lib/safe-fragment';

interface ResidueTableProps {
  viewMode: 'table' | 'hybrid';
  searchTerm?: string;
}

function ResidueTable({ viewMode, searchTerm }: ResidueTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: residueItems = [], isLoading, error } = useQuery<Residue[]>({
    queryKey: ['/api/residue'],
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

  const totals = useMemo(() => {
    return {
      count: residueItems.length,
      percentage: residueItems.reduce((sum: number, item: Residue) => {
        const value = parseFloat(item.percentage || '0') || 0;
        return sum + value;
      }, 0),
    };
  }, [residueItems]);

  const handleUpdateResidue = useCallback((id: number, field: keyof Residue, value: string | boolean | string[]) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof Residue, value: string, target?: HTMLInputElement) => {
    
    // Format the value based on field type
    let formattedValue = value;
    switch (field) {
      case 'percentage':
        formattedValue = formatPercentageValue(value);
        break;
      case 'entity':
        formattedValue = formatTextValue(value);
        break;
      default:
        formattedValue = value;
    }
    
    // Update DOM immediately for visual feedback
    if (target && formattedValue !== value) {
      target.value = formattedValue;
    }
    
    handleUpdateResidue(id, field, formattedValue);
  }, [handleUpdateResidue]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Loading residue...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500">Error loading residue</div>
      </div>
    );
  }

  // Ensure we have exactly one residue item
  const residueItem = residueItems[0] || { id: 1, entity: "Residue to registered charities", percentage: "0" };

  return (
    <div className="max-w-md mx-auto">
      <table className="w-full border-collapse">
        {/* Header */}
        <thead>
          <tr className="single-row-header">
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-left border-b border-neutral-200">
              Entity
            </th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200 w-24">
              Percentage
            </th>
          </tr>
        </thead>
        
        {/* Body */}
        <tbody>
          <SafeFragment key={`residue-${residueItem.id}`}>
            <tr>
              <td className="p-2 text-left">
                <span className="text-gray-700">Residue to registered charities</span>
              </td>
              <td className="p-2 text-center">
                <input
                  type="text"
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(residueItem.percentage, 'percentage')}`}
                  defaultValue={formatPercentageValue(residueItem.percentage)}
                  onFocus={handleDefaultValueFocus}
                  onBlur={createEnhancedBlurHandler(residueItem.id, 'percentage', handleInputBlur)}
                  disabled={isUpdating}
                />
              </td>
            </tr>
          </SafeFragment>
        </tbody>
        
        {/* Footer - Total */}
        <tfoot>
          <tr className="bg-neutral-50 border-t border-neutral-300">
            <td className="p-2 text-left font-semibold text-gray-700">
              Total
            </td>
            <td className="p-2 text-center font-semibold text-gray-700">
              {totals.percentage}%
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default ResidueTable;