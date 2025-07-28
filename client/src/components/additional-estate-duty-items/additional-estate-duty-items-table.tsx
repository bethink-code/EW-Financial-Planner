import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AdditionalEstateDutyItems, InsertAdditionalEstateDutyItems } from '@shared/schema';
import { AddButton, ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { getFieldClass, getCellClass } from '@/lib/field-types';
import { formatCurrencyValue, formatPercentageValue, formatTextValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';

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
        category: "",
        description: "",
        amount: "R 0",
        increasePercentage: "0%",
        johnDoe: "0%",
        janetteDoe: "0%",
        doeJunior: "0%",
        doeFamilyTrust: "0%",
        estate: "R 0",
        others: "R 0",
        client: "R 0",
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
        const value = parseFloat((item.amount || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      increasePercentage: items.reduce((sum: number, item: AdditionalEstateDutyItems) => {
        const value = parseFloat((item.increasePercentage || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      johnDoe: items.reduce((sum: number, item: AdditionalEstateDutyItems) => {
        const value = parseFloat((item.johnDoe || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      janetteDoe: items.reduce((sum: number, item: AdditionalEstateDutyItems) => {
        const value = parseFloat((item.janetteDoe || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      doeJunior: items.reduce((sum: number, item: AdditionalEstateDutyItems) => {
        const value = parseFloat((item.doeJunior || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      doeFamilyTrust: items.reduce((sum: number, item: AdditionalEstateDutyItems) => {
        const value = parseFloat((item.doeFamilyTrust || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      estate: items.reduce((sum: number, item: AdditionalEstateDutyItems) => {
        const value = parseFloat((item.estate || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      others: items.reduce((sum: number, item: AdditionalEstateDutyItems) => {
        const value = parseFloat((item.others || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      client: items.reduce((sum: number, item: AdditionalEstateDutyItems) => {
        const value = parseFloat((item.client || '').replace(/[^\d.-]/g, '')) || 0;
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
    if (field === 'amount' || field === 'estate' || field === 'others' || field === 'client') {
      formattedValue = formatCurrencyValue(value);
    } else if (field === 'increasePercentage' || field === 'johnDoe' || field === 'janetteDoe' || field === 'doeJunior' || field === 'doeFamilyTrust') {
      formattedValue = formatPercentageValue(value);
    } else {
      formattedValue = formatTextValue(value);
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
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center" colSpan={2}>Overview</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center" colSpan={2}>Financial Details</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center" colSpan={4}>Distribution Split</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center" colSpan={3}>Beneficiaries</th>
          </tr>
          <tr>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Category</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Description</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Amount</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Increase %</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">John Doe</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Janette Doe (Spouse)</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Doe Junior</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Doe family trust</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Estate</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Others</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Client</th>
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
              
              <td className="p-2 text-left">
                <input
                  type="text"
                  defaultValue={formatTextValue(item.category)}
                  placeholder="Enter details ..."
                  className={`table-input ${getFieldClass('text')} ${getValueClass(item.category, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(item.id, 'category', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-left">
                <input
                  type="text"
                  defaultValue={formatTextValue(item.description)}
                  placeholder="Enter details ..."
                  className={`table-input ${getFieldClass('text')} ${getValueClass(item.description, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(item.id, 'description', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-right">
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
              
              <td className="p-2 text-center">
                <input
                  key={`increasePercentage-${item.id}-${item.increasePercentage}`}
                  type="text"
                  defaultValue={item.increasePercentage}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(item.increasePercentage, 'percentage')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(item.id, 'increasePercentage', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-center">
                <input
                  key={`johnDoe-${item.id}-${item.johnDoe}`}
                  type="text"
                  defaultValue={item.johnDoe}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(item.johnDoe, 'percentage')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(item.id, 'johnDoe', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-center">
                <input
                  key={`janetteDoe-${item.id}-${item.janetteDoe}`}
                  type="text"
                  defaultValue={item.janetteDoe}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(item.janetteDoe, 'percentage')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(item.id, 'janetteDoe', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-center">
                <input
                  key={`doeJunior-${item.id}-${item.doeJunior}`}
                  type="text"
                  defaultValue={item.doeJunior}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(item.doeJunior, 'percentage')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(item.id, 'doeJunior', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-center">
                <input
                  key={`doeFamilyTrust-${item.id}-${item.doeFamilyTrust}`}
                  type="text"
                  defaultValue={item.doeFamilyTrust}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(item.doeFamilyTrust, 'percentage')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(item.id, 'doeFamilyTrust', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-right">
                <input
                  key={`estate-${item.id}-${item.estate}`}
                  type="text"
                  defaultValue={item.estate}
                  className={`table-input ${getFieldClass('currency')} ${getValueClass(item.estate, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(item.id, 'estate', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-right">
                <input
                  key={`others-${item.id}-${item.others}`}
                  type="text"
                  defaultValue={item.others}
                  className={`table-input ${getFieldClass('currency')} ${getValueClass(item.others, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(item.id, 'others', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-right">
                <input
                  key={`client-${item.id}-${item.client}`}
                  type="text"
                  defaultValue={item.client}
                  className={`table-input ${getFieldClass('currency')} ${getValueClass(item.client, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(item.id, 'client', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
            </tr>
          ))}
        </tbody>
        
        <tfoot>
          <tr>
            <td className="totals-cell-label text-right" colSpan={3}>Totals</td>
            <td className="totals-cell-value">R {totals.amount.toLocaleString()}</td>
            <td className="totals-cell-value">{totals.increasePercentage}%</td>
            <td className="totals-cell-value">{totals.johnDoe}%</td>
            <td className="totals-cell-value">{totals.janetteDoe}%</td>
            <td className="totals-cell-value">{totals.doeJunior}%</td>
            <td className="totals-cell-value">{totals.doeFamilyTrust}%</td>
            <td className="totals-cell-value">R {totals.estate.toLocaleString()}</td>
            <td className="totals-cell-value">R {totals.others.toLocaleString()}</td>
            <td className="totals-cell-value">R {totals.client.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default AdditionalEstateDutyItemsTable;