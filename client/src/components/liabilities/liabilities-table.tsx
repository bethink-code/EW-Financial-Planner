import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Liabilities, InsertLiabilities } from '@shared/schema';
import { AddButton, ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { TableHeaderAddButton } from '@/components/ui/table-header-add-button';
import { getFieldClass, getCellClass } from '@/lib/field-types';
import { formatCurrencyValue, formatPercentageValue, getValueClass, handleDefaultValueFocus, formatTextValue } from '@/lib/formatting';
import { parseEntityOwnership, getEntityDisplayName, setEntityOwnership, type ClientEntity } from '@/lib/entity-columns-utils';

interface LiabilitiesTableProps {
  viewMode: 'table' | 'hybrid';
  searchTerm?: string;
  onShowCategoryDialog?: () => void;
  onAddLiability?: () => void;
}

function LiabilitiesTable({ viewMode, searchTerm, onShowCategoryDialog, onAddLiability }: LiabilitiesTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Query for liabilities
  const { data: liabilities = [], isLoading, error } = useQuery<Liabilities[]>({
    queryKey: ['/api/liabilities'],
  });

  // Query for client entities to build dynamic columns
  const { data: clientEntities = [] } = useQuery<ClientEntity[]>({
    queryKey: ['/api/client-details'],
    select: (data: any[]) => data.map(entity => ({
      id: entity.id,
      entityName: entity.entityName,
      entityType: entity.entityType
    }))
  });

  // Add liability mutation
  const addMutation = useMutation({
    mutationFn: async (): Promise<Liabilities> => {
      const newLiability: InsertLiabilities = {
        description:"",
        debtAmount:"R 0",
        entityOwnership:"{}",
        estate:"R 0",
        others:"R 0",
        client:"R 0",
        section:"BONDS",
        included: true,
      };
      
      const response = await fetch('/api/liabilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLiability),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add liability');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/liabilities'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to add liability:', error);
      setIsUpdating(false);
    }
  });

  // Update liability mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Liabilities> }) => {
      const response = await fetch(`/api/liabilities/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update liability');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/liabilities'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to update liability:', error);
      setIsUpdating(false);
    }
  });

  // Delete liability mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/liabilities/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete liability');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/liabilities'] });
    }
  });

  // Calculate totals
  const totals = useMemo(() => {
    if (!liabilities || liabilities.length === 0) {
      return { count: 0, amount: 0, estate: 0, others: 0, client: 0 };
    }
    return {
      count: liabilities.length,
      amount: liabilities.reduce((sum: number, liability: Liabilities) => {
        const value = parseFloat((liability.debtAmount || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      estate: liabilities.reduce((sum: number, liability: Liabilities) => {
        const value = parseFloat((liability.estate || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      others: liabilities.reduce((sum: number, liability: Liabilities) => {
        const value = parseFloat((liability.others || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      client: liabilities.reduce((sum: number, liability: Liabilities) => {
        const value = parseFloat((liability.client || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
    };
  }, [liabilities]);

  const handleUpdateLiability = useCallback((id: number, field: keyof Liabilities, value: string | string[]) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof Liabilities, value: string) => {
    let formattedValue: string;
    if (field === 'debtAmount' || field === 'estate' || field === 'others' || field === 'client') {
      formattedValue = formatCurrencyValue(value);
    } else {
      formattedValue = value;
    }
    handleUpdateLiability(id, field, formattedValue);
    
    // Update DOM element for immediate visual feedback
    const target = document.activeElement as HTMLInputElement;
    if (target && formattedValue !== value) {
      setTimeout(() => {
        target.value = formattedValue;
      }, 0);
    }
  }, [handleUpdateLiability]);

  const handleDeleteLiability = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this liability?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  if (isLoading) {
    return <div className="flex justify-center">Loading liabilities...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error loading liabilities. Please try again.</div>;
  }

  return viewMode === 'table' ? (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table>
        <thead>
          <tr className="double-row-header-first">
            <th className="section-start table-actions-cell" rowSpan={2}>
              {onAddLiability && (
                <TableHeaderAddButton
                  onClick={onAddLiability}
                  title="Add new liability"
                />
              )}
            </th>
            <th className="section-start" colSpan={1}>Overview</th>
            <th className="section-start" colSpan={1}>Liability Details</th>
            <th className="section-start" colSpan={clientEntities.length}>Ownership Split</th>
            <th className="section-start" colSpan={3}>Settlement</th>
          </tr>
          <tr className="double-row-header-second">
            <th className="section-start">Description</th>
            <th className="section-start">Debt Amount</th>
            {clientEntities.map((entity, index) => (
              <th key={entity.id} className={index === 0 ? "section-start" : ""}>
                {getEntityDisplayName(entity)}
              </th>
            ))}
            <th className="section-start">Estate Duty</th>
            <th>Others</th>
            <th>Client</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {(() => {
            // Group liabilities by section/category
            const groupedLiabilities = liabilities.reduce((groups, liability) => {
              const section = liability.section || 'Other';
              if (!groups[section]) {
                groups[section] = [];
              }
              groups[section].push(liability);
              return groups;
            }, {} as Record<string, Liabilities[]>);

            return Object.entries(groupedLiabilities).map(([sectionName, sectionLiabilities]) => [
              // Section Header
              <tr key={`section-${sectionName}`} className="bg-blue-50">
                <td colSpan={clientEntities.length + 5} className="px-4 text-sm font-medium text-neutral-700 uppercase tracking-wider">
                  {sectionName.replace('_', ' ')}
                </td>
              </tr>,
              // Section Liabilities
              ...sectionLiabilities.map((liability: Liabilities) => (
                <tr key={liability.id} className="hover:bg-neutral-50">
                  <td className="table-actions-cell p-1 text-center section-start">
                    <ActionButtonGroup>
                      <DuplicateButton
                        onClick={onShowCategoryDialog || (() => addMutation.mutate())}
                        disabled={isUpdating}
                      />
                      <DeleteButton
                        onClick={() => handleDeleteLiability(liability.id)}
                        disabled={isUpdating}
                      />
                    </ActionButtonGroup>
                  </td>
                  
                  <td className="p-1 text-left section-start">
                    <input
                      type="text"
                      defaultValue={formatTextValue(liability.description)}
                      className={`table-input ${getFieldClass('text')} ${getValueClass(liability.description, 'text')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(liability.id, 'description', e.target.value)}
                      disabled={isUpdating}
                    />
                  </td>
                  
                  <td className="p-1 text-right section-start">
                    <input
                      key={`debtAmount-${liability.id}-${liability.debtAmount}`}
                      type="text"
                      defaultValue={liability.debtAmount}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(liability.debtAmount, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(liability.id, 'debtAmount', e.target.value)}
                      disabled={isUpdating}
                    />
                  </td>
                  
                  {clientEntities.map((entity, index) => {
                    const entityDisplayName = getEntityDisplayName(entity);
                    const ownership = parseEntityOwnership(liability.entityOwnership);
                    const value = ownership[entityDisplayName] || '0%';
                    
                    return (
                      <td key={entity.id} className={`p-1 text-center ${index === 0 ? 'section-start' : ''}`}>
                        <input
                          type="text"
                          defaultValue={value}
                          className={`table-input ${getFieldClass('percentage')} ${getValueClass(value, 'percentage')}`}
                          onFocus={handleDefaultValueFocus}
                          onBlur={(e) => {
                            const formattedValue = formatPercentageValue(e.target.value);
                            const newOwnership = setEntityOwnership(liability.entityOwnership, entityDisplayName, formattedValue);
                            handleUpdateLiability(liability.id, 'entityOwnership', newOwnership);
                            
                            // Update DOM element for immediate visual feedback
                            setTimeout(() => {
                              e.target.value = formattedValue;
                            }, 0);
                          }}
                          disabled={isUpdating}
                        />
                      </td>
                    );
                  })}
                  
                  <td className="p-1 text-right section-start">
                    <input
                      key={`estate-${liability.id}-${liability.estate}`}
                      type="text"
                      defaultValue={liability.estate}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(liability.estate, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(liability.id, 'estate', e.target.value)}
                      disabled={isUpdating}
                    />
                  </td>
                  
                  <td className="p-1 text-right">
                    <input
                      key={`others-${liability.id}-${liability.others}`}
                      type="text"
                      defaultValue={liability.others}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(liability.others, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(liability.id, 'others', e.target.value)}
                      disabled={isUpdating}
                    />
                  </td>
                  
                  <td className="p-1 text-right">
                    <input
                      key={`client-${liability.id}-${liability.client}`}
                      type="text"
                      defaultValue={liability.client}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(liability.client, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(liability.id, 'client', e.target.value)}
                      disabled={isUpdating}
                    />
                  </td>
                </tr>
              ))
            ]).flat();
          })()}
        </tbody>
        
        {/* Totals Footer */}
        <tfoot>
          <tr className="bg-neutral-50 border-t border-neutral-300">
            <td className="totals-cell-label section-start"></td>
            <td className="totals-cell-label text-right section-start">Totals</td>
            <td className="totals-cell-value section-start text-right">R {totals.amount.toLocaleString()}</td>
            <td className="totals-cell-label section-start" colSpan={clientEntities.length}></td>
            <td className="totals-cell-value section-start text-right">R {totals.estate.toLocaleString()}</td>
            <td className="totals-cell-value text-right">R {totals.others.toLocaleString()}</td>
            <td className="totals-cell-value text-right">R {totals.client.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
      </div>
    </div>
  ) : (
    // Hybrid View - Left sidebar with summary cards + Right side detailed form
    <div className="flex gap-6">
      {/* Left Sidebar - Summary Cards */}
      <div className="w-80 flex-shrink-0 space-y-4">
        {/* Totals Summary Card */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
          <h3 className="text-lg font-semibold text-neutral-800 mb-3">Liabilities Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600">Total Debt:</span>
              <span className="font-semibold">R {totals.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600">Estate:</span>
              <span className="font-semibold">R {totals.estate.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600">Others:</span>
              <span className="font-semibold">R {totals.others.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600">Client:</span>
              <span className="font-semibold">R {totals.client.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Liabilities by Category Cards */}
        {(() => {
          const groupedLiabilities = liabilities.reduce((groups, liability) => {
            const section = liability.section || 'Other';
            if (!groups[section]) {
              groups[section] = [];
            }
            groups[section].push(liability);
            return groups;
          }, {} as Record<string, Liabilities[]>);

          return Object.entries(groupedLiabilities).map(([sectionName, sectionLiabilities]) => {
            const sectionTotal = sectionLiabilities.reduce((sum: number, liability: Liabilities) => {
              const value = parseFloat((liability.debtAmount || '').replace(/[^\d.-]/g, '')) || 0;
              return sum + value;
            }, 0);

            return (
              <div key={`summary-${sectionName}`} className="bg-red-50 rounded-lg border border-red-200 p-4">
                <h4 className="font-medium text-red-900 mb-2">
                  {sectionName.replace('_', ' ')}
                </h4>
                <div className="text-sm text-red-700 mb-2">
                  {sectionLiabilities.length} liability{sectionLiabilities.length !== 1 ? 'ies' : 'y'}
                </div>
                <div className="font-semibold text-red-900">
                  R {sectionTotal.toLocaleString()}
                </div>
                <div className="mt-2 space-y-1">
                  {sectionLiabilities.slice(0, 3).map((liability: Liabilities) => (
                    <div key={`summary-item-${liability.id}`} className="text-xs text-red-700 truncate">
                      {formatTextValue(liability.description) || 'Untitled Liability'}
                    </div>
                  ))}
                  {sectionLiabilities.length > 3 && (
                    <div className="text-xs text-red-600">
                      +{sectionLiabilities.length - 3} more...
                    </div>
                  )}
                </div>
              </div>
            );
          });
        })()}
        
        {/* Add Liability Button */}
        {onAddLiability && (
          <button
            onClick={onAddLiability}
            disabled={isUpdating}
            className="w-full inline-flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Liability
          </button>
        )}
      </div>

      {/* Right Side - Detailed Forms */}
      <div className="flex-1 space-y-6">
        {(() => {
          const groupedLiabilities = liabilities.reduce((groups, liability) => {
            const section = liability.section || 'Other';
            if (!groups[section]) {
              groups[section] = [];
            }
            groups[section].push(liability);
            return groups;
          }, {} as Record<string, Liabilities[]>);

          return Object.entries(groupedLiabilities).map(([sectionName, sectionLiabilities]) => (
            <div key={`hybrid-section-${sectionName}`} className="bg-white rounded-lg shadow-sm border border-neutral-200">
              {/* Section Header */}
              <div className="bg-red-50 px-6 py-4 border-b border-neutral-200">
                <h3 className="text-lg font-medium text-neutral-700">
                  {sectionName.replace('_', ' ')} ({sectionLiabilities.length})
                </h3>
              </div>
              
              {/* Liabilities in this section */}
              <div className="p-6 space-y-6">
                {sectionLiabilities.map((liability: Liabilities) => (
                  <div key={`hybrid-${liability.id}`} className="border border-gray-200 rounded-lg p-4 space-y-4">
                    {/* Liability Header with Actions */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-neutral-800 text-lg">
                          {formatTextValue(liability.description) || `Liability #${liability.id}`}
                        </h4>
                        <p className="text-sm text-neutral-600 mt-1">
                          Debt Amount: <span className="font-semibold">{liability.debtAmount}</span>
                        </p>
                      </div>
                      <ActionButtonGroup>
                        <DuplicateButton
                          onClick={onShowCategoryDialog || (() => addMutation.mutate())}
                          disabled={isUpdating}
                        />
                        <DeleteButton
                          onClick={() => handleDeleteLiability(liability.id)}
                          disabled={isUpdating}
                        />
                      </ActionButtonGroup>
                    </div>
                    
                    {/* Liability Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Description
                        </label>
                        <input
                          type="text"
                          defaultValue={formatTextValue(liability.description)}
                          className={`w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getValueClass(liability.description, 'text')}`}
                          onFocus={handleDefaultValueFocus}
                          onBlur={(e) => handleInputBlur(liability.id, 'description', e.target.value)}
                          disabled={isUpdating}
                        />
                      </div>
                      
                      {/* Debt Amount */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Debt Amount
                        </label>
                        <input
                          key={`hybrid-debtAmount-${liability.id}-${liability.debtAmount}`}
                          type="text"
                          defaultValue={liability.debtAmount}
                          className={`w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getValueClass(liability.debtAmount, 'currency')}`}
                          onFocus={handleDefaultValueFocus}
                          onBlur={(e) => handleInputBlur(liability.id, 'debtAmount', e.target.value)}
                          disabled={isUpdating}
                        />
                      </div>
                    </div>
                    
                    {/* Ownership Split Section */}
                    <div>
                      <h5 className="text-sm font-medium text-neutral-700 mb-3">Ownership Split</h5>
                      <div className={`grid grid-cols-2 lg:grid-cols-${Math.min(4, clientEntities.length)} gap-3`}>
                        {clientEntities.map((entity) => {
                          const entityDisplayName = getEntityDisplayName(entity);
                          const ownership = parseEntityOwnership(liability.entityOwnership);
                          const value = ownership[entityDisplayName] || '0%';
                          
                          return (
                            <div key={entity.id}>
                              <label className="block text-xs font-medium text-neutral-600 mb-1">
                                {entityDisplayName}
                              </label>
                              <input
                                type="text"
                                defaultValue={value}
                                className={`w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent ${getValueClass(value, 'percentage')}`}
                                onFocus={handleDefaultValueFocus}
                                onBlur={(e) => {
                                  const formattedValue = formatPercentageValue(e.target.value);
                                  const newOwnership = setEntityOwnership(liability.entityOwnership, entityDisplayName, formattedValue);
                                  handleUpdateLiability(liability.id, 'entityOwnership', newOwnership);
                                  
                                  // Update DOM element for immediate visual feedback
                                  setTimeout(() => {
                                    e.target.value = formattedValue;
                                  }, 0);
                                }}
                                disabled={isUpdating}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Settlement Section */}
                    <div>
                      <h5 className="text-sm font-medium text-neutral-700 mb-3">Settlement</h5>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-neutral-600 mb-1">
                            Estate Duty
                          </label>
                          <input
                            key={`hybrid-estate-${liability.id}-${liability.estate}`}
                            type="text"
                            defaultValue={liability.estate}
                            className={`w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent ${getValueClass(liability.estate, 'currency')}`}
                            onFocus={handleDefaultValueFocus}
                            onBlur={(e) => handleInputBlur(liability.id, 'estate', e.target.value)}
                            disabled={isUpdating}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-neutral-600 mb-1">
                            Others
                          </label>
                          <input
                            key={`hybrid-others-${liability.id}-${liability.others}`}
                            type="text"
                            defaultValue={liability.others}
                            className={`w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent ${getValueClass(liability.others, 'currency')}`}
                            onFocus={handleDefaultValueFocus}
                            onBlur={(e) => handleInputBlur(liability.id, 'others', e.target.value)}
                            disabled={isUpdating}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-neutral-600 mb-1">
                            Client
                          </label>
                          <input
                            key={`hybrid-client-${liability.id}-${liability.client}`}
                            type="text"
                            defaultValue={liability.client}
                            className={`w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent ${getValueClass(liability.client, 'currency')}`}
                            onFocus={handleDefaultValueFocus}
                            onBlur={(e) => handleInputBlur(liability.id, 'client', e.target.value)}
                            disabled={isUpdating}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ));
        })()}
      </div>
    </div>
  );
}

export { LiabilitiesTable };