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

      {/* Group 1: Entity Relationship Triad (Owner → Life Assured → Death Benefit) */}
      <FieldGroup title="Entity Relationship Triad">
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
        </div>
      </FieldGroup>

      {/* Groups 2 & 3: Beneficiary Distribution & Amount Toggle Pattern (Related per-beneficiary) */}
      <FieldGroup title="Beneficiary Distribution & Amount Controls">
        <div className="space-y-4">
          <FormField label="Beneficiaries & Benefit Splits">
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
          
          <FormField label="Amount (with Years/% Toggle per Beneficiary)">
            <div className="space-y-2">
              <input
                type="text"
                defaultValue={policy.amount || 'R 0'}
                className={`table-input text-right ${policy.amount === 'R 0' ? 'text-neutral-400' : ''}`}
                style={{ width: 'fit-content', minWidth: '120px' }}
                onFocus={handleDefaultValueFocus}
                onBlur={(e) => handleTextFieldBlur('amount', e.target.value)}
                disabled={disabled}
              />
              <div className="text-sm text-neutral-500">
                Note: Each beneficiary has independent toggle controls for years/percentage input mode
              </div>
            </div>
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
      </FieldGroup>



      {/* Additional Information */}
      <FieldGroup title="Additional Information">
        <FormField label="Additional Information">
          <textarea
            defaultValue={policy.additionalInfo || ''}
            placeholder="Enter details ..."
            className={`table-input resize-none ${!policy.additionalInfo ? 'text-neutral-400' : ''}`}
            style={{ width: 'fit-content', minWidth: '300px' }}
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