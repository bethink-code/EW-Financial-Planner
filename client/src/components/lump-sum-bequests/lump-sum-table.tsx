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
    <div>
      {/* Table */}
      <table className="min-w-full border border-neutral-200">
        <thead>
          <tr className="border-b border-border">
            <th className="px-3 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider w-16">Actions</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={2}>Overview</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start section-end" colSpan={5}>Need Details</th>
          </tr>
          <tr className="border-b border-border">
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200"></th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start border-b border-neutral-200">Description</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Entity</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start border-b border-neutral-200">Start</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Amount</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Increase %</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">CPI</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-end border-b border-neutral-200">Value at Death</th>
          </tr>
        </thead>
        
        <tbody className="divide-y divide-neutral-200">
          {bequests.map((bequest, index) => (
            <tr key={bequest.id} className="hover:bg-neutral-50">
              {/* Actions */}
              <td className="table-actions-cell text-center">
                <div>
                  <ActionButtonGroup>
                    <DuplicateButton
                      onClick={() => handleDuplicate(bequest)}
                      disabled={isUpdating}
                    />
                    <DeleteButton
                      onClick={() => handleDelete(bequest.id)}
                      disabled={isUpdating}
                    />
                  </ActionButtonGroup>
                </div>
              </td>
              
              {/* Overview - Description */}
              <td className="px-3 py-2 section-start">
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
              <td className="px-3 py-2">
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
              <td className="px-3 py-2 section-start">
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
              <td className="px-3 py-2">
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
              <td className="px-3 py-2">
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
              <td className="px-3 py-2 text-center">
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
              <td className="px-3 py-2 section-end">
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
          <tr className="bg-neutral-100 font-bold table-total-row">
            <td className="px-3 py-2 text-center font-bold">-</td>
            <td className="px-3 py-2 font-bold section-start">TOTALS</td>
            <td className="px-3 py-2 font-bold">-</td>
            <td className="px-3 py-2 font-bold section-start">-</td>
            <td className="px-3 py-2 text-right font-bold">{totals.amount}</td>
            <td className="px-3 py-2 font-bold">-</td>
            <td className="px-3 py-2 font-bold">-</td>
            <td className="px-3 py-2 text-right font-bold section-end">{totals.valueAtDeath}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}