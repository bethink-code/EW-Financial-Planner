import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Assets, InsertAssets } from '@shared/assets-schema';
import { AddButton, ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { getFieldClass, getFieldWidth, getCellClass } from '@/lib/field-types';
import { formatCurrencyValue, formatPercentageValue, isDefaultValue, getValueClass, formatTextValue, handleDefaultValueFocus } from '@/lib/formatting';

interface AssetsTableProps {
  viewMode: 'table' | 'hybrid';
  searchTerm?: string;
}

function AssetsTable({ viewMode, searchTerm }: AssetsTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Query for assets
  const { data: assets = [], isLoading, error } = useQuery<Assets[]>({
    queryKey: ['/api/assets'],
  });

  // Add asset mutation
  const addMutation = useMutation({
    mutationFn: async (): Promise<Assets> => {
      const newAsset: InsertAssets = {
        description: "",
        marketValue: "R 0",
        johnDoe: "0%",
        janetteDoe: "0%",
        doeJunior: "0%",
        doeFamilyTrust: "0%",
        estate: "R 0",
        others: "R 0",
        client: "R 0",
        section: "PROPERTY",
        included: true,
      };
      
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAsset),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add asset');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to add asset:', error);
      setIsUpdating(false);
    }
  });

  // Update asset mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Assets> }) => {
      const response = await fetch(`/api/assets/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
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
      const response = await fetch(`/api/assets/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete asset');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
    }
  });

  // Calculate totals
  const totals = useMemo(() => {
    if (!assets || assets.length === 0) {
      return { count: 0, amount: 0, estate: 0, others: 0, client: 0 };
    }
    return {
      count: assets.length,
      amount: assets.reduce((sum: number, asset: Assets) => {
        const value = parseFloat((asset.marketValue || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      estate: assets.reduce((sum: number, asset: Assets) => {
        const value = parseFloat((asset.estate || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      others: assets.reduce((sum: number, asset: Assets) => {
        const value = parseFloat((asset.others || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      client: assets.reduce((sum: number, asset: Assets) => {
        const value = parseFloat((asset.client || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
    };
  }, [assets]);

  const handleAddAsset = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  const handleUpdateAsset = useCallback((id: number, field: keyof Assets, value: string | string[]) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof Assets, value: string) => {
    let formattedValue: string;
    if (field === 'johnDoe' || field === 'janetteDoe' || field === 'doeJunior' || field === 'doeFamilyTrust') {
      formattedValue = formatPercentageValue(value);
    } else if (field === 'marketValue' || field === 'estate' || field === 'others' || field === 'client') {
      formattedValue = formatCurrencyValue(value);
    } else {
      formattedValue = value;
    }
    handleUpdateAsset(id, field, formattedValue);
    
    // Update DOM element for immediate visual feedback
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

  return (
    <div className="space-y-6">
      <table>
        <thead>
          <tr>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center" rowSpan={2}>
              <AddButton onClick={() => addMutation.mutate()} disabled={isUpdating} />
            </th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center" colSpan={1}>Overview</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center" colSpan={1}>Asset Details</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center" colSpan={4}>Ownership Split</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center" colSpan={3}>Distribution</th>
          </tr>
          <tr>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Description</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Market Value</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">John Doe</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Janette Doe (Spouse)</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Doe Junior</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Doe family trust</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Estate</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Others</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Client</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {(() => {
            // Group assets by section/category
            const groupedAssets = assets.reduce((groups, asset) => {
              const section = asset.section || asset.category || 'Other';
              if (!groups[section]) {
                groups[section] = [];
              }
              groups[section].push(asset);
              return groups;
            }, {} as Record<string, Assets[]>);

            return Object.entries(groupedAssets).map(([sectionName, sectionAssets]) => [
              // Section Header
              <tr key={`section-${sectionName}`} className="bg-blue-50">
                <td colSpan={11} className="px-4 py-2 text-sm font-medium text-neutral-700 uppercase tracking-wider">
                  {sectionName.replace('_', ' ')}
                </td>
              </tr>,
              // Section Assets
              ...sectionAssets.map((asset: Assets, assetIndex) => (
                <tr key={asset.id} className="hover:bg-neutral-50">
              <td className="table-actions-cell p-2 text-center">
                <ActionButtonGroup>
                  <DuplicateButton
                    onClick={() => addMutation.mutate()}
                    disabled={isUpdating}
                  />
                  <DeleteButton
                    onClick={() => handleDeleteAsset(asset.id)}
                    disabled={isUpdating}
                  />
                </ActionButtonGroup>
              </td>
              
              <td className="p-2 text-left">
                <input
                  type="text"
                  defaultValue={formatTextValue(asset.description)}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(asset.description, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(asset.id, 'description', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-right">
                <input
                  key={`marketValue-${asset.id}-${asset.marketValue}`}
                  type="text"
                  defaultValue={asset.marketValue}
                  className={`table-input ${getFieldClass('currency')} ${getValueClass(asset.marketValue, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(asset.id, 'marketValue', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-right">
                <input
                  key={`johnDoe-${asset.id}-${asset.johnDoe}`}
                  type="text"
                  defaultValue={asset.johnDoe}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(asset.johnDoe, 'percentage')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(asset.id, 'johnDoe', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-right">
                <input
                  key={`janetteDoe-${asset.id}-${asset.janetteDoe}`}
                  type="text"
                  defaultValue={asset.janetteDoe}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(asset.janetteDoe, 'percentage')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(asset.id, 'janetteDoe', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-right">
                <input
                  key={`doeJunior-${asset.id}-${asset.doeJunior}`}
                  type="text"
                  defaultValue={asset.doeJunior}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(asset.doeJunior, 'percentage')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(asset.id, 'doeJunior', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-right">
                <input
                  key={`doeFamilyTrust-${asset.id}-${asset.doeFamilyTrust}`}
                  type="text"
                  defaultValue={asset.doeFamilyTrust}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(asset.doeFamilyTrust, 'percentage')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(asset.id, 'doeFamilyTrust', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-right">
                <input
                  key={`estate-${asset.id}-${asset.estate}`}
                  type="text"
                  defaultValue={asset.estate}
                  className={`table-input ${getFieldClass('currency')} ${getValueClass(asset.estate, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(asset.id, 'estate', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-right">
                <input
                  key={`others-${asset.id}-${asset.others}`}
                  type="text"
                  defaultValue={asset.others}
                  className={`table-input ${getFieldClass('currency')} ${getValueClass(asset.others, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(asset.id, 'others', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-right">
                <input
                  key={`client-${asset.id}-${asset.client}`}
                  type="text"
                  defaultValue={asset.client}
                  className={`table-input ${getFieldClass('currency')} ${getValueClass(asset.client, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(asset.id, 'client', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
            </tr>
              ))
            ]).flat();
          })()}
        </tbody>
        
        <tfoot>
          <tr className="bg-neutral-50 border-t border-neutral-300">
            <td className="totals-cell-label text-right" colSpan={1}>Totals</td>
            <td className="totals-cell-value section-start text-right">R {totals.amount.toLocaleString()}</td>
            <td className="totals-cell-label"></td>
            <td className="totals-cell-label"></td>
            <td className="totals-cell-label"></td>
            <td className="totals-cell-label"></td>
            <td className="totals-cell-value section-start text-right">R {totals.estate.toLocaleString()}</td>
            <td className="totals-cell-value text-right">R {totals.others.toLocaleString()}</td>
            <td className="totals-cell-value text-right">R {totals.client.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default AssetsTable;