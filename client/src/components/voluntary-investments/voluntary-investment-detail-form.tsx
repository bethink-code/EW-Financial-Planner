import { useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { VoluntaryInvestment } from '@shared/schema';
import { queryClient } from '@/lib/queryClient';
import EntityOwnerSelector from '@/components/common/entity-owner-selector';
import { FieldGroup, FormField } from '@/components/common/grouped-detail-form';
import { formatCurrencyValue, formatPercentageValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DetailFormHeader } from '@/components/common/detail-form-header';

interface VoluntaryInvestmentDetailFormProps {
  investment: VoluntaryInvestment;
  onDelete: (id: number) => void;
  onDuplicate?: (investment: VoluntaryInvestment) => void;
}

export function VoluntaryInvestmentDetailForm({ investment, onDelete, onDuplicate }: VoluntaryInvestmentDetailFormProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [location] = useLocation();
  const showRetirementProjection = location.startsWith('/needs/retirement');

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ updates }: { updates: Partial<VoluntaryInvestment> }) => {
      const response = await fetch(`/api/voluntary-investments/${investment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update investment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/voluntary-investments'] });
      setIsUpdating(false);
    },
    onError: () => setIsUpdating(false)
  });

  const handleUpdate = useCallback((field: keyof VoluntaryInvestment, value: string | string[] | boolean) => {
    setIsUpdating(true);
    updateMutation.mutate({ updates: { [field]: value } });
  }, [updateMutation]);

  const handleInputBlur = useCallback((field: keyof VoluntaryInvestment, value: string) => {
    let formattedValue: string;
    if (['liquidationPercentage', 'contributionEscalation', 'growthRate', 'incomeIncrease'].includes(field)) {
      formattedValue = formatPercentageValue(value);
    } else if (['baseCost', 'marketValue', 'spouse', 'others', 'monthlyContribution'].includes(field)) {
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

  const handleOwnerChange = useCallback((investmentId: number, ownerIndex: number, newOwner: string) => {
    const updatedOwners = [...(investment.owners || [])];
    updatedOwners[ownerIndex] = newOwner;
    handleUpdate('owners', updatedOwners);
  }, [investment.owners, handleUpdate]);

  const handleOwnershipPercentageChange = useCallback((investmentId: number, ownerIndex: number, newPercentage: string) => {
    const updatedPercentages = [...(investment.ownershipPercentages || [])];
    updatedPercentages[ownerIndex] = newPercentage;
    handleUpdate('ownershipPercentages', updatedPercentages);
  }, [investment.ownershipPercentages, handleUpdate]);

  const handleAddOwner = useCallback((investmentId: number) => {
    const updatedOwners = [...(investment.owners || []), ''];
    const updatedPercentages = [...(investment.ownershipPercentages || []), '0%'];
    handleUpdate('owners', updatedOwners);
    handleUpdate('ownershipPercentages', updatedPercentages);
  }, [investment.owners, investment.ownershipPercentages, handleUpdate]);

  const handleRemoveOwner = useCallback((investmentId: number, ownerIndex: number) => {
    const updatedOwners = (investment.owners || []).filter((_, index) => index !== ownerIndex);
    const updatedPercentages = (investment.ownershipPercentages || []).filter((_, index) => index !== ownerIndex);
    handleUpdate('owners', updatedOwners);
    handleUpdate('ownershipPercentages', updatedPercentages);
  }, [investment.owners, investment.ownershipPercentages, handleUpdate]);

  const handleBooleanChange = useCallback((field: keyof VoluntaryInvestment, checked: boolean) => {
    handleUpdate(field, checked);
  }, [handleUpdate]);

  return (
    <div className="space-y-10 p-6 bg-white">
      <DetailFormHeader
        title={investment.description}
        emptyTitle="Untitled Investment"
        onDuplicate={onDuplicate ? () => onDuplicate(investment) : undefined}
        onDelete={() => onDelete(investment.id)}
        disabled={isUpdating}
      />

      {/* Group 1: Overview */}
      <FieldGroup title="Overview">
        <div className="space-y-4">
          <FormField label="Investment Description">
            <input
              key={`description-${investment.id}`}
              type="text"
              defaultValue={investment.description || ''}
              placeholder="Enter details ..."
              className={`table-input ${investment.description ? '' : 'text-neutral-400'}`}
              style={{ width: 'fit-content', minWidth: '200px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('description', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>
          
          <FormField label="Owners & Ownership Percentages">
            <table className="border-collapse" style={{ tableLayout: 'fixed', width: 'fit-content', minWidth: '380px' }}>
              <thead>
                <tr>
                  <th className="text-center" style={{ width: '60px' }}>
                    ACTIONS
                  </th>
                  <th className="text-left" style={{ width: '200px' }}>
                    OWNER NAME
                  </th>
                  <th className="text-right" style={{ width: '120px' }}>
                    OWNERSHIP %
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.max(investment.owners?.length || 1, 1) }, (_, rowIndex) => (
                  <tr key={`owner-table-row-${rowIndex}`}>
                    <EntityOwnerSelector
                      policyId={investment.id}
                      owners={investment.owners || []}
                      ownershipPercentages={investment.ownershipPercentages || []}
                      onOwnerChange={handleOwnerChange}
                      onOwnershipPercentageChange={handleOwnershipPercentageChange}
                      onAddOwner={handleAddOwner}
                      onRemoveOwner={handleRemoveOwner}
                      rowIndex={rowIndex}
                      disabled={isUpdating}
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          </FormField>
        </div>
      </FieldGroup>

      {/* Group 2: Investment Details */}
      <FieldGroup title="Investment Details">
        <div className="grid grid-cols-2 gap-x-3 gap-y-4" style={{ width: 'fit-content' }}>
          <FormField label="Base Cost">
            <input
              key={`baseCost-${investment.id}`}
              type="text"
              defaultValue={investment.baseCost || ''}
              placeholder="R 0"
              className={`table-input ${investment.baseCost ? '' : 'text-neutral-400'}`}
              style={{ width: 'fit-content', minWidth: '120px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('baseCost', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>

          <FormField label="Market Value">
            <input
              key={`marketValue-${investment.id}`}
              type="text"
              defaultValue={investment.marketValue || ''}
              placeholder="R 0"
              className={`table-input ${investment.marketValue ? '' : 'text-neutral-400'}`}
              style={{ width: 'fit-content', minWidth: '120px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('marketValue', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>

          <FormField label="Liquidation Percentage">
            <input
              key={`liquidationPercentage-${investment.id}`}
              type="text"
              defaultValue={investment.liquidationPercentage || ''}
              placeholder="0%"
              className={`table-input ${investment.liquidationPercentage ? '' : 'text-neutral-400'}`}
              style={{ width: 'fit-content', minWidth: '120px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('liquidationPercentage', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>
        </div>
      </FieldGroup>

      {/* Group 3: Bequeath To */}
      <FieldGroup title="Bequeath To">
        <div className="grid grid-cols-2 gap-x-3 gap-y-4" style={{ width: 'fit-content' }}>
          <FormField label="Spouse">
            <input
              key={`spouse-${investment.id}`}
              type="text"
              defaultValue={investment.spouse || ''}
              placeholder="R 0"
              className={`table-input ${investment.spouse ? '' : 'text-neutral-400'}`}
              style={{ width: 'fit-content', minWidth: '120px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('spouse', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>

          <FormField label="Others">
            <input
              key={`others-${investment.id}`}
              type="text"
              defaultValue={investment.others || ''}
              placeholder="R 0"
              className={`table-input ${investment.others ? '' : 'text-neutral-400'}`}
              style={{ width: 'fit-content', minWidth: '120px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('others', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>
        </div>
      </FieldGroup>

      {/* Group 4: Exclusions */}
      <FieldGroup title="Exclusions">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-x-3 gap-y-4" style={{ width: 'fit-content' }}>
            <FormField label="Excluded from Joint Estate">
              <div className="flex items-center space-x-3">
                <Switch
                  checked={investment.excludedFromJointEstate}
                  onCheckedChange={(checked) => handleBooleanChange('excludedFromJointEstate', checked)}
                  disabled={isUpdating}
                />
                <Label className="text-sm font-medium text-gray-700">
                  {investment.excludedFromJointEstate ? 'Excluded' : 'Included'}
                </Label>
              </div>
            </FormField>

            <FormField label="Excluded from Estate Duty">
              <div className="flex items-center space-x-3">
                <Switch
                  checked={investment.excludedFromEstateDuty}
                  onCheckedChange={(checked) => handleBooleanChange('excludedFromEstateDuty', checked)}
                  disabled={isUpdating}
                />
                <Label className="text-sm font-medium text-gray-700">
                  {investment.excludedFromEstateDuty ? 'Excluded' : 'Included'}
                </Label>
              </div>
            </FormField>

            <FormField label="Excluded from CGT">
              <div className="flex items-center space-x-3">
                <Switch
                  checked={investment.excludedFromCGT}
                  onCheckedChange={(checked) => handleBooleanChange('excludedFromCGT', checked)}
                  disabled={isUpdating}
                />
                <Label className="text-sm font-medium text-gray-700">
                  {investment.excludedFromCGT ? 'Excluded' : 'Included'}
                </Label>
              </div>
            </FormField>

            <FormField label="Excluded from Executors Fees">
              <div className="flex items-center space-x-3">
                <Switch
                  checked={investment.excludedFromExecutorsFees}
                  onCheckedChange={(checked) => handleBooleanChange('excludedFromExecutorsFees', checked)}
                  disabled={isUpdating}
                />
                <Label className="text-sm font-medium text-gray-700">
                  {investment.excludedFromExecutorsFees ? 'Excluded' : 'Included'}
                </Label>
              </div>
            </FormField>
          </div>
        </div>
      </FieldGroup>

      {/* Group 5: Retirement Projection — only rendered inside the Retirement need flow */}
      {showRetirementProjection && (
      <FieldGroup title="Retirement Projection">
        <div className="grid grid-cols-2 gap-x-3 gap-y-4" style={{ width: 'fit-content' }}>
          <FormField label="Monthly Contribution">
            <input
              key={`monthlyContribution-${investment.id}`}
              type="text"
              defaultValue={investment.monthlyContribution || 'R 0'}
              placeholder="R 0"
              className={`table-input ${getValueClass(investment.monthlyContribution || 'R 0', 'currency')}`}
              style={{ width: 'fit-content', minWidth: '120px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('monthlyContribution', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>

          <FormField label="Contribution Escalation">
            <input
              key={`contributionEscalation-${investment.id}`}
              type="text"
              defaultValue={investment.contributionEscalation || '0%'}
              placeholder="0%"
              className={`table-input ${getValueClass(investment.contributionEscalation || '0%', 'percentage')}`}
              style={{ width: 'fit-content', minWidth: '120px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('contributionEscalation', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>

          <FormField label="Growth Rate">
            <input
              key={`growthRate-${investment.id}`}
              type="text"
              defaultValue={investment.growthRate || '10%'}
              placeholder="10%"
              className={`table-input ${getValueClass(investment.growthRate || '10%', 'percentage')}`}
              style={{ width: 'fit-content', minWidth: '120px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('growthRate', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>

          <FormField label="Income Increase at Retirement">
            <input
              key={`incomeIncrease-${investment.id}`}
              type="text"
              defaultValue={investment.incomeIncrease || '0%'}
              placeholder="0%"
              className={`table-input ${getValueClass(investment.incomeIncrease || '0%', 'percentage')}`}
              style={{ width: 'fit-content', minWidth: '120px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('incomeIncrease', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>
        </div>
      </FieldGroup>
      )}
    </div>
  );
}