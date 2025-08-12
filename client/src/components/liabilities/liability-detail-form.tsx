import { useState, useCallback, useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Liabilities } from '@shared/liabilities-schema';
import { queryClient } from '@/lib/queryClient';
import { ActionButtonGroup, DeleteButton } from '@/components/ui/action-buttons';
import { FieldGroup, FormField } from '@/components/common/grouped-detail-form';
import { formatCurrencyValue, formatPercentageValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';
import { parseEntityOwnership, setEntityOwnership, getEntityDisplayName, type ClientEntity } from '@/lib/entity-columns-utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LiabilityDetailFormProps {
  liability: Liabilities;
  onDelete: (id: number) => void;
}

export function LiabilityDetailForm({ liability, onDelete }: LiabilityDetailFormProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Query for client entities to build ownership fields
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
    mutationFn: async ({ updates }: { updates: Partial<Liabilities> }) => {
      const response = await fetch(`/api/liabilities/${liability.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update liability');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/liabilities'] });
      setIsUpdating(false);
    },
    onError: () => setIsUpdating(false)
  });

  const handleUpdate = useCallback((field: keyof Liabilities, value: string | boolean) => {
    setIsUpdating(true);
    updateMutation.mutate({ updates: { [field]: value } });
  }, [updateMutation]);

  const handleInputBlur = useCallback((field: keyof Liabilities, value: string) => {
    let formattedValue: string;
    if (['debtAmount', 'estate', 'others', 'client'].includes(field)) {
      formattedValue = formatCurrencyValue(value);
    } else {
      formattedValue = value;
    }
    handleUpdate(field, formattedValue);
    
    // Update DOM for immediate feedback
    const target = document.activeElement as HTMLInputElement;
    if (target && formattedValue !== value) {
      setTimeout(() => { target.value = formattedValue; }, 0);
    }
  }, [handleUpdate]);

  const handleOwnershipChange = useCallback((entityDisplayName: string, value: string) => {
    const formattedValue = formatPercentageValue(value);
    const newOwnership = setEntityOwnership(liability.entityOwnership, entityDisplayName, formattedValue);
    handleUpdate('entityOwnership', newOwnership);
  }, [liability.entityOwnership, handleUpdate]);

  const handleBooleanChange = useCallback((field: keyof Liabilities, checked: boolean) => {
    handleUpdate(field, checked);
  }, [handleUpdate]);

  // Parse current ownership
  const ownership = useMemo(() => parseEntityOwnership(liability.entityOwnership), [liability.entityOwnership]);

  return (
    <div className="space-y-12 p-6 bg-white">
      {/* Header with title and actions */}
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-semibold text-neutral-800">
          {liability.description || 'Untitled Liability'}
        </h2>
        <ActionButtonGroup>
          <DeleteButton
            onClick={() => onDelete(liability.id)}
            disabled={isUpdating}
          />
        </ActionButtonGroup>
      </div>

      {/* Group 1: Overview */}
      <FieldGroup title="Overview">
        <div className="space-y-4">
          <FormField label="Liability Description">
            <input
              type="text"
              defaultValue={liability.description || ''}
              placeholder="Enter details ..."
              className={`table-input ${liability.description ? '' : 'text-neutral-400'}`}
              style={{ width: 'fit-content', minWidth: '200px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('description', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>
          
          <FormField label="Category">
            <Select
              value={liability.category || ''}
              onValueChange={(value) => handleUpdate('category', value)}
              disabled={isUpdating}
            >
              <SelectTrigger style={{ width: 'fit-content', minWidth: '150px' }}>
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BONDS">Home Bond</SelectItem>
                <SelectItem value="VEHICLE_FINANCE">Vehicle Finance</SelectItem>
                <SelectItem value="CREDIT_CARDS">Credit Cards</SelectItem>
                <SelectItem value="PERSONAL_LOANS">Personal Loans</SelectItem>
                <SelectItem value="BUSINESS_LOANS">Business Loans</SelectItem>
                <SelectItem value="SHORT_TERM_DEBT">Short Term Debt</SelectItem>
                <SelectItem value="OTHER_DEBT">Other Debt</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          
          <FormField label="Currency">
            <input
              type="text"
              defaultValue={liability.currency || ''}
              placeholder="ZAR"
              className={`table-input ${liability.currency ? '' : 'text-neutral-400'}`}
              style={{ width: 'fit-content', minWidth: '80px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('currency', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>
        </div>
      </FieldGroup>

      {/* Group 2: Debt Details */}
      <FieldGroup title="Debt Details">
        <div className="grid grid-cols-2 gap-x-3 gap-y-4" style={{ width: 'fit-content' }}>
          <FormField label="Debt Amount">
            <input
              type="text"
              defaultValue={liability.debtAmount || ''}
              placeholder="R 0"
              className={`table-input ${liability.debtAmount ? '' : 'text-neutral-400'}`}
              style={{ width: 'fit-content', minWidth: '120px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('debtAmount', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>

          <FormField label="Included in Calculations">
            <div className="flex items-center space-x-3">
              <Switch
                checked={liability.included}
                onCheckedChange={(checked) => handleBooleanChange('included', checked)}
                disabled={isUpdating}
                className="data-[state=checked]:bg-blue-600"
              />
              <Label className="text-sm font-medium text-gray-700">
                {liability.included ? 'Included' : 'Excluded'}
              </Label>
            </div>
          </FormField>
        </div>
      </FieldGroup>

      {/* Group 3: Ownership Split */}
      <FieldGroup title="Ownership Split">
        <div className="overflow-hidden rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-neutral-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 border-b border-neutral-200">
                  Owner
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 border-b border-neutral-200">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody>
              {clientEntities.map((entity, index) => {
                const entityDisplayName = getEntityDisplayName(entity);
                const value = ownership[entityDisplayName] || '0%';
                const isLast = index === clientEntities.length - 1;
                
                return (
                  <tr key={entity.id} className={isLast ? '' : 'border-b border-neutral-100'}>
                    <td className="px-4 py-3 text-sm text-neutral-900">{entityDisplayName}</td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        defaultValue={value}
                        placeholder="0%"
                        className={`table-input ${value && value !== '0%' ? '' : 'text-neutral-400'}`}
                        style={{ width: 'fit-content', minWidth: '80px' }}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => {
                          const formattedValue = formatPercentageValue(e.target.value);
                          handleOwnershipChange(entityDisplayName, e.target.value);
                          setTimeout(() => { e.target.value = formattedValue; }, 0);
                        }}
                        disabled={isUpdating}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </FieldGroup>

      {/* Group 4: Settlement */}
      <FieldGroup title="Settlement">
        <div className="grid grid-cols-3 gap-x-3 gap-y-4" style={{ width: 'fit-content' }}>
          <FormField label="Estate">
            <input
              type="text"
              defaultValue={liability.estate || ''}
              placeholder="R 0"
              className={`table-input ${liability.estate ? '' : 'text-neutral-400'}`}
              style={{ width: 'fit-content', minWidth: '120px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('estate', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>

          <FormField label="Others">
            <input
              type="text"
              defaultValue={liability.others || ''}
              placeholder="R 0"
              className={`table-input ${liability.others ? '' : 'text-neutral-400'}`}
              style={{ width: 'fit-content', minWidth: '120px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('others', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>

          <FormField label="Client">
            <input
              type="text"
              defaultValue={liability.client || ''}
              placeholder="R 0"
              className={`table-input ${liability.client ? '' : 'text-neutral-400'}`}
              style={{ width: 'fit-content', minWidth: '120px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('client', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>
        </div>
      </FieldGroup>
    </div>
  );
}