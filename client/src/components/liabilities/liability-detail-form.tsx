import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Liabilities } from '@shared/liabilities-schema';
import { queryClient } from '@/lib/queryClient';
import { ActionButtonGroup, DeleteButton } from '@/components/ui/action-buttons';
import { FieldGroup, FormField } from '@/components/common/grouped-detail-form';
import { formatCurrencyValue, formatPercentageValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LiabilityDetailFormProps {
  liability: Liabilities;
  onDelete: (id: number) => void;
}

export function LiabilityDetailForm({ liability, onDelete }: LiabilityDetailFormProps) {
  const [isUpdating, setIsUpdating] = useState(false);

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
    } else if (['peterLambie', 'victoriaLambie', 'juniorLambie', 'lambiesFamilyTrust'].includes(field)) {
      formattedValue = formatPercentageValue(value);
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

  const handleBooleanChange = useCallback((field: keyof Liabilities, checked: boolean) => {
    handleUpdate(field, checked);
  }, [handleUpdate]);

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
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
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

      {/* Group 3: Owner(s) */}
      <FieldGroup title="Owner(s)">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <FormField label="Peter Lambie">
            <input
              type="text"
              defaultValue={liability.peterLambie || ''}
              placeholder="0%"
              className={`table-input ${liability.peterLambie && liability.peterLambie !== '0%' ? '' : 'text-neutral-400'}`}
              style={{ width: 'fit-content', minWidth: '80px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('peterLambie', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>

          <FormField label="Victoria Lambie">
            <input
              type="text"
              defaultValue={liability.victoriaLambie || ''}
              placeholder="0%"
              className={`table-input ${liability.victoriaLambie && liability.victoriaLambie !== '0%' ? '' : 'text-neutral-400'}`}
              style={{ width: 'fit-content', minWidth: '80px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('victoriaLambie', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>

          <FormField label="Junior Lambie">
            <input
              type="text"
              defaultValue={liability.juniorLambie || ''}
              placeholder="0%"
              className={`table-input ${liability.juniorLambie && liability.juniorLambie !== '0%' ? '' : 'text-neutral-400'}`}
              style={{ width: 'fit-content', minWidth: '80px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('juniorLambie', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>

          <FormField label="Lambies Family Trust">
            <input
              type="text"
              defaultValue={liability.lambiesFamilyTrust || ''}
              placeholder="0%"
              className={`table-input ${liability.lambiesFamilyTrust && liability.lambiesFamilyTrust !== '0%' ? '' : 'text-neutral-400'}`}
              style={{ width: 'fit-content', minWidth: '80px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('lambiesFamilyTrust', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>
        </div>
      </FieldGroup>

      {/* Group 4: Settlement */}
      <FieldGroup title="Settlement">
        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
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