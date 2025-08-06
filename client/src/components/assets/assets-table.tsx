import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Assets, InsertAssets } from '@shared/assets-schema';
import { AddButton, ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { TableHeaderAddButton } from '@/components/ui/table-header-add-button';
import { getFieldClass, getFieldWidth, getCellClass } from '@/lib/field-types';
import { formatCurrencyValue, formatPercentageValue, isDefaultValue, getValueClass, formatTextValue, handleDefaultValueFocus } from '@/lib/formatting';
import { useDebouncedUpdate } from '@/hooks/use-debounced-update';

interface AssetsTableProps {
  viewMode: 'table' | 'hybrid';
  searchTerm?: string;
  onShowCategoryDialog?: () => void;
  onAddAsset?: () => void;
}

function AssetsTable({ viewMode, searchTerm, onShowCategoryDialog, onAddAsset }: AssetsTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Query for assets
  const { data: assets = [], isLoading, error } = useQuery<Assets[]>({
    queryKey: ['/api/assets'],
  });

  // Add asset mutation
  const addMutation = useMutation({
    mutationFn: async (): Promise<Assets> => {
      const newAsset: InsertAssets = {
        description:"",
        marketValue:"R 0",
        johnDoe:"0%",
        janetteDoe:"0%",
        doeJunior:"0%",
        doeFamilyTrust:"0%",
        estate:"R 0",
        others:"R 0",
        client:"R 0",
        section:"PROPERTY",
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

  // Use debounced update for text fields
  const debouncedUpdate = useDebouncedUpdate(handleUpdateAsset);

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
    return <div className="flex justify-center">Loading assets and liabilities...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error loading assets and liabilities. Please try again.</div>;
  }

  // Render hybrid view or table view based on viewMode
  return viewMode === 'table' ? (
    <div className="space-y-6">
      <table>
        <thead>
          <tr className="double-row-header-first">
            <th className="section-start table-actions-cell" rowSpan={2}>
              {onAddAsset && (
                <TableHeaderAddButton
                  onClick={onAddAsset}
                  title="Add new asset"
                />
              )}
            </th>
            <th className="section-start" colSpan={1}>Overview</th>
            <th className="section-start" colSpan={1}>Asset Details</th>
            <th className="section-start" colSpan={4}>Ownership Split</th>
            <th className="section-start" colSpan={3}>Distribution</th>
          </tr>
          <tr className="double-row-header-second">
            <th className="section-start">Description</th>
            <th className="section-start">Market Value</th>
            <th className="section-start">John Doe</th>
            <th>Janette Doe (Spouse)</th>
            <th>Doe Junior</th>
            <th>Doe family trust</th>
            <th className="section-start">Estate</th>
            <th>Others</th>
            <th>Client</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {(() => {
            // Group assets by section/category
            const groupedAssets = assets.reduce((groups, asset) => {
              const section = asset.section || 'Other';
              if (!groups[section]) {
                groups[section] = [];
              }
              groups[section].push(asset);
              return groups;
            }, {} as Record<string, Assets[]>);

            return Object.entries(groupedAssets).map(([sectionName, sectionAssets]) => [
              // Section Header
              <tr key={`section-${sectionName}`} className="bg-blue-50">
                <td colSpan={11} className="px-4 text-sm font-medium text-neutral-700 uppercase tracking-wider">
                  {sectionName.replace('_', ' ')}
                </td>
              </tr>,
              // Section Assets
              ...sectionAssets.map((asset: Assets, assetIndex) => (
                <tr key={asset.id} className="hover:bg-neutral-50">
              <td className="table-actions-cell p-1 text-center section-start">
                <ActionButtonGroup>
                  <DuplicateButton
                    onClick={onShowCategoryDialog || (() => addMutation.mutate())}
                    disabled={isUpdating}
                  />
                  <DeleteButton
                    onClick={() => handleDeleteAsset(asset.id)}
                    disabled={isUpdating}
                  />
                </ActionButtonGroup>
              </td>
              
              <td className="p-1 text-left section-start">
                <input
                  type="text"
                  defaultValue={formatTextValue(asset.description)}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(asset.description, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onChange={(e) => debouncedUpdate(asset.id, 'description', e.target.value)}
                  onBlur={(e) => handleInputBlur(asset.id, 'description', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1 text-right section-start">
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
              
              <td className="p-1 text-right section-start">
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
              
              <td className="p-1 text-right">
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
              
              <td className="p-1 text-right">
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
              
              <td className="p-1 text-right">
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
              
              <td className="p-1 text-right section-start">
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
              
              <td className="p-1 text-right">
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
              
              <td className="p-1 text-right">
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
            <td className="totals-cell-label section-start"></td>
            <td className="totals-cell-label text-right section-start">Totals</td>
            <td className="totals-cell-value section-start text-right">R {totals.amount.toLocaleString()}</td>
            <td className="totals-cell-label section-start"></td>
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
  ) : (
    // Hybrid View - Form-like interface
    <div className="space-y-6">
      {(() => {
        // Group assets by section/category for hybrid view
        const groupedAssets = assets.reduce((groups, asset) => {
          const section = asset.section || 'Other';
          if (!groups[section]) {
            groups[section] = [];
          }
          groups[section].push(asset);
          return groups;
        }, {} as Record<string, Assets[]>);

        return Object.entries(groupedAssets).map(([sectionName, sectionAssets]) => (
          <div key={`hybrid-section-${sectionName}`} className="bg-white rounded-lg shadow-sm border border-neutral-200">
            {/* Section Header */}
            <div className="bg-blue-50 px-4 py-3 border-b border-neutral-200">
              <h3 className="text-sm font-medium text-neutral-700 uppercase tracking-wider">
                {sectionName.replace('_', ' ')}
              </h3>
            </div>
            
            {/* Assets in this section */}
            <div className="p-4 space-y-4">
              {sectionAssets.map((asset: Assets) => (
                <div key={`hybrid-${asset.id}`} className="bg-gray-50 rounded-lg p-4 space-y-4">
                  {/* Asset Header with Actions */}
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-neutral-800">Asset #{asset.id}</h4>
                    <ActionButtonGroup>
                      <DuplicateButton
                        onClick={onShowCategoryDialog || (() => addMutation.mutate())}
                        disabled={isUpdating}
                      />
                      <DeleteButton
                        onClick={() => handleDeleteAsset(asset.id)}
                        disabled={isUpdating}
                      />
                    </ActionButtonGroup>
                  </div>
                  
                  {/* Asset Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        defaultValue={formatTextValue(asset.description)}
                        className={`w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getValueClass(asset.description, 'text')}`}
                        onFocus={handleDefaultValueFocus}
                        onChange={(e) => debouncedUpdate(asset.id, 'description', e.target.value)}
                        onBlur={(e) => handleInputBlur(asset.id, 'description', e.target.value)}
                        disabled={isUpdating}
                      />
                    </div>
                    
                    {/* Market Value */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Market Value
                      </label>
                      <input
                        key={`hybrid-marketValue-${asset.id}-${asset.marketValue}`}
                        type="text"
                        defaultValue={asset.marketValue}
                        className={`w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getValueClass(asset.marketValue, 'currency')}`}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => handleInputBlur(asset.id, 'marketValue', e.target.value)}
                        disabled={isUpdating}
                      />
                    </div>
                  </div>
                  
                  {/* Ownership Split Section */}
                  <div>
                    <h5 className="text-sm font-medium text-neutral-700 mb-3">Ownership Split</h5>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-600 mb-1">
                          John Doe
                        </label>
                        <input
                          key={`hybrid-johnDoe-${asset.id}-${asset.johnDoe}`}
                          type="text"
                          defaultValue={asset.johnDoe}
                          className={`w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getValueClass(asset.johnDoe, 'percentage')}`}
                          onFocus={handleDefaultValueFocus}
                          onBlur={(e) => handleInputBlur(asset.id, 'johnDoe', e.target.value)}
                          disabled={isUpdating}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-600 mb-1">
                          Janette Doe (Spouse)
                        </label>
                        <input
                          key={`hybrid-janetteDoe-${asset.id}-${asset.janetteDoe}`}
                          type="text"
                          defaultValue={asset.janetteDoe}
                          className={`w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getValueClass(asset.janetteDoe, 'percentage')}`}
                          onFocus={handleDefaultValueFocus}
                          onBlur={(e) => handleInputBlur(asset.id, 'janetteDoe', e.target.value)}
                          disabled={isUpdating}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-600 mb-1">
                          Doe Junior
                        </label>
                        <input
                          key={`hybrid-doeJunior-${asset.id}-${asset.doeJunior}`}
                          type="text"
                          defaultValue={asset.doeJunior}
                          className={`w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getValueClass(asset.doeJunior, 'percentage')}`}
                          onFocus={handleDefaultValueFocus}
                          onBlur={(e) => handleInputBlur(asset.id, 'doeJunior', e.target.value)}
                          disabled={isUpdating}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-600 mb-1">
                          Doe Family Trust
                        </label>
                        <input
                          key={`hybrid-doeFamilyTrust-${asset.id}-${asset.doeFamilyTrust}`}
                          type="text"
                          defaultValue={asset.doeFamilyTrust}
                          className={`w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getValueClass(asset.doeFamilyTrust, 'percentage')}`}
                          onFocus={handleDefaultValueFocus}
                          onBlur={(e) => handleInputBlur(asset.id, 'doeFamilyTrust', e.target.value)}
                          disabled={isUpdating}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Distribution Section */}
                  <div>
                    <h5 className="text-sm font-medium text-neutral-700 mb-3">Distribution</h5>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-600 mb-1">
                          Estate
                        </label>
                        <input
                          key={`hybrid-estate-${asset.id}-${asset.estate}`}
                          type="text"
                          defaultValue={asset.estate}
                          className={`w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getValueClass(asset.estate, 'currency')}`}
                          onFocus={handleDefaultValueFocus}
                          onBlur={(e) => handleInputBlur(asset.id, 'estate', e.target.value)}
                          disabled={isUpdating}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-600 mb-1">
                          Others
                        </label>
                        <input
                          key={`hybrid-others-${asset.id}-${asset.others}`}
                          type="text"
                          defaultValue={asset.others}
                          className={`w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getValueClass(asset.others, 'currency')}`}
                          onFocus={handleDefaultValueFocus}
                          onBlur={(e) => handleInputBlur(asset.id, 'others', e.target.value)}
                          disabled={isUpdating}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-600 mb-1">
                          Client
                        </label>
                        <input
                          key={`hybrid-client-${asset.id}-${asset.client}`}
                          type="text"
                          defaultValue={asset.client}
                          className={`w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getValueClass(asset.client, 'currency')}`}
                          onFocus={handleDefaultValueFocus}
                          onBlur={(e) => handleInputBlur(asset.id, 'client', e.target.value)}
                          disabled={isUpdating}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add Asset Button for this section */}
              {onAddAsset && (
                <div className="pt-4 border-t border-neutral-200">
                  <button
                    onClick={onAddAsset}
                    disabled={isUpdating}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Asset to {sectionName.replace('_', ' ')}
                  </button>
                </div>
              )}
            </div>
          </div>
        ));
      })()}
      
      {/* Totals Summary for Hybrid View */}
      <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Totals Summary</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm text-neutral-600">Total Assets</div>
            <div className="text-lg font-semibold text-neutral-800">R {totals.amount.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-neutral-600">Estate</div>
            <div className="text-lg font-semibold text-neutral-800">R {totals.estate.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-neutral-600">Others</div>
            <div className="text-lg font-semibold text-neutral-800">R {totals.others.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-neutral-600">Client</div>
            <div className="text-lg font-semibold text-neutral-800">R {totals.client.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssetsTable;