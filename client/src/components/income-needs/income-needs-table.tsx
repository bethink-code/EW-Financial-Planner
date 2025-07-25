import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { IncomeNeeds, InsertIncomeNeeds } from '@shared/schema';
import { ActionButtonGroup, DuplicateButton, DeleteButton, AddButton } from '@/components/ui/action-buttons';
import { getFieldClass } from '@/lib/field-types';
import { formatCurrencyValue, formatPercentageValue, formatTextValue, formatNumberValue, isDefaultValue, getValueClass, parseCurrencyValue } from '@/lib/formatting';
import { handleDefaultValueFocus, createEnhancedBlurHandler } from '@/lib/formatting';

interface IncomeNeedsTableProps {
  viewMode: 'table' | 'hybrid';
  searchTerm?: string;
}

export default function IncomeNeedsTable({ viewMode, searchTerm }: IncomeNeedsTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Calculate capitalised amount for a single income need
  const calculateCapitalisedAmount = useCallback((need: IncomeNeeds): string => {
    const amount = parseCurrencyValue(need.amount || '0');
    const termYears = parseFloat(need.termYears?.replace(/[^\d.-]/g, '') || '0');
    const increaseRate = parseFloat(need.increasePercentage?.replace(/[^\d.-]/g, '') || '0') / 100;
    
    if (amount <= 0 || termYears <= 0) return 'R 0';
    
    // Use standard financial planning assumptions
    const discountRate = need.cpi ? 0.06 : 0.08; // 6% if CPI-linked, 8% otherwise
    const frequency = need.frequency === 'monthly' ? 12 : need.frequency === 'quarterly' ? 4 : 1;
    const periodsPerYear = frequency;
    const totalPeriods = termYears * periodsPerYear;
    const periodicDiscountRate = discountRate / periodsPerYear;
    const periodicIncreaseRate = increaseRate / periodsPerYear;
    
    let presentValue: number;
    
    if (Math.abs(periodicDiscountRate - periodicIncreaseRate) < 0.0001) {
      // When discount rate equals increase rate, use simplified formula
      presentValue = amount * totalPeriods;
    } else {
      // Present value of growing annuity formula
      const netRate = periodicDiscountRate - periodicIncreaseRate;
      const pvFactor = (1 - Math.pow((1 + periodicIncreaseRate) / (1 + periodicDiscountRate), totalPeriods)) / netRate;
      presentValue = amount * pvFactor;
    }
    
    return formatCurrencyValue(Math.round(presentValue).toString());
  }, []);

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
        termYears: "0 years",
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
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Entity</th>
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
              
              {/* Entity */}
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
                  type="date"
                  defaultValue={need.startDate}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(need.startDate, 'text')}`}
                  onBlur={(e) => handleInputBlur(need.id, 'startDate', e.target.value, e.target)}
                  disabled={isUpdating}
                />
              </td>
              
              {/* Term Years */}
              <td className="p-1">
                <input
                  type="text"
                  defaultValue={need.termYears}
                  onBlur={createEnhancedBlurHandler((value) => handleInputBlur(need.id, 'termYears', value), 'years')}
                  onFocus={handleDefaultValueFocus}
                  className={`table-input ${getFieldClass('years')} ${getValueClass(need.termYears, 'years')}`}
                  data-field={`termYears-${need.id}`}
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
                  value={need.frequency || "monthly"}
                  onChange={(e) => handleSelectChange(need.id, 'frequency', e.target.value)}
                  className="table-input pt-[5px] pb-[5px]"
                  disabled={isUpdating}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </td>
              
              {/* Capitalised Amount (Calculated) */}
              <td className="p-1 section-end">
                <input
                  type="text"
                  value={calculateCapitalisedAmount(need)}
                  className="calculated-field"
                  readOnly
                  tabIndex={-1}
                />
              </td>
            </tr>
          ))}
        </tbody>
        
        {/* Totals Footer */}
        <tfoot className="bg-neutral-50 border-t border-neutral-300">
          <tr>
            <td className="p-1 text-right text-neutral-700" colSpan={9} style={{ fontSize: '0.875rem' }}>Totals</td>
            <td className="text-right" style={{ padding: '0.6rem 0.8rem' }}>
              <span style={{ fontFamily: 'inherit', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                R {filteredNeeds.reduce((sum, need) => {
                  const capitalisedAmount = parseFloat(calculateCapitalisedAmount(need).replace(/[^\d.-]/g, '')) || 0;
                  return sum + capitalisedAmount;
                }, 0).toLocaleString()}
              </span>
            </td>
          </tr>
          <tr>
            <td className="p-1 text-right text-neutral-700" colSpan={9} style={{ fontSize: '0.875rem' }}>Capital Required for Income Shortfall</td>
            <td className="text-right" style={{ padding: '0.6rem 0.8rem' }}>
              <span style={{ fontFamily: 'inherit', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                R {filteredNeeds.reduce((sum, need) => {
                  const capitalisedAmount = parseFloat(calculateCapitalisedAmount(need).replace(/[^\d.-]/g, '')) || 0;
                  return sum + capitalisedAmount;
                }, 0).toLocaleString()}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}