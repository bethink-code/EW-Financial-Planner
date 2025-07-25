import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AssetsAndLiabilities, InsertAssetsAndLiabilities } from '@shared/schema';
import { ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { getFieldClass, getFieldWidth, getCellClass } from '@/lib/field-types';
import { formatCurrencyValue, formatPercentageValue, isDefaultValue, getValueClass } from '@/lib/formatting';
import { handleDefaultValueFocus, createEnhancedBlurHandler } from '@/lib/formatting';

interface AssetsAndLiabilitiesTableProps {
  viewMode: 'table' | 'hybrid';
  searchTerm?: string;
}

export default function AssetsAndLiabilitiesTable({ viewMode, searchTerm }: AssetsAndLiabilitiesTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Query for assets
  const { data: assets = [], isLoading, error } = useQuery<AssetsAndLiabilities[]>({
    queryKey: ['/api/assets-and-liabilities'],
  });

  // Add asset mutation
  const addMutation = useMutation({
    mutationFn: async (): Promise<AssetsAndLiabilities> => {
      const newAsset: InsertAssetsAndLiabilities = {
        description: "Enter details ...",
        owner: "Donald Edwards",
        amount: "R 0",
        increasePercentage: "0%",
        additionalOwners: [],
      };
      
      const response = await fetch('/api/assets-and-liabilities', {
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
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<AssetsAndLiabilities> }) => {
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

  // Calculate totals
  const totals = useMemo(() => {
    return {
      count: assets.length,
      amount: assets.reduce((sum: number, asset: AssetsAndLiabilities) => {
        const value = parseFloat(asset.amount.replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
    };
  }, [assets]);

  const handleAddAsset = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  const handleUpdateAsset = useCallback((id: number, field: keyof AssetsAndLiabilities, value: string | string[]) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof AssetsAndLiabilities, value: string) => {
    let formattedValue: string;
    if (field === 'increasePercentage') {
      formattedValue = formatPercentageValue(value);
    } else if (field === 'amount') {
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
          <tr className="border-b border-border">
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start section-end" rowSpan={2}>Actions</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={2}>Overview</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start section-end" colSpan={2}>Financial Details</th>
          </tr>
          <tr className="border-b border-border">
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start border-b border-neutral-200">Description</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Owner</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start border-b border-neutral-200">Amount</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-end border-b border-neutral-200">Increase %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {assets.map((asset: AssetsAndLiabilities, assetIndex) => (
            <tr key={asset.id} className="hover:bg-neutral-50">
              <td className="table-actions-cell p-1 text-center section-start section-end">
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
              
              <td className="p-1 section-start">
                <input
                  type="text"
                  defaultValue={asset.description}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(asset.description, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(asset.id, 'description', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1">
                <input
                  type="text"
                  defaultValue={asset.owner}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(asset.owner, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(asset.id, 'owner', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1 section-start">
                <input
                  key={`amount-${asset.id}-${asset.amount}`}
                  type="text"
                  defaultValue={asset.amount}
                  className={`table-input ${getFieldClass('currency')} ${getValueClass(asset.amount, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(asset.id, 'amount', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1 section-end">
                <input
                  key={`increasePercentage-${asset.id}-${asset.increasePercentage}`}
                  type="text"
                  defaultValue={asset.increasePercentage}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(asset.increasePercentage, 'percentage')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(asset.id, 'increasePercentage', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
            </tr>
          ))}
          
        </tbody>
        
        {/* Totals Footer */}
        <tfoot className="bg-neutral-50 border-t border-neutral-300">
          <tr>
            <td className="p-1 text-right text-neutral-700" colSpan={3} style={{ fontSize: '0.875rem' }}>Totals</td>
            <td className="text-right" style={{ padding: '0.6rem 0.8rem' }}>
              <span style={{ fontFamily: 'inherit', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                R {totals.amount.toLocaleString()}
              </span>
            </td>
            <td className="p-1"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}