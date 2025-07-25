import React, { useCallback } from "react";
import { RetirementFund, UpdateRetirementFund } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DuplicateButton, DeleteButton } from "@/components/ui/action-buttons";
import { getFieldClass, getFieldWidth } from "@/lib/design-tokens";
import { formatPercentageValue, getValueClass, isDefaultValue, handleDefaultValueFocus } from "@/lib/formatting";

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

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-neutral-300 bg-neutral-50 p-2 text-left text-xs font-medium text-neutral-700 min-w-[120px]">
              Actions
            </th>
            {/* Overview Section */}
            <th className="border border-neutral-300 bg-blue-50 p-2 text-left text-xs font-medium text-blue-700 min-w-[120px]">
              OVERVIEW
            </th>
            <th className="border border-neutral-300 bg-blue-50 p-2 text-left text-xs font-medium text-blue-700 min-w-[100px]"></th>
            <th className="border border-neutral-300 bg-blue-50 p-2 text-left text-xs font-medium text-blue-700 min-w-[100px]"></th>
            {/* Unapproved Life Cover Section */}
            <th className="border border-neutral-300 bg-green-50 p-2 text-left text-xs font-medium text-green-700 min-w-[120px]">
              UNAPPROVED LIFE COVER
            </th>
            <th className="border border-neutral-300 bg-green-50 p-2 text-left text-xs font-medium text-green-700 min-w-[100px]"></th>
            <th className="border border-neutral-300 bg-green-50 p-2 text-left text-xs font-medium text-green-700 min-w-[100px]"></th>
            {/* Monthly Death Benefit Section */}
            <th className="border border-neutral-300 bg-purple-50 p-2 text-left text-xs font-medium text-purple-700 min-w-[120px]">
              MONTHLY DEATH BENEFIT
            </th>
            <th className="border border-neutral-300 bg-purple-50 p-2 text-left text-xs font-medium text-purple-700 min-w-[100px]"></th>
            {/* Fund Value Section */}
            <th className="border border-neutral-300 bg-orange-50 p-2 text-left text-xs font-medium text-orange-700 min-w-[120px]">
              FUND VALUE
            </th>
            <th className="border border-neutral-300 bg-orange-50 p-2 text-left text-xs font-medium text-orange-700 min-w-[100px]"></th>
            {/* Fund Value Beneficiaries Section */}
            <th className="border border-neutral-300 bg-pink-50 p-2 text-left text-xs font-medium text-pink-700 min-w-[120px]">
              FUND VALUE BENEFICIARIES
            </th>
            <th className="border border-neutral-300 bg-pink-50 p-2 text-left text-xs font-medium text-pink-700 min-w-[100px]"></th>
            <th className="border border-neutral-300 bg-pink-50 p-2 text-left text-xs font-medium text-pink-700 min-w-[100px]"></th>
            <th className="border border-neutral-300 bg-pink-50 p-2 text-left text-xs font-medium text-pink-700 min-w-[100px]"></th>
            <th className="border border-neutral-300 bg-pink-50 p-2 text-left text-xs font-medium text-pink-700 min-w-[100px]"></th>
            <th className="border border-neutral-300 bg-pink-50 p-2 text-left text-xs font-medium text-pink-700 min-w-[100px]"></th>
          </tr>
          <tr>
            <th className="border border-neutral-300 bg-neutral-50 p-2 text-left text-xs font-medium text-neutral-700">
            </th>
            {/* Overview Headers */}
            <th className="border border-neutral-300 bg-blue-50 p-2 text-left text-xs font-medium text-blue-700">
              DESCRIPTION
            </th>
            <th className="border border-neutral-300 bg-blue-50 p-2 text-left text-xs font-medium text-blue-700">
              OWNER
            </th>
            <th className="border border-neutral-300 bg-blue-50 p-2 text-left text-xs font-medium text-blue-700">
              COVER AMOUNT
            </th>
            {/* Unapproved Life Cover Headers */}
            <th className="border border-neutral-300 bg-green-50 p-2 text-left text-xs font-medium text-green-700">
              TERM (YEARS)
            </th>
            <th className="border border-neutral-300 bg-green-50 p-2 text-left text-xs font-medium text-green-700">
              INCREASE %
            </th>
            <th className="border border-neutral-300 bg-green-50 p-2 text-left text-xs font-medium text-green-700">
              APPROVED LIFE COVER
            </th>
            {/* Monthly Death Benefit Headers */}
            <th className="border border-neutral-300 bg-purple-50 p-2 text-left text-xs font-medium text-purple-700">
              FUND VALUE
            </th>
            <th className="border border-neutral-300 bg-purple-50 p-2 text-left text-xs font-medium text-purple-700">
              FUND VALUE AT DEATH
            </th>
            {/* Fund Value Headers */}
            <th className="border border-neutral-300 bg-orange-50 p-2 text-left text-xs font-medium text-orange-700">
              NAME
            </th>
            <th className="border border-neutral-300 bg-orange-50 p-2 text-left text-xs font-medium text-orange-700">
              AMOUNT
            </th>
            {/* Fund Value Beneficiaries Headers */}
            <th className="border border-neutral-300 bg-pink-50 p-2 text-left text-xs font-medium text-pink-700">
              LUMP SUM TAKEN
            </th>
            <th className="border border-neutral-300 bg-pink-50 p-2 text-left text-xs font-medium text-pink-700">
              FUND VALUE
            </th>
            <th className="border border-neutral-300 bg-pink-50 p-2 text-left text-xs font-medium text-pink-700">
              NON-DEDUCTIBLE CONTRIBUTION
            </th>
            <th className="border border-neutral-300 bg-pink-50 p-2 text-left text-xs font-medium text-pink-700">
              LIVING ANNUITY
            </th>
            <th className="border border-neutral-300 bg-pink-50 p-2 text-left text-xs font-medium text-pink-700">
              MONTHLY INCOME
            </th>
            <th className="border border-neutral-300 bg-pink-50 p-2 text-left text-xs font-medium text-pink-700">
              INCOME TERM
            </th>
          </tr>
        </thead>
        <tbody>
          {funds.map((fund) => (
            <tr key={fund.id} className="hover:bg-neutral-50">
              {/* Actions */}
              <td className="border border-neutral-300 p-2">
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
              </td>

              {/* Overview Section */}
              <td className="border border-neutral-300 p-1">
                <input
                  type="text"
                  value={fund.description}
                  onChange={(e) => handleCellUpdate(fund.id, 'description', e.target.value)}
                  className={`${getFieldClass()} w-full text-xs`}
                  placeholder="Description"
                />
              </td>
              <td className="border border-neutral-300 p-1">
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
              </td>
              <td className="border border-neutral-300 p-1">
                <input
                  type="text"
                  value={fund.coverAmount}
                  onChange={(e) => handleCellUpdate(fund.id, 'coverAmount', e.target.value)}
                  className={`${getFieldClass()} w-full text-xs`}
                  placeholder="R 0"
                />
              </td>

              {/* Unapproved Life Cover Section */}
              <td className="border border-neutral-300 p-1">
                <input
                  type="text"
                  value={fund.termYears}
                  onChange={(e) => handleCellUpdate(fund.id, 'termYears', e.target.value)}
                  className={`${getFieldClass()} w-full text-xs`}
                  placeholder="0"
                />
              </td>
              <td className="border border-neutral-300 p-1">
                <input
                  type="text"
                  value={fund.increasePercentage}
                  onChange={(e) => handleCellUpdate(fund.id, 'increasePercentage', e.target.value)}
                  className={`${getFieldClass()} w-full text-xs`}
                  placeholder="0%"
                />
              </td>
              <td className="border border-neutral-300 p-1">
                <input
                  type="text"
                  value={fund.approvedLifeCover}
                  onChange={(e) => handleCellUpdate(fund.id, 'approvedLifeCover', e.target.value)}
                  className={`${getFieldClass()} w-full text-xs`}
                  placeholder="R 0"
                />
              </td>

              {/* Monthly Death Benefit Section */}
              <td className="border border-neutral-300 p-1">
                <input
                  type="text"
                  value={fund.fundValue}
                  onChange={(e) => handleCellUpdate(fund.id, 'fundValue', e.target.value)}
                  className={`${getFieldClass()} w-full text-xs`}
                  placeholder="R 0"
                />
              </td>
              <td className="border border-neutral-300 p-1">
                <input
                  type="text"
                  value={fund.fundValueAtDeath}
                  onChange={(e) => handleCellUpdate(fund.id, 'fundValueAtDeath', e.target.value)}
                  className={`${getFieldClass()} w-full text-xs`}
                  placeholder="R 0"
                />
              </td>

              {/* Fund Value Section */}
              <td className="border border-neutral-300 p-1">
                <input
                  type="text"
                  value={fund.name}
                  onChange={(e) => handleCellUpdate(fund.id, 'name', e.target.value)}
                  className={`${getFieldClass()} w-full text-xs`}
                  placeholder="Name"
                />
              </td>
              <td className="border border-neutral-300 p-1">
                <input
                  type="text"
                  value={fund.amount}
                  onChange={(e) => handleCellUpdate(fund.id, 'amount', e.target.value)}
                  className={`${getFieldClass()} w-full text-xs`}
                  placeholder="R 0"
                />
              </td>

              {/* Fund Value Beneficiaries Section */}
              <td className="border border-neutral-300 p-1">
                <input
                  type="text"
                  value={fund.lumpSumTaken}
                  onChange={(e) => handleCellUpdate(fund.id, 'lumpSumTaken', e.target.value)}
                  className={`${getFieldClass()} w-full text-xs`}
                  placeholder="R 0"
                />
              </td>
              <td className="border border-neutral-300 p-1">
                <input
                  type="text"
                  value={fund.fundValueAfterLumpSum || "R 0"}
                  onChange={(e) => handleCellUpdate(fund.id, 'fundValueAfterLumpSum', e.target.value)}
                  className={`${getFieldClass()} w-full text-xs`}
                  placeholder="R 0"
                />
              </td>
              <td className="border border-neutral-300 p-1">
                <input
                  type="text"
                  value={fund.nondeductibleContribution}
                  onChange={(e) => handleCellUpdate(fund.id, 'nondeductibleContribution', e.target.value)}
                  className={`${getFieldClass()} w-full text-xs`}
                  placeholder="R 0"
                />
              </td>
              <td className="border border-neutral-300 p-1">
                <input
                  type="text"
                  value={fund.livingAnnuity}
                  onChange={(e) => handleCellUpdate(fund.id, 'livingAnnuity', e.target.value)}
                  className={`${getFieldClass()} w-full text-xs`}
                  placeholder="R 0"
                />
              </td>
              <td className="border border-neutral-300 p-1">
                <input
                  type="text"
                  value={fund.monthlyIncome}
                  onChange={(e) => handleCellUpdate(fund.id, 'monthlyIncome', e.target.value)}
                  className={`${getFieldClass()} w-full text-xs`}
                  placeholder="R 0"
                />
              </td>
              <td className="border border-neutral-300 p-1">
                <input
                  type="text"
                  value={fund.incomeTerm}
                  onChange={(e) => handleCellUpdate(fund.id, 'incomeTerm', e.target.value)}
                  className={`${getFieldClass()} w-full text-xs`}
                  placeholder="0"
                />
              </td>
            </tr>
          ))}
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