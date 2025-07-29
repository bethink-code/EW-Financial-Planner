import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { IncomeNeeds, InsertIncomeNeeds } from '@shared/schema';
import { AddButton, ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { getFieldClass, getCellClass } from '@/lib/field-types';
import { formatCurrencyValue, formatPercentageValue, formatYearsValue, formatTextValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';

interface IncomeNeedsTableProps {
  viewMode: 'table' | 'hybrid';
  searchTerm?: string;
}

function IncomeNeedsTable({ viewMode, searchTerm }: IncomeNeedsTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: incomeNeeds = [], isLoading, error } = useQuery<IncomeNeeds[]>({
    queryKey: ['/api/income-needs'],
  });

  const addMutation = useMutation({
    mutationFn: async (): Promise<IncomeNeeds> => {
      const newIncomeNeed: InsertIncomeNeeds = {
        description: "",
        personName: "Enter details ...",
        startDate: "Enter details ...",
        termYears: "0",
        increasePercentage: "0%",
        cpi: false,
        frequency: "monthly",
        amount: "R 0",
        capitalisedAmount: "R 0",
      };
      
      const response = await fetch('/api/income-needs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newIncomeNeed),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add income need');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-needs'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to add income need:', error);
      setIsUpdating(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<IncomeNeeds> }) => {
      const response = await fetch(`/api/income-needs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update income need');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-needs'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to update income need:', error);
      setIsUpdating(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/income-needs/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete income need');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-needs'] });
    }
  });

  const totals = useMemo(() => {
    return {
      count: incomeNeeds.length,
      amount: incomeNeeds.reduce((sum: number, incomeNeed: IncomeNeeds) => {
        const value = parseFloat((incomeNeed.amount || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      capitalisedAmount: incomeNeeds.reduce((sum: number, incomeNeed: IncomeNeeds) => {
        const value = parseFloat((incomeNeed.capitalisedAmount || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
    };
  }, [incomeNeeds]);

  const handleUpdateIncomeNeed = useCallback((id: number, field: keyof IncomeNeeds, value: string | boolean | string[]) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof IncomeNeeds, value: string, target?: HTMLInputElement) => {
    
    // Format the value based on field type
    let formattedValue = value;
    switch (field) {
      case 'amount':
        formattedValue = formatCurrencyValue(value);
        break;
      case 'increasePercentage':
        formattedValue = formatPercentageValue(value);
        break;
      case 'termYears':
        formattedValue = formatYearsValue(value);
        break;
      case 'description':
      case 'personName':
        formattedValue = formatTextValue(value);
        break;
    }
    
    // Update the DOM element immediately for visual feedback
    if (target && formattedValue !== value) {
      target.value = formattedValue;
    }
    
    handleUpdateIncomeNeed(id, field, formattedValue);
  }, [handleUpdateIncomeNeed]);

  const handleDeleteIncomeNeed = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this income need?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading income needs...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading income needs. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      <table>
        <thead>
          <tr>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" rowSpan={2}>
              <AddButton onClick={() => addMutation.mutate()} disabled={isUpdating} />
            </th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={2}>Overview</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={7}>Income Need Details</th>
          </tr>
          <tr>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Description</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Entity</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Amount</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Start Date</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Term Years</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Increase %</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">CPI</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Frequency</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Capitalised Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {incomeNeeds.map((incomeNeed: IncomeNeeds, index) => (
            <tr key={incomeNeed.id} className="hover:bg-neutral-50">
              <td className="table-actions-cell p-2 text-center section-start">
                <ActionButtonGroup>
                  <DuplicateButton onClick={() => addMutation.mutate()} disabled={isUpdating} />
                  <DeleteButton onClick={() => handleDeleteIncomeNeed(incomeNeed.id)} disabled={isUpdating} />
                </ActionButtonGroup>
              </td>
              
              <td className="p-2 text-left section-start">
                <input
                  type="text"
                  defaultValue={formatTextValue(incomeNeed.description)}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(incomeNeed.description, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(incomeNeed.id, 'description', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-left">
                <input
                  type="text"
                  defaultValue={formatTextValue(incomeNeed.personName)}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(incomeNeed.personName, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(incomeNeed.id, 'personName', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-right section-start">
                <input
                  key={`amount-${incomeNeed.id}-${incomeNeed.amount}`}
                  type="text"
                  defaultValue={incomeNeed.amount}
                  className={`table-input ${getFieldClass('currency')} ${getValueClass(incomeNeed.amount, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(incomeNeed.id, 'amount', e.target.value, e.target)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-left">
                <input
                  type="text"
                  defaultValue={incomeNeed.startDate}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(incomeNeed.startDate, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(incomeNeed.id, 'startDate', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-center">
                <input
                  key={`termYears-${incomeNeed.id}-${incomeNeed.termYears}`}
                  type="text"
                  defaultValue={incomeNeed.termYears}
                  className={`table-input ${getFieldClass('years')} ${getValueClass(incomeNeed.termYears, 'years')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(incomeNeed.id, 'termYears', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-center">
                <input
                  key={`increasePercentage-${incomeNeed.id}-${incomeNeed.increasePercentage}`}
                  type="text"
                  defaultValue={incomeNeed.increasePercentage}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(incomeNeed.increasePercentage, 'percentage')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(incomeNeed.id, 'increasePercentage', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-center">
                <input
                  type="checkbox"
                  defaultChecked={incomeNeed.cpi}
                  className="table-input"
                  onChange={(e) => handleUpdateIncomeNeed(incomeNeed.id, 'cpi', e.target.checked)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-center">
                <select
                  defaultValue={incomeNeed.frequency}
                  className="table-input table-dropdown"
                  onChange={(e) => handleInputBlur(incomeNeed.id, 'frequency', e.target.value)}
                  disabled={isUpdating}
                >
                  <option value="monthly">Monthly</option>
                  <option value="annually">Annually</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </td>
              
              <td className="p-2 text-right">
                <input
                  key={`capitalisedAmount-${incomeNeed.id}-${incomeNeed.capitalisedAmount}`}
                  type="text"
                  defaultValue={incomeNeed.capitalisedAmount}
                  className="calculated-field"
                  readOnly
                />
              </td>
            </tr>
          ))}
        </tbody>
        
        <tfoot>
          <tr>
            <td className="totals-cell-label text-right section-start">Totals</td>
            <td className="totals-cell-label section-start" colSpan={2}></td>
            <td className="totals-cell-value section-start">R {totals.amount.toLocaleString()}</td>
            <td className="totals-cell-label" colSpan={4}></td>
            <td className="totals-cell-value">R {totals.capitalisedAmount.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default IncomeNeedsTable;