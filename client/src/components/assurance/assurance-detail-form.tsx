import React from 'react';
import { Assurance } from '@shared/schema';
import { GroupedDetailForm, FieldGroup, FormField } from '@/components/common/grouped-detail-form';
import AssuranceOwnerSelector from '@/components/common/assurance-owner-selector';
import EntityBeneficiarySelector from '@/components/common/entity-beneficiary-selector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { handleDefaultValueFocus } from '@/lib/formatting';

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

      {/* Policy Details Group */}
      <FieldGroup title="Policy Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Description" className="md:col-span-2">
            <input
              type="text"
              defaultValue={policy.description || ''}
              placeholder="Enter details ..."
              className={`w-full table-input ${policy.description ? '' : 'text-neutral-400'}`}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleTextFieldBlur('description', e.target.value)}
              disabled={disabled}
            />
          </FormField>
          
          <FormField label="Life Assured">
            <input
              type="text"
              defaultValue=""
              placeholder="Enter details ..."
              className="w-full table-input text-neutral-400"
              disabled={disabled}
            />
          </FormField>
          
          <FormField label="Death Benefit">
            <input
              type="text"
              defaultValue={policy.deathBenefit || 'R 0'}
              className={`w-full table-input text-right ${policy.deathBenefit === 'R 0' ? 'text-neutral-400' : ''}`}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleTextFieldBlur('deathBenefit', e.target.value)}
              disabled={disabled}
            />
          </FormField>
        </div>
      </FieldGroup>

      {/* Ownership Structure Group */}
      <FieldGroup title="Ownership Structure">
        <div className="space-y-6">
          <FormField label="Owners & Life Assured" className="md:col-span-2">
            <div className="space-y-2">
              {policy.owners.map((_, ownerIndex) => (
                <AssuranceOwnerSelector
                  key={`owner-${ownerIndex}`}
                  policyId={policy.id}
                  owners={policy.owners}
                  lifeAssured={policy.lifeAssured || [""]}
                  deathBenefits={policy.deathBenefits || ["R 0"]}
                  onOwnerChange={onOwnerChange}
                  onLifeAssuredChange={onLifeAssuredChange}
                  onDeathBenefitChange={onDeathBenefitChange}
                  onOwnershipPercentageChange={onOwnershipPercentageChange}
                  onAddOwner={onAddOwner}
                  onRemoveOwner={onRemoveOwner}
                  rowIndex={ownerIndex}
                  disabled={disabled}
                />
              ))}
            </div>
          </FormField>
          
          <FormField label="Beneficiaries & Allocation">
            <div className="space-y-2">
              {policy.beneficiaries.map((_, beneficiaryIndex) => (
                <EntityBeneficiarySelector
                  key={`beneficiary-${beneficiaryIndex}`}
                  policyId={policy.id}
                  beneficiaries={policy.beneficiaries}
                  beneficiaryPercentages={policy.beneficiaryPercentages || ["100%"]}
                  onBeneficiaryChange={onBeneficiaryChange}
                  onBeneficiaryPercentageChange={onBeneficiaryPercentageChange}
                  onAddBeneficiary={onAddBeneficiary}
                  onRemoveBeneficiary={onRemoveBeneficiary}
                  rowIndex={beneficiaryIndex}
                  disabled={disabled}
                />
              ))}
            </div>
          </FormField>
        </div>
      </FieldGroup>

      {/* Financial Details Group */}
      <FieldGroup title="Financial Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Amount">
            <input
              type="text"
              defaultValue={policy.amount || 'R 0'}
              className={`w-full table-input text-right ${policy.amount === 'R 0' ? 'text-neutral-400' : ''}`}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleTextFieldBlur('amount', e.target.value)}
              disabled={disabled}
            />
          </FormField>
          
          <FormField label="Premiums by Others">
            <input
              type="text"
              defaultValue={policy.premiumsByOthers || 'R 0'}
              className={`w-full table-input text-right ${policy.premiumsByOthers === 'R 0' ? 'text-neutral-400' : ''}`}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleTextFieldBlur('premiumsByOthers', e.target.value)}
              disabled={disabled}
            />
          </FormField>
          
          <FormField label="Collateral Session" className="md:col-span-2">
            <input
              type="text"
              defaultValue={policy.collateralSession || ''}
              placeholder="Enter details ..."
              className={`w-full table-input text-right ${!policy.collateralSession ? 'text-neutral-400' : ''}`}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleTextFieldBlur('collateralSession', e.target.value)}
              disabled={disabled}
            />
          </FormField>
        </div>
      </FieldGroup>

      {/* Policy Options Group */}
      <FieldGroup title="Policy Options">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Buy/Sell Option">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`buy-sell-${policy.id}`}
                defaultChecked={false}
                className="rounded border-neutral-300 text-primary focus:ring-primary"
                onChange={(e) => handleCheckboxChange('description' as keyof Assurance, e.target.checked)}
                disabled={disabled}
              />
              <label htmlFor={`buy-sell-${policy.id}`} className="text-sm text-neutral-600">
                Enable buy/sell option
              </label>
            </div>
          </FormField>
          
          <FormField label="Key Man Insurance">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`key-man-${policy.id}`}
                defaultChecked={false}
                className="rounded border-neutral-300 text-primary focus:ring-primary"
                onChange={(e) => handleCheckboxChange('description' as keyof Assurance, e.target.checked)}
                disabled={disabled}
              />
              <label htmlFor={`key-man-${policy.id}`} className="text-sm text-neutral-600">
                Key man insurance
              </label>
            </div>
          </FormField>
          
          <FormField label="Estate Duty">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`excluded-estate-${policy.id}`}
                defaultChecked={false}
                className="rounded border-neutral-300 text-primary focus:ring-primary"
                onChange={(e) => handleCheckboxChange('description' as keyof Assurance, e.target.checked)}
                disabled={disabled}
              />
              <label htmlFor={`excluded-estate-${policy.id}`} className="text-sm text-neutral-600">
                Excluded from estate duty
              </label>
            </div>
          </FormField>
        </div>
      </FieldGroup>

      {/* Additional Information Group */}
      <FieldGroup title="Additional Information">
        <FormField label="Additional Information">
          <textarea
            defaultValue={policy.additionalInfo || ''}
            placeholder="Enter details ..."
            className={`w-full table-input resize-none ${!policy.additionalInfo ? 'text-neutral-400' : ''}`}
            rows={3}
            onFocus={handleDefaultValueFocus}
            onBlur={(e) => handleTextFieldBlur('additionalInfo', e.target.value)}
            disabled={disabled}
          />
        </FormField>
      </FieldGroup>
    </GroupedDetailForm>
  );
}