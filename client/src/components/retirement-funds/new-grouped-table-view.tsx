import { RetirementFund, UpdateRetirementFund } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit3 } from "lucide-react";

interface ColumnVisibility {
  overview: boolean;
  unapprovedLifeCover: boolean;
  monthlyDeathBenefit: boolean;
  fundValueBeneficiaries: boolean;
}

interface NewGroupedTableViewProps {
  funds: RetirementFund[];
  columnVisibility: ColumnVisibility;
  tableMode: "inputs" | "flows";
  onFieldUpdate: (id: number, field: keyof UpdateRetirementFund, value: string) => void;
  isUpdating: boolean;
}

export function NewGroupedTableView({ funds, columnVisibility, tableMode, onFieldUpdate, isUpdating }: NewGroupedTableViewProps) {
  const handleInputChange = (fundId: number, field: keyof UpdateRetirementFund, value: string) => {
    onFieldUpdate(fundId, field, value);
  };

  const owners = ["John Doe", "Jane Smith"];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white table-auto">
        <thead>
          {/* First level headers */}
          <tr className="border-b border-neutral-200" style={{ backgroundColor: '#D6ECF5' }}>
            <th className="min-w-[200px] px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider" rowSpan={2}>
              Description
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider" rowSpan={2}>
              Owner
            </th>
            <th className="px-3 py-2 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider" colSpan={1}>
              Cover amount
            </th>
            <th className="px-3 py-2 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider border-l border-neutral-300" colSpan={4}>
              Monthly death benefit
            </th>
            <th className="px-3 py-2 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider border-l border-neutral-300" colSpan={1}>
              Approved life cover
            </th>
            <th className="px-3 py-2 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider border-l border-neutral-300" colSpan={2}>
              Fund value
            </th>
            <th className="px-3 py-2 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider border-l border-neutral-300" colSpan={6}>
              Fund value beneficiaries
            </th>
            <th className="px-3 py-2 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider border-l border-neutral-300" colSpan={1}>
              Living Annuity
            </th>
            <th className="px-3 py-2 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider border-l border-neutral-300" colSpan={1}>
              Income from
            </th>
          </tr>
          
          {/* Second level headers */}
          <tr className="border-b border-neutral-200" style={{ backgroundColor: '#D6ECF5' }}>
            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Unapproved
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider border-l border-neutral-300">
              Monthly income
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Term (Years)
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Increase %
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Escalation amount
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider border-l border-neutral-300">
              
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider border-l border-neutral-300">
              Fund value
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Fund value at death
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider border-l border-neutral-300">
              Name
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              %
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Lump sum taken
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Fund value at death
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
              Unappropriated fund commencement amount
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider border-l border-neutral-300">
              
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider border-l border-neutral-300">
              
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {funds.map((fund) => (
            <tr key={fund.id} className="hover:bg-neutral-50">
              {/* Description */}
              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-neutral-900">
                {fund.description}
              </td>
              
              {/* Owner */}
              <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                <Select
                  value={fund.owner || ""}
                  onValueChange={(value) => handleInputChange(fund.id, "owner", value)}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="compact-input border-0 bg-transparent focus:bg-white focus:border focus:border-primary hover:bg-teal-50 transition-colors duration-200 group">
                    <SelectValue />
                    <Edit3 size={12} className="ml-1 text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
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

              {/* Cover amount - Unapproved */}
              <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                <Input
                  type="text"
                  value={fund.coverAmount || ""}
                  onChange={(e) => handleInputChange(fund.id, "coverAmount", e.target.value)}
                  className="compact-input border-0 bg-transparent focus:bg-white focus:border focus:border-primary hover:bg-teal-50 text-right"
                  placeholder="R 0"
                  disabled={isUpdating}
                />
              </td>

              {/* Monthly death benefit - Monthly income */}
              <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-l border-neutral-200">
                <Input
                  type="text"
                  value={fund.monthlyIncome || ""}
                  onChange={(e) => handleInputChange(fund.id, "monthlyIncome", e.target.value)}
                  className="compact-input border-0 bg-transparent focus:bg-white focus:border focus:border-primary hover:bg-teal-50 text-right"
                  placeholder="R 0"
                  disabled={isUpdating}
                />
              </td>

              {/* Monthly death benefit - Term (Years) */}
              <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                <Input
                  type="text"
                  value={fund.termYears || ""}
                  onChange={(e) => handleInputChange(fund.id, "termYears", e.target.value)}
                  className="compact-input border-0 bg-transparent focus:bg-white focus:border focus:border-primary hover:bg-teal-50 text-right"
                  placeholder="0"
                  disabled={isUpdating}
                />
              </td>

              {/* Monthly death benefit - Increase % */}
              <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                <Input
                  type="text"
                  value={fund.increasePercentage || ""}
                  onChange={(e) => handleInputChange(fund.id, "increasePercentage", e.target.value)}
                  className="compact-input border-0 bg-transparent focus:bg-white focus:border focus:border-primary hover:bg-teal-50 text-right"
                  placeholder="0%"
                  disabled={isUpdating}
                />
              </td>

              {/* Monthly death benefit - Escalation amount */}
              <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                <Input
                  type="text"
                  value={fund.approvedLifeCover || ""}
                  onChange={(e) => handleInputChange(fund.id, "approvedLifeCover", e.target.value)}
                  className="compact-input border-0 bg-transparent focus:bg-white focus:border focus:border-primary hover:bg-teal-50 text-right"
                  placeholder="R 0"
                  disabled={isUpdating}
                />
              </td>

              {/* Approved life cover */}
              <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-l border-neutral-200">
                <span className="text-neutral-600">R {fund.approvedLifeCover || "0"}</span>
              </td>

              {/* Fund value - Fund value */}
              <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-l border-neutral-200">
                <span className="text-neutral-600">R {fund.fundValue || "0"}</span>
              </td>

              {/* Fund value - Fund value at death */}
              <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                <span className="text-neutral-600">R {fund.fundValueAtDeath || "0"}</span>
              </td>

              {/* Fund value beneficiaries - Name */}
              <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-l border-neutral-200">
                <div className="p-2 rounded" style={{ backgroundColor: '#FFFFFF', color: '#EA8A2E' }}>
                  <Input
                    type="text"
                    value={fund.beneficiaryName || ""}
                    onChange={(e) => handleInputChange(fund.id, "beneficiaryName", e.target.value)}
                    className="compact-input border-0 bg-transparent focus:bg-white focus:border focus:border-primary hover:bg-orange-50 text-right"
                    placeholder="Beneficiary name"
                    disabled={isUpdating}
                  />
                </div>
              </td>

              {/* Fund value beneficiaries - % */}
              <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                <div className="p-2 rounded" style={{ backgroundColor: '#FFFFFF', color: '#EA8A2E' }}>
                  <Input
                    type="text"
                    value={fund.beneficiaryPercentageSplit || ""}
                    onChange={(e) => handleInputChange(fund.id, "beneficiaryPercentageSplit", e.target.value)}
                    className="compact-input border-0 bg-transparent focus:bg-white focus:border focus:border-primary hover:bg-orange-50 text-right"
                    placeholder="0%"
                    disabled={isUpdating}
                  />
                </div>
              </td>

              {/* Fund value beneficiaries - Amount */}
              <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                <div className="p-2 rounded" style={{ backgroundColor: '#FFFFFF', color: '#EA8A2E' }}>
                  <Input
                    type="text"
                    value={fund.amount || ""}
                    onChange={(e) => handleInputChange(fund.id, "amount", e.target.value)}
                    className="compact-input border-0 bg-transparent focus:bg-white focus:border focus:border-primary hover:bg-orange-50 text-right"
                    placeholder="R 0"
                    disabled={isUpdating}
                  />
                </div>
              </td>

              {/* Fund value beneficiaries - Lump sum taken */}
              <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                <div className="p-2 rounded" style={{ backgroundColor: '#FFFFFF', color: '#EA8A2E' }}>
                  <Input
                    type="text"
                    value={fund.lumpSumTaken || ""}
                    onChange={(e) => handleInputChange(fund.id, "lumpSumTaken", e.target.value)}
                    className="compact-input border-0 bg-transparent focus:bg-white focus:border focus:border-primary hover:bg-orange-50 text-right"
                    placeholder="R 0"
                    disabled={isUpdating}
                  />
                </div>
              </td>

              {/* Fund value beneficiaries - Fund value at death */}
              <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                <div className="p-2 rounded" style={{ backgroundColor: '#FFFFFF', color: '#EA8A2E' }}>
                  <span className="text-neutral-600">R {fund.fundValueAtDeath || "0"}</span>
                </div>
              </td>

              {/* Fund value beneficiaries - Unappropriated fund commencement amount */}
              <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                <div className="p-2 rounded" style={{ backgroundColor: '#FFFFFF', color: '#EA8A2E' }}>
                  <Input
                    type="text"
                    value={fund.nondeductibleContribution || ""}
                    onChange={(e) => handleInputChange(fund.id, "nondeductibleContribution", e.target.value)}
                    className="compact-input border-0 bg-transparent focus:bg-white focus:border focus:border-primary hover:bg-orange-50 text-right"
                    placeholder="R 0"
                    disabled={isUpdating}
                  />
                </div>
              </td>

              {/* Living Annuity */}
              <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-l border-neutral-200">
                <span className="text-neutral-600">{fund.livingAnnuity || ""}</span>
              </td>

              {/* Income from */}
              <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-l border-neutral-200">
                <span className="text-neutral-600">{fund.incomeTerm || ""}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}