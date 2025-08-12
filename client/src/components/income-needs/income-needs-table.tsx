import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { IncomeNeeds, InsertIncomeNeeds } from '@shared/schema';
import { AddButton, ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { TableHeaderAddButton } from '@/components/ui/table-header-add-button';
import { getFieldClass, getCellClass } from '@/lib/field-types';
import { formatCurrencyValue, formatPercentageValue, formatYearsValue, formatTextValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';
import { type ClientEntity } from '@/lib/entity-columns-utils';
import { HybridViewWrapper } from '@/components/common/hybrid-view-wrapper';
import { IncomeNeedPreviewCard } from './income-need-preview-card';
import { IncomeNeedDetailForm } from './income-need-detail-form';

interface IncomeNeedsTableProps {
  viewMode: 'table' | 'hybrid';
  searchTerm?: string;
  onAddIncomeNeed?: () => void;
}

function IncomeNeedsTable({ viewMode, searchTerm, onAddIncomeNeed }: IncomeNeedsTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedIncomeNeedId, setSelectedIncomeNeedId] = useState<number | null>(null);

  const { data: incomeNeeds = [], isLoading, error } = useQuery<IncomeNeeds[]>({
    queryKey: ['/api/income-needs'],
  });

  // Query for client entities to populate Entity dropdown
  const { data: clientEntities = [] } = useQuery<ClientEntity[]>({
    queryKey: ['/api/client-details'],
    select: (data: any[]) => data.map(entity => ({
      id: entity.id,
      entityName: entity.entityName,
      entityType: entity.entityType
    }))
  });

  // Filter income needs based on search term
  const filteredIncomeNeeds = useMemo(() => {
    if (!searchTerm) return incomeNeeds;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return incomeNeeds.filter(incomeNeed =>
      incomeNeed.description?.toLowerCase().includes(lowerSearchTerm) ||
      incomeNeed.personName?.toLowerCase().includes(lowerSearchTerm) ||
      incomeNeed.amount?.toLowerCase().includes(lowerSearchTerm) ||
      incomeNeed.frequency?.toLowerCase().includes(lowerSearchTerm)
    );
  }, [incomeNeeds, searchTerm]);

  // Auto-select first item in hybrid view
  useEffect(() => {
    if (viewMode === 'hybrid' && filteredIncomeNeeds.length > 0 && !selectedIncomeNeedId) {
      setSelectedIncomeNeedId(filteredIncomeNeeds[0].id);
    }
  }, [viewMode, filteredIncomeNeeds, selectedIncomeNeedId]);

  const addMutation = useMutation({
    mutationFn: async (): Promise<IncomeNeeds> => {
      const newIncomeNeed: InsertIncomeNeeds = {
        description:"",
        personName:"",
        startDate:"Enter details ...",
        termYears:"0",
        increasePercentage:"0%",
        cpi: false,
        frequency:"monthly",
        amount:"R 0",
        capitalisedAmount:"R 0",
      };
      
      const response = await fetch('/api/income-needs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newIncomeNeed),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add income need');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-needs'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to add income need:', error);
      setIsUpdating(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<IncomeNeeds> }) => {
      const response = await fetch(`/api/income-needs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update income need');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-needs'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to update income need:', error);
      setIsUpdating(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/income-needs/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete income need');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-needs'] });
    }
  });

  // Calculate totals for filtered income needs
  const totals = useMemo(() => {
    return {
      count: filteredIncomeNeeds.length,
      amount: filteredIncomeNeeds.reduce((sum: number, incomeNeed: IncomeNeeds) => {
        const value = parseFloat((incomeNeed.amount || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      capitalisedAmount: filteredIncomeNeeds.reduce((sum: number, incomeNeed: IncomeNeeds) => {
        const value = parseFloat((incomeNeed.capitalisedAmount || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
    };
  }, [filteredIncomeNeeds]);

  // Get selected income need for hybrid view
  const selectedIncomeNeed = selectedIncomeNeedId 
    ? filteredIncomeNeeds.find(inc => inc.id === selectedIncomeNeedId)
    : null;

  const handleUpdateIncomeNeed = useCallback((id: number, field: keyof IncomeNeeds, value: string | boolean | string[]) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof IncomeNeeds, value: string, target?: HTMLInputElement) => {
    
    // Format the value based on field type
    let formattedValue = value;
    switch (field) {
      case 'amount':
        formattedValue = formatCurrencyValue(value);
        break;
      case 'increasePercentage':
        formattedValue = formatPercentageValue(value);
        break;
      case 'termYears':
        formattedValue = formatYearsValue(value);
        break;
      case 'description':
      case 'personName':
        formattedValue = formatTextValue(value);
        break;
    }
    
    // Update the DOM element immediately for visual feedback
    if (target && formattedValue !== value) {
      target.value = formattedValue;
    }
    
    handleUpdateIncomeNeed(id, field, formattedValue);
  }, [handleUpdateIncomeNeed]);

  const handleDeleteIncomeNeed = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this income need?')) {
      // If deleting the selected item in hybrid view, clear selection
      if (id === selectedIncomeNeedId) {
        setSelectedIncomeNeedId(null);
      }
      deleteMutation.mutate(id);
    }
  }, [deleteMutation, selectedIncomeNeedId]);

  const handleDuplicateIncomeNeed = useCallback((incomeNeed: IncomeNeeds) => {
    setIsUpdating(true);
    addMutation.mutate();
  }, [addMutation]);

  if (isLoading) {
    return <div className="flex justify-center">Loading income needs...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error loading income needs. Please try again.</div>;
  }

  return viewMode === 'table' ? (
    <div className="space-y-6">
      <table>
        <thead>
          <tr className="double-row-header-first">
            <th className="section-start table-actions-cell" rowSpan={2}>
              {onAddIncomeNeed && (
                <TableHeaderAddButton
                  onClick={onAddIncomeNeed}
                  title="Add new income need"
                />
              )}
            </th>
            <th className="section-start" colSpan={2}>Overview</th>
            <th className="section-start" colSpan={7}>Income Need Details</th>
          </tr>
          <tr className="double-row-header-second">
            <th className="section-start">Description</th>
            <th>Entity</th>
            <th className="section-start">Amount</th>
            <th>Start Date</th>
            <th>Term Years</th>
            <th>Increase %</th>
            <th>CPI</th>
            <th>Frequency</th>
            <th>Capitalised Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {filteredIncomeNeeds.map((incomeNeed: IncomeNeeds, index) => (
            <tr key={incomeNeed.id} className="hover:bg-neutral-50">
              <td className="table-actions-cell p-1 text-center section-start">
                <ActionButtonGroup>
                  <DuplicateButton onClick={() => addMutation.mutate()} disabled={isUpdating} />
                  <DeleteButton onClick={() => handleDeleteIncomeNeed(incomeNeed.id)} disabled={isUpdating} />
                </ActionButtonGroup>
              </td>
              
              <td className="p-1 text-left section-start">
                <input
                  type="text"
                  defaultValue={formatTextValue(incomeNeed.description)}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(incomeNeed.description, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(incomeNeed.id, 'description', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1 text-left">
                <select
                  defaultValue={incomeNeed.personName || ''}
                  className={`table-input table-dropdown ${getValueClass(incomeNeed.personName, 'text')}`}
                  onChange={(e) => handleInputBlur(incomeNeed.id, 'personName', e.target.value)}
                  disabled={isUpdating}
                >
                  <option value="">Select entity...</option>
                  {clientEntities.map((entity) => (
                    <option key={entity.id} value={entity.entityName}>
                      {entity.entityName} ({entity.entityType})
                    </option>
                  ))}
                </select>
              </td>
              
              <td className="p-1 text-right section-start">
                <input
                  key={`amount-${incomeNeed.id}-${incomeNeed.amount}`}
                  type="text"
                  defaultValue={incomeNeed.amount}
                  className={`table-input ${getFieldClass('currency')} ${getValueClass(incomeNeed.amount, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(incomeNeed.id, 'amount', e.target.value, e.target)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1 text-left">
                <input
                  type="text"
                  defaultValue={incomeNeed.startDate}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(incomeNeed.startDate, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(incomeNeed.id, 'startDate', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1 text-center">
                <input
                  key={`termYears-${incomeNeed.id}-${incomeNeed.termYears}`}
                  type="text"
                  defaultValue={incomeNeed.termYears}
                  className={`table-input ${getFieldClass('years')} ${getValueClass(incomeNeed.termYears, 'years')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(incomeNeed.id, 'termYears', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1 text-center">
                <input
                  key={`increasePercentage-${incomeNeed.id}-${incomeNeed.increasePercentage}`}
                  type="text"
                  defaultValue={incomeNeed.increasePercentage}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(incomeNeed.increasePercentage, 'percentage')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(incomeNeed.id, 'increasePercentage', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1 text-center">
                <input
                  type="checkbox"
                  defaultChecked={incomeNeed.cpi}
                  className="table-input"
                  onChange={(e) => handleUpdateIncomeNeed(incomeNeed.id, 'cpi', e.target.checked)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1 text-center">
                <select
                  defaultValue={incomeNeed.frequency}
                  className="table-input table-dropdown"
                  onChange={(e) => handleInputBlur(incomeNeed.id, 'frequency', e.target.value)}
                  disabled={isUpdating}
                >
                  <option value="monthly">Monthly</option>
                  <option value="annually">Annually</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </td>
              
              <td className="p-1 text-right">
                <input
                  key={`capitalisedAmount-${incomeNeed.id}-${incomeNeed.capitalisedAmount}`}
                  type="text"
                  defaultValue={incomeNeed.capitalisedAmount}
                  className="calculated-field"
                  readOnly
                />
              </td>
            </tr>
          ))}
        </tbody>
        
        <tfoot>
          <tr>
            <td className="totals-cell-label text-right section-start">Totals</td>
            <td className="totals-cell-label section-start" colSpan={2}></td>
            <td className="totals-cell-value section-start">R {totals.amount.toLocaleString()}</td>
            <td className="totals-cell-label" colSpan={4}></td>
            <td className="totals-cell-value">R {totals.capitalisedAmount.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  ) : (
    // Hybrid View - Following Global Hybrid View Pattern
    <HybridViewWrapper
      viewMode={viewMode}
      tableComponent={null}
      summaryCards={
        <div className="p-4">
          <div className="bg-white rounded-lg border border-neutral-200 p-4 mb-4">
            <h3 className="text-lg font-semibold text-neutral-800 mb-3">Income Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-600">Total Income:</span>
                <span className="font-medium">R {totals.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Capitalised Amount:</span>
                <span className="font-medium">R {totals.capitalisedAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Total Items:</span>
                <span className="font-medium">{totals.count}</span>
              </div>
            </div>
          </div>
        </div>
      }
      detailForms={
        <div className="flex border-t border-neutral-200">
          {/* Left Section - Preview Cards (Tabs) */}
          <div className="w-80 flex-shrink-0 border-r border-neutral-200 bg-neutral-50">
            <div className="hybrid-tabs-container">
              {onAddIncomeNeed && (
                <div className="hybrid-add-button-container p-4 border-b border-neutral-200">
                  <AddButton 
                    onClick={onAddIncomeNeed} 
                    disabled={isUpdating}
                  />
                </div>
              )}
              <div className="hybrid-tabs-list">
                {filteredIncomeNeeds.map((incomeNeed, index) => (
                  <IncomeNeedPreviewCard
                    key={incomeNeed.id}
                    incomeNeed={incomeNeed}
                    isActive={selectedIncomeNeedId === incomeNeed.id}
                    onClick={() => setSelectedIncomeNeedId(incomeNeed.id)}
                    isFirst={index === 0}
                    isLast={index === filteredIncomeNeeds.length - 1}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Section - Detail Form */}
          <div className="flex-1">
            {selectedIncomeNeed ? (
              <IncomeNeedDetailForm
                incomeNeed={selectedIncomeNeed}
                onDelete={handleDeleteIncomeNeed}
                onDuplicate={handleDuplicateIncomeNeed}
              />
            ) : filteredIncomeNeeds.length === 0 ? (
              <div className="hybrid-empty-state text-center py-8">
                <h3 className="text-lg font-medium text-neutral-500 mb-2">No Income Needs Found</h3>
                <p className="text-neutral-400 mb-4">
                  {searchTerm ? 'No income needs match your search criteria.' : 'Start by adding your first income need.'}
                </p>
                {onAddIncomeNeed && (
                  <AddButton 
                    onClick={onAddIncomeNeed} 
                    disabled={isUpdating}
                  />
                )}
              </div>
            ) : (
              <div className="hybrid-select-state text-center py-8">
                <h3 className="text-lg font-medium text-neutral-500 mb-2">Select an Income Need</h3>
                <p className="text-neutral-400">Choose an income need from the tabs on the left to view and edit details.</p>
              </div>
            )}
          </div>
        </div>
      }
      isUpdating={isUpdating}
      isEmpty={filteredIncomeNeeds.length === 0}
      emptyStateMessage={searchTerm ? "No income needs match your search criteria." : "No income needs found. Add your first income need to get started."}
    />
  );
}

export default IncomeNeedsTable;
