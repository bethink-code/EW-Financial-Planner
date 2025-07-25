import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { LumpSumBequest, InsertLumpSumBequest } from '@shared/schema';
import { ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { getFieldClass } from '@/lib/field-types';
import { formatCurrencyValue, formatPercentageValue, formatTextValue, isDefaultValue, getValueClass } from '@/lib/formatting';
import { handleDefaultValueFocus, createEnhancedBlurHandler } from '@/lib/formatting';

interface LumpSumTableProps {
  viewMode: 'table' | 'hybrid';
  searchTerm?: string;
}

export function LumpSumTable({ viewMode, searchTerm }: LumpSumTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Query for lump sum bequests
  const { data: bequests = [], isLoading, error } = useQuery<LumpSumBequest[]>({
    queryKey: ['/api/lump-sum-bequests'],
  });

  // Add bequest mutation
  const addMutation = useMutation({
    mutationFn: async (): Promise<LumpSumBequest> => {
      const newBequest: InsertLumpSumBequest = {
        description: "Enter details ...",
        entity: "Enter details ...",
        start: "Enter details ...",
        amount: "R 0",
        increasePercentage: "0%",
        cpi: false,
        valueAtDeath: "R 0",
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
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to delete lump sum bequest:', error);
      setIsUpdating(false);
    }
  });

  // Update bequest mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: number; field: keyof InsertLumpSumBequest; value: string | boolean }) => {
      const response = await fetch(`/api/lump-sum-bequests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: value }),
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

  // Handle input blur with proper formatting
  const handleInputBlur = useCallback((id: number, field: keyof InsertLumpSumBequest, value: string) => {
    setIsUpdating(true);
    
    // Format the value based on field type
    let formattedValue = value;
    if (field === 'amount' || field === 'valueAtDeath') {
      formattedValue = formatCurrencyValue(value);
    } else if (field === 'increasePercentage') {
      formattedValue = formatPercentageValue(value);
    } else if (field === 'description' || field === 'entity' || field === 'start') {
      formattedValue = formatTextValue(value);
    }
    
    updateMutation.mutate({ id, field, value: formattedValue });
    
    // Update DOM immediately for visual feedback
    const element = document.querySelector(`input[data-field="${field}-${id}"]`) as HTMLInputElement;
    if (element) {
      element.value = formattedValue;
    }
  }, [updateMutation]);

  // Handle checkbox change
  const handleCheckboxChange = useCallback((id: number, field: 'cpi', value: boolean) => {
    setIsUpdating(true);
    updateMutation.mutate({ id, field, value });
  }, [updateMutation]);

  // Handle duplicate
  const handleDuplicate = useCallback((bequest: LumpSumBequest) => {
    setIsUpdating(true);
    addMutation.mutate();
  }, [addMutation]);

  // Handle delete
  const handleDelete = useCallback((id: number) => {
    setIsUpdating(true);
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalAmount = bequests.reduce((sum, bequest) => {
      const amount = parseFloat(bequest.amount?.replace(/[^\d.-]/g, '') || '0') || 0;
      return sum + amount;
    }, 0);

    const totalValueAtDeath = bequests.reduce((sum, bequest) => {
      const value = parseFloat(bequest.valueAtDeath?.replace(/[^\d.-]/g, '') || '0') || 0;
      return sum + value;
    }, 0);

    return {
      amount: `R ${totalAmount.toLocaleString()}`,
      valueAtDeath: `R ${totalValueAtDeath.toLocaleString()}`,
    };
  }, [bequests]);

  if (isLoading) {
    return <div className="flex justify-center items-center p-8">Loading lump sum bequests...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error loading lump sum bequests</div>;
  }

  return (
    <div className="w-full">
      <table className="w-full border-collapse">
        <thead>
          {/* First header row - Section groups */}
          <tr className="bg-gray-50">
            <th className="border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 text-center" colSpan={2}>
              ACTIONS
            </th>
            <th className="border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 text-center" colSpan={2}>
              OVERVIEW
            </th>
            <th className="border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 text-center" colSpan={5}>
              NEED DETAILS
            </th>
          </tr>
          
          {/* Second header row - Individual columns */}
          <tr className="bg-gray-50">
            <th className="border border-gray-300 border-b border-neutral-200 px-2 py-1 text-xs font-medium text-gray-700">DUPLICATE</th>
            <th className="border border-gray-300 border-b border-neutral-200 px-2 py-1 text-xs font-medium text-gray-700">DELETE</th>
            <th className="border border-gray-300 border-b border-neutral-200 px-2 py-1 text-xs font-medium text-gray-700">DESCRIPTION</th>
            <th className="border border-gray-300 border-b border-neutral-200 px-2 py-1 text-xs font-medium text-gray-700">ENTITY</th>
            <th className="border border-gray-300 border-b border-neutral-200 px-2 py-1 text-xs font-medium text-gray-700">START</th>
            <th className="border border-gray-300 border-b border-neutral-200 px-2 py-1 text-xs font-medium text-gray-700">AMOUNT</th>
            <th className="border border-gray-300 border-b border-neutral-200 px-2 py-1 text-xs font-medium text-gray-700">INCREASE %</th>
            <th className="border border-gray-300 border-b border-neutral-200 px-2 py-1 text-xs font-medium text-gray-700">CPI</th>
            <th className="border border-gray-300 border-b border-neutral-200 px-2 py-1 text-xs font-medium text-gray-700">VALUE AT DEATH</th>
          </tr>
        </thead>
        
        <tbody>
          {bequests.map((bequest, index) => (
            <tr key={bequest.id} className="hover:bg-gray-50">
              {/* Actions - Duplicate */}
              <td className="border border-gray-300 p-1 table-actions-cell">
                <div>
                  <DuplicateButton 
                    onClick={() => handleDuplicate(bequest)}
                    disabled={isUpdating}
                  />
                </div>
              </td>
              
              {/* Actions - Delete */}
              <td className="border border-gray-300 p-1 table-actions-cell">
                <div>
                  <DeleteButton 
                    onClick={() => handleDelete(bequest.id)}
                    disabled={isUpdating}
                  />
                </div>
              </td>
              
              {/* Overview - Description */}
              <td className="border border-gray-300 p-1">
                <input
                  type="text"
                  defaultValue={bequest.description}
                  onBlur={(e) => handleInputBlur(bequest.id, 'description', e.target.value)}
                  onFocus={handleDefaultValueFocus}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(bequest.description)}`}
                  data-field={`description-${bequest.id}`}
                  disabled={isUpdating}
                />
              </td>
              
              {/* Overview - Entity */}
              <td className="border border-gray-300 p-1">
                <input
                  type="text"
                  defaultValue={bequest.entity}
                  onBlur={(e) => handleInputBlur(bequest.id, 'entity', e.target.value)}
                  onFocus={handleDefaultValueFocus}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(bequest.entity)}`}
                  data-field={`entity-${bequest.id}`}
                  disabled={isUpdating}
                />
              </td>
              
              {/* Need Details - Start Date */}
              <td className="border border-gray-300 p-1">
                <input
                  type="text"
                  defaultValue={bequest.start}
                  onBlur={(e) => handleInputBlur(bequest.id, 'start', e.target.value)}
                  onFocus={handleDefaultValueFocus}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(bequest.start)}`}
                  data-field={`start-${bequest.id}`}
                  disabled={isUpdating}
                />
              </td>
              
              {/* Need Details - Amount */}
              <td className="border border-gray-300 p-1">
                <input
                  type="text"
                  defaultValue={bequest.amount}
                  onBlur={(e) => handleInputBlur(bequest.id, 'amount', e.target.value)}
                  onFocus={handleDefaultValueFocus}
                  className={`table-input ${getFieldClass('currency')} ${getValueClass(bequest.amount)} text-right`}
                  data-field={`amount-${bequest.id}`}
                  disabled={isUpdating}
                />
              </td>
              
              {/* Need Details - Increase % */}
              <td className="border border-gray-300 p-1">
                <input
                  type="text"
                  defaultValue={bequest.increasePercentage}
                  onBlur={createEnhancedBlurHandler((value) => handleInputBlur(bequest.id, 'increasePercentage', value))}
                  onFocus={handleDefaultValueFocus}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(bequest.increasePercentage)} text-right`}
                  data-field={`increasePercentage-${bequest.id}`}
                  disabled={isUpdating}
                />
              </td>
              
              {/* Need Details - CPI Checkbox */}
              <td className="border border-gray-300 p-1 text-center">
                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={bequest.cpi || false}
                    onChange={(e) => handleCheckboxChange(bequest.id, 'cpi', e.target.checked)}
                    className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                    disabled={isUpdating}
                  />
                </div>
              </td>
              
              {/* Need Details - Value at Death (Calculated) */}
              <td className="border border-gray-300 p-1">
                <input
                  type="text"
                  defaultValue={bequest.valueAtDeath}
                  onBlur={(e) => handleInputBlur(bequest.id, 'valueAtDeath', e.target.value)}
                  className={`table-input ${getFieldClass('currency')} text-right`}
                  data-field={`valueAtDeath-${bequest.id}`}
                  disabled={isUpdating}
                />
              </td>
            </tr>
          ))}
          
          {/* Totals Row */}
          <tr className="bg-gray-100 font-bold table-total-row">
            <td className="border border-gray-300 p-1 text-center font-bold">-</td>
            <td className="border border-gray-300 p-1 text-center font-bold">-</td>
            <td className="border border-gray-300 p-1 font-bold">TOTALS</td>
            <td className="border border-gray-300 p-1 font-bold">-</td>
            <td className="border border-gray-300 p-1 font-bold">-</td>
            <td className="border border-gray-300 p-1 text-right font-bold">{totals.amount}</td>
            <td className="border border-gray-300 p-1 font-bold">-</td>
            <td className="border border-gray-300 p-1 font-bold">-</td>
            <td className="border border-gray-300 p-1 text-right font-bold">{totals.valueAtDeath}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}