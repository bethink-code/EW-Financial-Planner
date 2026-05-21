import { useQuery } from '@tanstack/react-query';
import { Assurance, ClientDetails } from '@shared/schema';
import { GroupedDetailForm, FieldGroup, FormField } from '@/components/common/grouped-detail-form';
import EntityOwnerSelector from '@/components/common/entity-owner-selector';
import EntityBeneficiarySelector from '@/components/common/entity-beneficiary-selector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { handleDefaultValueFocus, formatYearsValue, formatPercentageValue, getValueClass } from '@/lib/formatting';
import { getFieldClass } from '@/lib/design-tokens';
import { getCellClass } from '@/lib/field-types';

interface AssuranceDetailFormProps {
  policy: Assurance;
  onUpdate: (id: number, field: keyof Assurance, value: string | boolean | string[] | boolean[]) => void;
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
 * AssuranceDetailForm - Field groups for the active policy. Action strip
 * (Add | Title | Duplicate/Delete) lives in HybridHeaderBar above; this
 * component just renders the form sections.
 */
export function AssuranceDetailForm({
  policy,
  onUpdate,
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
    // Get current array value
    const currentArray = policy[field as keyof Assurance] as any[];
    
    // Create new array with updated value at index
    const newArray = [...(currentArray || [])];
    
    // Ensure array is long enough
    while (newArray.length <= index) {
      if (field === 'amountToggles') {
        newArray.push(true); // Default toggle state
      } else if (field === 'amountYearsValues') {
        newArray.push("0 years"); // Default years value
      } else if (field === 'amountIncreaseValues') {
        newArray.push("0%"); // Default percentage value
      } else {
        newArray.push("");
      }
    }
    
    // Update the specific index
    newArray[index] = value;
    
    // Call onUpdate with the complete updated array
    onUpdate(policyId, field as keyof Assurance, newArray);
  };

  return (
    <GroupedDetailForm>
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
            <table className="border-collapse" style={{ tableLayout: 'fixed', width: 'fit-content', minWidth: '600px' }}>
              <thead>
                <tr>
                  <th className="text-center" style={{ width: '60px' }}>
                    ACTIONS
                  </th>
                  <th className="text-left" style={{ width: '300px' }}>
                    OWNER
                  </th>
                  <th className="text-center" style={{ width: '80px' }}>
                    OWNERSHIP %
                  </th>
                  <th className="text-left" style={{ width: '300px' }}>
                    LIFE ASSURED
                  </th>
                  <th className="text-right" style={{ width: '100px' }}>
                    DEATH BENEFIT
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.max(policy.owners.length, 1) }, (_, rowIndex) => (
                  <tr key={`owner-table-row-${rowIndex}`}>
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
                    <td className="px-1 py-1" style={{ width: '300px' }}>
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
                          {entities.filter(client => client.entityName && client.entityName.trim() !== "").map((client) => (
                            <SelectItem key={client.id} value={client.entityName}>
                              {client.entityName}
                              {client.entityType === "Primary entity" && " (Primary entity)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-1 py-1" style={{ width: '100px' }}>
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
            <table className="border-collapse" style={{ tableLayout: 'fixed', width: 'fit-content', minWidth: '700px' }}>
              <thead>
                <tr>
                  <th className="text-center" style={{ width: '60px' }}>
                    ACTIONS
                  </th>
                  <th className="text-left" style={{ width: '300px' }}>
                    BENEFICIARY
                  </th>
                  <th className="text-center" style={{ width: '80px' }}>
                    BENEFIT %
                  </th>
                  <th className="text-right" style={{ width: '100px' }}>
                    BENEFIT SPLIT
                  </th>
                  <th className="text-right" style={{ width: '90px' }}>
                    AMOUNT
                  </th>
                  <th className="text-center" style={{ width: '70px' }}>
                    TOGGLE
                  </th>
                  <th className="text-center" style={{ width: '80px' }}>
                    YEARS/%
                  </th>
                </tr>
              </thead>
              <tbody>
                  {Array.from({ length: Math.max(policy.beneficiaries.length, 1) }, (_, rowIndex) => (
                    <tr key={`beneficiary-table-row-${rowIndex}`}>
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
                      <td className="px-1 py-1" style={{ width: '100px' }}>
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
                      <td className="px-1 py-1" style={{ width: '90px' }}>
                        <input
                          key={`amount-${policy.id}-${rowIndex}`}
                          type="text"
                          defaultValue={policy.amount || "R 0"}
                          className={`${getFieldClass('currency')} ${getCellClass('currency')} ${getValueClass(policy.amount || "R 0", 'currency')}`}
                          onFocus={handleDefaultValueFocus}
                          onBlur={(e) => handleTextFieldBlur('amount', e.target.value)}
                          disabled={disabled}
                        />
                      </td>
                      <td className="px-1 py-1" style={{ width: '70px' }}>
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
                      <td className="px-1 py-1" style={{ width: '80px' }}>
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
      <FieldGroup title="Other Policy Details">
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

        {/* Policy-Level Flags */}
        <div className="flex flex-wrap gap-6 pt-4" style={{ borderTop: "1px solid var(--ew-border)" }}>
          <FormField label="Buy/Sell">
            <Switch
              checked={policy.buySell}
              onCheckedChange={(checked) => handleCheckboxChange('buySell', checked)}
              disabled={disabled}
            />
          </FormField>

          <FormField label="Key Man">
            <Switch
              checked={policy.keyMan}
              onCheckedChange={(checked) => handleCheckboxChange('keyMan', checked)}
              disabled={disabled}
            />
          </FormField>

          <FormField label="Excluded Estate Duty">
            <Switch
              checked={policy.excludedFromEstateDuty}
              onCheckedChange={(checked) => handleCheckboxChange('excludedFromEstateDuty', checked)}
              disabled={disabled}
            />
          </FormField>

          <FormField label="Excluded Provisions">
            <Switch
              checked={policy.excludedFromProvisions}
              onCheckedChange={(checked) => handleCheckboxChange('excludedFromProvisions', checked)}
              disabled={disabled}
            />
          </FormField>
        </div>
      </FieldGroup>
    </GroupedDetailForm>
  );
}