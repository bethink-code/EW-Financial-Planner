import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { getFieldClass, getFieldWidth } from "@/lib/design-tokens";
import { formatCurrencyValue, formatPercentageValue, getValueClass, isDefaultValue, handleDefaultValueFocus } from "@/lib/formatting";
import { SafeFragment } from "@/lib/react-utils";
import { DeleteButton, DuplicateButton, ActionButtonGroup } from "@/components/ui/action-buttons";
import type { AssetAndLiability, InsertAssetAndLiability } from "@shared/schema";

const CURRENCY_OPTIONS = [
  { value: "ZAR", label: "ZAR" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
];

const CATEGORIES = [
  "Immovable assets (primary residence)",
  "Immovable assets (other)",
  "Business interests",
  "Movable property",
  "Personal effects (personal use assets)",
  "Other assets"
];

export default function AssetsAndLiabilitiesTable() {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  // Fetch assets and liabilities
  const { data: assets = [], isLoading, error } = useQuery<AssetAndLiability[]>({
    queryKey: ['/api/assets-and-liabilities'],
    queryFn: async () => {
      const response = await fetch('/api/assets-and-liabilities');
      if (!response.ok) {
        throw new Error('Failed to fetch assets and liabilities');
      }
      return response.json();
    }
  });

  // Add new asset mutation
  const addMutation = useMutation({
    mutationFn: async (category: string): Promise<AssetAndLiability> => {
      const maxSortOrder = Math.max(
        ...assets
          .filter(a => a.category === category && !a.isHeader)
          .map(a => a.sortOrder || 0),
        0
      );

      const newAsset: InsertAssetAndLiability = {
        include: true,
        categoryAndDescription: "",
        currency: "ZAR",
        baseCost: "0",
        marketValue: "0",
        donaldEdwardsPercentage: "0%",
        bettyEdwardsPercentage: "0%",
        liquidationPercentage: "0%",
        spouse: "0%",
        others: "0%",
        excludedFromJointEstate: false,
        excludedFromEstateDuty: false,
        excludedFromCGT: false,
        category: category,
        isHeader: false,
        sortOrder: maxSortOrder + 1,
      };
      
      const response = await fetch('/api/assets-and-liabilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAsset),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create asset');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets-and-liabilities'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to add asset:', error);
      setIsUpdating(false);
    }
  });

  // Update asset mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<AssetAndLiability> }) => {
      const response = await fetch(`/api/assets-and-liabilities/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update asset');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets-and-liabilities'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to update asset:', error);
      setIsUpdating(false);
    }
  });

  // Delete asset mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/assets-and-liabilities/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete asset');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets-and-liabilities'] });
    }
  });

  // No filtering needed - show all assets
  const filteredAssets = assets;

  // Calculate category and overall totals
  const totals = useMemo(() => {
    const categoryTotals: Record<string, {
      marketValue: number;
      donaldEdwards: number;
      bettyEdwards: number;
    }> = {};

    const assetsByCategory = assets.filter(asset => !asset.isHeader);
    
    // Calculate category totals
    CATEGORIES.forEach(category => {
      const categoryAssets = assetsByCategory.filter(asset => asset.category === category && asset.include);
      
      categoryTotals[category] = {
        marketValue: categoryAssets.reduce((sum, asset) => {
          const value = parseFloat(asset.marketValue.replace(/[^\d.-]/g, '')) || 0;
          return sum + value;
        }, 0),
        donaldEdwards: categoryAssets.reduce((sum, asset) => {
          const marketValue = parseFloat(asset.marketValue.replace(/[^\d.-]/g, '')) || 0;
          const percentage = parseFloat(asset.donaldEdwardsPercentage.replace(/[^\d.-]/g, '')) || 0;
          return sum + (marketValue * percentage / 100);
        }, 0),
        bettyEdwards: categoryAssets.reduce((sum, asset) => {
          const marketValue = parseFloat(asset.marketValue.replace(/[^\d.-]/g, '')) || 0;
          const percentage = parseFloat(asset.bettyEdwardsPercentage.replace(/[^\d.-]/g, '')) || 0;
          return sum + (marketValue * percentage / 100);
        }, 0),
      };
    });

    // Calculate overall totals
    const overallTotals = {
      marketValue: Object.values(categoryTotals).reduce((sum, cat) => sum + cat.marketValue, 0),
      donaldEdwards: Object.values(categoryTotals).reduce((sum, cat) => sum + cat.donaldEdwards, 0),
      bettyEdwards: Object.values(categoryTotals).reduce((sum, cat) => sum + cat.bettyEdwards, 0),
    };

    return { categoryTotals, overallTotals };
  }, [assets]);

  const handleAddAsset = useCallback((category: string) => {
    addMutation.mutate(category);
  }, [addMutation]);

  const handleUpdateAsset = useCallback((id: number, field: keyof AssetAndLiability, value: string | boolean) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof AssetAndLiability, value: string) => {
    // Determine field type and format accordingly
    let formattedValue: string;
    if (field === 'donaldEdwardsPercentage' || field === 'bettyEdwardsPercentage' || field === 'liquidationPercentage' || field === 'spouse' || field === 'others') {
      formattedValue = formatPercentageValue(value);
    } else {
      formattedValue = formatCurrencyValue(value);
    }
    handleUpdateAsset(id, field, formattedValue);
    
    // Update DOM element directly for immediate visual feedback
    const target = document.activeElement as HTMLInputElement;
    if (target && formattedValue !== value) {
      setTimeout(() => {
        target.value = formattedValue;
      }, 0);
    }
  }, [handleUpdateAsset]);

  const handleDeleteAsset = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const handleDuplicateAsset = useCallback((asset: AssetAndLiability) => {
    const duplicatedAsset: InsertAssetAndLiability = {
      include: asset.include,
      categoryAndDescription: asset.categoryAndDescription,
      currency: asset.currency,
      baseCost: asset.baseCost,
      marketValue: asset.marketValue,
      donaldEdwardsPercentage: asset.donaldEdwardsPercentage,
      bettyEdwardsPercentage: asset.bettyEdwardsPercentage,
      liquidationPercentage: asset.liquidationPercentage,
      spouse: asset.spouse,
      others: asset.others,
      excludedFromJointEstate: asset.excludedFromJointEstate,
      excludedFromEstateDuty: asset.excludedFromEstateDuty,
      excludedFromCGT: asset.excludedFromCGT,
      category: asset.category,
      isHeader: false,
      sortOrder: asset.sortOrder,
    };
    
    fetch('/api/assets-and-liabilities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(duplicatedAsset),
    }).then(res => {
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/assets-and-liabilities'] });
      }
    });
  }, [queryClient]);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading assets and liabilities...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading assets and liabilities. Please try again.</div>;
  }

  // Group assets by category for display
  const assetsByCategory = CATEGORIES.map(category => ({
    category,
    header: assets.find(asset => asset.category === category && asset.isHeader),
    assets: assets.filter(asset => asset.category === category && !asset.isHeader),
    totals: totals.categoryTotals[category]
  }));

  return (
    <div className="">
      {/* Table */}
      <table className="bg-white rounded-lg shadow-sm border border-neutral-200" className="min-w-full border border-neutral-200 bg-white rounded-lg shadow-sm">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider w-16">Actions</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider" colSpan={5}>Overview</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider" colSpan={2}>Owner(s)</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider" colSpan={3}>Bequeath To</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider" colSpan={3}>Exclusions</th>
            </tr>
            <tr className="border-b border-neutral-200">
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider"></th>
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Include?</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Category and Description</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Currency</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Base Cost</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Market Value</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Donald Edwards (%)</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Betty Edwards (%)</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Liquidation %</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Spouse</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Others</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Joint Estate</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Estate Duty</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">CGT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {assetsByCategory.map(({ category, assets, totals: categoryTotals }) => (
              <SafeFragment key={category}>
                {/* Category Header Row */}
                <tr className="bg-[#F0F9FF] border-t-2 border-[#0891B2]">
                  <td colSpan={14} className="px-3 py-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-[#0891B2] uppercase tracking-wide">
                        {category}
                      </h4>
                      <button
                        onClick={() => handleAddAsset(category)}
                        disabled={addMutation.isPending}
                        className="bg-primary text-white px-3 py-1 rounded-lg hover:bg-[#014d6b] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-xs font-medium"
                      >
                        <Plus className="h-3 w-3" />
                        Add Asset
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Category Assets */}
                {assets.map((asset: AssetAndLiability) => (
                  <tr key={asset.id} className="">
                    <td className="table-actions-cell text-center">
                      <ActionButtonGroup>
                        <DuplicateButton
                          onClick={() => handleDuplicateAsset(asset)}
                          disabled={isUpdating}
                        />
                        <DeleteButton
                          onClick={() => handleDeleteAsset(asset.id)}
                        />
                      </ActionButtonGroup>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={asset.include}
                        onChange={(e) => handleUpdateAsset(asset.id, 'include', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-primary border-gray-300 rounded"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        defaultValue={asset.categoryAndDescription}
                        onBlur={(e) => handleUpdateAsset(asset.id, 'categoryAndDescription', e.target.value)}
                        className={`${getFieldClass('description')} ${getValueClass(asset.categoryAndDescription, 'text')}`}
                        
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={asset.currency}
                        onChange={(e) => handleUpdateAsset(asset.id, 'currency', e.target.value)}
                        className={getFieldClass('name')}
                        
                        disabled={isUpdating}
                      >
                        {CURRENCY_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        key={`baseCost-${asset.id}-${asset.baseCost}`}
                        type="text"
                        defaultValue={formatCurrencyValue(asset.baseCost)}
                        onBlur={(e) => handleInputBlur(asset.id, 'baseCost', e.target.value)}
                        className={`${getFieldClass('amount')} ${getValueClass(formatCurrencyValue(asset.baseCost), 'currency')}`}
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        key={`marketValue-${asset.id}-${asset.marketValue}`}
                        type="text"
                        defaultValue={formatCurrencyValue(asset.marketValue)}
                        onBlur={(e) => handleInputBlur(asset.id, 'marketValue', e.target.value)}
                        className={`${getFieldClass('amount')} ${getValueClass(formatCurrencyValue(asset.marketValue), 'currency')}`}
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        defaultValue={asset.donaldEdwardsPercentage || "0%"}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => {
                          const formattedValue = formatPercentageValue(e.target.value);
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(asset.id, 'donaldEdwardsPercentage', e.target.value);
                        }}
                        className={`${getFieldClass('percentage')} ${getValueClass(asset.donaldEdwardsPercentage || "0%", 'percentage')}`}
                        
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        defaultValue={asset.bettyEdwardsPercentage || "0%"}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => {
                          const formattedValue = formatPercentageValue(e.target.value);
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(asset.id, 'bettyEdwardsPercentage', e.target.value);
                        }}
                        className={`${getFieldClass('percentage')} ${getValueClass(asset.bettyEdwardsPercentage || "0%", 'percentage')}`}
                        
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        defaultValue={asset.liquidationPercentage || "0%"}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => {
                          const formattedValue = formatPercentageValue(e.target.value);
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(asset.id, 'liquidationPercentage', e.target.value);
                        }}
                        className={`${getFieldClass('percentage')} ${getValueClass(asset.liquidationPercentage || "0%", 'percentage')}`}
                        
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        defaultValue={asset.spouse || "0%"}
                        onBlur={(e) => handleInputBlur(asset.id, 'spouse', e.target.value)}
                        className={`${getFieldClass('percentage')} ${getValueClass(asset.spouse || "0%", 'percentage')}`}
                        
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        defaultValue={asset.others || "0%"}
                        onBlur={(e) => handleInputBlur(asset.id, 'others', e.target.value)}
                        className={`${getFieldClass('percentage')} ${getValueClass(asset.others || "0%", 'percentage')}`}
                        
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={asset.excludedFromJointEstate}
                        onChange={(e) => handleUpdateAsset(asset.id, 'excludedFromJointEstate', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-primary border-gray-300 rounded"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={asset.excludedFromEstateDuty}
                        onChange={(e) => handleUpdateAsset(asset.id, 'excludedFromEstateDuty', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-primary border-gray-300 rounded"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={asset.excludedFromCGT}
                        onChange={(e) => handleUpdateAsset(asset.id, 'excludedFromCGT', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-primary border-gray-300 rounded"
                        disabled={isUpdating}
                      />
                    </td>
                  </tr>
                ))}

                {/* Category Total Row */}
                {categoryTotals && (
                  <tr className="border-t border-neutral-300">
                    <td colSpan={4} className="px-3 py-2 text-sm font-bold text-neutral-800">
                      {category} Total
                    </td>
                    <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                      {formatCurrencyValue(categoryTotals.marketValue.toString())}
                    </td>
                    <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                      {formatCurrencyValue(categoryTotals.donaldEdwards.toString())}
                    </td>
                    <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                      {formatCurrencyValue(categoryTotals.bettyEdwards.toString())}
                    </td>
                    <td colSpan={7} className="px-3 py-2"></td>
                  </tr>
                )}
              </SafeFragment>
            ))}

            {/* Overall Total Row */}
            {assets.length > 0 && (
              <tr className="bg-neutral-200 border-t-2 border-neutral-400">
                <td colSpan={4} className="px-3 py-2 text-sm font-bold text-neutral-900">
                  OVERALL TOTAL
                </td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-900 text-right">
                  {formatCurrencyValue(totals.overallTotals.marketValue.toString())}
                </td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-900 text-right">
                  {formatCurrencyValue(totals.overallTotals.donaldEdwards.toString())}
                </td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-900 text-right">
                  {formatCurrencyValue(totals.overallTotals.bettyEdwards.toString())}
                </td>
                <td colSpan={7} className="px-3 py-2"></td>
              </tr>
            )}
            
            {assets.length === 0 && (
              <tr>
                <td colSpan={14} className="px-3 py-8 text-center text-neutral-500">
                  No assets found. Add new assets using the header button.
                </td>
              </tr>
            )}
          </tbody>
      </table>
    </div>
  );
}