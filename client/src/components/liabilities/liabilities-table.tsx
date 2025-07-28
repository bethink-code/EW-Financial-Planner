import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Liabilities } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { SafeFragment } from '@/lib/safe-fragment';
import { SimpleCategorySelector } from './simple-category-selector';
import { formatCurrencyValue, formatPercentageValue, formatTextValue, isDefaultValue, getValueClass } from '@/lib/formatting';
import { getFieldClass, getCellClass } from '@/lib/field-types';
import { createEnhancedBlurHandler, handleDefaultValueFocus } from '@/lib/formatting';
import { AddButton, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';

interface LiabilitiesTableProps {
  viewMode?: 'table' | 'hybrid';
}

export function LiabilitiesTable({ viewMode = 'table' }: LiabilitiesTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch liabilities
  const { data: liabilities = [], isLoading, error } = useQuery<Liabilities[]>({
    queryKey: ['/api/liabilities'],
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/liabilities', {
      category: 'BONDS',
      description: 'Enter details...',
      debtAmount: 'R 0',
      johnDoe: '0%',
      janetteDoe: '0%',
      doeJunior: '0%',
      doeFamilyTrust: '0%',
      estate: 'R 0',
      others: 'R 0',
      client: 'R 0',
      section: 'BONDS',
      included: true
    }),
    onSettled: () => {
      setIsUpdating(false);
      queryClient.invalidateQueries({ queryKey: ['/api/liabilities'] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, field, value }: { id: number; field: string; value: any }) =>
      apiRequest('PATCH', `/api/liabilities/${id}`, { [field]: value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/liabilities'] });
    },
    onSettled: () => {
      setIsUpdating(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/liabilities/${id}`),
    onSettled: () => {
      setIsUpdating(false);
      queryClient.invalidateQueries({ queryKey: ['/api/liabilities'] });
    },
  });

  // Handle input blur with formatting
  const handleInputBlur = useCallback((id: number, field: string, value: string) => {
    setIsUpdating(true);
    updateMutation.mutate({ id, field, value });

    // Apply formatting to the DOM element immediately
    setTimeout(() => {
      const element = document.querySelector(`input[data-field="${field}-${id}"]`) as HTMLInputElement;
      if (element) {
        let formattedValue = value;
        
        if (field.includes('Amount') || field.includes('estate') || field.includes('others') || field.includes('client')) {
          formattedValue = formatCurrencyValue(value);
        } else if (field.includes('johnDoe') || field.includes('janetteDoe') || field.includes('doeJunior') || field.includes('doeFamilyTrust')) {
          formattedValue = formatPercentageValue(value);
        } else {
          formattedValue = formatTextValue(value);
        }
        
        element.value = formattedValue;
      }
    }, 100);
  }, [updateMutation]);

  // Handle checkbox change
  const handleCheckboxChange = useCallback((id: number, field: 'included', value: boolean) => {
    setIsUpdating(true);
    updateMutation.mutate({ id, field, value });
  }, [updateMutation]);

  // Handle add liability
  const handleAddLiability = useCallback(() => {
    setIsUpdating(true);
    addMutation.mutate();
  }, [addMutation]);

  // Handle duplicate
  const handleDuplicate = useCallback((liability: Liabilities) => {
    setIsUpdating(true);
    addMutation.mutate();
  }, [addMutation]);

  // Handle delete
  const handleDelete = useCallback((id: number) => {
    setIsUpdating(true);
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  // Group liabilities by section
  const groupedLiabilities = useMemo(() => {
    const sections = {
      BONDS: liabilities.filter((l: Liabilities) => l.section === 'BONDS'),
      HIRE_PURCHASES: liabilities.filter((l: Liabilities) => l.section === 'HIRE_PURCHASES'),
      OVERDRAFTS: liabilities.filter((l: Liabilities) => l.section === 'OVERDRAFTS'),
      SHORT_TERM_DEBT: liabilities.filter((l: Liabilities) => l.section === 'SHORT_TERM_DEBT'),
      OTHER_DEBT: liabilities.filter((l: Liabilities) => l.section === 'OTHER_DEBT'),
    };
    return sections;
  }, [liabilities]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalDebtAmount = liabilities.reduce((sum: number, liability: Liabilities) => {
      const amount = parseFloat(liability.debtAmount?.replace(/[^\d.-]/g, '') || '0') || 0;
      return sum + amount;
    }, 0);

    const totalEstate = liabilities.reduce((sum: number, liability: Liabilities) => {
      const amount = parseFloat(liability.estate?.replace(/[^\d.-]/g, '') || '0') || 0;
      return sum + amount;
    }, 0);

    const totalOthers = liabilities.reduce((sum: number, liability: Liabilities) => {
      const amount = parseFloat(liability.others?.replace(/[^\d.-]/g, '') || '0') || 0;
      return sum + amount;
    }, 0);

    const totalClient = liabilities.reduce((sum: number, liability: Liabilities) => {
      const amount = parseFloat(liability.client?.replace(/[^\d.-]/g, '') || '0') || 0;
      return sum + amount;
    }, 0);

    return {
      debtAmount: formatCurrencyValue(totalDebtAmount.toString()),
      estate: formatCurrencyValue(totalEstate.toString()),
      others: formatCurrencyValue(totalOthers.toString()),
      client: formatCurrencyValue(totalClient.toString()),
    };
  }, [liabilities]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading liabilities</div>;

  const sectionLabels = {
    BONDS: 'Bonds',
    HIRE_PURCHASES: 'Hire Purchases',
    OVERDRAFTS: 'Overdrafts',
    SHORT_TERM_DEBT: 'Short Term Debt',
    OTHER_DEBT: 'Other Debt'
  };

  const renderLiabilityRow = (liability: Liabilities) => (
    <tr key={liability.id}>
      <td className="table-actions-cell">
        <div className="flex gap-2">
          <DuplicateButton
            onClick={() => handleDuplicate(liability)}
            disabled={isUpdating}
          />
          <DeleteButton
            onClick={() => handleDelete(liability.id)}
            disabled={isUpdating}
          />
        </div>
      </td>
      <td className={getCellClass('text')}>
        <SimpleCategorySelector
          value={liability.category}
          onChange={(category) => handleInputBlur(liability.id, 'category', category)}
          disabled={isUpdating}
        />
      </td>
      <td className={getCellClass('text')}>
        <input
          type="text"
          defaultValue={liability.description}
          onFocus={handleDefaultValueFocus}
          onBlur={createEnhancedBlurHandler(liability.id, 'description', handleInputBlur)}
          data-field={`description-${liability.id}`}
          className={`table-input ${getValueClass(liability.description, 'text')}`}
          disabled={isUpdating}
        />
      </td>
      <td className={getCellClass('checkbox')}>
        <input
          type="checkbox"
          checked={liability.included}
          onChange={(e) => handleCheckboxChange(liability.id, 'included', e.target.checked)}
          disabled={isUpdating}
        />
      </td>
      <td className={getCellClass('currency')}>
        <input
          type="text"
          defaultValue={liability.debtAmount}
          onFocus={handleDefaultValueFocus}
          onBlur={createEnhancedBlurHandler(liability.id, 'debtAmount', handleInputBlur)}
          data-field={`debtAmount-${liability.id}`}
          className={`table-input ${getValueClass(liability.debtAmount, 'currency')}`}
          disabled={isUpdating}
        />
      </td>
      <td className={getCellClass('percentage')}>
        <input
          type="text"
          defaultValue={liability.johnDoe}
          onFocus={handleDefaultValueFocus}
          onBlur={createEnhancedBlurHandler(liability.id, 'johnDoe', handleInputBlur)}
          data-field={`johnDoe-${liability.id}`}
          className={`table-input ${getValueClass(liability.johnDoe, 'percentage')}`}
          disabled={isUpdating}
        />
      </td>
      <td className={getCellClass('percentage')}>
        <input
          type="text"
          defaultValue={liability.janetteDoe}
          onFocus={handleDefaultValueFocus}
          onBlur={createEnhancedBlurHandler(liability.id, 'janetteDoe', handleInputBlur)}
          data-field={`janetteDoe-${liability.id}`}
          className={`table-input ${getValueClass(liability.janetteDoe, 'percentage')}`}
          disabled={isUpdating}
        />
      </td>
      <td className={getCellClass('percentage')}>
        <input
          type="text"
          defaultValue={liability.doeJunior}
          onFocus={handleDefaultValueFocus}
          onBlur={createEnhancedBlurHandler(liability.id, 'doeJunior', handleInputBlur)}
          data-field={`doeJunior-${liability.id}`}
          className={`table-input ${getValueClass(liability.doeJunior, 'percentage')}`}
          disabled={isUpdating}
        />
      </td>
      <td className={getCellClass('percentage')}>
        <input
          type="text"
          defaultValue={liability.doeFamilyTrust}
          onFocus={handleDefaultValueFocus}
          onBlur={createEnhancedBlurHandler(liability.id, 'doeFamilyTrust', handleInputBlur)}
          data-field={`doeFamilyTrust-${liability.id}`}
          className={`table-input ${getValueClass(liability.doeFamilyTrust, 'percentage')}`}
          disabled={isUpdating}
        />
      </td>
      <td className={getCellClass('currency')}>
        <input
          type="text"
          defaultValue={liability.estate}
          onFocus={handleDefaultValueFocus}
          onBlur={createEnhancedBlurHandler(liability.id, 'estate', handleInputBlur)}
          data-field={`estate-${liability.id}`}
          className={`table-input ${getValueClass(liability.estate, 'currency')}`}
          disabled={isUpdating}
        />
      </td>
      <td className={getCellClass('currency')}>
        <input
          type="text"
          defaultValue={liability.others}
          onFocus={handleDefaultValueFocus}
          onBlur={createEnhancedBlurHandler(liability.id, 'others', handleInputBlur)}
          data-field={`others-${liability.id}`}
          className={`table-input ${getValueClass(liability.others, 'currency')}`}
          disabled={isUpdating}
        />
      </td>
      <td className={getCellClass('currency')}>
        <input
          type="text"
          defaultValue={liability.client}
          onFocus={handleDefaultValueFocus}
          onBlur={createEnhancedBlurHandler(liability.id, 'client', handleInputBlur)}
          data-field={`client-${liability.id}`}
          className={`table-input ${getValueClass(liability.client, 'currency')}`}
          disabled={isUpdating}
        />
      </td>
    </tr>
  );

  return (
    <div className="table-wrapper">
      <table className="table">
        {/* Header */}
        <thead>
          <tr className="border-b border-border">
            <th className="px-3 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider w-16" rowSpan={2}>
              <AddButton onClick={handleAddLiability} disabled={isUpdating} />
            </th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={3}>Overview</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={1}>Liability Details</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={4}>Ownership Split</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start section-end" colSpan={3}>Distribution</th>
          </tr>
          <tr className="border-b border-border">
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start border-b border-neutral-200">Category</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Description</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Include</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start border-b border-neutral-200">Debt Amount</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start border-b border-neutral-200">John Doe</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Janette Doe (Spouse)</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Doe Junior</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Doe family trust</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start border-b border-neutral-200">Estate</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Others</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-end border-b border-neutral-200">Client</th>
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {Object.entries(groupedLiabilities).map(([sectionKey, sectionLiabilities]) => (
            <SafeFragment key={sectionKey}>
              {sectionLiabilities.length > 0 && (
                <SafeFragment key={`${sectionKey}-header`}>
                  <tr className="bg-neutral-50">
                    <td colSpan={12} className="px-4 py-2 font-medium text-neutral-700 border-b border-neutral-200">
                      {sectionLabels[sectionKey as keyof typeof sectionLabels]}
                    </td>
                  </tr>
                  {sectionLiabilities.map(renderLiabilityRow)}
                </SafeFragment>
              )}
            </SafeFragment>
          ))}
        </tbody>

        {/* Totals Footer */}
        <tfoot>
          <tr className="bg-neutral-50 border-t border-neutral-300">
            <td className="px-3 py-2 font-semibold text-neutral-700">Totals</td>
            <td className="px-3 py-2"></td>
            <td className="px-3 py-2"></td>
            <td className="px-3 py-2"></td>
            <td className="px-3 py-2 text-right font-semibold text-neutral-700">{totals.debtAmount}</td>
            <td className="px-3 py-2"></td>
            <td className="px-3 py-2"></td>
            <td className="px-3 py-2"></td>
            <td className="px-3 py-2"></td>
            <td className="px-3 py-2 text-right font-semibold text-neutral-700">{totals.estate}</td>
            <td className="px-3 py-2 text-right font-semibold text-neutral-700">{totals.others}</td>
            <td className="px-3 py-2 text-right font-semibold text-neutral-700">{totals.client}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}