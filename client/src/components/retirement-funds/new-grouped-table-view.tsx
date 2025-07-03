import { RetirementFund, UpdateRetirementFund } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Edit3, Plus, Minus } from "lucide-react";
import { useRef, useEffect } from "react";
import {
  parseUnapprovedBeneficiaries,
  parseFundValueBeneficiaries,
  addUnapprovedBeneficiary,
  addFundValueBeneficiary,
  removeUnapprovedBeneficiary,
  removeFundValueBeneficiary,
  updateUnapprovedBeneficiary,
  updateFundValueBeneficiary
} from "@/lib/beneficiaries";

interface ColumnVisibility {
  overview: boolean;
  unapprovedLifeCover: boolean;
  monthlyDeathBenefit: boolean;
  fundValue: boolean;
  fundValueBeneficiaries: boolean;
}

interface NewGroupedTableViewProps {
  funds: RetirementFund[];
  columnVisibility: ColumnVisibility;
  tableMode: "inputs" | "flows";
  onFieldUpdate: (id: number, field: keyof UpdateRetirementFund, value: string) => void;
  isUpdating: boolean;
}

// Auto-sizing input component
const AutoSizeInput = ({ value, onChange, className, placeholder, disabled, style, ...props }: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  type?: string;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      // Create a temporary span to measure text width
      const span = document.createElement('span');
      span.style.visibility = 'hidden';
      span.style.position = 'absolute';
      span.style.whiteSpace = 'pre';
      span.style.font = window.getComputedStyle(inputRef.current).font;
      span.textContent = value || placeholder || '';
      document.body.appendChild(span);
      
      const width = Math.max(60, Math.min(250, span.offsetWidth + 30)); // Min 60px, max 250px, +30px for padding
      inputRef.current.style.width = `${width}px`;
      
      document.body.removeChild(span);
    }
  }, [value, placeholder]);

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={onChange}
      className={`${className} auto-size-input`}
      placeholder={placeholder}
      disabled={disabled}
      style={{ ...style, minWidth: '60px', maxWidth: '250px' }}
      {...props}
    />
  );
};

export function NewGroupedTableView({ funds, columnVisibility, tableMode, onFieldUpdate, isUpdating }: NewGroupedTableViewProps) {
  const handleInputChange = (fundId: number, field: keyof UpdateRetirementFund, value: string) => {
    onFieldUpdate(fundId, field, value);
  };

  const owners = ["John Doe", "Jane Smith"];

  // Inputs Table Component (always shown)
  const InputsTable = () => (
    <div className="overflow-x-auto mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-neutral-900">Retirement Funds - Inputs</h3>
      </div>
      <table className="min-w-full bg-white table-auto border border-neutral-300 rounded-lg">
        <thead>
          <tr className="border-b border-neutral-200" style={{ backgroundColor: '#D6ECF5' }}>
            {/* Overview Section Headers */}
            {columnVisibility.overview && (
              <>
                <th colSpan={3} className="px-3 py-3 text-center text-sm font-bold uppercase tracking-wider border-r border-neutral-300" style={{ color: '#094161' }}>
                  Overview
                </th>
              </>
            )}

            {/* Unapproved Life Cover Section Headers */}
            {columnVisibility.unapprovedLifeCover && (
              <>
                <th colSpan={3} className="px-3 py-3 text-center text-sm font-bold uppercase tracking-wider border-r border-neutral-300" style={{ color: '#094161' }}>
                  Unapproved Life Cover
                </th>
              </>
            )}

            {/* Monthly Death Benefit Section Headers */}
            {columnVisibility.monthlyDeathBenefit && (
              <>
                <th colSpan={4} className="px-3 py-3 text-center text-sm font-bold uppercase tracking-wider border-r border-neutral-300" style={{ color: '#094161' }}>
                  Monthly Death Benefit
                </th>
              </>
            )}

            {/* Fund Value Section Headers */}
            {columnVisibility.fundValue && (
              <>
                <th colSpan={3} className="px-3 py-3 text-center text-sm font-bold uppercase tracking-wider border-r border-neutral-300" style={{ color: '#094161' }}>
                  Fund Value
                </th>
              </>
            )}

            {/* Fund Value Beneficiaries Section Headers */}
            {columnVisibility.fundValueBeneficiaries && (
              <>
                <th colSpan={8} className="px-3 py-3 text-center text-sm font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Fund Value Beneficiaries
                </th>
              </>
            )}
          </tr>

          {/* Second level headers */}
          <tr className="border-b-2 border-neutral-300" style={{ backgroundColor: '#D6ECF5' }}>
            {/* Overview Section Subheaders */}
            {columnVisibility.overview && (
              <>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider border-r border-neutral-300" style={{ color: '#094161' }}>
                  Description
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider border-r border-neutral-300" style={{ color: '#094161' }}>
                  Owner
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider border-r border-neutral-300" style={{ color: '#094161' }}>
                  Cover Amount
                </th>
              </>
            )}

            {/* Unapproved Life Cover Subheaders */}
            {columnVisibility.unapprovedLifeCover && (
              <>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Unapproved Beneficiaries
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Percentage
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider border-r border-neutral-300" style={{ color: '#094161' }}>
                  Cover Split
                </th>
              </>
            )}

            {/* Monthly Death Benefit Subheaders */}
            {columnVisibility.monthlyDeathBenefit && (
              <>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Monthly Income
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Term Years
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Increase Percentage
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider border-r border-neutral-300" style={{ color: '#094161' }}>
                  Total Amount
                </th>
              </>
            )}

            {/* Fund Value Subheaders */}
            {columnVisibility.fundValue && (
              <>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Approved Life Cover
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Fund Value
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider border-r border-neutral-300" style={{ color: '#094161' }}>
                  Fund Value at Death
                </th>
              </>
            )}

            {/* Fund Value Beneficiaries Subheaders */}
            {columnVisibility.fundValueBeneficiaries && (
              <>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  %
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Amount
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Lump Sum Taken
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Fund Value at Death
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Non Deductible Contribution
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Living Annuity
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Income Term
                </th>
              </>
            )}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-neutral-200">
          {funds.map((fund) => (
            <tr key={fund.id} className="hover:bg-neutral-50">
              {/* Overview Section */}
              {columnVisibility.overview && (
                <>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900" style={{ backgroundColor: '#EFF5F9' }}>
                    <AutoSizeInput
                      type="text"
                      value={fund.description || ""}
                      onChange={(e) => handleInputChange(fund.id, "description", e.target.value)}
                      className="border-0 focus:bg-white focus:border focus:border-primary hover:bg-teal-50 text-right"
                      placeholder="Fund description"
                      disabled={isUpdating}
                    />
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900" style={{ backgroundColor: '#EFF5F9' }}>
                    <Select
                      value={fund.owner || ""}
                      onValueChange={(value) => handleInputChange(fund.id, "owner", value)}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-auto min-w-[120px] h-8 text-sm border-0 bg-[#F2F7FB] focus:bg-white focus:border focus:border-primary hover:bg-teal-50 text-right">
                        <SelectValue placeholder="Select owner" />
                      </SelectTrigger>
                      <SelectContent>
                        {owners.map((owner) => (
                          <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-r border-neutral-300" style={{ backgroundColor: '#EFF5F9' }}>
                    <AutoSizeInput
                      type="text"
                      value={fund.coverAmount || ""}
                      onChange={(e) => handleInputChange(fund.id, "coverAmount", e.target.value)}
                      className="border-0 focus:bg-white focus:border focus:border-primary hover:bg-teal-50 text-right"
                      placeholder="R 0"
                      disabled={isUpdating}
                    />
                  </td>
                </>
              )}

              {/* Unapproved Life Cover Section */}
              {columnVisibility.unapprovedLifeCover && (
                <>
                  <td colSpan={3} className="px-3 py-2 border-r border-neutral-300" style={{ backgroundColor: '#EFF5F9' }}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-neutral-700">Unapproved Beneficiaries</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleInputChange(fund.id, "unapprovedBeneficiaries", addUnapprovedBeneficiary(fund.unapprovedBeneficiaries || ""))}
                          disabled={isUpdating}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      {parseUnapprovedBeneficiaries(fund.unapprovedBeneficiaries || "").map((beneficiary, index) => (
                        <div key={beneficiary.id} className="grid grid-cols-4 gap-2 p-2 bg-white rounded border">
                          <div>
                            <Label className="text-xs text-neutral-600">Name</Label>
                            <Input
                              value={beneficiary.name}
                              onChange={(e) => handleInputChange(fund.id, "unapprovedBeneficiaries", 
                                updateUnapprovedBeneficiary(fund.unapprovedBeneficiaries || "", beneficiary.id, "name", e.target.value))}
                              className="h-7 text-xs"
                              disabled={isUpdating}
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-neutral-600">%</Label>
                            <Input
                              value={beneficiary.percentage}
                              onChange={(e) => handleInputChange(fund.id, "unapprovedBeneficiaries", 
                                updateUnapprovedBeneficiary(fund.unapprovedBeneficiaries || "", beneficiary.id, "percentage", e.target.value))}
                              className="h-7 text-xs text-right"
                              disabled={isUpdating}
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-neutral-600">Cover Split</Label>
                            <Input
                              value={beneficiary.coverSplit}
                              onChange={(e) => handleInputChange(fund.id, "unapprovedBeneficiaries", 
                                updateUnapprovedBeneficiary(fund.unapprovedBeneficiaries || "", beneficiary.id, "coverSplit", e.target.value))}
                              className="h-7 text-xs text-right"
                              disabled={isUpdating}
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleInputChange(fund.id, "unapprovedBeneficiaries", 
                                removeUnapprovedBeneficiary(fund.unapprovedBeneficiaries || "", beneficiary.id))}
                              disabled={isUpdating}
                              className="h-7 w-7 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                </>
              )}

              {/* Monthly Death Benefit Section */}
              {columnVisibility.monthlyDeathBenefit && (
                <>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900" style={{ backgroundColor: '#EFF5F9' }}>
                    <AutoSizeInput
                      type="text"
                      value={fund.monthlyIncome || ""}
                      onChange={(e) => handleInputChange(fund.id, "monthlyIncome", e.target.value)}
                      className="border-0 focus:bg-white focus:border focus:border-primary hover:bg-teal-50 text-right"
                      placeholder="R 0"
                      disabled={isUpdating}
                    />
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900" style={{ backgroundColor: '#EFF5F9' }}>
                    <AutoSizeInput
                      type="text"
                      value={fund.termYears || ""}
                      onChange={(e) => handleInputChange(fund.id, "termYears", e.target.value)}
                      className="border-0 focus:bg-white focus:border focus:border-primary hover:bg-teal-50 text-right"
                      placeholder="0"
                      disabled={isUpdating}
                    />
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900" style={{ backgroundColor: '#EFF5F9' }}>
                    <AutoSizeInput
                      type="text"
                      value={fund.increasePercentage || ""}
                      onChange={(e) => handleInputChange(fund.id, "increasePercentage", e.target.value)}
                      className="border-0 focus:bg-white focus:border focus:border-primary hover:bg-teal-50 text-right"
                      placeholder="0%"
                      disabled={isUpdating}
                    />
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-r border-neutral-300" style={{ backgroundColor: '#EFF5F9' }}>
                    <span className="text-neutral-600">
                      R {((parseFloat(fund.monthlyIncome) || 0) * (parseFloat(fund.termYears) || 0) * 12).toLocaleString()}
                    </span>
                  </td>
                </>
              )}

              {/* Fund Value Section */}
              {columnVisibility.fundValue && (
                <>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900" style={{ backgroundColor: '#EFF5F9' }}>
                    <AutoSizeInput
                      type="text"
                      value={fund.approvedLifeCover || ""}
                      onChange={(e) => handleInputChange(fund.id, "approvedLifeCover", e.target.value)}
                      className="border-0 focus:bg-white focus:border focus:border-primary hover:bg-teal-50 text-right"
                      placeholder="R 0"
                      disabled={isUpdating}
                    />
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900" style={{ backgroundColor: '#EFF5F9' }}>
                    <AutoSizeInput
                      type="text"
                      value={fund.fundValue || ""}
                      onChange={(e) => handleInputChange(fund.id, "fundValue", e.target.value)}
                      className="border-0 focus:bg-white focus:border focus:border-primary hover:bg-teal-50 text-right"
                      placeholder="R 0"
                      disabled={isUpdating}
                    />
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-r border-neutral-300" style={{ backgroundColor: '#EFF5F9' }}>
                    <span className="text-neutral-600">{fund.fundValueAtDeath || "R 0"}</span>
                  </td>
                </>
              )}

              {/* Fund Value Beneficiaries Section */}
              {columnVisibility.fundValueBeneficiaries && (
                <>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900" style={{ backgroundColor: '#EFF5F9' }}>
                    <div className="text-right text-sm text-neutral-600">
                      {fund.fundValueBeneficiaries ? 
                        JSON.parse(fund.fundValueBeneficiaries).map((b: any) => b.name).join(', ') || 'None'
                        : 'None'}
                    </div>
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900" style={{ backgroundColor: '#EFF5F9' }}>
                    <div className="text-right text-sm text-neutral-600">
                      {fund.fundValueBeneficiaries ? 
                        JSON.parse(fund.fundValueBeneficiaries).reduce((sum: number, b: any) => sum + (parseFloat(b.percentage) || 0), 0).toFixed(1) + '%'
                        : '0%'}
                    </div>
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900" style={{ backgroundColor: '#EFF5F9' }}>
                    <div className="text-right text-sm text-neutral-600">
                      R {((parseFloat(fund.fundValue) || 0) * 0.8).toLocaleString()}
                    </div>
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900" style={{ backgroundColor: '#EFF5F9' }}>
                    <div className="text-right text-sm text-neutral-600">
                      {fund.fundValueBeneficiaries ? 
                        'R ' + JSON.parse(fund.fundValueBeneficiaries).reduce((sum: number, b: any) => sum + (parseFloat(b.lumpSumTaken) || 0), 0).toLocaleString()
                        : 'R 0'}
                    </div>
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900" style={{ backgroundColor: '#EFF5F9' }}>
                    <div className="text-right text-sm text-neutral-600">
                      R {(parseFloat(fund.fundValueAtDeath) || 0).toLocaleString()}
                    </div>
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900" style={{ backgroundColor: '#EFF5F9' }}>
                    <div className="text-right text-sm text-neutral-600">
                      {fund.fundValueBeneficiaries ? 
                        'R ' + JSON.parse(fund.fundValueBeneficiaries).reduce((sum: number, b: any) => sum + (parseFloat(b.nondeductibleContribution) || 0), 0).toLocaleString()
                        : 'R 0'}
                    </div>
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900" style={{ backgroundColor: '#EFF5F9' }}>
                    <div className="text-right text-sm text-neutral-600">
                      {fund.fundValueBeneficiaries ? 
                        'R ' + JSON.parse(fund.fundValueBeneficiaries).reduce((sum: number, b: any) => sum + (parseFloat(b.livingAnnuity) || 0), 0).toLocaleString()
                        : 'R 0'}
                    </div>
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900" style={{ backgroundColor: '#EFF5F9' }}>
                    <div className="text-right text-sm text-neutral-600">
                      {fund.fundValueBeneficiaries ? 
                        JSON.parse(fund.fundValueBeneficiaries).reduce((sum: number, b: any) => sum + (parseFloat(b.incomeTerm) || 0), 0).toFixed(0) + ' years'
                        : '0 years'}
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Flows Table Component (shown when tableMode is "flows")
  const FlowsTable = () => (
    <div className="overflow-x-auto">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-neutral-900">Retirement Funds - Financial Flows</h3>
      </div>
      <table className="min-w-full bg-white table-auto border border-neutral-300 rounded-lg">
        <thead>
          <tr className="border-b border-neutral-200" style={{ backgroundColor: '#D6ECF5' }}>
            {/* Overview Section Headers */}
            {columnVisibility.overview && (
              <>
                <th colSpan={3} className="px-3 py-3 text-center text-sm font-bold uppercase tracking-wider border-r border-neutral-300" style={{ color: '#094161' }}>
                  Current Values
                </th>
              </>
            )}

            {/* Unapproved Life Cover Section Headers */}
            {columnVisibility.unapprovedLifeCover && (
              <>
                <th colSpan={3} className="px-3 py-3 text-center text-sm font-bold uppercase tracking-wider border-r border-neutral-300" style={{ color: '#094161' }}>
                  Beneficiary Flows
                </th>
              </>
            )}

            {/* Monthly Death Benefit Section Headers */}
            {columnVisibility.monthlyDeathBenefit && (
              <>
                <th colSpan={4} className="px-3 py-3 text-center text-sm font-bold uppercase tracking-wider border-r border-neutral-300" style={{ color: '#094161' }}>
                  Income Projections
                </th>
              </>
            )}

            {/* Fund Value Section Headers */}
            {columnVisibility.fundValue && (
              <>
                <th colSpan={3} className="px-3 py-3 text-center text-sm font-bold uppercase tracking-wider border-r border-neutral-300" style={{ color: '#094161' }}>
                  Fund Growth
                </th>
              </>
            )}

            {/* Fund Value Beneficiaries Section Headers */}
            {columnVisibility.fundValueBeneficiaries && (
              <>
                <th colSpan={6} className="px-3 py-3 text-center text-sm font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Estate Planning Costs
                </th>
              </>
            )}
          </tr>

          {/* Second level headers for flows */}
          <tr className="border-b-2 border-neutral-300" style={{ backgroundColor: '#D6ECF5' }}>
            {/* Overview Section Subheaders */}
            {columnVisibility.overview && (
              <>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider border-r border-neutral-300" style={{ color: '#094161' }}>
                  Fund Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider border-r border-neutral-300" style={{ color: '#094161' }}>
                  Owner Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider border-r border-neutral-300" style={{ color: '#094161' }}>
                  Current Value
                </th>
              </>
            )}

            {/* Unapproved Life Cover Subheaders */}
            {columnVisibility.unapprovedLifeCover && (
              <>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Beneficiaries Count
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Total Coverage %
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider border-r border-neutral-300" style={{ color: '#094161' }}>
                  Flow Amount
                </th>
              </>
            )}

            {/* Monthly Death Benefit Subheaders */}
            {columnVisibility.monthlyDeathBenefit && (
              <>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Current Income
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Annual Growth
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Inflation Adj %
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider border-r border-neutral-300" style={{ color: '#094161' }}>
                  Projected Total
                </th>
              </>
            )}

            {/* Fund Value Subheaders */}
            {columnVisibility.fundValue && (
              <>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Current Fund Value
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Growth Rate %
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider border-r border-neutral-300" style={{ color: '#094161' }}>
                  Projected Term
                </th>
              </>
            )}

            {/* Fund Value Beneficiaries Subheaders */}
            {columnVisibility.fundValueBeneficiaries && (
              <>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Estate Duty (Spouse)
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Estate Duty (No Spouse)
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Estate Duty (Others)
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Executor Fee
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Master Fee
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#094161' }}>
                  Total Costs
                </th>
              </>
            )}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-neutral-200">
          {funds.map((fund) => (
            <tr key={fund.id} className="hover:bg-neutral-50">
              {/* Overview Section Flows */}
              {columnVisibility.overview && (
                <>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                    <div className="text-right text-sm text-neutral-600">
                      {fund.description || "Unnamed Fund"}
                    </div>
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                    <div className="text-right text-sm text-neutral-600">
                      {fund.owner ? "Active" : "Pending"}
                    </div>
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-r border-neutral-300">
                    <div className="text-right text-sm text-neutral-600">
                      R {(parseFloat(fund.coverAmount) || 0).toLocaleString()}
                    </div>
                  </td>
                </>
              )}

              {/* Unapproved Life Cover Flows */}
              {columnVisibility.unapprovedLifeCover && (
                <>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                    <div className="text-right text-sm text-neutral-600">
                      {fund.unapprovedBeneficiaries ? 
                        JSON.parse(fund.unapprovedBeneficiaries).length + " beneficiaries"
                        : "0 beneficiaries"}
                    </div>
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                    <div className="text-right text-sm text-neutral-600">
                      {fund.unapprovedBeneficiaries ? 
                        JSON.parse(fund.unapprovedBeneficiaries).reduce((sum: number, b: any) => sum + (parseFloat(b.percentage) || 0), 0).toFixed(1) + '%'
                        : '0%'}
                    </div>
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-r border-neutral-300">
                    <div className="text-right text-sm text-neutral-600">
                      R {((parseFloat(fund.coverAmount) || 0) * 0.75).toLocaleString()}
                    </div>
                  </td>
                </>
              )}

              {/* Monthly Death Benefit Flows */}
              {columnVisibility.monthlyDeathBenefit && (
                <>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                    <div className="text-right text-sm text-neutral-600">
                      R {(parseFloat(fund.monthlyIncome) || 0).toLocaleString()}
                    </div>
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                    <div className="text-right text-sm text-neutral-600">
                      R {((parseFloat(fund.monthlyIncome) || 0) * 0.06).toLocaleString()}
                    </div>
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                    <div className="text-right text-sm text-neutral-600">
                      {fund.increasePercentage || "6%"}
                    </div>
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-r border-neutral-300">
                    <div className="text-right text-sm text-neutral-600">
                      R {((parseFloat(fund.monthlyIncome) || 0) * (parseFloat(fund.termYears) || 0) * 12 * 1.06).toLocaleString()}
                    </div>
                  </td>
                </>
              )}

              {/* Fund Value Flows */}
              {columnVisibility.fundValue && (
                <>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                    <div className="text-right text-sm text-neutral-600">
                      R {(parseFloat(fund.fundValue) || 0).toLocaleString()}
                    </div>
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                    <div className="text-right text-sm text-neutral-600">
                      7.5%
                    </div>
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-r border-neutral-300">
                    <div className="text-right text-sm text-neutral-600">
                      25 years
                    </div>
                  </td>
                </>
              )}

              {/* Fund Value Beneficiaries Flows */}
              {columnVisibility.fundValueBeneficiaries && (
                <>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                    <div className="text-right text-sm text-neutral-600">
                      R {((parseFloat(fund.fundValue) || 0) * 0.15).toLocaleString()}
                    </div>
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                    <div className="text-right text-sm text-neutral-600">
                      R {((parseFloat(fund.fundValue) || 0) * 0.20).toLocaleString()}
                    </div>
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                    <div className="text-right text-sm text-neutral-600">
                      R {((parseFloat(fund.fundValue) || 0) * 0.25).toLocaleString()}
                    </div>
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                    <div className="text-right text-sm text-neutral-600">
                      R {((parseFloat(fund.fundValue) || 0) * 0.035).toLocaleString()}
                    </div>
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                    <div className="text-right text-sm text-neutral-600">
                      R {((parseFloat(fund.fundValue) || 0) * 0.006).toLocaleString()}
                    </div>
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                    <div className="text-right text-sm text-neutral-600 font-semibold">
                      R {((parseFloat(fund.fundValue) || 0) * 0.431).toLocaleString()}
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Always show inputs table */}
      <InputsTable />
      
      {/* Show flows table when flows mode is enabled */}
      {tableMode === "flows" && <FlowsTable />}
    </div>
  );
}