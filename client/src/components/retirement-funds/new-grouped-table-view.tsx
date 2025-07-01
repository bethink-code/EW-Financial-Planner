import { useState } from "react";
import { RetirementFund, UpdateRetirementFund } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ColumnVisibility {
  overview: boolean;
  unapprovedLifeCover: boolean;
  monthlyDeathBenefit: boolean;
  fundValueBeneficiaries: boolean;
}

interface NewGroupedTableViewProps {
  funds: RetirementFund[];
  columnVisibility: ColumnVisibility;
  onFieldUpdate: (id: number, field: keyof UpdateRetirementFund, value: string) => void;
  isUpdating: boolean;
}

export function NewGroupedTableView({ funds, columnVisibility, onFieldUpdate, isUpdating }: NewGroupedTableViewProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (group: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(group)) {
      newCollapsed.delete(group);
    } else {
      newCollapsed.add(group);
    }
    setCollapsedGroups(newCollapsed);
  };

  const handleInputChange = (fundId: number, field: keyof UpdateRetirementFund, value: string) => {
    onFieldUpdate(fundId, field, value);
  };

  const owners = ["John Doe", "Jane Smith"];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-neutral-50 border-b border-neutral-200">
            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Description
            </th>
            
            {/* Overview Section */}
            {columnVisibility.overview && (
              <>
                <th className="px-3 py-2 text-center border-l border-neutral-300" colSpan={collapsedGroups.has("overview") ? 1 : 2}>
                  <button
                    onClick={() => toggleGroup("overview")}
                    className="flex items-center justify-center w-full text-xs font-medium text-teal-700 uppercase tracking-wider hover:text-teal-600"
                  >
                    {collapsedGroups.has("overview") ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                    Overview
                  </button>
                </th>
                {!collapsedGroups.has("overview") && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Cover Amount
                  </th>
                )}
              </>
            )}

            {/* Unapproved Life Cover Section */}
            {columnVisibility.unapprovedLifeCover && (
              <>
                <th className="px-3 py-2 text-center border-l border-neutral-300" colSpan={collapsedGroups.has("lifeCover") ? 1 : 3}>
                  <button
                    onClick={() => toggleGroup("lifeCover")}
                    className="flex items-center justify-center w-full text-xs font-medium text-teal-600 uppercase tracking-wider hover:text-teal-700"
                  >
                    {collapsedGroups.has("lifeCover") ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                    Unapproved Life Cover
                  </button>
                </th>
                {!collapsedGroups.has("lifeCover") && (
                  <>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      % Split
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Cover Split (ZAR)
                    </th>
                  </>
                )}
              </>
            )}

            {/* Monthly Death Benefit Section */}
            {columnVisibility.monthlyDeathBenefit && (
              <>
                <th className="px-3 py-2 text-center border-l border-neutral-300" colSpan={collapsedGroups.has("monthlyBenefit") ? 1 : 6}>
                  <button
                    onClick={() => toggleGroup("monthlyBenefit")}
                    className="flex items-center justify-center w-full text-xs font-medium text-teal-800 uppercase tracking-wider hover:text-teal-700"
                  >
                    {collapsedGroups.has("monthlyBenefit") ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                    Monthly Death Benefit
                  </button>
                </th>
                {!collapsedGroups.has("monthlyBenefit") && (
                  <>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Term (Years)
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Increase %
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Approved Life Cover
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Fund Value
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Value at Death
                    </th>
                  </>
                )}
              </>
            )}

            {/* Fund Value Beneficiaries Section */}
            {columnVisibility.fundValueBeneficiaries && (
              <>
                <th className="px-3 py-2 text-center border-l border-neutral-300" colSpan={collapsedGroups.has("fundBeneficiaries") ? 1 : 7}>
                  <button
                    onClick={() => toggleGroup("fundBeneficiaries")}
                    className="flex items-center justify-center w-full text-xs font-medium text-orange-700 uppercase tracking-wider hover:text-orange-600"
                  >
                    {collapsedGroups.has("fundBeneficiaries") ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                    Fund Value Beneficiaries
                  </button>
                </th>
                {!collapsedGroups.has("fundBeneficiaries") && (
                  <>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      % Split
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Lump Sum Taken
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Nondeductible Contribution
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Living Annuity
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Income Term
                    </th>
                  </>
                )}
              </>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {funds.map((fund) => (
            <tr key={fund.id} className="hover:bg-neutral-50">
              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-neutral-900">
                {fund.description}
              </td>

              {/* Overview Columns */}
              {columnVisibility.overview && (
                <>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-l border-neutral-200">
                    <Select
                      value={fund.owner}
                      onValueChange={(value) => handleInputChange(fund.id, "owner", value)}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="compact-input border-0 bg-transparent focus:bg-white focus:border focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {owners.map((owner) => (
                          <SelectItem key={owner} value={owner}>
                            {owner}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  {!collapsedGroups.has("overview") && (
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                      <Input
                        type="number"
                        value={fund.coverAmount}
                        onChange={(e) => handleInputChange(fund.id, "coverAmount", e.target.value)}
                        className="compact-input w-20 text-right border-0 bg-transparent focus:bg-white focus:border focus:border-primary"
                        disabled={isUpdating}
                      />
                    </td>
                  )}
                </>
              )}

              {/* Unapproved Life Cover Columns */}
              {columnVisibility.unapprovedLifeCover && (
                <>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-l border-neutral-200">
                    <Input
                      value={fund.beneficiary}
                      onChange={(e) => handleInputChange(fund.id, "beneficiary", e.target.value)}
                      className="compact-input w-24 border-0 bg-transparent focus:bg-white focus:border focus:border-primary"
                      placeholder="Beneficiary"
                      disabled={isUpdating}
                    />
                  </td>
                  {!collapsedGroups.has("lifeCover") && (
                    <>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                        <Input
                          type="number"
                          value={fund.beneficiaryPercentage}
                          onChange={(e) => handleInputChange(fund.id, "beneficiaryPercentage", e.target.value)}
                          className="compact-input w-16 text-right border-0 bg-transparent focus:bg-white focus:border focus:border-primary"
                          disabled={isUpdating}
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                        <Input
                          type="number"
                          value={fund.coverSplit}
                          onChange={(e) => handleInputChange(fund.id, "coverSplit", e.target.value)}
                          className="compact-input w-20 text-right border-0 bg-transparent focus:bg-white focus:border focus:border-primary"
                          disabled={isUpdating}
                        />
                      </td>
                    </>
                  )}
                </>
              )}

              {/* Monthly Death Benefit Columns */}
              {columnVisibility.monthlyDeathBenefit && (
                <>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-l border-neutral-200">
                    <Input
                      type="number"
                      value={fund.monthlyIncome}
                      onChange={(e) => handleInputChange(fund.id, "monthlyIncome", e.target.value)}
                      className="compact-input w-20 text-right border-0 bg-transparent focus:bg-white focus:border focus:border-primary"
                      disabled={isUpdating}
                    />
                  </td>
                  {!collapsedGroups.has("monthlyBenefit") && (
                    <>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                        <Input
                          type="number"
                          value={fund.termYears}
                          onChange={(e) => handleInputChange(fund.id, "termYears", e.target.value)}
                          className="compact-input w-16 text-right border-0 bg-transparent focus:bg-white focus:border focus:border-primary"
                          disabled={isUpdating}
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                        <Input
                          type="number"
                          value={fund.increasePercentage}
                          onChange={(e) => handleInputChange(fund.id, "increasePercentage", e.target.value)}
                          className="compact-input w-16 text-right border-0 bg-transparent focus:bg-white focus:border focus:border-primary"
                          disabled={isUpdating}
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                        <Input
                          type="number"
                          value={fund.approvedLifeCover}
                          onChange={(e) => handleInputChange(fund.id, "approvedLifeCover", e.target.value)}
                          className="compact-input w-20 text-right border-0 bg-transparent focus:bg-white focus:border focus:border-primary"
                          disabled={isUpdating}
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                        <Input
                          type="number"
                          value={fund.fundValue}
                          onChange={(e) => handleInputChange(fund.id, "fundValue", e.target.value)}
                          className="compact-input w-20 text-right border-0 bg-transparent focus:bg-white focus:border focus:border-primary"
                          disabled={isUpdating}
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                        <Input
                          type="number"
                          value={fund.fundValueAtDeath}
                          onChange={(e) => handleInputChange(fund.id, "fundValueAtDeath", e.target.value)}
                          className="compact-input w-20 text-right border-0 bg-transparent focus:bg-white focus:border focus:border-primary"
                          disabled={isUpdating}
                        />
                      </td>
                    </>
                  )}
                </>
              )}

              {/* Fund Value Beneficiaries Columns */}
              {columnVisibility.fundValueBeneficiaries && (
                <>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-l border-neutral-200">
                    <Input
                      value={fund.beneficiaryName}
                      onChange={(e) => handleInputChange(fund.id, "beneficiaryName", e.target.value)}
                      className="compact-input w-24 border-0 bg-transparent focus:bg-white focus:border focus:border-primary"
                      placeholder="Name"
                      disabled={isUpdating}
                    />
                  </td>
                  {!collapsedGroups.has("fundBeneficiaries") && (
                    <>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                        <Input
                          type="number"
                          value={fund.beneficiaryPercentageSplit}
                          onChange={(e) => handleInputChange(fund.id, "beneficiaryPercentageSplit", e.target.value)}
                          className="compact-input w-16 text-right border-0 bg-transparent focus:bg-white focus:border focus:border-primary"
                          disabled={isUpdating}
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                        <Input
                          type="number"
                          value={fund.amount}
                          onChange={(e) => handleInputChange(fund.id, "amount", e.target.value)}
                          className="compact-input w-20 text-right border-0 bg-transparent focus:bg-white focus:border focus:border-primary"
                          disabled={isUpdating}
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                        <Input
                          type="number"
                          value={fund.lumpSumTaken}
                          onChange={(e) => handleInputChange(fund.id, "lumpSumTaken", e.target.value)}
                          className="compact-input w-20 text-right border-0 bg-transparent focus:bg-white focus:border focus:border-primary"
                          disabled={isUpdating}
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                        <Input
                          type="number"
                          value={fund.nondeductibleContribution}
                          onChange={(e) => handleInputChange(fund.id, "nondeductibleContribution", e.target.value)}
                          className="compact-input w-20 text-right border-0 bg-transparent focus:bg-white focus:border focus:border-primary"
                          disabled={isUpdating}
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                        <Input
                          type="number"
                          value={fund.livingAnnuity}
                          onChange={(e) => handleInputChange(fund.id, "livingAnnuity", e.target.value)}
                          className="compact-input w-20 text-right border-0 bg-transparent focus:bg-white focus:border focus:border-primary"
                          disabled={isUpdating}
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                        <Input
                          type="number"
                          value={fund.incomeTerm}
                          onChange={(e) => handleInputChange(fund.id, "incomeTerm", e.target.value)}
                          className="compact-input w-16 text-right border-0 bg-transparent focus:bg-white focus:border focus:border-primary"
                          disabled={isUpdating}
                        />
                      </td>
                    </>
                  )}
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}