import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { IncomeNeeds } from '@shared/schema';
import { queryClient } from '@/lib/queryClient';
import { ActionButtonGroup, DeleteButton, DuplicateButton } from '@/components/ui/action-buttons';
import { FieldGroup, FormField } from '@/components/common/grouped-detail-form';
import { formatCurrencyValue, formatPercentageValue, formatYearsValue, formatTextValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';
import { type ClientEntity } from '@/lib/entity-columns-utils';

interface IncomeNeedDetailFormProps {
  incomeNeed: IncomeNeeds;
  onDelete: (id: number) => void;
  onDuplicate: (incomeNeed: IncomeNeeds) => void;
}

export function IncomeNeedDetailForm({ incomeNeed, onDelete, onDuplicate }: IncomeNeedDetailFormProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Query for client entities to populate Entity dropdown
  const { data: clientEntities = [] } = useQuery<ClientEntity[]>({
    queryKey: ['/api/client-details'],
    select: (data: any[]) => data.map(entity => ({
      id: entity.id,
      entityName: entity.entityName,
      entityType: entity.entityType
    }))
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ updates }: { updates: Partial<IncomeNeeds> }) => {
      const response = await fetch(`/api/income-needs/${incomeNeed.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update income need');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-needs'] });
      setIsUpdating(false);
    },
    onError: () => setIsUpdating(false)
  });

  const handleUpdate = useCallback((field: keyof IncomeNeeds, value: string | boolean) => {
    setIsUpdating(true);
    updateMutation.mutate({ updates: { [field]: value } });
  }, [updateMutation]);

  const handleInputBlur = useCallback((field: keyof IncomeNeeds, value: string) => {
    let formattedValue: string;
    switch (field) {
      case 'amount':
      case 'capitalisedAmount':
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
      case 'startDate':
        formattedValue = formatTextValue(value);
        break;
      default:
        formattedValue = value;
    }
    handleUpdate(field, formattedValue);
    
    // Update DOM for immediate feedback
    const target = document.activeElement as HTMLInputElement;
    if (target && formattedValue !== value) {
      setTimeout(() => { target.value = formattedValue; }, 0);
    }
  }, [handleUpdate]);

  const disabled = isUpdating || updateMutation.isPending;

  return (
    <div className="space-y-12 p-6 bg-white">
      {/* Header with Actions - Mandatory Pattern */}
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-semibold text-neutral-800">
          {incomeNeed.description || 'Untitled Income Need'}
        </h2>
        <ActionButtonGroup>
          <DuplicateButton 
            onClick={() => onDuplicate(incomeNeed)} 
            disabled={disabled}
          />
          <DeleteButton 
            onClick={() => onDelete(incomeNeed.id)} 
            disabled={disabled}
          />
        </ActionButtonGroup>
      </div>

      {/* Group 1: Overview */}
      <FieldGroup title="Overview">
        <div className="grid grid-cols-2 gap-x-3 gap-y-4" style={{ width: 'fit-content' }}>
          <FormField label="Description">
            <input
              type="text"
              defaultValue={incomeNeed.description || ''}
              placeholder="Enter details..."
              className={`table-input ${incomeNeed.description ? '' : 'text-neutral-400'}`}
              style={{ width: 'fit-content', minWidth: '200px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('description', e.target.value)}
              disabled={disabled}
            />
          </FormField>

          <FormField label="Entity">
            <select
              defaultValue={incomeNeed.personName || ''}
              className={`table-input table-dropdown ${getValueClass(incomeNeed.personName, 'text')}`}
              style={{ width: 'fit-content', minWidth: '200px' }}
              onChange={(e) => handleUpdate('personName', e.target.value)}
              disabled={disabled}
            >
              <option value="">Select entity...</option>
              {clientEntities.map((entity) => (
                <option key={entity.id} value={entity.entityName}>
                  {entity.entityName} ({entity.entityType})
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </FieldGroup>

      {/* Group 2: Main Details */}
      <FieldGroup title="Income Need Details">
        <div className="grid grid-cols-3 gap-x-3 gap-y-4" style={{ width: 'fit-content' }}>
          <FormField label="Amount">
            <input
              type="text"
              defaultValue={incomeNeed.amount || 'R 0'}
              placeholder="R 0"
              className={`table-input ${getValueClass(incomeNeed.amount, 'currency')}`}
              style={{ width: 'fit-content', minWidth: '120px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('amount', e.target.value)}
              disabled={disabled}
            />
          </FormField>

          <FormField label="Start Date">
            <input
              type="text"
              defaultValue={incomeNeed.startDate || ''}
              placeholder="Enter details..."
              className={`table-input ${getValueClass(incomeNeed.startDate, 'text')}`}
              style={{ width: 'fit-content', minWidth: '120px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('startDate', e.target.value)}
              disabled={disabled}
            />
          </FormField>

          <FormField label="Frequency">
            <select
              defaultValue={incomeNeed.frequency}
              className="table-input table-dropdown"
              style={{ width: 'fit-content', minWidth: '120px' }}
              onChange={(e) => handleUpdate('frequency', e.target.value)}
              disabled={disabled}
            >
              <option value="monthly">Monthly</option>
              <option value="annually">Annually</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </FormField>

          <FormField label="Term Years">
            <input
              type="text"
              defaultValue={incomeNeed.termYears || '0'}
              placeholder="0 years"
              className={`table-input ${getValueClass(incomeNeed.termYears, 'years')}`}
              style={{ width: 'fit-content', minWidth: '120px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('termYears', e.target.value)}
              disabled={disabled}
            />
          </FormField>

          <FormField label="Increase %">
            <input
              type="text"
              defaultValue={incomeNeed.increasePercentage || '0%'}
              placeholder="0%"
              className={`table-input ${getValueClass(incomeNeed.increasePercentage, 'percentage')}`}
              style={{ width: 'fit-content', minWidth: '120px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('increasePercentage', e.target.value)}
              disabled={disabled}
            />
          </FormField>

          <FormField label="CPI Adjusted">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={incomeNeed.cpi}
                className="table-input"
                onChange={(e) => handleUpdate('cpi', e.target.checked)}
                disabled={disabled}
              />
              <span className="text-sm text-neutral-600">
                {incomeNeed.cpi ? 'Yes' : 'No'}
              </span>
            </div>
          </FormField>
        </div>
      </FieldGroup>

      {/* Group 3: Calculated Fields */}
      <FieldGroup title="Calculated Values">
        <div className="grid grid-cols-1 gap-x-3 gap-y-4" style={{ width: 'fit-content' }}>
          <FormField label="Capitalised Amount">
            <input
              type="text"
              value={incomeNeed.capitalisedAmount || 'R 0'}
              className="calculated-field"
              style={{ width: 'fit-content', minWidth: '150px' }}
              readOnly
            />
          </FormField>
        </div>
      </FieldGroup>
    </div>
  );
}