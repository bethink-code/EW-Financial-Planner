import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AdditionalEstateDutyItems, InsertAdditionalEstateDutyItems } from '@shared/schema';
import { AddButton, ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { TableHeaderAddButton } from '@/components/ui/table-header-add-button';
import { getFieldClass } from '@/lib/field-types';
import { formatCurrencyValue, formatTextValue, getValueClass, handleDefaultValueFocus, createEnhancedBlurHandler } from '@/lib/formatting';
import { SafeFragment } from '@/lib/safe-fragment';

interface AdditionalEstateDutyItemsTableProps {
  viewMode?: 'table' | 'hybrid';
}

function AdditionalEstateDutyItemsTable({ viewMode = 'table' }: AdditionalEstateDutyItemsTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: items = [], isLoading, error } = useQuery<AdditionalEstateDutyItems[]>({
    queryKey: ['/api/additional-estate-duty-items'],
  });

  const addMutation = useMutation({
    mutationFn: async (): Promise<AdditionalEstateDutyItems> => {
      const newItem = {}; // Send empty object to use database defaults
      
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
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/additional-estate-duty-items'] });
    },
    onError: (error) => {
      console.error('Failed to delete additional estate duty item:', error);
    }
  });

  const handleUpdateItem = useCallback((id: number, updates: Partial<AdditionalEstateDutyItems>) => {
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof AdditionalEstateDutyItems, value: string) => {
    let formattedValue: string;
    if (field === 'amount') {
      formattedValue = formatCurrencyValue(value);
    } else {
      formattedValue = formatTextValue(value);
    }
    handleUpdateItem(id, { [field]: formattedValue });
    
    // Update the input field display
    const target = document.activeElement as HTMLInputElement;
    if (target && formattedValue !== value) {
      setTimeout(() => {
        target.value = formattedValue;
      }, 0);
    }
  }, [handleUpdateItem]);

  const handleCheckboxChange = useCallback((id: number, field: keyof AdditionalEstateDutyItems, checked: boolean) => {
    handleUpdateItem(id, { [field]: checked });
  }, [handleUpdateItem]);

  const handleDeleteItem = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this additional estate duty item?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const handleDuplicateItem = useCallback((item: AdditionalEstateDutyItems) => {
    const newItem: InsertAdditionalEstateDutyItems = {
      description: item.description || "",
      amount: item.amount || "R 0",
      deduction: item.deduction || false,
      excludeFromJointEstate: item.excludeFromJointEstate || false,
    };
    
    const response = fetch('/api/additional-estate-duty-items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newItem),
    }).then(res => res.json());
    
    response.then(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/additional-estate-duty-items'] });
    });
  }, []);

  if (isLoading) {
    return <div className="flex justify-center">Loading additional estate duty items...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error loading additional estate duty items. Please try again.</div>;
  }

  // Calculate totals
  const totalAmount = items.reduce((sum, item) => {
    const amount = parseFloat(item.amount?.replace(/[R\s,]/g, '') || '0');
    return sum + amount;
  }, 0);

  if (viewMode === "table") {
    return (
      <div className="table-container-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th className="table-actions-cell section-start">
                <TableHeaderAddButton
                  onClick={() => addMutation.mutate()}
                  disabled={addMutation.isPending}
                  title="Add new item"
                />
              </th>
              <th className="p-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                Description
              </th>
              <th className="p-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                Amount
              </th>
              <th className="p-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                Deduction?
              </th>
              <th className="p-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
                Exclude from joint estate for 'In community'?
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <SafeFragment key={`item-${item.id}`}>
                <tr>
                  <td className="table-actions-cell section-start">
                    <ActionButtonGroup>
                      <DuplicateButton
                        onClick={() => handleDuplicateItem(item)}
                        size="sm"
                      />
                      <DeleteButton
                        onClick={() => handleDeleteItem(item.id)}
                        size="sm"
                      />
                    </ActionButtonGroup>
                  </td>
                  <td className="p-2 text-left">
                    <input
                      type="text"
                      className={`table-input ${getFieldClass('text')} ${getValueClass(item.description, 'text')}`}
                      defaultValue={formatTextValue(item.description || "")}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(item.id, 'description', e.target.value)}
                    />
                  </td>
                  <td className="p-2 text-right">
                    <input
                      type="text"
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(item.amount, 'currency')}`}
                      defaultValue={item.amount || "R 0"}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(item.id, 'amount', e.target.value)}
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={item.deduction || false}
                      onChange={(e) => handleCheckboxChange(item.id, 'deduction', e.target.checked)}
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={item.excludeFromJointEstate || false}
                      onChange={(e) => handleCheckboxChange(item.id, 'excludeFromJointEstate', e.target.checked)}
                    />
                  </td>
                </tr>
              </SafeFragment>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-neutral-50 border-t border-neutral-300">
              <td className="section-start p-2 text-sm font-semibold text-neutral-700"></td>
              <td className="p-2 text-sm font-normal text-neutral-700">Totals</td>
              <td className="p-2 text-right text-sm font-semibold text-neutral-700">
                R {totalAmount.toLocaleString()}
              </td>
              <td className="p-2"></td>
              <td className="p-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  }

  // Hybrid view - same compact table as table view
  return (
    <div className="table-container-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th className="table-actions-cell section-start">
              <AddButton
                onClick={() => addMutation.mutate()}
                disabled={addMutation.isPending}
                size="sm"
              />
            </th>
            <th className="p-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
              Description
            </th>
            <th className="p-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
              Amount
            </th>
            <th className="p-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
              Deduction?
            </th>
            <th className="p-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">
              Exclude from joint estate for 'In community'?
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <SafeFragment key={`item-${item.id}`}>
              <tr>
                <td className="table-actions-cell section-start">
                  <ActionButtonGroup>
                    <DuplicateButton
                      onClick={() => handleDuplicateItem(item)}
                      size="sm"
                    />
                    <DeleteButton
                      onClick={() => handleDeleteItem(item.id)}
                      size="sm"
                    />
                  </ActionButtonGroup>
                </td>
                <td className="p-2 text-left">
                  <input
                    type="text"
                    className={`table-input ${getFieldClass('text')} ${getValueClass(item.description, 'text')}`}
                    defaultValue={formatTextValue(item.description || "")}
                    onFocus={handleDefaultValueFocus}
                    onBlur={(e) => handleInputBlur(item.id, 'description', e.target.value)}
                  />
                </td>
                <td className="p-2 text-right">
                  <input
                    type="text"
                    className={`table-input ${getFieldClass('currency')} ${getValueClass(item.amount, 'currency')}`}
                    defaultValue={item.amount || "R 0"}
                    onFocus={handleDefaultValueFocus}
                    onBlur={(e) => handleInputBlur(item.id, 'amount', e.target.value)}
                  />
                </td>
                <td className="p-2 text-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={item.deduction || false}
                    onChange={(e) => handleCheckboxChange(item.id, 'deduction', e.target.checked)}
                  />
                </td>
                <td className="p-2 text-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={item.excludeFromJointEstate || false}
                    onChange={(e) => handleCheckboxChange(item.id, 'excludeFromJointEstate', e.target.checked)}
                  />
                </td>
              </tr>
            </SafeFragment>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-neutral-50 border-t border-neutral-300">
            <td className="section-start p-2 text-sm font-semibold text-neutral-700"></td>
            <td className="p-2 text-sm font-normal text-neutral-700">Totals</td>
            <td className="p-2 text-right text-sm font-semibold text-neutral-700">
              R {totalAmount.toLocaleString()}
            </td>
            <td className="p-2"></td>
            <td className="p-2"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default AdditionalEstateDutyItemsTable;