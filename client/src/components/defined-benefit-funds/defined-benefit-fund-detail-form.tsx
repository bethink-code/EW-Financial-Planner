import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { DefinedBenefitFund } from '@shared/schema';
import { queryClient } from '@/lib/queryClient';
import EntityOwnerSelector from '@/components/common/entity-owner-selector';
import { ActionButtonGroup, DeleteButton } from '@/components/ui/action-buttons';
import { formatCurrencyValue, formatPercentageValue, formatYearsValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';
import { getFieldClass } from '@/lib/field-types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface DefinedBenefitFundDetailFormProps {
  fund: DefinedBenefitFund;
  onDelete: (id: number) => void;
}

export function DefinedBenefitFundDetailForm({ fund, onDelete }: DefinedBenefitFundDetailFormProps) {
  const [isUpdating, setIsUpdating] = useState(false);

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
    if (field === 'pensionIncomeIncrease') {
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
    <div className="space-y-12 p-6 bg-white">
      {/* Header with title and actions */}
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-semibold text-neutral-800">
          {fund.description || 'Untitled Fund'}
        </h2>
        <ActionButtonGroup>
          <DeleteButton
            onClick={() => onDelete(fund.id)}
            disabled={isUpdating}
          />
        </ActionButtonGroup>
      </div>

      {/* Overview Section */}
      <div className="space-y-6">
        <h3 className="text-sm font-medium text-neutral-600 uppercase tracking-wide">Overview</h3>
        
        <div className="grid gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fund Description
            </label>
            <input
              type="text"
              defaultValue={fund.description}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getValueClass(fund.description, 'text')}`}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('description', e.target.value)}
              disabled={isUpdating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Owners & Ownership Percentages
            </label>
            <EntityOwnerSelector
              policyId={fund.id}
              owners={fund.owners || []}
              ownershipPercentages={fund.ownershipPercentages || []}
              onOwnerChange={handleOwnerChange}
              onOwnershipPercentageChange={handleOwnershipPercentageChange}
              onAddOwner={handleAddOwner}
              onRemoveOwner={handleRemoveOwner}
              rowIndex={0}
              disabled={isUpdating}
            />
          </div>
        </div>
      </div>

      {/* Fund Details Section */}
      <div className="space-y-6">
        <h3 className="text-sm font-medium text-neutral-600 uppercase tracking-wide">Fund Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Service
            </label>
            <input
              type="text"
              defaultValue={fund.yearsOfService}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getValueClass(fund.yearsOfService, 'years')}`}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('yearsOfService', e.target.value)}
              disabled={isUpdating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Final Monthly Salary
            </label>
            <input
              type="text"
              defaultValue={fund.finalMonthlySalary}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getValueClass(fund.finalMonthlySalary, 'currency')}`}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('finalMonthlySalary', e.target.value)}
              disabled={isUpdating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Death Lump Sum
            </label>
            <input
              type="text"
              defaultValue={fund.deathLumpSum}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getValueClass(fund.deathLumpSum, 'currency')}`}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('deathLumpSum', e.target.value)}
              disabled={isUpdating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Tax Free Amount
            </label>
            <input
              type="text"
              defaultValue={fund.additionalTaxFreeAmount}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getValueClass(fund.additionalTaxFreeAmount, 'currency')}`}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('additionalTaxFreeAmount', e.target.value)}
              disabled={isUpdating}
            />
          </div>
        </div>
      </div>

      {/* Pension Income at Death Section */}
      <div className="space-y-6">
        <h3 className="text-sm font-medium text-neutral-600 uppercase tracking-wide">Pension Income at Death</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <input
              type="text"
              defaultValue={fund.pensionIncomeAmount}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getValueClass(fund.pensionIncomeAmount, 'currency')}`}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('pensionIncomeAmount', e.target.value)}
              disabled={isUpdating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Increase
            </label>
            <input
              type="text"
              defaultValue={fund.pensionIncomeIncrease}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getValueClass(fund.pensionIncomeIncrease, 'percentage')}`}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleInputBlur('pensionIncomeIncrease', e.target.value)}
              disabled={isUpdating}
            />
          </div>

          {/* Years/Percentage Toggle */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Switch
                id="pension-toggle"
                checked={fund.pensionIncomeCheckbox}
                onCheckedChange={handleToggleChange}
                disabled={isUpdating}
                className="data-[state=checked]:bg-blue-600"
              />
              <Label htmlFor="pension-toggle" className="text-sm font-medium text-gray-700">
                {fund.pensionIncomeCheckbox ? 'Years Mode' : 'Percentage Mode'}
              </Label>
            </div>

            {fund.pensionIncomeCheckbox && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pension Income Years
                </label>
                <input
                  type="text"
                  defaultValue={fund.pensionIncomeYears}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getValueClass(fund.pensionIncomeYears, 'years')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur('pensionIncomeYears', e.target.value)}
                  disabled={isUpdating}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}