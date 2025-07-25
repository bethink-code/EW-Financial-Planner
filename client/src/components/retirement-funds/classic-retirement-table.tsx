import React, { useCallback, useMemo } from "react";
import { RetirementFund, UpdateRetirementFund } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, UserMinus } from "lucide-react";
import { DuplicateButton, DeleteButton, AddButton } from "@/components/ui/action-buttons";
import { getFieldClass, getFieldWidth } from "@/lib/design-tokens";
import { formatCurrencyValue, formatPercentageValue, formatTextValue, formatYearsValue, getValueClass, isDefaultValue, handleDefaultValueFocus, createEnhancedBlurHandler } from "@/lib/formatting";

interface ClassicRetirementTableProps {
  funds: RetirementFund[];
  onFieldUpdate: (id: number, field: keyof UpdateRetirementFund, value: string) => void;
  onRemoveFund?: (id: number) => void;
  onDuplicateFund?: (fund: RetirementFund) => void;
  isUpdating: boolean;
}

const owners = ["Donald Edwards", "Betty Edwards"];

export function ClassicRetirementTable({ 
  funds, 
  onFieldUpdate, 
  onRemoveFund,
  onDuplicateFund,
  isUpdating 
}: ClassicRetirementTableProps) {

  const handleCellUpdate = useCallback((id: number, field: keyof UpdateRetirementFund, value: string) => {
    onFieldUpdate(id, field, value);
  }, [onFieldUpdate]);

  // Helper functions for managing additional owners
  const handleAddOwner = useCallback((fundId: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const updatedAdditionalOwners = [...fund.additionalOwners, "Donald Edwards"];
    onFieldUpdate(fundId, 'additionalOwners', updatedAdditionalOwners as any);
  }, [funds, onFieldUpdate]);

  const handleRemoveOwner = useCallback((fundId: number, ownerIndex: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const updatedAdditionalOwners = fund.additionalOwners.filter((_, index) => index !== ownerIndex);
    onFieldUpdate(fundId, 'additionalOwners', updatedAdditionalOwners as any);
  }, [funds, onFieldUpdate]);

  const handleOwnerChange = useCallback((fundId: number, ownerIndex: number, newOwner: string) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const updatedAdditionalOwners = [...fund.additionalOwners];
    updatedAdditionalOwners[ownerIndex] = newOwner;
    onFieldUpdate(fundId, 'additionalOwners', updatedAdditionalOwners as any);
  }, [funds, onFieldUpdate]);

  // Helper functions for managing additional beneficiaries
  const handleAddBeneficiary = useCallback((fundId: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const updatedBeneficiaries = [...fund.additionalBeneficiaries, ""];
    const updatedSplits = [...fund.additionalBenefitSplits, "0%"];
    onFieldUpdate(fundId, 'additionalBeneficiaries', updatedBeneficiaries as any);
    onFieldUpdate(fundId, 'additionalBenefitSplits', updatedSplits as any);
  }, [funds, onFieldUpdate]);

  const handleRemoveBeneficiary = useCallback((fundId: number, beneficiaryIndex: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const updatedBeneficiaries = fund.additionalBeneficiaries.filter((_, index) => index !== beneficiaryIndex);
    const updatedSplits = fund.additionalBenefitSplits.filter((_, index) => index !== beneficiaryIndex);
    onFieldUpdate(fundId, 'additionalBeneficiaries', updatedBeneficiaries as any);
    onFieldUpdate(fundId, 'additionalBenefitSplits', updatedSplits as any);
  }, [funds, onFieldUpdate]);

  const handleBeneficiaryChange = useCallback((fundId: number, beneficiaryIndex: number, newBeneficiary: string) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const updatedBeneficiaries = [...fund.additionalBeneficiaries];
    updatedBeneficiaries[beneficiaryIndex] = newBeneficiary;
    onFieldUpdate(fundId, 'additionalBeneficiaries', updatedBeneficiaries as any);
  }, [funds, onFieldUpdate]);

  const handleBenefitSplitChange = useCallback((fundId: number, beneficiaryIndex: number, newSplit: string) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const updatedSplits = [...fund.additionalBenefitSplits];
    updatedSplits[beneficiaryIndex] = newSplit;
    onFieldUpdate(fundId, 'additionalBenefitSplits', updatedSplits as any);
  }, [funds, onFieldUpdate]);

  // Create expanded rows data that includes funds + additional owners + additional beneficiaries
  const expandedRowsData = useMemo(() => {
    const rows: Array<{
      type: 'fund' | 'additional-owner' | 'additional-beneficiary';
      fund: RetirementFund;
      ownerIndex?: number;
      beneficiaryIndex?: number;
      isLast?: boolean;
    }> = [];

    funds.forEach(fund => {
      // Main fund row
      rows.push({ type: 'fund', fund });

      // Additional owner rows
      fund.additionalOwners.forEach((_, ownerIndex) => {
        rows.push({ 
          type: 'additional-owner', 
          fund, 
          ownerIndex,
          isLast: ownerIndex === fund.additionalOwners.length - 1 && fund.additionalBeneficiaries.length === 0
        });
      });

      // Additional beneficiary rows
      fund.additionalBeneficiaries.forEach((_, beneficiaryIndex) => {
        rows.push({ 
          type: 'additional-beneficiary', 
          fund, 
          beneficiaryIndex,
          isLast: beneficiaryIndex === fund.additionalBeneficiaries.length - 1
        });
      });
    });

    return rows;
  }, [funds]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          {/* First header row - Section groupings */}
          <tr>
            <th className="border border-neutral-300 bg-neutral-50 p-2 text-left text-xs font-medium text-neutral-700 min-w-[80px]" rowSpan={2}>
              Actions
            </th>
            {/* Overview Section - 2 columns */}
            <th className="border border-neutral-300 bg-blue-50 p-2 text-center text-xs font-medium text-blue-700" colSpan={2}>
              OVERVIEW
            </th>
            {/* Unapproved Life Cover Section - 4 columns */}
            <th className="border border-neutral-300 bg-green-50 p-2 text-center text-xs font-medium text-green-700" colSpan={4}>
              UNAPPROVED LIFE COVER
            </th>
            {/* Monthly Death Benefit Section - 3 columns */}
            <th className="border border-neutral-300 bg-purple-50 p-2 text-center text-xs font-medium text-purple-700" colSpan={3}>
              MONTHLY DEATH BENEFIT
            </th>
            {/* Fund Value Section - 2 columns */}
            <th className="border border-neutral-300 bg-orange-50 p-2 text-center text-xs font-medium text-orange-700" colSpan={2}>
              FUND VALUE
            </th>
            {/* Fund Value Beneficiaries Section - 6 columns */}
            <th className="border border-neutral-300 bg-pink-50 p-2 text-center text-xs font-medium text-pink-700" colSpan={6}>
              FUND VALUE BENEFICIARIES
            </th>
          </tr>
          {/* Second header row - Individual column names */}
          <tr>
            {/* Overview columns */}
            <th className="border border-neutral-300 bg-blue-50 p-2 text-left text-xs font-medium text-blue-700 min-w-[150px] border-b border-neutral-200">
              Description
            </th>
            <th className="border border-neutral-300 bg-blue-50 p-2 text-left text-xs font-medium text-blue-700 min-w-[120px] border-b border-neutral-200">
              Owner
            </th>
            {/* Unapproved Life Cover columns */}
            <th className="border border-neutral-300 bg-green-50 p-2 text-left text-xs font-medium text-green-700 min-w-[100px] border-b border-neutral-200">
              Cover Amount
            </th>
            <th className="border border-neutral-300 bg-green-50 p-2 text-left text-xs font-medium text-green-700 min-w-[80px] border-b border-neutral-200">
              Term (Years)
            </th>
            <th className="border border-neutral-300 bg-green-50 p-2 text-left text-xs font-medium text-green-700 min-w-[80px] border-b border-neutral-200">
              Increase %
            </th>
            <th className="border border-neutral-300 bg-green-50 p-2 text-left text-xs font-medium text-green-700 min-w-[120px] border-b border-neutral-200">
              Approved Life Cover
            </th>
            {/* Monthly Death Benefit columns */}
            <th className="border border-neutral-300 bg-purple-50 p-2 text-left text-xs font-medium text-purple-700 min-w-[100px] border-b border-neutral-200">
              Fund Value
            </th>
            <th className="border border-neutral-300 bg-purple-50 p-2 text-left text-xs font-medium text-purple-700 min-w-[120px] border-b border-neutral-200">
              Fund Value at Death
            </th>
            <th className="border border-neutral-300 bg-purple-50 p-2 text-left text-xs font-medium text-purple-700 min-w-[120px] border-b border-neutral-200">
              Beneficiary Name
            </th>
            {/* Fund Value columns */}
            <th className="border border-neutral-300 bg-orange-50 p-2 text-left text-xs font-medium text-orange-700 min-w-[120px] border-b border-neutral-200">
              Name
            </th>
            <th className="border border-neutral-300 bg-orange-50 p-2 text-left text-xs font-medium text-orange-700 min-w-[100px] border-b border-neutral-200">
              Amount
            </th>
            {/* Fund Value Beneficiaries columns */}
            <th className="border border-neutral-300 bg-pink-50 p-2 text-left text-xs font-medium text-pink-700 min-w-[100px] border-b border-neutral-200">
              Lump Sum Taken
            </th>
            <th className="border border-neutral-300 bg-pink-50 p-2 text-left text-xs font-medium text-pink-700 min-w-[100px] border-b border-neutral-200">
              Fund Value
            </th>
            <th className="border border-neutral-300 bg-pink-50 p-2 text-left text-xs font-medium text-pink-700 min-w-[140px] border-b border-neutral-200">
              Non-Deductible Contribution
            </th>
            <th className="border border-neutral-300 bg-pink-50 p-2 text-left text-xs font-medium text-pink-700 min-w-[100px] border-b border-neutral-200">
              Living Annuity
            </th>
            <th className="border border-neutral-300 bg-pink-50 p-2 text-left text-xs font-medium text-pink-700 min-w-[100px] border-b border-neutral-200">
              Monthly Income
            </th>
            <th className="border border-neutral-300 bg-pink-50 p-2 text-left text-xs font-medium text-pink-700 min-w-[80px] border-b border-neutral-200">
              Income Term
            </th>
          </tr>
        </thead>
        <tbody>
          {expandedRowsData.map((row, index) => {
            const { type, fund, ownerIndex, beneficiaryIndex, isLast } = row;

            return (
              <tr key={`${fund.id}-${type}-${ownerIndex || beneficiaryIndex || 0}`}>
                {/* Actions Column */}
                <td className={`border border-neutral-300 p-2 table-actions-cell ${isLast ? 'border-b-2 border-b-neutral-400' : ''}`}>
                  {type === 'fund' && (
                    <div className="flex items-center gap-1">
                      <DuplicateButton onClick={() => onDuplicateFund?.(fund)} />
                      <DeleteButton onClick={() => onRemoveFund?.(fund.id)} />
                    </div>
                  )}
                </td>

                {/* Overview Section */}
                <td className={`border border-neutral-300 p-1 ${isLast ? 'border-b-2 border-b-neutral-400' : ''}`}>
                  {type === 'fund' && (
                    <input
                      key={`field-${fund.id}-description`}
                      type="text"
                      defaultValue={formatTextValue(fund.description)}
                      className={`table-input ${getFieldClass('text')} ${getValueClass(fund.description, 'text')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => createEnhancedBlurHandler((value) => handleCellUpdate(fund.id, 'description', value), 'text')(e)}
                    />
                  )}
                  {type === 'additional-owner' && ownerIndex !== undefined && (
                    <div className="flex items-center gap-1 text-blue-600 text-xs">
                      <span className="text-blue-500">↳</span>
                      <span className="text-xs text-neutral-500">Additional Owner</span>
                    </div>
                  )}
                  {type === 'additional-beneficiary' && beneficiaryIndex !== undefined && (
                    <div className="flex items-center gap-1 text-green-600 text-xs">
                      <span className="text-green-500">↳</span>
                      <span className="text-xs text-neutral-500">Additional Beneficiary</span>
                    </div>
                  )}
                </td>

                <td className={`border border-neutral-300 p-1 ${isLast ? 'border-b-2 border-b-neutral-400' : ''}`}>
                  {type === 'fund' && (
                    <div className="flex items-center gap-1">
                      <Select value={fund.owner} onValueChange={(value) => handleCellUpdate(fund.id, 'owner', value)}>
                        <SelectTrigger className="h-7 text-xs min-w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {owners.map((owner) => (
                            <SelectItem key={owner} value={owner} className="text-xs">
                              {owner}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <AddButton onClick={() => handleAddOwner(fund.id)}>
                        <UserPlus className="h-3 w-3" />
                      </AddButton>
                    </div>
                  )}
                  {type === 'additional-owner' && ownerIndex !== undefined && (
                    <div className="flex items-center gap-1">
                      <Select 
                        value={fund.additionalOwners[ownerIndex]} 
                        onValueChange={(value) => handleOwnerChange(fund.id, ownerIndex, value)}
                      >
                        <SelectTrigger className="h-7 text-xs min-w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {owners.map((owner) => (
                            <SelectItem key={owner} value={owner} className="text-xs">
                              {owner}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <DeleteButton onClick={() => handleRemoveOwner(fund.id, ownerIndex)}>
                        <UserMinus className="h-3 w-3" />
                      </DeleteButton>
                    </div>
                  )}
                </td>

                {/* Unapproved Life Cover Section */}
                <td className={`border border-neutral-300 p-1 ${isLast ? 'border-b-2 border-b-neutral-400' : ''}`}>
                  {type === 'fund' && (
                    <input
                      key={`field-${fund.id}-coverAmount`}
                      type="text"
                      defaultValue={formatCurrencyValue(fund.coverAmount)}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.coverAmount, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => createEnhancedBlurHandler((value) => handleCellUpdate(fund.id, 'coverAmount', value), 'currency')(e)}
                    />
                  )}
                </td>

                <td className={`border border-neutral-300 p-1 ${isLast ? 'border-b-2 border-b-neutral-400' : ''}`}>
                  {type === 'fund' && (
                    <input
                      key={`field-${fund.id}-termYears`}
                      type="text"
                      defaultValue={formatYearsValue(fund.termYears)}
                      className={`table-input ${getFieldClass('years')} ${getValueClass(fund.termYears, 'years')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => createEnhancedBlurHandler((value) => handleCellUpdate(fund.id, 'termYears', value), 'years')(e)}
                    />
                  )}
                </td>

                <td className={`border border-neutral-300 p-1 ${isLast ? 'border-b-2 border-b-neutral-400' : ''}`}>
                  {type === 'fund' && (
                    <input
                      key={`field-${fund.id}-increasePercentage`}
                      type="text"
                      defaultValue={formatPercentageValue(fund.increasePercentage)}
                      className={`table-input ${getFieldClass('percentage')} ${getValueClass(fund.increasePercentage, 'percentage')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => createEnhancedBlurHandler((value) => handleCellUpdate(fund.id, 'increasePercentage', value), 'percentage')(e)}
                    />
                  )}
                </td>

                <td className={`border border-neutral-300 p-1 ${isLast ? 'border-b-2 border-b-neutral-400' : ''}`}>
                  {type === 'fund' && (
                    <input
                      key={`field-${fund.id}-approvedLifeCover`}
                      type="text"
                      defaultValue={formatCurrencyValue(fund.approvedLifeCover)}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.approvedLifeCover, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => createEnhancedBlurHandler((value) => handleCellUpdate(fund.id, 'approvedLifeCover', value), 'currency')(e)}
                    />
                  )}
                </td>

                {/* Monthly Death Benefit Section */}
                <td className={`border border-neutral-300 p-1 ${isLast ? 'border-b-2 border-b-neutral-400' : ''}`}>
                  {type === 'fund' && (
                    <input
                      key={`field-${fund.id}-fundValue`}
                      type="text"
                      defaultValue={formatCurrencyValue(fund.fundValue)}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.fundValue, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => createEnhancedBlurHandler((value) => handleCellUpdate(fund.id, 'fundValue', value), 'currency')(e)}
                    />
                  )}
                </td>

                <td className={`border border-neutral-300 p-1 ${isLast ? 'border-b-2 border-b-neutral-400' : ''}`}>
                  {type === 'fund' && (
                    <input
                      key={`field-${fund.id}-fundValueAtDeath`}
                      type="text"
                      defaultValue={formatCurrencyValue(fund.fundValueAtDeath)}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.fundValueAtDeath, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => createEnhancedBlurHandler((value) => handleCellUpdate(fund.id, 'fundValueAtDeath', value), 'currency')(e)}
                    />
                  )}
                </td>

                <td className={`border border-neutral-300 p-1 ${isLast ? 'border-b-2 border-b-neutral-400' : ''}`}>
                  {type === 'fund' && (
                    <input
                      key={`field-${fund.id}-beneficiaryName`}
                      type="text"
                      defaultValue={formatTextValue(fund.beneficiaryName)}
                      className={`table-input ${getFieldClass('text')} ${getValueClass(fund.beneficiaryName, 'text')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => createEnhancedBlurHandler((value) => handleCellUpdate(fund.id, 'beneficiaryName', value), 'text')(e)}
                    />
                  )}
                </td>

                {/* Fund Value Section */}
                <td className={`border border-neutral-300 p-1 ${isLast ? 'border-b-2 border-b-neutral-400' : ''}`}>
                  {type === 'fund' && (
                    <input
                      key={`field-${fund.id}-name`}
                      type="text"
                      defaultValue={formatTextValue(fund.name)}
                      className={`table-input ${getFieldClass('text')} ${getValueClass(fund.name, 'text')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => createEnhancedBlurHandler((value) => handleCellUpdate(fund.id, 'name', value), 'text')(e)}
                    />
                  )}
                </td>

                <td className={`border border-neutral-300 p-1 ${isLast ? 'border-b-2 border-b-neutral-400' : ''}`}>
                  {type === 'fund' && (
                    <input
                      key={`field-${fund.id}-amount`}
                      type="text"
                      defaultValue={formatCurrencyValue(fund.amount)}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.amount, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => createEnhancedBlurHandler((value) => handleCellUpdate(fund.id, 'amount', value), 'currency')(e)}
                    />
                  )}
                </td>

                {/* Fund Value Beneficiaries Section */}
                <td className={`border border-neutral-300 p-1 ${isLast ? 'border-b-2 border-b-neutral-400' : ''}`}>
                  {type === 'fund' && (
                    <input
                      key={`field-${fund.id}-lumpSumTaken`}
                      type="text"
                      defaultValue={formatCurrencyValue(fund.lumpSumTaken)}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.lumpSumTaken, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => createEnhancedBlurHandler((value) => handleCellUpdate(fund.id, 'lumpSumTaken', value), 'currency')(e)}
                    />
                  )}
                </td>

                <td className={`border border-neutral-300 p-1 ${isLast ? 'border-b-2 border-b-neutral-400' : ''}`}>
                  {type === 'fund' && (
                    <input
                      key={`field-${fund.id}-fundValueBeneficiaries`}
                      type="text"
                      defaultValue={formatCurrencyValue(fund.fundValueBeneficiaries)}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.fundValueBeneficiaries, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => createEnhancedBlurHandler((value) => handleCellUpdate(fund.id, 'fundValueBeneficiaries', value), 'currency')(e)}
                    />
                  )}
                </td>

                <td className={`border border-neutral-300 p-1 ${isLast ? 'border-b-2 border-b-neutral-400' : ''}`}>
                  {type === 'fund' && (
                    <input
                      key={`field-${fund.id}-nonDeductibleContribution`}
                      type="text"
                      defaultValue={formatCurrencyValue(fund.nonDeductibleContribution)}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.nonDeductibleContribution, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => createEnhancedBlurHandler((value) => handleCellUpdate(fund.id, 'nonDeductibleContribution', value), 'currency')(e)}
                    />
                  )}
                </td>

                <td className={`border border-neutral-300 p-1 ${isLast ? 'border-b-2 border-b-neutral-400' : ''}`}>
                  {type === 'fund' && (
                    <input
                      key={`field-${fund.id}-livingAnnuity`}
                      type="text"
                      defaultValue={formatCurrencyValue(fund.livingAnnuity)}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.livingAnnuity, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => createEnhancedBlurHandler((value) => handleCellUpdate(fund.id, 'livingAnnuity', value), 'currency')(e)}
                    />
                  )}
                </td>

                <td className={`border border-neutral-300 p-1 ${isLast ? 'border-b-2 border-b-neutral-400' : ''}`}>
                  {type === 'fund' && (
                    <input
                      key={`field-${fund.id}-monthlyIncome`}
                      type="text"
                      defaultValue={formatCurrencyValue(fund.monthlyIncome)}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.monthlyIncome, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => createEnhancedBlurHandler((value) => handleCellUpdate(fund.id, 'monthlyIncome', value), 'currency')(e)}
                    />
                  )}
                </td>

                <td className={`border border-neutral-300 p-1 ${isLast ? 'border-b-2 border-b-neutral-400' : ''}`}>
                  {type === 'fund' && (
                    <input
                      key={`field-${fund.id}-incomeTerm`}
                      type="text"
                      defaultValue={formatYearsValue(fund.incomeTerm)}
                      className={`table-input ${getFieldClass('years')} ${getValueClass(fund.incomeTerm, 'years')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => createEnhancedBlurHandler((value) => handleCellUpdate(fund.id, 'incomeTerm', value), 'years')(e)}
                    />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}