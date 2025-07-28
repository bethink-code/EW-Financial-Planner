import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Assets } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { SafeFragment } from '@/lib/safe-fragment';
import { CategorySelector } from './category-selector';
import { CategorySelectionDialog } from '@/components/ui/category-selection-dialog';
import { formatCurrencyValue, formatPercentageValue, formatTextValue, isDefaultValue, getValueClass } from '@/lib/formatting';
import { getFieldClass, getCellClass } from '@/lib/field-types';
import { createEnhancedBlurHandler, handleDefaultValueFocus } from '@/lib/formatting';
import { AddButton, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';

interface AssetsTableProps {
  viewMode?: 'table' | 'hybrid';
  onShowCategoryDialog?: () => void;
}

export function AssetsTable({ viewMode = 'table', onShowCategoryDialog }: AssetsTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  // Fetch assets
  const { data: assets = [], isLoading, error } = useQuery<Assets[]>({
    queryKey: ['/api/assets'],
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: (category: string) => apiRequest('POST', '/api/assets', {
      category,
      description: 'Enter details...',
      marketValue: 'R 0',
      johnDoe: '0%',
      janetteDoe: '0%',
      doeJunior: '0%',
      doeFamilyTrust: '0%',
      estate: 'R 0',
      others: 'R 0',
      client: 'R 0',
      section: category,
      included: true
    }),
    onSettled: () => {
      setIsUpdating(false);
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, field, value }: { id: number; field: string; value: any }) =>
      apiRequest('PATCH', `/api/assets/${id}`, { [field]: value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
    },
    onSettled: () => {
      setIsUpdating(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/assets/${id}`),
    onSettled: () => {
      setIsUpdating(false);
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
    },
  });

  // Asset categories
  const assetCategories = [
    { value: 'PROPERTY', label: 'Property' },
    { value: 'VEHICLES', label: 'Vehicles' },
    { value: 'HOUSEHOLD_GOODS', label: 'Household Goods' },
    { value: 'INVESTMENTS', label: 'Investments' },
    { value: 'CASH', label: 'Cash & Bank Accounts' },
    { value: 'OTHER_ASSETS', label: 'Other Assets' }
  ];

  // Handle add asset - use prop function if provided, fallback to dialog
  const handleAddAsset = useCallback(() => {
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

  // Handle checkbox changes
  const handleCheckboxChange = useCallback((id: number, field: string, checked: boolean) => {
    updateMutation.mutate({
      id,
      updates: { [field]: checked }
    });
  }, [updateMutation]);

  // Handle input blur with formatting
  const handleInputBlur = useCallback((id: number, field: string, value: string) => {
    setIsUpdating(true);
    updateMutation.mutate({ id, field, value });

    // Apply formatting to the DOM element immediately
    setTimeout(() => {
      const element = document.querySelector(`input[data-field="${field}-${id}"]`) as HTMLInputElement;
      if (element) {
        if (field.includes('john') || field.includes('janette') || field.includes('doe')) {
          element.value = formatPercentageValue(value);
        } else if (field.includes('Value') || field.includes('estate') || field.includes('others') || field.includes('client')) {
          element.value = formatCurrencyValue(value);
        }
      }
    }, 50);
  }, [updateMutation]);

  // Handle duplicate
  const handleDuplicate = useCallback((asset: Assets) => {
    setIsUpdating(true);
    const { id, ...assetData } = asset;
    apiRequest('POST', '/api/assets', assetData).then(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      setIsUpdating(false);
    });
  }, []);

  // Handle delete
  const handleDelete = useCallback((id: number) => {
    setIsUpdating(true);
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  // Group assets by section
  const groupedAssets = useMemo(() => {
    const sections = {
      PROPERTY: assets.filter((a: Assets) => a.section === 'PROPERTY'),
      VEHICLES: assets.filter((a: Assets) => a.section === 'VEHICLES'),
      INVESTMENTS: assets.filter((a: Assets) => a.section === 'INVESTMENTS'),
      CASH_BANK: assets.filter((a: Assets) => a.section === 'CASH_BANK'),
      PERSONAL_ASSETS: assets.filter((a: Assets) => a.section === 'PERSONAL_ASSETS'),
      BUSINESS_ASSETS: assets.filter((a: Assets) => a.section === 'BUSINESS_ASSETS'),
      INSURANCE_POLICIES: assets.filter((a: Assets) => a.section === 'INSURANCE_POLICIES'),
      OTHER_ASSETS: assets.filter((a: Assets) => a.section === 'OTHER_ASSETS'),
    };
    return sections;
  }, [assets]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalMarketValue = assets.reduce((sum: number, asset: Assets) => {
      const amount = parseFloat(asset.marketValue?.replace(/[^\d.-]/g, '') || '0') || 0;
      return sum + amount;
    }, 0);

    const totalEstate = assets.reduce((sum: number, asset: Assets) => {
      const amount = parseFloat(asset.estate?.replace(/[^\d.-]/g, '') || '0') || 0;
      return sum + amount;
    }, 0);

    const totalOthers = assets.reduce((sum: number, asset: Assets) => {
      const amount = parseFloat(asset.others?.replace(/[^\d.-]/g, '') || '0') || 0;
      return sum + amount;
    }, 0);

    const totalClient = assets.reduce((sum: number, asset: Assets) => {
      const amount = parseFloat(asset.client?.replace(/[^\d.-]/g, '') || '0') || 0;
      return sum + amount;
    }, 0);

    return {
      totalMarketValue: `R ${totalMarketValue.toLocaleString()}`,
      totalEstate: `R ${totalEstate.toLocaleString()}`,
      totalOthers: `R ${totalOthers.toLocaleString()}`,
      totalClient: `R ${totalClient.toLocaleString()}`,
    };
  }, [assets]);

  if (isLoading) return <div>Loading assets...</div>;
  if (error) return <div>Error loading assets</div>;

  const sectionNames = {
    PROPERTY: 'Property',
    VEHICLES: 'Vehicles', 
    INVESTMENTS: 'Investments',
    CASH_BANK: 'Cash & Bank Accounts',
    PERSONAL_ASSETS: 'Personal Assets',
    BUSINESS_ASSETS: 'Business Assets',
    INSURANCE_POLICIES: 'Insurance Policies',
    OTHER_ASSETS: 'Other Assets'
  };

  const renderAssetRow = (asset: Assets) => (
    <SafeFragment key={`asset-${asset.id}`}>
      <tr>
        <td className="table-actions-cell">
          <div className="flex gap-2">
            <DuplicateButton
              onClick={() => handleDuplicate(asset)}
              disabled={isUpdating}
            />
            <DeleteButton
              onClick={() => handleDelete(asset.id)}
              disabled={isUpdating}
            />
          </div>
        </td>

        {/* Overview */}
        <td className="p-2 text-center">
          <input
            type="checkbox"
            checked={asset.included || false}
            onChange={(e) => handleCheckboxChange(asset.id, 'included', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </td>
        <td className="p-2">
          <input
            type="text"
            defaultValue={formatTextValue(asset.description)}
            data-field={`description-${asset.id}`}
            className={`table-input h-7 text-sm bg-primary/5 border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm ${getValueClass(asset.description, 'text')}`}
            style={{ textAlign: "left" }}
            onFocus={handleDefaultValueFocus}
            onBlur={(e) => handleInputBlur(asset.id, 'description', e.target.value)}
          />
        </td>

        {/* Asset Details */}
        <td className="p-2 text-right">
          <input
            type="text"
            defaultValue={formatCurrencyValue(asset.marketValue)}
            data-field={`marketValue-${asset.id}`}
            className={`table-input h-7 text-sm bg-primary/5 border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm ${getValueClass(asset.marketValue, 'currency')}`}
            style={{ textAlign: "right", minWidth: "100px" }}
            onFocus={handleDefaultValueFocus}
            onBlur={createEnhancedBlurHandler((value) => handleInputBlur(asset.id, 'marketValue', value), 'currency')}
          />
        </td>

        {/* Owner(s) - Individual ownership percentages */}
        <td className="p-2 text-right">
          <input
            type="text"
            defaultValue={formatPercentageValue(asset.johnDoe)}
            data-field={`johnDoe-${asset.id}`}
            className={`table-input h-7 text-sm bg-primary/5 border-gray-200 focus:border-primary w-16 px-2 py-1 border rounded-md text-sm ${getValueClass(asset.johnDoe, 'percentage')}`}
            style={{ textAlign: "right" }}
            onFocus={handleDefaultValueFocus}
            onBlur={createEnhancedBlurHandler((value) => handleInputBlur(asset.id, 'johnDoe', value), 'percentage')}
          />
        </td>
        <td className="p-2 text-right">
          <input
            type="text"
            defaultValue={formatPercentageValue(asset.janetteDoe)}
            data-field={`janetteDoe-${asset.id}`}
            className={`table-input h-7 text-sm bg-primary/5 border-gray-200 focus:border-primary w-16 px-2 py-1 border rounded-md text-sm ${getValueClass(asset.janetteDoe, 'percentage')}`}
            style={{ textAlign: "right" }}
            onFocus={handleDefaultValueFocus}
            onBlur={createEnhancedBlurHandler((value) => handleInputBlur(asset.id, 'janetteDoe', value), 'percentage')}
          />
        </td>
        <td className="p-2 text-right">
          <input
            type="text"
            defaultValue={formatPercentageValue(asset.doeJunior)}
            data-field={`doeJunior-${asset.id}`}
            className={`table-input h-7 text-sm bg-primary/5 border-gray-200 focus:border-primary w-16 px-2 py-1 border rounded-md text-sm ${getValueClass(asset.doeJunior, 'percentage')}`}
            style={{ textAlign: "right" }}
            onFocus={handleDefaultValueFocus}
            onBlur={createEnhancedBlurHandler((value) => handleInputBlur(asset.id, 'doeJunior', value), 'percentage')}
          />
        </td>
        <td className="p-2 text-right">
          <input
            type="text"
            defaultValue={formatPercentageValue(asset.doeFamilyTrust)}
            data-field={`doeFamilyTrust-${asset.id}`}
            className={`table-input h-7 text-sm bg-primary/5 border-gray-200 focus:border-primary w-16 px-2 py-1 border rounded-md text-sm ${getValueClass(asset.doeFamilyTrust, 'percentage')}`}
            style={{ textAlign: "right" }}
            onFocus={handleDefaultValueFocus}
            onBlur={createEnhancedBlurHandler((value) => handleInputBlur(asset.id, 'doeFamilyTrust', value), 'percentage')}
          />
        </td>

        {/* Asset distribution by */}
        <td className="p-2 text-right">
          <input
            type="text"
            defaultValue={formatCurrencyValue(asset.estate)}
            data-field={`estate-${asset.id}`}
            className={`table-input h-7 text-sm bg-primary/5 border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm ${getValueClass(asset.estate, 'currency')}`}
            style={{ textAlign: "right", minWidth: "100px" }}
            onFocus={handleDefaultValueFocus}
            onBlur={createEnhancedBlurHandler((value) => handleInputBlur(asset.id, 'estate', value), 'currency')}
          />
        </td>
        <td className="p-2 text-right">
          <input
            type="text"
            defaultValue={formatCurrencyValue(asset.others)}
            data-field={`others-${asset.id}`}
            className={`table-input h-7 text-sm bg-primary/5 border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm ${getValueClass(asset.others, 'currency')}`}
            style={{ textAlign: "right", minWidth: "100px" }}
            onFocus={handleDefaultValueFocus}
            onBlur={createEnhancedBlurHandler((value) => handleInputBlur(asset.id, 'others', value), 'currency')}
          />
        </td>
        <td className="p-2 text-right">
          <input
            type="text"
            defaultValue={formatCurrencyValue(asset.client)}
            data-field={`client-${asset.id}`}
            className={`table-input h-7 text-sm bg-primary/5 border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm ${getValueClass(asset.client, 'currency')}`}
            style={{ textAlign: "right", minWidth: "100px" }}
            onFocus={handleDefaultValueFocus}
            onBlur={createEnhancedBlurHandler((value) => handleInputBlur(asset.id, 'client', value), 'currency')}
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
          <tr className="border-b border-border">
            <th className="px-3 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider w-16" rowSpan={2}>
              <AddButton onClick={handleAddAsset} disabled={isUpdating} />
            </th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={2}>Overview</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={1}>Asset Details</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={4}>Ownership Split</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start section-end" colSpan={3}>Distribution</th>
          </tr>
          <tr className="border-b border-border">
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start border-b border-neutral-200">Include</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Description</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start border-b border-neutral-200">Market Value</th>
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
          {Object.entries(groupedAssets).map(([sectionKey, sectionAssets]) => (
            <SafeFragment key={sectionKey}>
              {sectionAssets.length > 0 && (
                <SafeFragment key={`${sectionKey}-header`}>
                  <tr className="bg-neutral-50">
                    <td colSpan={11} className="px-4 py-2 text-neutral-700 border-b border-neutral-200 text-[14px] font-semibold bg-[#edf4f9]">
                      {sectionNames[sectionKey as keyof typeof sectionNames]}
                    </td>
                  </tr>
                  {sectionAssets.map(renderAssetRow)}
                </SafeFragment>
              )}
            </SafeFragment>
          ))}
        </tbody>

        {/* Totals Footer */}
        <tfoot>
          <tr>
            <td className="totals-cell-label">Totals</td>
            <td className="totals-cell-label"></td>
            <td className="totals-cell-label"></td>
            <td className="totals-cell-value">{totals.totalMarketValue}</td>
            <td className="totals-cell-label"></td>
            <td className="totals-cell-label"></td>
            <td className="totals-cell-label"></td>
            <td className="totals-cell-label"></td>
            <td className="totals-cell-value">{totals.totalEstate}</td>
            <td className="totals-cell-value">{totals.totalOthers}</td>
            <td className="totals-cell-value">{totals.totalClient}</td>
          </tr>
        </tfoot>
      </table>

      {/* Category Selection Dialog */}
      <CategorySelectionDialog
        isOpen={showCategoryDialog}
        onClose={() => setShowCategoryDialog(false)}
        onSelectCategory={handleCategorySelect}
        title="Select Asset Category"
        categories={assetCategories}
      />
    </div>
  );
}