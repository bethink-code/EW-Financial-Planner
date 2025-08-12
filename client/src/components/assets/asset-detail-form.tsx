import { useState, useCallback, useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Assets } from '@shared/assets-schema';
import { queryClient } from '@/lib/queryClient';
import { FieldGroup, FormField } from '@/components/common/grouped-detail-form';
import { formatCurrencyValue, formatPercentageValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';
import { parseEntityOwnership, setEntityOwnership, getEntityDisplayName, type ClientEntity } from '@/lib/entity-columns-utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface AssetDetailFormProps {
  asset: Assets;
  onDelete: (id: number) => void;
  onDuplicate?: (asset: Assets) => void;
}

export function AssetDetailForm({ asset, onDelete, onDuplicate }: AssetDetailFormProps) {
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
    mutationFn: async ({ updates }: { updates: Partial<Assets> }) => {
      const response = await fetch(`/api/assets/${asset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update asset');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      setIsUpdating(false);
    },
    onError: () => setIsUpdating(false)
  });

  const handleUpdate = useCallback((field: keyof Assets, value: string | boolean) => {
    setIsUpdating(true);
    updateMutation.mutate({ updates: { [field]: value } });
  }, [updateMutation]);

  const handleInputBlur = useCallback((field: keyof Assets, value: string) => {
    let formattedValue: string;
    if (['marketValue', 'estate', 'others', 'client'].includes(field)) {
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
    const newOwnership = setEntityOwnership(asset.entityOwnership, entityDisplayName, formattedValue);
    handleUpdate('entityOwnership', newOwnership);
  }, [asset.entityOwnership, handleUpdate]);

  const handleBooleanChange = useCallback((field: keyof Assets, checked: boolean) => {
    handleUpdate(field, checked);
  }, [handleUpdate]);

  // Parse current ownership
  const ownership = useMemo(() => parseEntityOwnership(asset.entityOwnership), [asset.entityOwnership]);

  return (
    <div className="space-y-12 p-6 bg-white">
      {/* Header with title and actions */}
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-semibold text-neutral-800">
          {asset.description || 'Untitled Asset'}
        </h2>
        <div className="flex gap-2">
          {onDuplicate && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDuplicate(asset)}
              disabled={isUpdating}
            >
              Duplicate
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onDelete(asset.id)}
            disabled={isUpdating}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Group 1: Overview */}
      <FieldGroup title="Overview">
        <div className="space-y-4">
          <FormField label="Asset Description">
            <input
              type="text"
              defaultValue={asset.description || ''}
              placeholder="Enter details ..."
              className={`table-input ${asset.description ? '' : 'text-neutral-400'}`}
              style={{ width: 'fit-content', minWidth: '200px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('description', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>
          
          <FormField label="Category">
            <Select
              value={asset.section || ''}
              onValueChange={(value) => handleUpdate('section', value)}
              disabled={isUpdating}
            >
              <SelectTrigger style={{ width: 'fit-content', minWidth: '150px' }}>
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PROPERTY">Property</SelectItem>
                <SelectItem value="VEHICLES">Vehicles</SelectItem>
                <SelectItem value="INVESTMENTS">Investments</SelectItem>
                <SelectItem value="CASH">Cash & Bank</SelectItem>
                <SelectItem value="PERSONAL">Personal Assets</SelectItem>
                <SelectItem value="BUSINESS">Business Assets</SelectItem>
                <SelectItem value="OTHER">Other Assets</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </FieldGroup>

      {/* Group 2: Asset Details */}
      <FieldGroup title="Asset Details">
        <div className="grid grid-cols-2 gap-x-3 gap-y-4" style={{ width: 'fit-content' }}>
          <FormField label="Market Value">
            <input
              type="text"
              defaultValue={asset.marketValue || ''}
              placeholder="R 0"
              className={`table-input ${asset.marketValue ? '' : 'text-neutral-400'}`}
              style={{ width: 'fit-content', minWidth: '120px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('marketValue', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>

          <FormField label="Included in Calculations">
            <div className="flex items-center space-x-3">
              <Switch
                checked={asset.included}
                onCheckedChange={(checked) => handleBooleanChange('included', checked)}
                disabled={isUpdating}
                className="data-[state=checked]:bg-blue-600"
              />
              <Label className="text-sm font-medium text-gray-700">
                {asset.included ? 'Included' : 'Excluded'}
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

      {/* Group 4: Distribution */}
      <FieldGroup title="Distribution">
        <div className="grid grid-cols-3 gap-x-3 gap-y-4" style={{ width: 'fit-content' }}>
          <FormField label="Estate">
            <input
              type="text"
              defaultValue={asset.estate || ''}
              placeholder="R 0"
              className={`table-input ${asset.estate ? '' : 'text-neutral-400'}`}
              style={{ width: 'fit-content', minWidth: '120px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('estate', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>

          <FormField label="Others">
            <input
              type="text"
              defaultValue={asset.others || ''}
              placeholder="R 0"
              className={`table-input ${asset.others ? '' : 'text-neutral-400'}`}
              style={{ width: 'fit-content', minWidth: '120px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('others', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>

          <FormField label="Client">
            <input
              type="text"
              defaultValue={asset.client || ''}
              placeholder="R 0"
              className={`table-input ${asset.client ? '' : 'text-neutral-400'}`}
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