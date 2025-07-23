import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Search } from "lucide-react";
import type { AssetAndLiability, InsertAssetAndLiability } from "@shared/schema";

// Utility function for formatting currency values
const formatCurrencyValue = (value: string, fieldType: string): string => {
  if (!value || value.trim() === '') return value;
  
  // Remove existing formatting
  const cleanValue = value.replace(/[^\d.-]/g, '');
  if (!cleanValue || isNaN(parseFloat(cleanValue))) return value;
  
  const numValue = parseFloat(cleanValue);
  
  if (fieldType === 'percentage' || fieldType.includes('percentage')) {
    return `${numValue}%`;
  }
  
  // Currency formatting
  if (numValue === 0) return 'R 0';
  
  // Format with thousands separators
  const formatted = new Intl.NumberFormat('en-ZA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(numValue));
  
  return `R ${formatted}`;
};

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
  const [searchTerm, setSearchTerm] = useState("");
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
        donaldEdwardsPercentage: "0",
        bettyEdwardsPercentage: "0",
        liquidationPercentage: "0",
        spouse: "0",
        others: "0",
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

  // Filter assets based on search term
  const filteredAssets = useMemo(() => {
    if (!searchTerm.trim()) return assets;
    
    const lowerQuery = searchTerm.toLowerCase();
    return assets.filter(asset => 
      asset.categoryAndDescription.toLowerCase().includes(lowerQuery) ||
      asset.category.toLowerCase().includes(lowerQuery)
    );
  }, [assets, searchTerm]);

  // Calculate category and overall totals
  const totals = useMemo(() => {
    const categoryTotals: Record<string, {
      marketValue: number;
      donaldEdwards: number;
      bettyEdwards: number;
    }> = {};

    const assetsByCategory = filteredAssets.filter(asset => !asset.isHeader);
    
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
  }, [filteredAssets]);

  const handleAddAsset = useCallback((category: string) => {
    addMutation.mutate(category);
  }, [addMutation]);

  const handleUpdateAsset = useCallback((id: number, field: keyof AssetAndLiability, value: string | boolean) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof AssetAndLiability, value: string) => {
    const formattedValue = formatCurrencyValue(value, field);
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

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading assets and liabilities...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading assets and liabilities. Please try again.</div>;
  }

  // Group assets by category for display
  const assetsByCategory = CATEGORIES.map(category => ({
    category,
    header: filteredAssets.find(asset => asset.category === category && asset.isHeader),
    assets: filteredAssets.filter(asset => asset.category === category && !asset.isHeader),
    totals: totals.categoryTotals[category]
  }));

  return (
    <div className="space-y-4">
      {/* Search Controls */}
      <div className="flex justify-start items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search assets and liabilities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Summary Section */}
      {filteredAssets.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-primary/10 px-4 py-3 border-b border-neutral-200">
            <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">Overall Totals</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-neutral-50 p-3 rounded-lg">
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Total Market Value</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {formatCurrencyValue(totals.overallTotals.marketValue.toString(), 'marketValue')}
                </p>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg">
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Total for Donald Edwards</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {formatCurrencyValue(totals.overallTotals.donaldEdwards.toString(), 'donaldEdwards')}
                </p>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg">
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Total for Betty Edwards</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {formatCurrencyValue(totals.overallTotals.bettyEdwards.toString(), 'bettyEdwards')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-neutral-200 rounded-lg shadow-sm">
          <thead>
            <tr className="bg-primary/10 border-b border-neutral-200">
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider" colSpan={5}>Overview</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider" colSpan={2}>Owner(s)</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider" colSpan={3}>Bequeath To</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider" colSpan={3}>Exclusions</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Actions</th>
            </tr>
            <tr className="bg-primary/10 border-b border-neutral-200">
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
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {assetsByCategory.map(({ category, assets, totals: categoryTotals }) => (
              <React.Fragment key={category}>
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
                  <tr key={asset.id} className="hover:bg-neutral-50">
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
                        className="table-input w-full px-2 py-1 text-sm border border-neutral-300 rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={asset.currency}
                        onChange={(e) => handleUpdateAsset(asset.id, 'currency', e.target.value)}
                        className="table-input w-full px-2 py-1 text-sm border border-neutral-300 rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                        type="text"
                        defaultValue={asset.baseCost}
                        onBlur={(e) => handleInputBlur(asset.id, 'baseCost', e.target.value)}
                        className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        defaultValue={asset.marketValue}
                        onBlur={(e) => handleInputBlur(asset.id, 'marketValue', e.target.value)}
                        className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        defaultValue={asset.donaldEdwardsPercentage}
                        onBlur={(e) => handleInputBlur(asset.id, 'donaldEdwardsPercentage', e.target.value)}
                        className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        defaultValue={asset.bettyEdwardsPercentage}
                        onBlur={(e) => handleInputBlur(asset.id, 'bettyEdwardsPercentage', e.target.value)}
                        className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        defaultValue={asset.liquidationPercentage}
                        onBlur={(e) => handleInputBlur(asset.id, 'liquidationPercentage', e.target.value)}
                        className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        defaultValue={asset.spouse}
                        onBlur={(e) => handleInputBlur(asset.id, 'spouse', e.target.value)}
                        className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        defaultValue={asset.others}
                        onBlur={(e) => handleInputBlur(asset.id, 'others', e.target.value)}
                        className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="text-[#4F4F4F] hover:text-red-600 transition-colors"
                        title="Delete asset"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Category Total Row */}
                {categoryTotals && (
                  <tr className="bg-neutral-100 border-t border-neutral-300">
                    <td colSpan={4} className="px-3 py-2 text-sm font-bold text-neutral-800">
                      {category} Total
                    </td>
                    <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                      {formatCurrencyValue(categoryTotals.marketValue.toString(), 'marketValue')}
                    </td>
                    <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                      {formatCurrencyValue(categoryTotals.donaldEdwards.toString(), 'donaldEdwards')}
                    </td>
                    <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                      {formatCurrencyValue(categoryTotals.bettyEdwards.toString(), 'bettyEdwards')}
                    </td>
                    <td colSpan={7} className="px-3 py-2"></td>
                  </tr>
                )}
              </React.Fragment>
            ))}

            {/* Overall Total Row */}
            {filteredAssets.length > 0 && (
              <tr className="bg-neutral-200 border-t-2 border-neutral-400">
                <td colSpan={4} className="px-3 py-2 text-sm font-bold text-neutral-900">
                  OVERALL TOTAL
                </td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-900 text-right">
                  {formatCurrencyValue(totals.overallTotals.marketValue.toString(), 'marketValue')}
                </td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-900 text-right">
                  {formatCurrencyValue(totals.overallTotals.donaldEdwards.toString(), 'donaldEdwards')}
                </td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-900 text-right">
                  {formatCurrencyValue(totals.overallTotals.bettyEdwards.toString(), 'bettyEdwards')}
                </td>
                <td colSpan={7} className="px-3 py-2"></td>
              </tr>
            )}
            
            {filteredAssets.length === 0 && (
              <tr>
                <td colSpan={14} className="px-3 py-8 text-center text-neutral-500">
                  {searchTerm ? "No assets found matching your search." : "No assets found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}