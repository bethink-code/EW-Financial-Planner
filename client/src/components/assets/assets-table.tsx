import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Assets } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { SafeFragment } from '@/lib/safe-fragment';
import { CategorySelector } from './category-selector';
import { formatCurrencyValue, formatPercentageValue, formatTextValue, isDefaultValue, getValueClass } from '@/lib/formatting';
import { getFieldClass, getCellClass } from '@/lib/field-types';
import { createEnhancedBlurHandler, handleDefaultValueFocus } from '@/lib/formatting';
import { AddButton, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';

interface AssetsTableProps {
  viewMode?: 'table' | 'hybrid';
}

export function AssetsTable({ viewMode = 'table' }: AssetsTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch assets
  const { data: assets = [], isLoading, error } = useQuery<Assets[]>({
    queryKey: ['/api/assets'],
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/assets', {
      category: 'PROPERTY',
      description: 'Enter details...',
      marketValue: 'R 0',
      johnDoe: '0%',
      janetteDoe: '0%',
      doeJunior: '0%',
      doeFamilyTrust: '0%',
      estate: 'R 0',
      others: 'R 0',
      client: 'R 0',
      section: 'PROPERTY',
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

  // Handle add asset
  const handleAddAsset = useCallback(() => {
    setIsUpdating(true);
    addMutation.mutate();
  }, [addMutation]);

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
        <td className={getCellClass('text')}>
          <CategorySelector
            value={asset.category}
            onChange={(value) => {
              handleInputBlur(asset.id, 'category', value);
              handleInputBlur(asset.id, 'section', value);
            }}
          />
        </td>
        <td className={getCellClass('text')}>
          <input
            type="text"
            defaultValue={formatTextValue(asset.description)}
            data-field={`description-${asset.id}`}
            className={`${getFieldClass('text')} ${getValueClass(asset.description, 'text')}`}
            onFocus={handleDefaultValueFocus}
            onBlur={(e) => handleInputBlur(asset.id, 'description', e.target.value)}
          />
        </td>

        {/* Asset Details */}
        <td className={getCellClass('currency')}>
          <input
            type="text"
            defaultValue={formatCurrencyValue(asset.marketValue)}
            data-field={`marketValue-${asset.id}`}
            className={`${getFieldClass('currency')} ${getValueClass(asset.marketValue, 'currency')}`}
            onFocus={handleDefaultValueFocus}
            onBlur={createEnhancedBlurHandler((value) => handleInputBlur(asset.id, 'marketValue', value), 'currency')}
          />
        </td>

        {/* Owner(s) - Individual ownership percentages */}
        <td className={getCellClass('percentage')}>
          <input
            type="text"
            defaultValue={formatPercentageValue(asset.johnDoe)}
            data-field={`johnDoe-${asset.id}`}
            className={`${getFieldClass('percentage')} ${getValueClass(asset.johnDoe, 'percentage')}`}
            onFocus={handleDefaultValueFocus}
            onBlur={createEnhancedBlurHandler((value) => handleInputBlur(asset.id, 'johnDoe', value), 'percentage')}
          />
        </td>
        <td className={getCellClass('percentage')}>
          <input
            type="text"
            defaultValue={formatPercentageValue(asset.janetteDoe)}
            data-field={`janetteDoe-${asset.id}`}
            className={`${getFieldClass('percentage')} ${getValueClass(asset.janetteDoe, 'percentage')}`}
            onFocus={handleDefaultValueFocus}
            onBlur={createEnhancedBlurHandler((value) => handleInputBlur(asset.id, 'janetteDoe', value), 'percentage')}
          />
        </td>
        <td className={getCellClass('percentage')}>
          <input
            type="text"
            defaultValue={formatPercentageValue(asset.doeJunior)}
            data-field={`doeJunior-${asset.id}`}
            className={`${getFieldClass('percentage')} ${getValueClass(asset.doeJunior, 'percentage')}`}
            onFocus={handleDefaultValueFocus}
            onBlur={createEnhancedBlurHandler((value) => handleInputBlur(asset.id, 'doeJunior', value), 'percentage')}
          />
        </td>
        <td className={getCellClass('percentage')}>
          <input
            type="text"
            defaultValue={formatPercentageValue(asset.doeFamilyTrust)}
            data-field={`doeFamilyTrust-${asset.id}`}
            className={`${getFieldClass('percentage')} ${getValueClass(asset.doeFamilyTrust, 'percentage')}`}
            onFocus={handleDefaultValueFocus}
            onBlur={createEnhancedBlurHandler((value) => handleInputBlur(asset.id, 'doeFamilyTrust', value), 'percentage')}
          />
        </td>

        {/* Asset distribution by */}
        <td className={getCellClass('currency')}>
          <input
            type="text"
            defaultValue={formatCurrencyValue(asset.estate)}
            data-field={`estate-${asset.id}`}
            className={`${getFieldClass('currency')} ${getValueClass(asset.estate, 'currency')}`}
            onFocus={handleDefaultValueFocus}
            onBlur={createEnhancedBlurHandler((value) => handleInputBlur(asset.id, 'estate', value), 'currency')}
          />
        </td>
        <td className={getCellClass('currency')}>
          <input
            type="text"
            defaultValue={formatCurrencyValue(asset.others)}
            data-field={`others-${asset.id}`}
            className={`${getFieldClass('currency')} ${getValueClass(asset.others, 'currency')}`}
            onFocus={handleDefaultValueFocus}
            onBlur={createEnhancedBlurHandler((value) => handleInputBlur(asset.id, 'others', value), 'currency')}
          />
        </td>
        <td className={getCellClass('currency')}>
          <input
            type="text"
            defaultValue={formatCurrencyValue(asset.client)}
            data-field={`client-${asset.id}`}
            className={`${getFieldClass('currency')} ${getValueClass(asset.client, 'currency')}`}
            onFocus={handleDefaultValueFocus}
            onBlur={createEnhancedBlurHandler((value) => handleInputBlur(asset.id, 'client', value), 'currency')}
          />
        </td>

        {/* Included checkbox */}
        <td className={getCellClass('checkbox')}>
          <input
            type="checkbox"
            checked={asset.included || false}
            onChange={(e) => handleInputBlur(asset.id, 'included', e.target.checked)}
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
          <tr className="border-b border-border">
            <th className="px-3 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider w-16" rowSpan={2}>
              <AddButton onClick={handleAddAsset} disabled={isUpdating} />
            </th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={2}>Overview</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={1}>Asset Details</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={4}>Ownership Split</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={3}>Distribution</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start section-end" rowSpan={2}>Include</th>
          </tr>
          <tr className="border-b border-border">
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start border-b border-neutral-200">Category</th>
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
                    <td colSpan={12} className="px-4 py-2 text-neutral-700 border-b border-neutral-200 text-[14px] font-semibold bg-[#edf4f9]">
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
            <td className="totals-cell-label"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}