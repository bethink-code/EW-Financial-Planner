import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { IncomeNeeds, InsertIncomeNeeds } from '@shared/schema';
import { ActionButtonGroup, DuplicateButton, DeleteButton, AddButton } from '@/components/ui/action-buttons';
import { getFieldClass } from '@/lib/field-types';
import { formatCurrencyValue, formatPercentageValue, formatTextValue, formatNumberValue, isDefaultValue, getValueClass } from '@/lib/formatting';
import { handleDefaultValueFocus, createEnhancedBlurHandler } from '@/lib/formatting';

interface IncomeNeedsTableProps {
  viewMode: 'table' | 'hybrid';
  searchTerm?: string;
}

export default function IncomeNeedsTable({ viewMode, searchTerm }: IncomeNeedsTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Query for income needs
  const { data: needs = [], isLoading, error } = useQuery<IncomeNeeds[]>({
    queryKey: ['/api/income-needs'],
  });

  // Add need mutation
  const addMutation = useMutation({
    mutationFn: async (): Promise<IncomeNeeds> => {
      const newNeed: InsertIncomeNeeds = {
        description: "Enter details ...",
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
        body: JSON.stringify(newNeed),
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

  // Delete need mutation
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
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to delete income need:', error);
      setIsUpdating(false);
    }
  });

  // Handle field updates
  const handleInputBlur = useCallback((id: number, field: keyof IncomeNeeds, value: string, element?: HTMLInputElement) => {
    let formattedValue = value;
    
    // Apply specific formatting based on field type
    if (field === 'amount' || field === 'capitalisedAmount') {
      formattedValue = formatCurrencyValue(value);
    } else if (field === 'increasePercentage') {
      formattedValue = formatPercentageValue(value);
    } else if (field === 'termYears') {
      formattedValue = formatNumberValue(value);
    } else {
      formattedValue = formatTextValue(value);
    }
    
    // Update DOM element if formatting changed
    if (element && formattedValue !== value) {
      element.value = formattedValue;
    }
    
    // Update database
    fetch(`/api/income-needs/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ [field]: formattedValue }),
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-needs'] });
    });
  }, []);

  // Handle checkbox changes
  const handleCheckboxChange = useCallback((id: number, field: keyof IncomeNeeds, checked: boolean) => {
    fetch(`/api/income-needs/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ [field]: checked }),
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-needs'] });
    });
  }, []);

  // Handle select changes
  const handleSelectChange = useCallback((id: number, field: keyof IncomeNeeds, value: string) => {
    fetch(`/api/income-needs/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ [field]: value }),
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-needs'] });
    });
  }, []);

  const handleAddNeed = useCallback(() => {
    setIsUpdating(true);
    addMutation.mutate();
  }, [addMutation]);

  const handleDeleteNeed = useCallback((id: number) => {
    setIsUpdating(true);
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  // Filter needs based on search term
  const filteredNeeds = useMemo(() => {
    if (!searchTerm) return needs;
    return needs.filter(need => 
      need.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      need.personName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [needs, searchTerm]);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading income needs...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading income needs. Please try again.</div>;
  }

  return (
    <div>
      {/* Table */}
      <table className="min-w-full border border-neutral-200">
        <thead>
          <tr className="border-b border-border">
            <th className="px-3 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider w-16">Actions</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={2}>Overview</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start section-end" colSpan={7}>Income Need Details</th>
          </tr>
          <tr className="border-b border-border">
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200"></th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start border-b border-neutral-200">Description</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Person Name</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start border-b border-neutral-200">Amount</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Start</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Term (years)</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Increase %</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">CPI</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Frequency</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-end border-b border-neutral-200">Capitalised Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {filteredNeeds.map((need: IncomeNeeds) => (
            <tr key={need.id} className="hover:bg-neutral-50">
              {/* Actions */}
              <td className="table-actions-cell text-center">
                <div>
                  <ActionButtonGroup>
                    <DuplicateButton
                      onClick={() => handleAddNeed()}
                      disabled={isUpdating}
                    />
                    <DeleteButton
                      onClick={() => handleDeleteNeed(need.id)}
                      disabled={isUpdating}
                    />
                  </ActionButtonGroup>
                </div>
              </td>
              
              {/* Overview Section */}
              {/* Description */}
              <td className="p-1 section-start">
                <input
                  key={`description-${need.id}-${need.description}`}
                  type="text"
                  defaultValue={need.description}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(need.description, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(need.id, 'description', e.target.value, e.target)}
                  disabled={isUpdating}
                />
              </td>
              
              {/* Person Name */}
              <td className="p-1">
                <input
                  key={`personName-${need.id}-${need.personName}`}
                  type="text"
                  defaultValue={need.personName}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(need.personName, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(need.id, 'personName', e.target.value, e.target)}
                  disabled={isUpdating}
                />
              </td>
              
              {/* Income Need Details Section */}
              {/* Amount */}
              <td className="p-1 section-start">
                <input
                  key={`amount-${need.id}-${need.amount}`}
                  type="text"
                  defaultValue={need.amount}
                  className={`table-input ${getFieldClass('currency')} ${getValueClass(need.amount, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(need.id, 'amount', e.target.value, e.target)}
                  disabled={isUpdating}
                />
              </td>
              
              {/* Start Date */}
              <td className="p-1">
                <input
                  key={`startDate-${need.id}-${need.startDate}`}
                  type="text"
                  defaultValue={need.startDate}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(need.startDate, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(need.id, 'startDate', e.target.value, e.target)}
                  disabled={isUpdating}
                />
              </td>
              
              {/* Term Years */}
              <td className="p-1">
                <input
                  key={`termYears-${need.id}-${need.termYears}`}
                  type="text"
                  defaultValue={need.termYears}
                  className={`table-input ${getFieldClass('years')} ${getValueClass(need.termYears, 'years')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(need.id, 'termYears', e.target.value, e.target)}
                  disabled={isUpdating}
                />
              </td>
              
              {/* Increase Percentage */}
              <td className="p-1">
                <input
                  key={`increasePercentage-${need.id}-${need.increasePercentage}`}
                  type="text"
                  defaultValue={need.increasePercentage}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(need.increasePercentage, 'percentage')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(need.id, 'increasePercentage', e.target.value, e.target)}
                  disabled={isUpdating}
                />
              </td>
              
              {/* CPI Checkbox */}
              <td className="p-1 text-center">
                <div className="mt-2">
                  <input
                    type="checkbox"
                    checked={need.cpi}
                    onChange={(e) => handleCheckboxChange(need.id, 'cpi', e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    disabled={isUpdating}
                  />
                </div>
              </td>
              
              {/* Frequency Dropdown */}
              <td className="p-1">
                <select
                  key={`frequency-${need.id}-${need.frequency || 'monthly'}`}
                  defaultValue={need.frequency || "monthly"}
                  onBlur={(e) => handleSelectChange(need.id, 'frequency', e.target.value)}
                  className={`table-input ${getFieldClass('text')} entered-value`}
                  disabled={isUpdating}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </td>
              
              {/* Capitalised Amount */}
              <td className="p-1 section-end">
                <input
                  key={`capitalisedAmount-${need.id}-${need.capitalisedAmount}`}
                  type="text"
                  defaultValue={need.capitalisedAmount}
                  className={`table-input ${getFieldClass('currency')} ${getValueClass(need.capitalisedAmount, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(need.id, 'capitalisedAmount', e.target.value, e.target)}
                  disabled={isUpdating}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}