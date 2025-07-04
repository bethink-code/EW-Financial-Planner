import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RetirementFund, UpdateRetirementFund } from "@shared/schema";

interface ColumnVisibility {
  overview: boolean;
  unapprovedLifeCover: boolean;
  monthlyDeathBenefit: boolean;
  fundValue: boolean;
  fundValueBeneficiaries: boolean;
}

interface GroupedTableViewProps {
  funds: RetirementFund[];
  columnVisibility: ColumnVisibility;
  onFieldUpdate: (id: number, field: keyof UpdateRetirementFund, value: string) => void;
  isUpdating: boolean;
}

export function GroupedTableView({ funds, columnVisibility, onFieldUpdate, isUpdating }: GroupedTableViewProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  const handleInputChange = (id: number, field: keyof UpdateRetirementFund, value: string) => {
    onFieldUpdate(id, field, value);
  };

  const owners = ["John Doe", "Jane Smith"];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              {/* Basic Information Group */}
              {columnVisibility.basicInfo && (
                <th colSpan={3} className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider bg-blue-50 border-r border-neutral-200">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleGroup("basic")}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      {collapsedGroups.has("basic") ? (
                        <ChevronRight size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </button>
                    <span>Basic Information</span>
                  </div>
                </th>
              )}
              
              {/* Death Benefits Group */}
              {columnVisibility.deathBenefits && (
                <th colSpan={4} className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider bg-green-50 border-r border-neutral-200">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleGroup("death")}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      {collapsedGroups.has("death") ? (
                        <ChevronRight size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </button>
                    <span>Death Benefits</span>
                  </div>
                </th>
              )}
              
              {/* Financial Details Group */}
              {columnVisibility.financialDetails && (
                <th colSpan={5} className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider bg-orange-50">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleGroup("financial")}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      {collapsedGroups.has("financial") ? (
                        <ChevronRight size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </button>
                    <span>Financial Details</span>
                  </div>
                </th>
              )}
            </tr>
            <tr>
              {/* Basic Information Sub-headers */}
              {columnVisibility.basicInfo && !collapsedGroups.has("basic") && (
                <>
                  <th className="px-3 py-1.5 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider bg-blue-25">Description</th>
                  <th className="px-3 py-1.5 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider bg-blue-25">Owner</th>
                  <th className="px-3 py-1.5 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider bg-blue-25 border-r border-neutral-200">Cover Against</th>
                </>
              )}
              
              {/* Death Benefits Sub-headers */}
              {columnVisibility.deathBenefits && !collapsedGroups.has("death") && (
                <>
                  <th className="px-3 py-1.5 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider bg-green-25">Monthly Death</th>
                  <th className="px-3 py-1.5 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider bg-green-25">Lump Sum Death</th>
                  <th className="px-3 py-1.5 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider bg-green-25">Previous Lump</th>
                  <th className="px-3 py-1.5 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider bg-green-25 border-r border-neutral-200">Tax Free Amount</th>
                </>
              )}
              
              {/* Financial Details Sub-headers */}
              {columnVisibility.financialDetails && !collapsedGroups.has("financial") && (
                <>
                  <th className="px-3 py-1.5 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider bg-orange-25">Fund Value</th>
                  <th className="px-3 py-1.5 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider bg-orange-25">Value at Death</th>
                  <th className="px-3 py-1.5 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider bg-orange-25">Name</th>
                  <th className="px-3 py-1.5 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider bg-orange-25">Amount</th>
                  <th className="px-3 py-1.5 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider bg-orange-25">Lump Sum</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {funds.map((fund) => (
              <tr key={fund.id} className="hover:bg-neutral-50 transition-colors">
                {/* Basic Information Cells */}
                {columnVisibility.basicInfo && !collapsedGroups.has("basic") && (
                  <>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                      <Input
                        value={fund.description}
                        onChange={(e) => handleInputChange(fund.id, "description", e.target.value)}
                        className="compact-input w-full border-0 bg-transparent focus:bg-white focus:border focus:border-primary"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                      <Select
                        value={fund.owner}
                        onValueChange={(value) => handleInputChange(fund.id, "owner", value)}
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="w-full h-7 text-xs border-0 bg-transparent focus:bg-white focus:border focus:border-primary">
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
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-r border-neutral-200">
                      <Input
                        value={fund.coverAgainst}
                        onChange={(e) => handleInputChange(fund.id, "coverAgainst", e.target.value)}
                        className="compact-input w-16 text-right border-0 bg-transparent focus:bg-white focus:border focus:border-primary"
                        disabled={isUpdating}
                      />
                    </td>
                  </>
                )}
                
                {/* Death Benefits Cells */}
                {columnVisibility.deathBenefits && !collapsedGroups.has("death") && (
                  <>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                      <Input
                        type="number"
                        value={fund.monthlyDeathBenefit}
                        onChange={(e) => handleInputChange(fund.id, "monthlyDeathBenefit", e.target.value)}
                        className="compact-input w-20 text-right border-0 bg-transparent focus:bg-white focus:border focus:border-primary"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                      <Input
                        type="number"
                        value={fund.lumpSumDeath}
                        onChange={(e) => handleInputChange(fund.id, "lumpSumDeath", e.target.value)}
                        className="compact-input w-20 text-right border-0 bg-transparent focus:bg-white focus:border focus:border-primary"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                      <Input
                        type="number"
                        value={fund.previousLumpSums}
                        onChange={(e) => handleInputChange(fund.id, "previousLumpSums", e.target.value)}
                        className="compact-input w-20 text-right border-0 bg-transparent focus:bg-white focus:border focus:border-primary"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-r border-neutral-200">
                      <Input
                        type="number"
                        value={fund.taxFreeAmount}
                        onChange={(e) => handleInputChange(fund.id, "taxFreeAmount", e.target.value)}
                        className="compact-input w-20 text-right border-0 bg-transparent focus:bg-white focus:border focus:border-primary"
                        disabled={isUpdating}
                      />
                    </td>
                  </>
                )}
                
                {/* Financial Details Cells */}
                {columnVisibility.financialDetails && !collapsedGroups.has("financial") && (
                  <>
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
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                      <Input
                        value={fund.name}
                        onChange={(e) => handleInputChange(fund.id, "name", e.target.value)}
                        className="compact-input w-24 border-0 bg-transparent focus:bg-white focus:border focus:border-primary"
                        placeholder="Name"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                      <Input
                        type="number"
                        value={fund.amount}
                        onChange={(e) => handleInputChange(fund.id, "amount", e.target.value)}
                        className="compact-input w-20 text-right border-0 bg-transparent focus:bg-white focus:border focus:border-primary"
                        placeholder="0"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                      <Input
                        type="number"
                        value={fund.lumpSumTaken}
                        onChange={(e) => handleInputChange(fund.id, "lumpSumTaken", e.target.value)}
                        className="compact-input w-20 text-right border-0 bg-transparent focus:bg-white focus:border focus:border-primary"
                        placeholder="0"
                        disabled={isUpdating}
                      />
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
