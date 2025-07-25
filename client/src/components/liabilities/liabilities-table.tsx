import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Liabilities, InsertLiabilities } from '@shared/schema';
import { ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { getFieldClass, getCellClass } from '@/lib/field-types';
import { formatCurrencyValue, formatPercentageValue, formatTextValue, isDefaultValue, getValueClass } from '@/lib/formatting';
import { handleDefaultValueFocus, createEnhancedBlurHandler } from '@/lib/formatting';

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
    mutationFn: () => apiRequest('/api/liabilities', 'POST', {}),
    onSettled: () => {
      setIsUpdating(false);
      queryClient.invalidateQueries({ queryKey: ['/api/liabilities'] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, field, value }: { id: number; field: string; value: any }) =>
      apiRequest(`/api/liabilities/${id}`, 'PATCH', { [field]: value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/liabilities'] });
    },
    onSettled: () => {
      setIsUpdating(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/liabilities/${id}`, 'DELETE'),
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
      SHORT_TERM: liabilities.filter((l: Liabilities) => l.section === 'SHORT_TERM'),
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

  const sectionTitles = {
    BONDS: 'BONDS',
    HIRE_PURCHASES: 'HIRE PURCHASES AND LEASES',
    OVERDRAFTS: 'OVERDRAFTS AND CREDIT CARDS',
    SHORT_TERM: 'SHORT TERM DEBT',
    OTHER_DEBT: 'OTHER DEBT',
  };

  return (
    <div>
      {/* Table */}
      <table className="min-w-full border border-neutral-200">
        <thead>
          {/* First header row - Main groups */}
          <tr className="border-b border-border">
            <th className="px-3 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider w-16">Incl?</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={3}>Overview</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={4}>Owner(s)</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={2}>Client's liabilities settled by</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start section-end">Others' liabilities settled by</th>
          </tr>
          {/* Second header row - Individual columns */}
          <tr className="border-b border-border">
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200"></th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start border-b border-neutral-200">Category and description</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Currency</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Debt amount</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start border-b border-neutral-200">Peter Lambie</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Victoria Lambie (Spouse)</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Junior Lambie</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Lambie's family trust</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start border-b border-neutral-200">Estate</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Others</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-end border-b border-neutral-200">Client</th>
          </tr>
        </thead>
        
        <tbody className="divide-y divide-neutral-200">
          {/* Render each section */}
          {Object.entries(sectionTitles).map(([sectionKey, sectionTitle]) => (
            <React.Fragment key={sectionKey}>
              {/* Section Header */}
              <tr className="bg-neutral-50">
                <td colSpan={11} className="px-3 py-2 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  {sectionTitle}
                </td>
              </tr>
              
              {/* Section Rows */}
              {groupedLiabilities[sectionKey as keyof typeof groupedLiabilities].map((liability: Liabilities, index: number) => (
                <tr key={liability.id} className="hover:bg-neutral-50">
                  {/* Incl? Checkbox */}
                  <td className="px-3 py-2 text-center">
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={liability.included || false}
                        onChange={(e) => handleCheckboxChange(liability.id, 'included', e.target.checked)}
                        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                        disabled={isUpdating}
                      />
                    </div>
                  </td>
                  
                  {/* Overview - Category and Description */}
                  <td className="px-3 py-2 section-start">
                    <input
                      type="text"
                      defaultValue={liability.category}
                      onBlur={createEnhancedBlurHandler((value) => handleInputBlur(liability.id, 'category', value), 'text')}
                      onFocus={handleDefaultValueFocus}
                      className={`table-input ${getFieldClass('text')} ${getValueClass(liability.category, 'text')}`}
                      data-field={`category-${liability.id}`}
                      disabled={isUpdating}
                    />
                  </td>
                  
                  {/* Overview - Currency */}
                  <td className="px-3 py-2">
                    <select
                      defaultValue={liability.currency}
                      onChange={(e) => handleInputBlur(liability.id, 'currency', e.target.value)}
                      className="table-input table-dropdown"
                      disabled={isUpdating}
                    >
                      <option value="ZAR">ZAR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </td>
                  
                  {/* Overview - Debt Amount */}
                  <td className={`px-3 py-2 ${getCellClass('currency')}`}>
                    <input
                      type="text"
                      defaultValue={liability.debtAmount}
                      onBlur={createEnhancedBlurHandler((value) => handleInputBlur(liability.id, 'debtAmount', value), 'currency')}
                      onFocus={handleDefaultValueFocus}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(liability.debtAmount, 'currency')}`}
                      data-field={`debtAmount-${liability.id}`}
                      disabled={isUpdating}
                    />
                  </td>
                  
                  {/* Owner(s) - Peter Lambie */}
                  <td className={`px-3 py-2 section-start ${getCellClass('percentage')}`}>
                    <input
                      type="text"
                      defaultValue={liability.peterLambie}
                      onBlur={createEnhancedBlurHandler((value) => handleInputBlur(liability.id, 'peterLambie', value), 'percentage')}
                      onFocus={handleDefaultValueFocus}
                      className={`table-input ${getFieldClass('percentage')} ${getValueClass(liability.peterLambie, 'percentage')}`}
                      data-field={`peterLambie-${liability.id}`}
                      disabled={isUpdating}
                    />
                  </td>
                  
                  {/* Owner(s) - Victoria Lambie */}
                  <td className={`px-3 py-2 ${getCellClass('percentage')}`}>
                    <input
                      type="text"
                      defaultValue={liability.victoriaLambie}
                      onBlur={createEnhancedBlurHandler((value) => handleInputBlur(liability.id, 'victoriaLambie', value), 'percentage')}
                      onFocus={handleDefaultValueFocus}
                      className={`table-input ${getFieldClass('percentage')} ${getValueClass(liability.victoriaLambie, 'percentage')}`}
                      data-field={`victoriaLambie-${liability.id}`}
                      disabled={isUpdating}
                    />
                  </td>
                  
                  {/* Owner(s) - Junior Lambie */}
                  <td className={`px-3 py-2 ${getCellClass('percentage')}`}>
                    <input
                      type="text"
                      defaultValue={liability.juniorLambie}
                      onBlur={createEnhancedBlurHandler((value) => handleInputBlur(liability.id, 'juniorLambie', value), 'percentage')}
                      onFocus={handleDefaultValueFocus}
                      className={`table-input ${getFieldClass('percentage')} ${getValueClass(liability.juniorLambie, 'percentage')}`}
                      data-field={`juniorLambie-${liability.id}`}
                      disabled={isUpdating}
                    />
                  </td>
                  
                  {/* Owner(s) - Lambie's Family Trust */}
                  <td className={`px-3 py-2 ${getCellClass('percentage')}`}>
                    <input
                      type="text"
                      defaultValue={liability.lambiesFamilyTrust}
                      onBlur={createEnhancedBlurHandler((value) => handleInputBlur(liability.id, 'lambiesFamilyTrust', value), 'percentage')}
                      onFocus={handleDefaultValueFocus}
                      className={`table-input ${getFieldClass('percentage')} ${getValueClass(liability.lambiesFamilyTrust, 'percentage')}`}
                      data-field={`lambiesFamilyTrust-${liability.id}`}
                      disabled={isUpdating}
                    />
                  </td>
                  
                  {/* Client's liabilities settled by - Estate */}
                  <td className={`px-3 py-2 section-start ${getCellClass('currency')}`}>
                    <input
                      type="text"
                      defaultValue={liability.estate}
                      onBlur={createEnhancedBlurHandler((value) => handleInputBlur(liability.id, 'estate', value), 'currency')}
                      onFocus={handleDefaultValueFocus}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(liability.estate, 'currency')}`}
                      data-field={`estate-${liability.id}`}
                      disabled={isUpdating}
                    />
                  </td>
                  
                  {/* Client's liabilities settled by - Others */}
                  <td className={`px-3 py-2 ${getCellClass('currency')}`}>
                    <input
                      type="text"
                      defaultValue={liability.others}
                      onBlur={createEnhancedBlurHandler((value) => handleInputBlur(liability.id, 'others', value), 'currency')}
                      onFocus={handleDefaultValueFocus}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(liability.others, 'currency')}`}
                      data-field={`others-${liability.id}`}
                      disabled={isUpdating}
                    />
                  </td>
                  
                  {/* Others' liabilities settled by - Client */}
                  <td className={`px-3 py-2 section-end ${getCellClass('currency')}`}>
                    <input
                      type="text"
                      defaultValue={liability.client}
                      onBlur={createEnhancedBlurHandler((value) => handleInputBlur(liability.id, 'client', value), 'currency')}
                      onFocus={handleDefaultValueFocus}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(liability.client, 'currency')}`}
                      data-field={`client-${liability.id}`}
                      disabled={isUpdating}
                    />
                  </td>
                </tr>
              ))}
              
              {/* Add empty row if section is empty */}
              {groupedLiabilities[sectionKey as keyof typeof groupedLiabilities].length === 0 && (
                <tr className="hover:bg-neutral-50">
                  <td colSpan={11} className="px-3 py-4 text-center text-neutral-500 text-sm">
                    No {sectionTitle.toLowerCase()} entries
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
        
        {/* Totals Footer */}
        <tfoot className="bg-neutral-50 border-t border-neutral-300">
          <tr>
            <td className="px-3 py-3 text-sm font-semibold text-neutral-700"></td>
            <td className="px-3 py-3 text-sm font-normal text-neutral-700 section-start">Totals</td>
            <td className="px-3 py-3 text-sm font-normal text-neutral-700"></td>
            <td className={`px-3 py-3 text-sm font-semibold text-neutral-700 ${getCellClass('currency')}`}>{totals.debtAmount}</td>
            <td className="px-3 py-3 text-sm font-normal text-neutral-700 section-start"></td>
            <td className="px-3 py-3 text-sm font-normal text-neutral-700"></td>
            <td className="px-3 py-3 text-sm font-normal text-neutral-700"></td>
            <td className="px-3 py-3 text-sm font-normal text-neutral-700"></td>
            <td className={`px-3 py-3 text-sm font-semibold text-neutral-700 section-start ${getCellClass('currency')}`}>{totals.estate}</td>
            <td className={`px-3 py-3 text-sm font-semibold text-neutral-700 ${getCellClass('currency')}`}>{totals.others}</td>
            <td className={`px-3 py-3 text-sm font-semibold text-neutral-700 section-end ${getCellClass('currency')}`}>{totals.client}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}