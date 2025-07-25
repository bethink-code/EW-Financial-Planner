import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { IncomeProvisions, InsertIncomeProvisions } from '@shared/schema';
import { ActionButtonGroup, DuplicateButton, DeleteButton, AddButton } from '@/components/ui/action-buttons';
import { getFieldClass } from '@/lib/field-types';
import { formatCurrencyValue, formatPercentageValue, formatTextValue, formatNumberValue, isDefaultValue, getValueClass, parseCurrencyValue } from '@/lib/formatting';
import { handleDefaultValueFocus, createEnhancedBlurHandler } from '@/lib/formatting';

interface IncomeProvisionsTableProps {
  viewMode: 'table' | 'hybrid';
  searchTerm?: string;
}

export default function IncomeProvisionsTable({ viewMode, searchTerm }: IncomeProvisionsTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Calculate capitalised amount for a single income provision
  const calculateCapitalisedAmount = useCallback((provision: IncomeProvisions): string => {
    const amount = parseCurrencyValue(provision.amount || '0');
    const termYears = parseFloat(provision.termYears?.replace(/[^\d.-]/g, '') || '0');
    const increaseRate = parseFloat(provision.increasePercentage?.replace(/[^\d.-]/g, '') || '0') / 100;
    
    if (amount <= 0 || termYears <= 0) return 'R 0';
    
    // Use standard financial planning assumptions
    const discountRate = provision.cpi ? 0.06 : 0.08; // 6% if CPI-linked, 8% otherwise
    const frequency = provision.frequency === 'monthly' ? 12 : provision.frequency === 'quarterly' ? 4 : 1;
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

  // Query for income provisions
  const { data: provisions = [], isLoading, error } = useQuery<IncomeProvisions[]>({
    queryKey: ['/api/income-provisions'],
  });

  // Add provision mutation
  const addMutation = useMutation({
    mutationFn: async (): Promise<IncomeProvisions> => {
      const newProvision: InsertIncomeProvisions = {
        description: "Enter details ...",
        personName: "Enter details ...",
        startDate: "Enter details ...",
        termYears: "0 years",
        increasePercentage: "0%",
        cpi: false,
        frequency: "monthly",
        amount: "R 0",
        capitalisedAmount: "R 0",
        taxPercentage: "0%",
        taxRate: "0%",
      };
      
      const response = await fetch('/api/income-provisions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProvision),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add income provision');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-provisions'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to add income provision:', error);
      setIsUpdating(false);
    }
  });

  // Delete provision mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/income-provisions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete income provision');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-provisions'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to delete income provision:', error);
      setIsUpdating(false);
    }
  });

  const handleInputBlur = useCallback((id: number, field: string, value: string, inputElement?: HTMLInputElement) => {
    fetch(`/api/income-provisions/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ [field]: value }),
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-provisions'] });
    });
  }, []);

  const handleCheckboxChange = useCallback((id: number, field: string, checked: boolean) => {
    fetch(`/api/income-provisions/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ [field]: checked }),
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-provisions'] });
    });
  }, []);

  const handleSelectChange = useCallback((id: number, field: string, value: string) => {
    fetch(`/api/income-provisions/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ [field]: value }),
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-provisions'] });
    });
  }, []);

  const handleAddProvision = useCallback(() => {
    setIsUpdating(true);
    addMutation.mutate();
  }, [addMutation]);

  const handleDeleteProvision = useCallback((id: number) => {
    setIsUpdating(true);
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  // Filter provisions based on search term
  const filteredProvisions = useMemo(() => {
    if (!searchTerm) return provisions;
    return provisions.filter(provision => 
      provision.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provision.personName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [provisions, searchTerm]);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading income provisions...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading income provisions. Please try again.</div>;
  }

  return (
    <div>
      {/* Table */}
      <table className="min-w-full border border-neutral-200">
        <thead>
          <tr className="border-b border-border">
            <th className="px-3 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider w-16">Actions</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={2}>Overview</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start section-end" colSpan={9}>Income Provision Details</th>
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
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Tax %</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Tax Rate</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-end border-b border-neutral-200">Capitalised Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {filteredProvisions.map((provision: IncomeProvisions) => {
            const capitalisedAmount = calculateCapitalisedAmount(provision);
            
            return (
              <tr key={provision.id} className="hover:bg-neutral-50">
                {/* Actions */}
                <td className="table-actions-cell text-center">
                  <div>
                    <ActionButtonGroup>
                      <DuplicateButton
                        onClick={() => handleAddProvision()}
                        disabled={isUpdating}
                      />
                      <DeleteButton
                        onClick={() => handleDeleteProvision(provision.id)}
                        disabled={isUpdating}
                      />
                    </ActionButtonGroup>
                  </div>
                </td>
                
                {/* Overview Section */}
                {/* Description */}
                <td className="p-1 section-start">
                  <input
                    key={`description-${provision.id}-${provision.description}`}
                    type="text"
                    defaultValue={provision.description}
                    className={`table-input ${getFieldClass('text')} ${getValueClass(provision.description, 'text')}`}
                    onFocus={handleDefaultValueFocus}
                    onBlur={createEnhancedBlurHandler((value) => handleInputBlur(provision.id, 'description', value), 'text')}
                    disabled={isUpdating}
                  />
                </td>
                
                {/* Entity */}
                <td className="p-1">
                  <input
                    key={`personName-${provision.id}-${provision.personName}`}
                    type="text"
                    defaultValue={provision.personName}
                    className={`table-input ${getFieldClass('text')} ${getValueClass(provision.personName, 'text')}`}
                    onFocus={handleDefaultValueFocus}
                    onBlur={createEnhancedBlurHandler((value) => handleInputBlur(provision.id, 'personName', value), 'text')}
                    disabled={isUpdating}
                  />
                </td>
                
                {/* Income Provision Details Section */}
                {/* Amount */}
                <td className="p-1 section-start">
                  <input
                    key={`amount-${provision.id}-${provision.amount}`}
                    type="text"
                    defaultValue={provision.amount}
                    className={`table-input ${getFieldClass('currency')} ${getValueClass(provision.amount, 'currency')}`}
                    onFocus={handleDefaultValueFocus}
                    onBlur={createEnhancedBlurHandler((value) => handleInputBlur(provision.id, 'amount', value), 'currency')}
                    disabled={isUpdating}
                  />
                </td>
                
                {/* Start Date */}
                <td className="p-1">
                  <input
                    key={`startDate-${provision.id}-${provision.startDate}`}
                    type="date"
                    defaultValue={provision.startDate}
                    className={`table-input ${getFieldClass('date')} ${getValueClass(provision.startDate, 'text')}`}
                    onBlur={createEnhancedBlurHandler((value) => handleInputBlur(provision.id, 'startDate', value), 'text')}
                    disabled={isUpdating}
                  />
                </td>
                
                {/* Term Years */}
                <td className="p-1">
                  <input
                    type="text"
                    defaultValue={provision.termYears}
                    onBlur={createEnhancedBlurHandler((value) => handleInputBlur(provision.id, 'termYears', value), 'years')}
                    onFocus={handleDefaultValueFocus}
                    className={`table-input ${getFieldClass('years')} ${getValueClass(provision.termYears, 'years')}`}
                    data-field={`termYears-${provision.id}`}
                    disabled={isUpdating}
                  />
                </td>
                
                {/* Increase Percentage */}
                <td className="p-1">
                  <input
                    key={`increasePercentage-${provision.id}-${provision.increasePercentage}`}
                    type="text"
                    defaultValue={provision.increasePercentage}
                    className={`table-input ${getFieldClass('percentage')} ${getValueClass(provision.increasePercentage, 'percentage')}`}
                    onFocus={handleDefaultValueFocus}
                    onBlur={createEnhancedBlurHandler((value) => handleInputBlur(provision.id, 'increasePercentage', value), 'percentage')}
                    disabled={isUpdating}
                  />
                </td>
                
                {/* CPI Checkbox */}
                <td className="p-1 text-center">
                  <div className="mt-2">
                    <input
                      type="checkbox"
                      checked={provision.cpi}
                      onChange={(e) => handleCheckboxChange(provision.id, 'cpi', e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      disabled={isUpdating}
                    />
                  </div>
                </td>
                
                {/* Frequency Dropdown */}
                <td className="p-1">
                  <select
                    value={provision.frequency || "monthly"}
                    onChange={(e) => handleSelectChange(provision.id, 'frequency', e.target.value)}
                    className="table-input pt-[5px] pb-[5px]"
                    disabled={isUpdating}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </td>
                
                {/* Tax Percentage */}
                <td className="p-1">
                  <input
                    key={`taxPercentage-${provision.id}-${provision.taxPercentage}`}
                    type="text"
                    defaultValue={provision.taxPercentage}
                    className={`table-input ${getFieldClass('percentage')} ${getValueClass(provision.taxPercentage, 'percentage')}`}
                    onFocus={handleDefaultValueFocus}
                    onBlur={createEnhancedBlurHandler((value) => handleInputBlur(provision.id, 'taxPercentage', value), 'percentage')}
                    disabled={isUpdating}
                  />
                </td>
                
                {/* Tax Rate */}
                <td className="p-1">
                  <input
                    key={`taxRate-${provision.id}-${provision.taxRate}`}
                    type="text"
                    defaultValue={provision.taxRate}
                    className={`table-input ${getFieldClass('percentage')} ${getValueClass(provision.taxRate, 'percentage')}`}
                    onFocus={handleDefaultValueFocus}
                    onBlur={createEnhancedBlurHandler((value) => handleInputBlur(provision.id, 'taxRate', value), 'percentage')}
                    disabled={isUpdating}
                  />
                </td>
                
                {/* Capitalised Amount (Calculated) */}
                <td className="p-1 section-end">
                  <input
                    type="text"
                    value={capitalisedAmount}
                    className="calculated-field"
                    readOnly
                    tabIndex={-1}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}