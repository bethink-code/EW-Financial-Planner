import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Liabilities, InsertLiabilities } from '@shared/schema';
import { AddButton, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { getFieldClass, getCellClass } from '@/lib/field-types';
import { formatCurrencyValue, formatPercentageValue, formatTextValue, isDefaultValue, getValueClass } from '@/lib/formatting';
import { handleDefaultValueFocus, createEnhancedBlurHandler } from '@/lib/formatting';
import { SimpleCategorySelector } from './simple-category-selector';
import { SafeFragment } from '@/lib/safe-fragment';


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
      currency: 'ZAR',
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

    // Format and update DOM element immediately for visual feedback
    const formattedValue = field.includes('amount') || field.includes('estate') || field.includes('others') || field.includes('client')
      ? formatCurrencyValue(value)
      : field.includes('percentage') || field.includes('peter') || field.includes('victoria') || field.includes('junior') || field.includes('trust')
      ? formatPercentageValue(value)
      : formatTextValue(value);

    const element = document.querySelector(`input[data-field="${field}-${id}"]`) as HTMLInputElement;
    if (element) {
      element.value = formattedValue;
    }
  }, [updateMutation]);

  // Handle checkbox change
  const handleCheckboxChange = useCallback((id: number, field: 'included', value: boolean) => {
    setIsUpdating(true);
    updateMutation.mutate({ id, field, value });
  }, [updateMutation]);

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
      debtAmount: `R ${totalDebtAmount.toLocaleString()}`,
      estate: `R ${totalEstate.toLocaleString()}`,
      others: `R ${totalOthers.toLocaleString()}`,
      client: `R ${totalClient.toLocaleString()}`,
    };
  }, [liabilities]);

  if (isLoading) {
    return <div className="flex justify-center items-center p-8">Loading liabilities...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error loading liabilities</div>;
  }

  const sectionNames = {
    BONDS: 'Bonds',
    HIRE_PURCHASES: 'Hire Purchases',
    OVERDRAFTS: 'Overdrafts', 
    SHORT_TERM_DEBT: 'Short Term Debt',
    OTHER_DEBT: 'Other Debt',
  };

  const renderLiabilityRow = (liability: Liabilities) => (
    <SafeFragment key={`liability-${liability.id}`}>
      <tr>
        {/* Actions */}
        <td className="table-actions-cell">
          <div className="flex space-x-1">
            <DuplicateButton onClick={() => handleDuplicate(liability)} />
            <DeleteButton onClick={() => handleDelete(liability.id)} />
          </div>
        </td>

        {/* Overview */}
        <td className={getCellClass('text')}>
          <SimpleCategorySelector
            value={liability.category}
            onChange={(value) => {
              handleInputBlur(liability.id, 'category', value);
              handleInputBlur(liability.id, 'section', value);
            }}
          />
        </td>
        <td className={getCellClass('text')}>
          <input
            type="text"
            defaultValue={formatTextValue(liability.description)}
            data-field={`description-${liability.id}`}
            className={`${getFieldClass('text')} ${getValueClass(liability.description, 'text')}`}
            onFocus={handleDefaultValueFocus}
            onBlur={(e) => handleInputBlur(liability.id, 'description', e.target.value)}
          />
        </td>
        <td className={getCellClass('text')}>
          <input
            type="text"
            defaultValue={formatTextValue(liability.currency)}
            data-field={`currency-${liability.id}`}
            className={`${getFieldClass('text')} ${getValueClass(liability.currency, 'text')}`}
            onFocus={handleDefaultValueFocus}
            onBlur={(e) => handleInputBlur(liability.id, 'currency', e.target.value)}
          />
        </td>

        {/* Liability Details */}
        <td className={getCellClass('currency')}>
          <input
            type="text"
            defaultValue={formatCurrencyValue(liability.debtAmount)}
            data-field={`debtAmount-${liability.id}`}
            className={`${getFieldClass('currency')} ${getValueClass(liability.debtAmount, 'currency')}`}
            onFocus={handleDefaultValueFocus}
            onBlur={createEnhancedBlurHandler((value) => handleInputBlur(liability.id, 'debtAmount', value), 'currency')}
          />
        </td>

        {/* Owner(s) - Individual ownership percentages */}
        <td className={getCellClass('percentage')}>
          <input
            type="text"
            defaultValue={formatPercentageValue(liability.johnDoe)}
            data-field={`johnDoe-${liability.id}`}
            className={`${getFieldClass('percentage')} ${getValueClass(liability.johnDoe, 'percentage')}`}
            onFocus={handleDefaultValueFocus}
            onBlur={createEnhancedBlurHandler((value) => handleInputBlur(liability.id, 'johnDoe', value), 'percentage')}
          />
        </td>
        <td className={getCellClass('percentage')}>
          <input
            type="text"
            defaultValue={formatPercentageValue(liability.janetteDoe)}
            data-field={`janetteDoe-${liability.id}`}
            className={`${getFieldClass('percentage')} ${getValueClass(liability.janetteDoe, 'percentage')}`}
            onFocus={handleDefaultValueFocus}
            onBlur={createEnhancedBlurHandler((value) => handleInputBlur(liability.id, 'janetteDoe', value), 'percentage')}
          />
        </td>
        <td className={getCellClass('percentage')}>
          <input
            type="text"
            defaultValue={formatPercentageValue(liability.doeJunior)}
            data-field={`doeJunior-${liability.id}`}
            className={`${getFieldClass('percentage')} ${getValueClass(liability.doeJunior, 'percentage')}`}
            onFocus={handleDefaultValueFocus}
            onBlur={createEnhancedBlurHandler((value) => handleInputBlur(liability.id, 'doeJunior', value), 'percentage')}
          />
        </td>
        <td className={getCellClass('percentage')}>
          <input
            type="text"
            defaultValue={formatPercentageValue(liability.doeFamilyTrust)}
            data-field={`doeFamilyTrust-${liability.id}`}
            className={`${getFieldClass('percentage')} ${getValueClass(liability.doeFamilyTrust, 'percentage')}`}
            onFocus={handleDefaultValueFocus}
            onBlur={createEnhancedBlurHandler((value) => handleInputBlur(liability.id, 'doeFamilyTrust', value), 'percentage')}
          />
        </td>

        {/* Liability distribution by */}
        <td className={getCellClass('currency')}>
          <input
            type="text"
            defaultValue={formatCurrencyValue(liability.estate)}
            data-field={`estate-${liability.id}`}
            className={`${getFieldClass('currency')} ${getValueClass(liability.estate, 'currency')}`}
            onFocus={handleDefaultValueFocus}
            onBlur={createEnhancedBlurHandler((value) => handleInputBlur(liability.id, 'estate', value), 'currency')}
          />
        </td>
        <td className={getCellClass('currency')}>
          <input
            type="text"
            defaultValue={formatCurrencyValue(liability.others)}
            data-field={`others-${liability.id}`}
            className={`${getFieldClass('currency')} ${getValueClass(liability.others, 'currency')}`}
            onFocus={handleDefaultValueFocus}
            onBlur={createEnhancedBlurHandler((value) => handleInputBlur(liability.id, 'others', value), 'currency')}
          />
        </td>
        <td className={getCellClass('currency')}>
          <input
            type="text"
            defaultValue={formatCurrencyValue(liability.client)}
            data-field={`client-${liability.id}`}
            className={`${getFieldClass('currency')} ${getValueClass(liability.client, 'currency')}`}
            onFocus={handleDefaultValueFocus}
            onBlur={createEnhancedBlurHandler((value) => handleInputBlur(liability.id, 'client', value), 'currency')}
          />
        </td>

        {/* Included checkbox */}
        <td className={getCellClass('checkbox')}>
          <input
            type="checkbox"
            checked={liability.included || false}
            onChange={(e) => handleInputBlur(liability.id, 'included', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </td>
      </tr>
    </SafeFragment>
  );

  return (
    <div className="table-wrapper">
      <table className="table">
        {/* Header */}
        <thead>
          <tr>
            <th rowSpan={2} className="w-20 text-center">Actions</th>
            <th colSpan={3} className="border-b border-neutral-200">Overview</th>
            <th colSpan={1} className="border-b border-neutral-200">Liability Details</th>
            <th colSpan={4} className="border-b border-neutral-200">Owner(s)</th>
            <th colSpan={3} className="border-b border-neutral-200">Liability distribution by</th>
            <th rowSpan={2} className="border-b border-neutral-200">Included</th>
          </tr>
          <tr>
            <th className="border-b border-neutral-200">Category</th>
            <th className="border-b border-neutral-200">Description</th>
            <th className="border-b border-neutral-200">Currency</th>
            <th className="border-b border-neutral-200">Debt Amount</th>
            <th className="border-b border-neutral-200">John Doe</th>
            <th className="border-b border-neutral-200">Janette Doe (Spouse)</th>
            <th className="border-b border-neutral-200">Doe Junior</th>
            <th className="border-b border-neutral-200">Doe family trust</th>
            <th className="border-b border-neutral-200">Estate</th>
            <th className="border-b border-neutral-200">Others</th>
            <th className="border-b border-neutral-200">Client</th>
          </tr>
        </thead>
        
        {/* Body with grouped sections */}
        <tbody>
          {Object.entries(groupedLiabilities).map(([sectionKey, sectionLiabilities]) => 
            sectionLiabilities.length > 0 && (
              <SafeFragment key={`section-${sectionKey}`}>
                <tr>
                  <td colSpan={12} className="bg-gray-100 px-4 py-2 font-semibold text-gray-700 border-t border-gray-300">
                    {sectionNames[sectionKey as keyof typeof sectionNames]}
                  </td>
                </tr>
                {sectionLiabilities.map(renderLiabilityRow)}
              </SafeFragment>
            )
          )}
        </tbody>

        {/* Totals */}
        <tfoot>
          <tr className="bg-neutral-50 border-t border-neutral-300">
            <td className="px-4 py-3 text-gray-600 font-normal text-sm">Totals</td>
            <td colSpan={3} className="px-4 py-3"></td>
            <td className="px-4 py-3 text-gray-700 font-semibold text-sm text-right">{totals.debtAmount}</td>
            <td colSpan={4} className="px-4 py-3"></td>
            <td className="px-4 py-3 text-gray-700 font-semibold text-sm text-right">{totals.estate}</td>
            <td className="px-4 py-3 text-gray-700 font-semibold text-sm text-right">{totals.others}</td>
            <td className="px-4 py-3 text-gray-700 font-semibold text-sm text-right">{totals.client}</td>
            <td className="px-4 py-3"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}