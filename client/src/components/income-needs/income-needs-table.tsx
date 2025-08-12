import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { IncomeNeeds, InsertIncomeNeeds } from '@shared/schema';
import { AddButton, ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { TableHeaderAddButton } from '@/components/ui/table-header-add-button';
import { getFieldClass, getCellClass } from '@/lib/field-types';
import { formatCurrencyValue, formatPercentageValue, formatYearsValue, formatTextValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';
import { type ClientEntity } from '@/lib/entity-columns-utils';

interface IncomeNeedsTableProps {
  viewMode: 'table' | 'hybrid';
  searchTerm?: string;
  onAddIncomeNeed?: () => void;
}

function IncomeNeedsTable({ viewMode, searchTerm, onAddIncomeNeed }: IncomeNeedsTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);

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

  const totals = useMemo(() => {
    return {
      count: incomeNeeds.length,
      amount: incomeNeeds.reduce((sum: number, incomeNeed: IncomeNeeds) => {
        const value = parseFloat((incomeNeed.amount || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      capitalisedAmount: incomeNeeds.reduce((sum: number, incomeNeed: IncomeNeeds) => {
        const value = parseFloat((incomeNeed.capitalisedAmount || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
    };
  }, [incomeNeeds]);

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
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

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
          {incomeNeeds.map((incomeNeed: IncomeNeeds, index) => (
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
    // Hybrid View - Left sidebar with summary cards + Right side detailed form
    <div className="flex gap-6">
      {/* Left Sidebar - Summary Cards */}
      <div className="w-80 flex-shrink-0 space-y-4">
        {/* Totals Summary Card */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
          <h3 className="text-lg font-semibold text-neutral-800 mb-3">Income Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600">Total Income:</span>
              <span className="font-semibold">R {totals.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600">Capitalised Amount:</span>
              <span className="font-semibold">R {totals.capitalisedAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600">Total Items:</span>
              <span className="font-semibold">{incomeNeeds.length}</span>
            </div>
          </div>
        </div>

        {/* Income Needs Cards */}
        <div className="space-y-3">
          {incomeNeeds.slice(0, 5).map((incomeNeed: IncomeNeeds) => (
            <div key={`summary-${incomeNeed.id}`} className="bg-green-50 rounded-lg border border-green-200 p-3">
              <h4 className="font-medium text-green-900 text-sm mb-1">
                {formatTextValue(incomeNeed.description) || `Income #${incomeNeed.id}`}
              </h4>
              <div className="text-xs text-green-700 mb-1">
                {incomeNeed.frequency || 'monthly'}
              </div>
              <div className="font-semibold text-green-900 text-sm">
                {incomeNeed.amount}
              </div>
            </div>
          ))}
          {incomeNeeds.length > 5 && (
            <div className="text-center text-sm text-neutral-600">
              +{incomeNeeds.length - 5} more items
            </div>
          )}
        </div>
        
        {/* Add Income Need Button */}
        {onAddIncomeNeed && (
          <button
            onClick={onAddIncomeNeed}
            disabled={isUpdating}
            className="w-full inline-flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Income Need
          </button>
        )}
      </div>

      {/* Right Side - Detailed Forms */}
      <div className="flex-1 space-y-4">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
          {/* Section Header */}
          <div className="bg-green-50 px-6 py-4 border-b border-neutral-200">
            <h3 className="text-lg font-medium text-neutral-700">
              Income Needs ({incomeNeeds.length})
            </h3>
          </div>
          
          {/* Income needs in form view */}
          <div className="p-6 space-y-6">
            {incomeNeeds.map((incomeNeed: IncomeNeeds) => (
              <div key={`hybrid-${incomeNeed.id}`} className="border border-gray-200 rounded-lg p-4 space-y-4">
                {/* Income Need Header with Actions */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-neutral-800 text-lg">
                      {formatTextValue(incomeNeed.description) || `Income Need #${incomeNeed.id}`}
                    </h4>
                    <p className="text-sm text-neutral-600 mt-1">
                      Amount: <span className="font-semibold">{incomeNeed.amount}</span> | 
                      Frequency: <span className="font-semibold">{incomeNeed.frequency}</span>
                    </p>
                  </div>
                  <ActionButtonGroup>
                    <DuplicateButton
                      onClick={() => addMutation.mutate()}
                      disabled={isUpdating}
                    />
                    <DeleteButton
                      onClick={() => handleDeleteIncomeNeed(incomeNeed.id)}
                      disabled={isUpdating}
                    />
                  </ActionButtonGroup>
                </div>
                
                {/* Income Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      defaultValue={formatTextValue(incomeNeed.description)}
                      className={`w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getValueClass(incomeNeed.description, 'text')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(incomeNeed.id, 'description', e.target.value)}
                      disabled={isUpdating}
                    />
                  </div>
                  
                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Amount
                    </label>
                    <input
                      key={`hybrid-amount-${incomeNeed.id}-${incomeNeed.amount}`}
                      type="text"
                      defaultValue={incomeNeed.amount}
                      className={`w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getValueClass(incomeNeed.amount, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(incomeNeed.id, 'amount', e.target.value)}
                      disabled={isUpdating}
                    />
                  </div>
                  
                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Frequency
                    </label>
                    <select
                      defaultValue={incomeNeed.frequency}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => handleInputBlur(incomeNeed.id, 'frequency', e.target.value)}
                      disabled={isUpdating}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="annually">Annually</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>
                </div>
                
                {/* Income Period and Adjustments */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Period From
                    </label>
                    <input
                      key={`hybrid-periodFrom-${incomeNeed.id}-${incomeNeed.periodFrom}`}
                      type="text"
                      defaultValue={incomeNeed.periodFrom}
                      className={`w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent ${getValueClass(incomeNeed.periodFrom, 'years')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(incomeNeed.id, 'periodFrom', e.target.value)}
                      disabled={isUpdating}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Period To
                    </label>
                    <input
                      key={`hybrid-periodTo-${incomeNeed.id}-${incomeNeed.periodTo}`}
                      type="text"
                      defaultValue={incomeNeed.periodTo}
                      className={`w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent ${getValueClass(incomeNeed.periodTo, 'years')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(incomeNeed.id, 'periodTo', e.target.value)}
                      disabled={isUpdating}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Discount Rate
                    </label>
                    <input
                      key={`hybrid-discountRate-${incomeNeed.id}-${incomeNeed.discountRate}`}
                      type="text"
                      defaultValue={incomeNeed.discountRate}
                      className={`w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent ${getValueClass(incomeNeed.discountRate, 'percentage')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(incomeNeed.id, 'discountRate', e.target.value)}
                      disabled={isUpdating}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      CPI Adjustment
                    </label>
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        checked={incomeNeed.cpi}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        onChange={(e) => handleUpdateIncomeNeed(incomeNeed.id, 'cpi', e.target.checked)}
                        disabled={isUpdating}
                      />
                      <span className="ml-2 text-sm text-gray-600">Apply CPI</span>
                    </div>
                  </div>
                </div>
                
                {/* Calculated Field */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-start-4">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Capitalised Amount
                      </label>
                      <input
                        key={`hybrid-capitalisedAmount-${incomeNeed.id}-${incomeNeed.capitalisedAmount}`}
                        type="text"
                        defaultValue={incomeNeed.capitalisedAmount}
                        className="calculated-field w-full px-2 py-1 text-sm border-0 bg-transparent focus:outline-none"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IncomeNeedsTable;