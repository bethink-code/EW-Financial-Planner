import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AdditionalEstateDutyItems, InsertAdditionalEstateDutyItems } from '@shared/schema';
import { AddButton, ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { getFieldClass, getCellClass } from '@/lib/field-types';
import { formatCurrencyValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';

interface AdditionalEstateDutyItemsTableProps {
  viewMode: 'table' | 'hybrid';
  searchTerm?: string;
}

function AdditionalEstateDutyItemsTable({ viewMode, searchTerm }: AdditionalEstateDutyItemsTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: items = [], isLoading, error } = useQuery<AdditionalEstateDutyItems[]>({
    queryKey: ['/api/additional-estate-duty-items'],
  });

  const addMutation = useMutation({
    mutationFn: async (): Promise<AdditionalEstateDutyItems> => {
      const newItem: InsertAdditionalEstateDutyItems = {
        description: "Enter details ...",
        owner: "Donald Edwards",
        amount: "R 0",
        additionalOwners: [],
      };
      
      const response = await fetch('/api/additional-estate-duty-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add additional estate duty item');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/additional-estate-duty-items'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to add additional estate duty item:', error);
      setIsUpdating(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<AdditionalEstateDutyItems> }) => {
      const response = await fetch(`/api/additional-estate-duty-items/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update additional estate duty item');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/additional-estate-duty-items'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to update additional estate duty item:', error);
      setIsUpdating(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/additional-estate-duty-items/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete additional estate duty item');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/additional-estate-duty-items'] });
    }
  });

  const totals = useMemo(() => {
    return {
      count: items.length,
      amount: items.reduce((sum: number, item: AdditionalEstateDutyItems) => {
        const value = parseFloat(item.amount.replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
    };
  }, [items]);

  const handleUpdateItem = useCallback((id: number, field: keyof AdditionalEstateDutyItems, value: string | string[]) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof AdditionalEstateDutyItems, value: string) => {
    let formattedValue: string;
    if (field === 'amount') {
      formattedValue = formatCurrencyValue(value);
    } else {
      formattedValue = value;
    }
    handleUpdateItem(id, field, formattedValue);
    
    const target = document.activeElement as HTMLInputElement;
    if (target && formattedValue !== value) {
      setTimeout(() => {
        target.value = formattedValue;
      }, 0);
    }
  }, [handleUpdateItem]);

  const handleDeleteItem = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this additional estate duty item?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading additional estate duty items...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading additional estate duty items. Please try again.</div>;
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
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Owner</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-end">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {items.map((item: AdditionalEstateDutyItems, index) => (
            <tr key={item.id} className="hover:bg-neutral-50">
              <td className="table-actions-cell p-1 text-center section-start section-end">
                <ActionButtonGroup>
                  <DuplicateButton onClick={() => addMutation.mutate()} disabled={isUpdating} />
                  <DeleteButton onClick={() => handleDeleteItem(item.id)} disabled={isUpdating} />
                </ActionButtonGroup>
              </td>
              
              <td className="p-1 section-start">
                <input
                  type="text"
                  defaultValue={item.description}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(item.description, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(item.id, 'description', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1">
                <input
                  type="text"
                  defaultValue={item.owner}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(item.owner, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(item.id, 'owner', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1 section-end">
                <input
                  key={`amount-${item.id}-${item.amount}`}
                  type="text"
                  defaultValue={item.amount}
                  className={`table-input ${getFieldClass('currency')} ${getValueClass(item.amount, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(item.id, 'amount', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
            </tr>
          ))}
        </tbody>
        
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

export default AdditionalEstateDutyItemsTable;