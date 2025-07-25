import React, { useCallback, useMemo } from "react";
import { RetirementFund, UpdateRetirementFund } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { DuplicateButton, DeleteButton, AddButton } from "@/components/ui/action-buttons";
import { getFieldClass } from "@/lib/design-tokens";

interface ExactMatchTableProps {
  funds: RetirementFund[];
  onFieldUpdate: (id: number, field: keyof UpdateRetirementFund, value: string) => void;
  onRemoveFund?: (id: number) => void;
  onDuplicateFund?: (fund: RetirementFund) => void;
  isUpdating: boolean;
}

const owners = ["Donald Edwards", "Betty Edwards"];

export function ExactMatchTable({ 
  funds, 
  onFieldUpdate, 
  onRemoveFund,
  onDuplicateFund,
  isUpdating 
}: ExactMatchTableProps) {

  const handleCellUpdate = useCallback((id: number, field: keyof UpdateRetirementFund, value: string) => {
    onFieldUpdate(id, field, value);
  }, [onFieldUpdate]);

  // Helper functions for managing additional owners
  const handleAddOwner = useCallback((fundId: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const updatedAdditionalOwners = [...fund.additionalOwners, "Donald Edwards"];
    onFieldUpdate(fundId, 'additionalOwners', updatedAdditionalOwners);
  }, [funds, onFieldUpdate]);

  const handleRemoveOwner = useCallback((fundId: number, ownerIndex: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const updatedAdditionalOwners = fund.additionalOwners.filter((_, index) => index !== ownerIndex);
    onFieldUpdate(fundId, 'additionalOwners', updatedAdditionalOwners);
  }, [funds, onFieldUpdate]);

  const handleOwnerChange = useCallback((fundId: number, ownerIndex: number, newOwner: string) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const updatedAdditionalOwners = [...fund.additionalOwners];
    updatedAdditionalOwners[ownerIndex] = newOwner;
    onFieldUpdate(fundId, 'additionalOwners', updatedAdditionalOwners);
  }, [funds, onFieldUpdate]);

  // Helper functions for managing additional beneficiaries
  const handleAddBeneficiary = useCallback((fundId: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const updatedBeneficiaries = [...fund.additionalBeneficiaries, ""];
    const updatedSplits = [...fund.additionalBenefitSplits, "0%"];
    onFieldUpdate(fundId, 'additionalBeneficiaries', updatedBeneficiaries);
    onFieldUpdate(fundId, 'additionalBenefitSplits', updatedSplits);
  }, [funds, onFieldUpdate]);

  const handleRemoveBeneficiary = useCallback((fundId: number, beneficiaryIndex: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const updatedBeneficiaries = fund.additionalBeneficiaries.filter((_, index) => index !== beneficiaryIndex);
    const updatedSplits = fund.additionalBenefitSplits.filter((_, index) => index !== beneficiaryIndex);
    onFieldUpdate(fundId, 'additionalBeneficiaries', updatedBeneficiaries);
    onFieldUpdate(fundId, 'additionalBenefitSplits', updatedSplits);
  }, [funds, onFieldUpdate]);

  const handleBeneficiaryChange = useCallback((fundId: number, beneficiaryIndex: number, newBeneficiary: string) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const updatedBeneficiaries = [...fund.additionalBeneficiaries];
    updatedBeneficiaries[beneficiaryIndex] = newBeneficiary;
    onFieldUpdate(fundId, 'additionalBeneficiaries', updatedBeneficiaries);
  }, [funds, onFieldUpdate]);

  const handleBenefitSplitChange = useCallback((fundId: number, beneficiaryIndex: number, newSplit: string) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const updatedSplits = [...fund.additionalBenefitSplits];
    updatedSplits[beneficiaryIndex] = newSplit;
    onFieldUpdate(fundId, 'additionalBenefitSplits', updatedSplits);
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
          <tr>
            <th className="border border-neutral-300 bg-neutral-50 p-2 text-left text-xs font-medium text-neutral-700 min-w-[80px]">
              ACTIONS
            </th>
            {/* Overview Section - 3 columns */}
            <th className="border border-neutral-300 bg-blue-50 p-2 text-center text-xs font-medium text-blue-700" colSpan={3}>
              OVERVIEW
            </th>
            {/* Unapproved Life Cover Section - 3 columns */}
            <th className="border border-neutral-300 bg-green-50 p-2 text-center text-xs font-medium text-green-700" colSpan={3}>
              UNAPPROVED LIFE COVER
            </th>
            {/* Monthly Death Benefit Section - 2 columns */}
            <th className="border border-neutral-300 bg-purple-50 p-2 text-center text-xs font-medium text-purple-700" colSpan={2}>
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
          <tr>
            <th className="border border-neutral-300 bg-neutral-50 p-2 text-left text-xs font-medium text-neutral-700">
            </th>
            {/* Overview Headers */}
            <th className="border border-neutral-300 bg-blue-50 p-2 text-left text-xs font-medium text-blue-700 min-w-[120px]">
              DESCRIPTION
            </th>
            <th className="border border-neutral-300 bg-blue-50 p-2 text-left text-xs font-medium text-blue-700 min-w-[100px]">
              OWNER
            </th>
            <th className="border border-neutral-300 bg-blue-50 p-2 text-left text-xs font-medium text-blue-700 min-w-[100px]">
              COVER AMOUNT
            </th>
            {/* Unapproved Life Cover Headers */}
            <th className="border border-neutral-300 bg-green-50 p-2 text-left text-xs font-medium text-green-700 min-w-[80px]">
              TERM (YEARS)
            </th>
            <th className="border border-neutral-300 bg-green-50 p-2 text-left text-xs font-medium text-green-700 min-w-[80px]">
              INCREASE %
            </th>
            <th className="border border-neutral-300 bg-green-50 p-2 text-left text-xs font-medium text-green-700 min-w-[120px]">
              APPROVED LIFE COVER
            </th>
            {/* Monthly Death Benefit Headers */}
            <th className="border border-neutral-300 bg-purple-50 p-2 text-left text-xs font-medium text-purple-700 min-w-[100px]">
              FUND VALUE
            </th>
            <th className="border border-neutral-300 bg-purple-50 p-2 text-left text-xs font-medium text-purple-700 min-w-[120px]">
              FUND VALUE AT DEATH
            </th>
            {/* Fund Value Headers */}
            <th className="border border-neutral-300 bg-orange-50 p-2 text-left text-xs font-medium text-orange-700 min-w-[100px]">
              NAME
            </th>
            <th className="border border-neutral-300 bg-orange-50 p-2 text-left text-xs font-medium text-orange-700 min-w-[100px]">
              AMOUNT
            </th>
            {/* Fund Value Beneficiaries Headers */}
            <th className="border border-neutral-300 bg-pink-50 p-2 text-left text-xs font-medium text-pink-700 min-w-[100px]">
              LUMP SUM TAKEN
            </th>
            <th className="border border-neutral-300 bg-pink-50 p-2 text-left text-xs font-medium text-pink-700 min-w-[100px]">
              FUND VALUE
            </th>
            <th className="border border-neutral-300 bg-pink-50 p-2 text-left text-xs font-medium text-pink-700 min-w-[120px]">
              NON-DEDUCTIBLE CONTRIBUTION
            </th>
            <th className="border border-neutral-300 bg-pink-50 p-2 text-left text-xs font-medium text-pink-700 min-w-[100px]">
              LIVING ANNUITY
            </th>
            <th className="border border-neutral-300 bg-pink-50 p-2 text-left text-xs font-medium text-pink-700 min-w-[120px]">
              MONTHLY INCOME TERM
            </th>
            <th className="border border-neutral-300 bg-pink-50 p-2 text-left text-xs font-medium text-pink-700 min-w-[80px]">
              INCOME TERM
            </th>
          </tr>
        </thead>
        <tbody>
          {expandedRowsData.map((row, index) => {
            const { type, fund, ownerIndex, beneficiaryIndex, isLast } = row;
            const isMainRow = type === 'fund';
            const isAdditionalOwner = type === 'additional-owner';
            const isAdditionalBeneficiary = type === 'additional-beneficiary';

            return (
              <tr key={`${fund.id}-${type}-${ownerIndex}-${beneficiaryIndex}`} 
                  className={`hover:bg-neutral-50 ${!isMainRow ? 'bg-neutral-25' : ''}`}>
                {/* Actions */}
                <td className="border border-neutral-300 p-2">
                  {isMainRow && (
                    <div className="flex gap-1">
                      {onDuplicateFund && (
                        <DuplicateButton
                          onClick={() => onDuplicateFund(fund)}
                          disabled={isUpdating}
                        />
                      )}
                      {onRemoveFund && (
                        <DeleteButton
                          onClick={() => onRemoveFund(fund.id)}
                          disabled={isUpdating}
                        />
                      )}
                    </div>
                  )}
                  {isAdditionalOwner && (
                    <div className="flex gap-1">
                      <DeleteButton
                        onClick={() => handleRemoveOwner(fund.id, ownerIndex!)}
                        disabled={isUpdating}
                        size="sm"
                      />
                      {isLast && (
                        <AddButton
                          onClick={() => handleAddOwner(fund.id)}
                          disabled={isUpdating}
                          size="sm"
                        />
                      )}
                    </div>
                  )}
                  {isAdditionalBeneficiary && (
                    <div className="flex gap-1">
                      <DeleteButton
                        onClick={() => handleRemoveBeneficiary(fund.id, beneficiaryIndex!)}
                        disabled={isUpdating}
                        size="sm"
                      />
                      {isLast && (
                        <AddButton
                          onClick={() => handleAddBeneficiary(fund.id)}
                          disabled={isUpdating}
                          size="sm"
                        />
                      )}
                    </div>
                  )}
                </td>

                {/* Overview Section */}
                <td className="border border-neutral-300 p-1">
                  {isMainRow && (
                    <input
                      type="text"
                      value={fund.description}
                      onChange={(e) => handleCellUpdate(fund.id, 'description', e.target.value)}
                      className={`${getFieldClass()} w-full text-xs`}
                      placeholder="Description"
                    />
                  )}
                </td>
                <td className="border border-neutral-300 p-1">
                  {isMainRow && (
                    <Select
                      value={fund.owner}
                      onValueChange={(value) => handleCellUpdate(fund.id, 'owner', value)}
                    >
                      <SelectTrigger className={`${getFieldClass()} w-full h-7 text-xs`}>
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
                  )}
                  {isAdditionalOwner && (
                    <Select
                      value={fund.additionalOwners[ownerIndex!]}
                      onValueChange={(value) => handleOwnerChange(fund.id, ownerIndex!, value)}
                    >
                      <SelectTrigger className={`${getFieldClass()} w-full h-7 text-xs`}>
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
                  )}
                </td>
                <td className="border border-neutral-300 p-1">
                  {isMainRow && (
                    <input
                      type="text"
                      value={fund.coverAmount}
                      onChange={(e) => handleCellUpdate(fund.id, 'coverAmount', e.target.value)}
                      className={`${getFieldClass()} w-full text-xs`}
                      placeholder="R 0"
                    />
                  )}
                </td>

                {/* Unapproved Life Cover Section */}
                <td className="border border-neutral-300 p-1">
                  {isMainRow && (
                    <input
                      type="text"
                      value={fund.termYears}
                      onChange={(e) => handleCellUpdate(fund.id, 'termYears', e.target.value)}
                      className={`${getFieldClass()} w-full text-xs`}
                      placeholder="0"
                    />
                  )}
                </td>
                <td className="border border-neutral-300 p-1">
                  {isMainRow && (
                    <input
                      type="text"
                      value={fund.increasePercentage}
                      onChange={(e) => handleCellUpdate(fund.id, 'increasePercentage', e.target.value)}
                      className={`${getFieldClass()} w-full text-xs`}
                      placeholder="0%"
                    />
                  )}
                </td>
                <td className="border border-neutral-300 p-1">
                  {isMainRow && (
                    <input
                      type="text"
                      value={fund.approvedLifeCover}
                      onChange={(e) => handleCellUpdate(fund.id, 'approvedLifeCover', e.target.value)}
                      className={`${getFieldClass()} w-full text-xs`}
                      placeholder="R 0"
                    />
                  )}
                </td>

                {/* Monthly Death Benefit Section */}
                <td className="border border-neutral-300 p-1">
                  {isMainRow && (
                    <input
                      type="text"
                      value={fund.fundValue}
                      onChange={(e) => handleCellUpdate(fund.id, 'fundValue', e.target.value)}
                      className={`${getFieldClass()} w-full text-xs`}
                      placeholder="R 0"
                    />
                  )}
                </td>
                <td className="border border-neutral-300 p-1">
                  {isMainRow && (
                    <input
                      type="text"
                      value={fund.fundValueAtDeath}
                      onChange={(e) => handleCellUpdate(fund.id, 'fundValueAtDeath', e.target.value)}
                      className={`${getFieldClass()} w-full text-xs`}
                      placeholder="R 0"
                    />
                  )}
                </td>

                {/* Fund Value Section */}
                <td className="border border-neutral-300 p-1">
                  {isMainRow && (
                    <input
                      type="text"
                      value={fund.name}
                      onChange={(e) => handleCellUpdate(fund.id, 'name', e.target.value)}
                      className={`${getFieldClass()} w-full text-xs`}
                      placeholder="Name"
                    />
                  )}
                  {isAdditionalBeneficiary && (
                    <input
                      type="text"
                      value={fund.additionalBeneficiaries[beneficiaryIndex!]}
                      onChange={(e) => handleBeneficiaryChange(fund.id, beneficiaryIndex!, e.target.value)}
                      className={`${getFieldClass()} w-full text-xs`}
                      placeholder="Beneficiary Name"
                    />
                  )}
                </td>
                <td className="border border-neutral-300 p-1">
                  {isMainRow && (
                    <input
                      type="text"
                      value={fund.amount}
                      onChange={(e) => handleCellUpdate(fund.id, 'amount', e.target.value)}
                      className={`${getFieldClass()} w-full text-xs`}
                      placeholder="R 0"
                    />
                  )}
                  {isAdditionalBeneficiary && (
                    <input
                      type="text"
                      value={fund.additionalBenefitSplits[beneficiaryIndex!]}
                      onChange={(e) => handleBenefitSplitChange(fund.id, beneficiaryIndex!, e.target.value)}
                      className={`${getFieldClass()} w-full text-xs`}
                      placeholder="0%"
                    />
                  )}
                </td>

                {/* Fund Value Beneficiaries Section */}
                <td className="border border-neutral-300 p-1">
                  {isMainRow && (
                    <input
                      type="text"
                      value={fund.lumpSumTaken}
                      onChange={(e) => handleCellUpdate(fund.id, 'lumpSumTaken', e.target.value)}
                      className={`${getFieldClass()} w-full text-xs`}
                      placeholder="R 0"
                    />
                  )}
                </td>
                <td className="border border-neutral-300 p-1">
                  {isMainRow && (
                    <input
                      type="text"
                      value={fund.fundValueAfterLumpSum}
                      onChange={(e) => handleCellUpdate(fund.id, 'fundValueAfterLumpSum', e.target.value)}
                      className={`${getFieldClass()} w-full text-xs`}
                      placeholder="R 0"
                    />
                  )}
                </td>
                <td className="border border-neutral-300 p-1">
                  {isMainRow && (
                    <input
                      type="text"
                      value={fund.nondeductibleContribution}
                      onChange={(e) => handleCellUpdate(fund.id, 'nondeductibleContribution', e.target.value)}
                      className={`${getFieldClass()} w-full text-xs`}
                      placeholder="R 0"
                    />
                  )}
                </td>
                <td className="border border-neutral-300 p-1">
                  {isMainRow && (
                    <input
                      type="text"
                      value={fund.livingAnnuity}
                      onChange={(e) => handleCellUpdate(fund.id, 'livingAnnuity', e.target.value)}
                      className={`${getFieldClass()} w-full text-xs`}
                      placeholder="R 0"
                    />
                  )}
                </td>
                <td className="border border-neutral-300 p-1">
                  {isMainRow && (
                    <input
                      type="text"
                      value={fund.monthlyIncomeTerm}
                      onChange={(e) => handleCellUpdate(fund.id, 'monthlyIncomeTerm', e.target.value)}
                      className={`${getFieldClass()} w-full text-xs`}
                      placeholder="R 0"
                    />
                  )}
                </td>
                <td className="border border-neutral-300 p-1">
                  {isMainRow && (
                    <input
                      type="text"
                      value={fund.incomeTerm}
                      onChange={(e) => handleCellUpdate(fund.id, 'incomeTerm', e.target.value)}
                      className={`${getFieldClass()} w-full text-xs`}
                      placeholder="0"
                    />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Total Row */}
      <div className="mt-4 p-4 bg-neutral-50 border border-neutral-200 rounded">
        <div className="text-sm font-medium text-neutral-700">
          Total: R {funds.reduce((sum, fund) => {
            const value = parseFloat(fund.fundValue.replace(/[^\d.-]/g, '')) || 0;
            return sum + value;
          }, 0).toLocaleString()}
        </div>
      </div>
    </div>
  );
}