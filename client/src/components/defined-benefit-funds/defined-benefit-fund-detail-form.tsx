import { useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { DefinedBenefitFund } from '@shared/schema';
import { queryClient } from '@/lib/queryClient';
import EntityOwnerSelector from '@/components/common/entity-owner-selector';
import { FieldGroup, FormField, GroupedDetailForm } from '@/components/common/grouped-detail-form';
import { formatCurrencyValue, formatPercentageValue, formatYearsValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';
import { getFieldClass } from '@/lib/field-types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useRetirementProjection } from '@/hooks/use-retirement-projection';

interface DefinedBenefitFundDetailFormProps {
  fund: DefinedBenefitFund;
}

export function DefinedBenefitFundDetailForm({ fund }: DefinedBenefitFundDetailFormProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [location] = useLocation();
  const showRetirementProjection = location.startsWith('/needs/retirement');
  const { data: projection } = useRetirementProjection();
  const perVehicle = showRetirementProjection
    ? projection?.definedBenefitFunds.find(f => f.id === fund.id)
    : undefined;
  const formatRand = (n: number | undefined) =>
    formatCurrencyValue(Math.round(n ?? 0).toString());

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ updates }: { updates: Partial<DefinedBenefitFund> }) => {
      const response = await fetch(`/api/defined-benefit-funds/${fund.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update fund');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/defined-benefit-funds'] });
      setIsUpdating(false);
    },
    onError: () => setIsUpdating(false)
  });

  const handleUpdate = useCallback((field: keyof DefinedBenefitFund, value: string | string[] | boolean) => {
    setIsUpdating(true);
    updateMutation.mutate({ updates: { [field]: value } });
  }, [updateMutation]);

  const handleInputBlur = useCallback((field: keyof DefinedBenefitFund, value: string) => {
    let formattedValue: string;
    if (field === 'pensionIncomeIncrease' || field === 'growthRate') {
      formattedValue = formatPercentageValue(value);
    } else if (['finalMonthlySalary', 'deathLumpSum', 'additionalTaxFreeAmount', 'pensionIncomeAmount'].includes(field)) {
      formattedValue = formatCurrencyValue(value);
    } else if (field === 'yearsOfService' || field === 'pensionIncomeYears') {
      formattedValue = formatYearsValue(value);
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

  const handleOwnerChange = useCallback((policyId: number, ownerIndex: number, newOwner: string) => {
    const updatedOwners = [...(fund.owners || [])];
    updatedOwners[ownerIndex] = newOwner;
    handleUpdate('owners', updatedOwners);
  }, [fund.owners, handleUpdate]);

  const handleOwnershipPercentageChange = useCallback((policyId: number, ownerIndex: number, newPercentage: string) => {
    const updatedPercentages = [...(fund.ownershipPercentages || [])];
    updatedPercentages[ownerIndex] = newPercentage;
    handleUpdate('ownershipPercentages', updatedPercentages);
  }, [fund.ownershipPercentages, handleUpdate]);

  const handleAddOwner = useCallback((policyId: number) => {
    const updatedOwners = [...(fund.owners || []), ''];
    const updatedPercentages = [...(fund.ownershipPercentages || []), '0%'];
    handleUpdate('owners', updatedOwners);
    handleUpdate('ownershipPercentages', updatedPercentages);
  }, [fund.owners, fund.ownershipPercentages, handleUpdate]);

  const handleRemoveOwner = useCallback((policyId: number, ownerIndex: number) => {
    const updatedOwners = (fund.owners || []).filter((_, index) => index !== ownerIndex);
    const updatedPercentages = (fund.ownershipPercentages || []).filter((_, index) => index !== ownerIndex);
    handleUpdate('owners', updatedOwners);
    handleUpdate('ownershipPercentages', updatedPercentages);
  }, [fund.owners, fund.ownershipPercentages, handleUpdate]);

  const handleToggleChange = useCallback((checked: boolean) => {
    handleUpdate('pensionIncomeCheckbox', checked);
  }, [handleUpdate]);

  return (
    <GroupedDetailForm>
      {/* Group 1: Overview */}
      <FieldGroup title="Overview">
        <div className="space-y-4">
          <FormField label="Fund Description">
            <input
              type="text"
              defaultValue={fund.description || ''}
              placeholder="Enter details ..."
              className={`table-input ${fund.description ? '' : 'text-neutral-400'}`}
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
                {Array.from({ length: Math.max(fund.owners?.length || 1, 1) }, (_, rowIndex) => (
                  <tr key={`owner-table-row-${rowIndex}`}>
                    <EntityOwnerSelector
                      policyId={fund.id}
                      owners={fund.owners || []}
                      ownershipPercentages={fund.ownershipPercentages || []}
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

      {/* Group 2: Fund Details */}
      <FieldGroup title="Fund Details">
        <div className="grid grid-cols-2 gap-x-3 gap-y-4" style={{ width: 'fit-content' }}>
          <FormField label="Years of Service">
            <input
              type="text"
              defaultValue={fund.yearsOfService || ''}
              placeholder="0 years"
              className={`table-input ${fund.yearsOfService ? '' : 'text-neutral-400'}`}
              style={{ width: 'fit-content', minWidth: '120px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('yearsOfService', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>

          <FormField label="Final Monthly Salary">
            <input
              type="text"
              defaultValue={fund.finalMonthlySalary || ''}
              placeholder="R 0"
              className={`table-input ${fund.finalMonthlySalary ? '' : 'text-neutral-400'}`}
              style={{ width: 'fit-content', minWidth: '120px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('finalMonthlySalary', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>

          <FormField label="Death Lump Sum">
            <input
              type="text"
              defaultValue={fund.deathLumpSum || ''}
              placeholder="R 0"
              className={`table-input ${fund.deathLumpSum ? '' : 'text-neutral-400'}`}
              style={{ width: 'fit-content', minWidth: '120px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('deathLumpSum', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>

          <FormField label="Additional Tax Free Amount">
            <input
              type="text"
              defaultValue={fund.additionalTaxFreeAmount || ''}
              placeholder="R 0"
              className={`table-input ${fund.additionalTaxFreeAmount ? '' : 'text-neutral-400'}`}
              style={{ width: 'fit-content', minWidth: '120px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('additionalTaxFreeAmount', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>
        </div>
      </FieldGroup>

      {/* Group 3: Pension Income at Death */}
      <FieldGroup title="Pension Income at Death">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-x-3 gap-y-4" style={{ width: 'fit-content' }}>
            <FormField label="Amount">
              <input
                type="text"
                defaultValue={fund.pensionIncomeAmount || ''}
                placeholder="R 0"
                className={`table-input ${fund.pensionIncomeAmount ? '' : 'text-neutral-400'}`}
                style={{ width: 'fit-content', minWidth: '120px' }}
                onFocus={handleDefaultValueFocus}
                onBlur={(e) => handleInputBlur('pensionIncomeAmount', e.target.value)}
                disabled={isUpdating}
              />
            </FormField>

            <FormField label="Increase">
              <input
                type="text"
                defaultValue={fund.pensionIncomeIncrease || ''}
                placeholder="0%"
                className={`table-input ${fund.pensionIncomeIncrease ? '' : 'text-neutral-400'}`}
                style={{ width: 'fit-content', minWidth: '120px' }}
                onFocus={handleDefaultValueFocus}
                onBlur={(e) => handleInputBlur('pensionIncomeIncrease', e.target.value)}
                disabled={isUpdating}
              />
            </FormField>
          </div>

          {/* Years/Percentage Toggle */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Switch
                id="pension-toggle"
                checked={fund.pensionIncomeCheckbox}
                onCheckedChange={handleToggleChange}
                disabled={isUpdating}
              />
              <Label htmlFor="pension-toggle" className="text-sm font-medium text-gray-700">
                {fund.pensionIncomeCheckbox ? 'Years Mode' : 'Percentage Mode'}
              </Label>
            </div>

            {fund.pensionIncomeCheckbox && (
              <FormField label="Pension Income Years">
                <input
                  type="text"
                  defaultValue={fund.pensionIncomeYears || ''}
                  placeholder="0 years"
                  className={`table-input ${fund.pensionIncomeYears ? '' : 'text-neutral-400'}`}
                  style={{ width: 'fit-content', minWidth: '120px' }}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur('pensionIncomeYears', e.target.value)}
                  disabled={isUpdating}
                />
              </FormField>
            )}
          </div>
        </div>
      </FieldGroup>

      {/* Group 4: Retirement Projection — only rendered inside the Retirement need flow */}
      {showRetirementProjection && (
      <FieldGroup title="Retirement Projection">
        <div className="grid grid-cols-3 gap-x-3 gap-y-4 items-end" style={{ width: 'fit-content' }}>
          <FormField label="Growth Rate">
            <input
              type="text"
              defaultValue={fund.growthRate || '10%'}
              placeholder="10%"
              className={`table-input ${getValueClass(fund.growthRate || '10%', 'percentage')}`}
              style={{ width: 'fit-content', minWidth: '120px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('growthRate', e.target.value)}
              disabled={isUpdating}
            />
          </FormField>

          <FormField label="Capital at Retirement">
            <div className="calculated-field" style={{ minWidth: '140px' }}>
              {formatRand(perVehicle?.capitalAtRetirement)}
            </div>
          </FormField>

          <FormField label="Value in Current Terms">
            <div className="calculated-field" style={{ minWidth: '140px' }}>
              {formatRand(perVehicle?.valueInCurrentTerms)}
            </div>
          </FormField>
        </div>
      </FieldGroup>
      )}
    </GroupedDetailForm>
  );
}