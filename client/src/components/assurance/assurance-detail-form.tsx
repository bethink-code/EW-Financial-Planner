import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Assurance, ClientDetails } from '@shared/schema';
import { GroupedDetailForm, FieldGroup, FormField } from '@/components/common/grouped-detail-form';
import EntityOwnerSelector from '@/components/common/entity-owner-selector';
import EntityBeneficiarySelector from '@/components/common/entity-beneficiary-selector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { handleDefaultValueFocus, formatYearsValue, formatPercentageValue, getValueClass } from '@/lib/formatting';
import { getFieldClass } from '@/lib/design-tokens';
import { getCellClass } from '@/lib/field-types';

interface AssuranceDetailFormProps {
  policy: Assurance;
  onUpdate: (id: number, field: keyof Assurance, value: string | boolean | string[]) => void;
  onDuplicate: (policy: Assurance) => void;
  onDelete: (id: number) => void;
  onOwnerChange: (policyId: number, ownerIndex: number, newOwner: string) => void;
  onLifeAssuredChange: (policyId: number, lifeAssuredIndex: number, newLifeAssured: string) => void;
  onDeathBenefitChange: (policyId: number, deathBenefitIndex: number, newDeathBenefit: string) => void;
  onOwnershipPercentageChange: (policyId: number, ownerIndex: number, newPercentage: string) => void;
  onAddOwner: (policyId: number) => void;
  onRemoveOwner: (policyId: number, ownerIndex: number) => void;
  onBeneficiaryChange: (policyId: number, beneficiaryIndex: number, newBeneficiary: string) => void;
  onBeneficiaryPercentageChange: (policyId: number, beneficiaryIndex: number, newPercentage: string) => void;
  onAddBeneficiary: (policyId: number) => void;
  onRemoveBeneficiary: (policyId: number, beneficiaryIndex: number) => void;
  disabled?: boolean;
}

/**
 * AssuranceDetailForm - Structured detail form for assurance policies in hybrid view
 * Maintains logical groupings from the table structure without flattening the hierarchy
 */
export function AssuranceDetailForm({
  policy,
  onUpdate,
  onDuplicate,
  onDelete,
  onOwnerChange,
  onLifeAssuredChange,
  onDeathBenefitChange,
  onOwnershipPercentageChange,
  onAddOwner,
  onRemoveOwner,
  onBeneficiaryChange,
  onBeneficiaryPercentageChange,
  onAddBeneficiary,
  onRemoveBeneficiary,
  disabled = false
}: AssuranceDetailFormProps) {
  
  const handleTextFieldBlur = (field: keyof Assurance, value: string) => {
    onUpdate(policy.id, field, value);
  };

  const handleCheckboxChange = (field: keyof Assurance, checked: boolean) => {
    onUpdate(policy.id, field, checked);
  };

  // Fetch entities for dropdowns
  const { data: entities = [] } = useQuery<ClientDetails[]>({
    queryKey: ["/api/client-details"]
  });

  // Helper functions from table
  const isAmountYearsMode = (policy: Assurance, rowIndex: number): boolean => {
    return (policy.amountToggles || [])[rowIndex] === true;
  };

  const getAmountControlsEnabled = (policy: Assurance, isPending: boolean): boolean => {
    return !isPending; // Simple check - can be enhanced as needed
  };

  const handleArrayFieldUpdate = (policyId: number, field: string, index: number, value: any) => {
    onUpdate(policyId, field, { index, value });
  };

  return (
    <GroupedDetailForm>
      {/* Header with Actions */}
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-semibold text-neutral-800">
          {policy.description || 'Untitled Policy'}
        </h2>
        <ActionButtonGroup>
          <DuplicateButton 
            onClick={() => onDuplicate(policy)} 
            disabled={disabled}
          />
          <DeleteButton 
            onClick={() => onDelete(policy.id)} 
            disabled={disabled}
          />
        </ActionButtonGroup>
      </div>

      {/* Group 1: Overview (Owner → Life Assured → Death Benefit) */}
      <FieldGroup title="Overview">
        <div className="space-y-4">
          <FormField label="Policy Description">
            <input
              type="text"
              defaultValue={policy.description || ''}
              placeholder="Enter details ..."
              className={`table-input ${policy.description ? '' : 'text-neutral-400'}`}
              style={{ width: 'fit-content', minWidth: '200px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleTextFieldBlur('description', e.target.value)}
              disabled={disabled}
            />
          </FormField>
          
          <FormField label="Owners & Life Assured & Death Benefits">
            <table className="border-collapse">
              <tbody>
                {Array.from({ length: Math.max(policy.owners.length, 1) }, (_, rowIndex) => (
                  <tr key={`owner-table-row-${rowIndex}`} className="border-b border-neutral-200 bg-white">
                    <td className="px-1 py-1 border-r border-neutral-200">
                      <EntityOwnerSelector
                        policyId={policy.id}
                        owners={policy.owners}
                        ownershipPercentages={policy.ownershipPercentages || ["100%"]}
                        onOwnerChange={onOwnerChange}
                        onOwnershipPercentageChange={onOwnershipPercentageChange}
                        onAddOwner={onAddOwner}
                        onRemoveOwner={onRemoveOwner}
                        rowIndex={rowIndex}
                        disabled={disabled}
                      />
                    </td>
                    <td className="px-1 py-1 border-r border-neutral-200">
                      <Select
                        value={(policy.lifeAssured || [])[rowIndex] || "none"}
                        onValueChange={(value) => {
                          const valueToStore = value === "none" ? "" : value;
                          onLifeAssuredChange(policy.id, rowIndex, valueToStore);
                        }}
                        disabled={disabled}
                      >
                        <SelectTrigger className="table-input w-full">
                          <SelectValue placeholder="Select life assured..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Select life assured...</SelectItem>
                          {entities.map((client) => (
                            <SelectItem key={client.id} value={client.entityName}>
                              {client.entityName}
                              {client.entityType === "Primary entity" && " (Primary entity)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-1 py-1">
                      <input
                        type="text"
                        defaultValue={((policy.deathBenefits || [])[rowIndex] || "R 0")}
                        className={`${getFieldClass('currency')} ${getCellClass('currency')} ${getValueClass(((policy.deathBenefits || [])[rowIndex] || "R 0"), 'currency')}`}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => {
                          let value = e.target.value.trim();
                          value = value.replace(/[^\d.-]/g, '');
                          
                          if (value === '' || value === '0') {
                            onDeathBenefitChange(policy.id, rowIndex, 'R 0');
                            e.target.value = 'R 0';
                            return;
                          }
                          
                          if (!isNaN(parseFloat(value))) {
                            const numValue = parseFloat(value);
                            const formattedValue = `R ${numValue.toLocaleString()}`;
                            onDeathBenefitChange(policy.id, rowIndex, formattedValue);
                            e.target.value = formattedValue;
                          } else {
                            onDeathBenefitChange(policy.id, rowIndex, 'R 0');
                            e.target.value = 'R 0';
                          }
                        }}
                        disabled={disabled}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </FormField>
        </div>
      </FieldGroup>

      {/* Groups 2 & 3: Beneficiary Distribution & Amount Toggle Pattern (Related per-beneficiary) */}
      <FieldGroup title="Beneficiary Distribution">
        <div className="space-y-4">


          <FormField label="Beneficiaries & Controls">
            {/* Use actual table element with overflow wrapper for wide dropdown */}
            <table className="border-collapse">
              <tbody>
                  {Array.from({ length: Math.max(policy.owners.length, policy.beneficiaries.length) }, (_, rowIndex) => (
                    <tr key={`beneficiary-table-row-${rowIndex}`} className="border-b border-neutral-200 bg-white">
                      <td className="px-1 py-1 border-r border-neutral-200">
                        <EntityBeneficiarySelector
                          policyId={policy.id}
                          beneficiaries={policy.beneficiaries}
                          beneficiaryPercentages={policy.beneficiaryPercentages || ["100%"]}
                          onBeneficiaryChange={onBeneficiaryChange}
                          onBeneficiaryPercentageChange={onBeneficiaryPercentageChange}
                          onAddBeneficiary={onAddBeneficiary}
                          onRemoveBeneficiary={onRemoveBeneficiary}
                          rowIndex={rowIndex}
                          disabled={disabled}
                        />
                      </td>
                      <td className="px-1 py-1 border-r border-neutral-200">
                        {(() => {
                          const currentPercentage = (policy.beneficiaryPercentages || ["100%"])[rowIndex] || "0%";
                          // Calculate total death benefit across all Life Assured entries for this policy
                          const totalDeathBenefit = (policy.deathBenefits || []).reduce((sum, benefit) => {
                            return sum + (parseFloat(benefit?.replace(/[^\d.-]/g, '') || '0') || 0);
                          }, 0);
                          const percentage = parseFloat(currentPercentage.replace('%', '')) || 0;
                          const benefitSplit = Math.round((totalDeathBenefit * percentage) / 100);
                          
                          return (
                            <div className="calculated-field text-right">
                              R {benefitSplit.toLocaleString()}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-1 py-1 border-r border-neutral-200">
                        <input
                          key={`amount-${policy.id}-${rowIndex}`}
                          type="text"
                          defaultValue={policy.amount || "R 0"}
                          className={`${getFieldClass('amount')} ${getCellClass('amount')} ${getValueClass(policy.amount || "R 0", 'amount')}`}
                          onFocus={handleDefaultValueFocus}
                          onBlur={(e) => handleTextFieldBlur('amount', e.target.value)}
                          disabled={disabled}
                        />
                      </td>
                      <td className="px-1 py-1 border-r border-neutral-200">
                        <button
                          type="button"
                          onClick={() => {
                            const currentToggle = isAmountYearsMode(policy, rowIndex);
                            handleArrayFieldUpdate(policy.id, 'amountToggles', rowIndex, !currentToggle);
                          }}
                          className={`h-6 px-1 w-full bg-[#E8F3F8] border border-[#E0E0E0] text-[#016991] hover:bg-[#D1E7F0] rounded text-xs font-medium ${
                            !getAmountControlsEnabled(policy, disabled) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                          disabled={!getAmountControlsEnabled(policy, disabled)}
                        >
                          {isAmountYearsMode(policy, rowIndex) ? 'Y' : '%'}
                        </button>
                      </td>
                      <td className="px-1 py-1">
                        {isAmountYearsMode(policy, rowIndex) ? (
                          // Years Mode
                          <input
                            key={`amount-years-${policy.id}-${rowIndex}`}
                            type="text"
                            defaultValue={formatYearsValue((policy.amountYearsValues || ["0 years"])[rowIndex] || "0 years")}
                            className={`${getFieldClass('years')} ${getCellClass('years')} ${getValueClass((policy.amountYearsValues || ["0 years"])[rowIndex] || "0 years", 'years')} ${
                              !getAmountControlsEnabled(policy, disabled) ? 'bg-neutral-100 cursor-not-allowed' : ''
                            }`}
                            style={{minWidth: "80px", maxWidth: "80px"}}
                            onFocus={handleDefaultValueFocus}
                            onBlur={(e) => {
                              const formattedValue = formatYearsValue(e.target.value);
                              e.target.value = formattedValue;
                              handleArrayFieldUpdate(policy.id, 'amountYearsValues', rowIndex, formattedValue);
                            }}
                            disabled={!getAmountControlsEnabled(policy, disabled)}
                          />
                        ) : (
                          // Percentage Mode
                          <input
                            key={`amount-increase-${policy.id}-${rowIndex}`}
                            type="text"
                            defaultValue={(policy.amountIncreaseValues || ["0%"])[rowIndex] || "0%"}
                            className={`${getFieldClass('percentage')} ${getCellClass('percentage')} ${getValueClass((policy.amountIncreaseValues || ["0%"])[rowIndex] || "0%", 'percentage')} ${
                              !getAmountControlsEnabled(policy, disabled) ? 'bg-neutral-100 cursor-not-allowed' : ''
                            }`}
                            style={{minWidth: "50px", maxWidth: "65px"}}
                            onFocus={handleDefaultValueFocus}
                            onBlur={(e) => {
                              const formattedValue = formatPercentageValue(e.target.value);
                              e.target.value = formattedValue;
                              handleArrayFieldUpdate(policy.id, 'amountIncreaseValues', rowIndex, formattedValue);
                            }}
                            disabled={!getAmountControlsEnabled(policy, disabled)}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </FormField>
        </div>
      </FieldGroup>

      {/* Group 4: Policy-Level Financial Fields */}
      <FieldGroup title="Policy-Level Financial Details">
        <div className="flex flex-wrap gap-6">
          <FormField label="Premiums by Others">
            <input
              type="text"
              defaultValue={policy.premiumsByOthers || 'R 0'}
              className={`table-input text-right ${policy.premiumsByOthers === 'R 0' ? 'text-neutral-400' : ''}`}
              style={{ width: 'fit-content', minWidth: '120px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleTextFieldBlur('premiumsByOthers', e.target.value)}
              disabled={disabled}
            />
          </FormField>
          
          <FormField label="Collateral Session">
            <input
              type="text"
              defaultValue={policy.collateralSession || ''}
              placeholder="Enter details ..."
              className={`table-input text-right ${!policy.collateralSession ? 'text-neutral-400' : ''}`}
              style={{ width: 'fit-content', minWidth: '120px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleTextFieldBlur('collateralSession', e.target.value)}
              disabled={disabled}
            />
          </FormField>
        </div>

        {/* Policy-Level Checkboxes */}
        <div className="flex flex-wrap gap-6 pt-4 border-t border-neutral-200">
          <FormField label="Buy/Sell">
            <input
              type="checkbox"
              defaultChecked={false}
              className="rounded border-neutral-300"
              onChange={(e) => handleTextFieldBlur('buySell', e.target.checked ? 'checked' : 'unchecked')}
              disabled={disabled}
            />
          </FormField>
          
          <FormField label="Key Man">
            <input
              type="checkbox"
              defaultChecked={false}
              className="rounded border-neutral-300"
              onChange={(e) => handleTextFieldBlur('keyMan', e.target.checked ? 'checked' : 'unchecked')}
              disabled={disabled}
            />
          </FormField>
          
          <FormField label="Excluded Estate Duty">
            <input
              type="checkbox"
              defaultChecked={false}
              className="rounded border-neutral-300"
              onChange={(e) => handleTextFieldBlur('excludedEstateDuty', e.target.checked ? 'checked' : 'unchecked')}
              disabled={disabled}
            />
          </FormField>
          
          <FormField label="Excluded Provisions">
            <input
              type="checkbox"
              defaultChecked={false}
              className="rounded border-neutral-300"
              onChange={(e) => handleTextFieldBlur('excludedProvisions', e.target.checked ? 'checked' : 'unchecked')}
              disabled={disabled}
            />
          </FormField>
        </div>
      </FieldGroup>
    </GroupedDetailForm>
  );
}