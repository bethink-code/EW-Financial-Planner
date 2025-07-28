import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Liabilities } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { SafeFragment } from '@/lib/safe-fragment';
import { SimpleCategorySelector } from './simple-category-selector';
import { CategorySelectionDialog } from '@/components/ui/category-selection-dialog';
import { formatCurrencyValue, formatPercentageValue, formatTextValue, isDefaultValue, getValueClass } from '@/lib/formatting';
import { getFieldClass, getCellClass } from '@/lib/field-types';
import { createEnhancedBlurHandler, handleDefaultValueFocus } from '@/lib/formatting';
import { AddButton, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';

interface LiabilitiesTableProps {
  viewMode?: 'table' | 'hybrid';
  onShowCategoryDialog?: () => void;
}

export function LiabilitiesTable({ viewMode = 'table', onShowCategoryDialog }: LiabilitiesTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  // Fetch liabilities
  const { data: liabilities = [], isLoading, error } = useQuery<Liabilities[]>({
    queryKey: ['/api/liabilities'],
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: (category: string) => apiRequest('POST', '/api/liabilities', {
      category,
      description: 'Enter details...',
      debtAmount: 'R 0',
      peterLambie: '0%',
      victoriaLambie: '0%',
      juniorLambie: '0%',
      lambiesFamilyTrust: '0%',
      estate: 'R 0',
      others: 'R 0',
      client: 'R 0',
      section: category,
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

  // Liability categories
  const liabilityCategories = [
    { value: 'BONDS', label: 'Home Bond' },
    { value: 'VEHICLE_FINANCE', label: 'Vehicle Finance' },
    { value: 'CREDIT_CARDS', label: 'Credit Cards' },
    { value: 'PERSONAL_LOANS', label: 'Personal Loans' },
    { value: 'BUSINESS_LOANS', label: 'Business Loans' },
    { value: 'SHORT_TERM_DEBT', label: 'Short Term Debt' },
    { value: 'OTHER_DEBT', label: 'Other Debt' }
  ];

  // Handle add liability - use prop function if provided, fallback to dialog
  const handleAddLiability = useCallback(() => {
    if (onShowCategoryDialog) {
      onShowCategoryDialog();
    } else {
      setShowCategoryDialog(true);
    }
  }, [onShowCategoryDialog]);

  // Handle category selection
  const handleCategorySelect = useCallback((category: string) => {
    setIsUpdating(true);
    addMutation.mutate(category);
  }, [addMutation]);

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
        } else if (field.includes('peterLambie') || field.includes('victoriaLambie') || field.includes('juniorLambie') || field.includes('lambiesFamilyTrust')) {
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

  // Handle duplicate
  const handleDuplicate = useCallback((liability: Liabilities) => {
    setIsUpdating(true);
    const { id, ...liabilityData } = liability;
    apiRequest('POST', '/api/liabilities', liabilityData).then(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/liabilities'] });
      setIsUpdating(false);
    });
  }, []);

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
      <td className="p-2 text-center section-start">
        <input
          type="checkbox"
          checked={liability.included}
          onChange={(e) => handleCheckboxChange(liability.id, 'included', e.target.checked)}
          disabled={isUpdating}
        />
      </td>
      <td className="p-2">
        <input
          type="text"
          defaultValue={formatTextValue(liability.description)}
          onFocus={handleDefaultValueFocus}
          onBlur={createEnhancedBlurHandler((value) => handleInputBlur(liability.id, 'description', value), 'text')}
          data-field={`description-${liability.id}`}
          className={`table-input h-7 text-sm bg-primary/5 border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm ${getValueClass(liability.description, 'text')}`}
          style={{ textAlign: "left" }}
          disabled={isUpdating}
        />
      </td>
      <td className="p-2 text-right section-start">
        <input
          type="text"
          defaultValue={formatCurrencyValue(liability.debtAmount)}
          onFocus={handleDefaultValueFocus}
          onBlur={createEnhancedBlurHandler((value) => handleInputBlur(liability.id, 'debtAmount', value), 'currency')}
          data-field={`debtAmount-${liability.id}`}
          className={`table-input h-7 text-sm bg-primary/5 border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm ${getValueClass(liability.debtAmount, 'currency')}`}
          style={{ textAlign: "right", minWidth: "100px" }}
          disabled={isUpdating}
        />
      </td>
      <td className="p-2 text-right section-start">
        <input
          type="text"
          defaultValue={formatPercentageValue(liability.peterLambie)}
          onFocus={handleDefaultValueFocus}
          onBlur={createEnhancedBlurHandler((value) => handleInputBlur(liability.id, 'peterLambie', value), 'percentage')}
          data-field={`peterLambie-${liability.id}`}
          className={`table-input h-7 text-sm bg-primary/5 border-gray-200 focus:border-primary w-16 px-2 py-1 border rounded-md text-sm ${getValueClass(liability.peterLambie, 'percentage')}`}
          style={{ textAlign: "right" }}
          disabled={isUpdating}
        />
      </td>
      <td className="p-2 text-right">
        <input
          type="text"
          defaultValue={formatPercentageValue(liability.victoriaLambie)}
          onFocus={handleDefaultValueFocus}
          onBlur={createEnhancedBlurHandler((value) => handleInputBlur(liability.id, 'victoriaLambie', value), 'percentage')}
          data-field={`victoriaLambie-${liability.id}`}
          className={`table-input h-7 text-sm bg-primary/5 border-gray-200 focus:border-primary w-16 px-2 py-1 border rounded-md text-sm ${getValueClass(liability.victoriaLambie, 'percentage')}`}
          style={{ textAlign: "right" }}
          disabled={isUpdating}
        />
      </td>
      <td className="p-2 text-right">
        <input
          type="text"
          defaultValue={formatPercentageValue(liability.juniorLambie)}
          onFocus={handleDefaultValueFocus}
          onBlur={createEnhancedBlurHandler((value) => handleInputBlur(liability.id, 'juniorLambie', value), 'percentage')}
          data-field={`juniorLambie-${liability.id}`}
          className={`table-input h-7 text-sm bg-primary/5 border-gray-200 focus:border-primary w-16 px-2 py-1 border rounded-md text-sm ${getValueClass(liability.juniorLambie, 'percentage')}`}
          style={{ textAlign: "right" }}
          disabled={isUpdating}
        />
      </td>
      <td className="p-2 text-right">
        <input
          type="text"
          defaultValue={formatPercentageValue(liability.lambiesFamilyTrust)}
          onFocus={handleDefaultValueFocus}
          onBlur={createEnhancedBlurHandler((value) => handleInputBlur(liability.id, 'lambiesFamilyTrust', value), 'percentage')}
          data-field={`lambiesFamilyTrust-${liability.id}`}
          className={`table-input h-7 text-sm bg-primary/5 border-gray-200 focus:border-primary w-16 px-2 py-1 border rounded-md text-sm ${getValueClass(liability.lambiesFamilyTrust, 'percentage')}`}
          style={{ textAlign: "right" }}
          disabled={isUpdating}
        />
      </td>
      <td className="p-2 text-right section-start">
        <input
          type="text"
          defaultValue={formatCurrencyValue(liability.estate)}
          onFocus={handleDefaultValueFocus}
          onBlur={createEnhancedBlurHandler((value) => handleInputBlur(liability.id, 'estate', value), 'currency')}
          data-field={`estate-${liability.id}`}
          className={`table-input h-7 text-sm bg-primary/5 border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm ${getValueClass(liability.estate, 'currency')}`}
          style={{ textAlign: "right", minWidth: "100px" }}
          disabled={isUpdating}
        />
      </td>
      <td className="p-2 text-right">
        <input
          type="text"
          defaultValue={formatCurrencyValue(liability.others)}
          onFocus={handleDefaultValueFocus}
          onBlur={createEnhancedBlurHandler((value) => handleInputBlur(liability.id, 'others', value), 'currency')}
          data-field={`others-${liability.id}`}
          className={`table-input h-7 text-sm bg-primary/5 border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm ${getValueClass(liability.others, 'currency')}`}
          style={{ textAlign: "right", minWidth: "100px" }}
          disabled={isUpdating}
        />
      </td>
      <td className="p-2 text-right section-end">
        <input
          type="text"
          defaultValue={formatCurrencyValue(liability.client)}
          onFocus={handleDefaultValueFocus}
          onBlur={createEnhancedBlurHandler((value) => handleInputBlur(liability.id, 'client', value), 'currency')}
          data-field={`client-${liability.id}`}
          className={`table-input h-7 text-sm bg-primary/5 border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm ${getValueClass(liability.client, 'currency')}`}
          style={{ textAlign: "right", minWidth: "100px" }}
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
          <tr>
            <th className="px-3 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider w-16" rowSpan={2}>
              <AddButton onClick={handleAddLiability} disabled={isUpdating} />
            </th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={2}>Overview</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={1}>Liability Details</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={4}>Ownership Split</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start section-end" colSpan={3}>Distribution</th>
          </tr>
          <tr>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Include</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Description</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Debt Amount</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">John Doe</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Janette Doe (Spouse)</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Doe Junior</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Doe family trust</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Estate</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Others</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-end">Client</th>
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {Object.entries(groupedLiabilities).map(([sectionKey, sectionLiabilities]) => (
            <SafeFragment key={sectionKey}>
              {sectionLiabilities.length > 0 && (
                <SafeFragment key={`${sectionKey}-header`}>
                  <tr className="bg-neutral-50">
                    <td colSpan={11} className="px-4 py-2 text-neutral-700 border-b border-neutral-200 text-[14px] font-semibold bg-[#edf4f9]">
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
          <tr>
            <td className="totals-cell-label">Totals</td>
            <td className="totals-cell-label section-start"></td>
            <td className="totals-cell-label"></td>
            <td className="totals-cell-value section-start">{totals.debtAmount}</td>
            <td className="totals-cell-label section-start"></td>
            <td className="totals-cell-label"></td>
            <td className="totals-cell-label"></td>
            <td className="totals-cell-label"></td>
            <td className="totals-cell-value section-start">{totals.estate}</td>
            <td className="totals-cell-value">{totals.others}</td>
            <td className="totals-cell-value section-end">{totals.client}</td>
          </tr>
        </tfoot>
      </table>

      {/* Category Selection Dialog */}
      <CategorySelectionDialog
        isOpen={showCategoryDialog}
        onClose={() => setShowCategoryDialog(false)}
        onSelectCategory={handleCategorySelect}
        title="Select Liability Category"
        categories={liabilityCategories}
      />
    </div>
  );
}