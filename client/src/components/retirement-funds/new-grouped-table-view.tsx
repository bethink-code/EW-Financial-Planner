import { RetirementFund, UpdateRetirementFund } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit3 } from "lucide-react";
import { useRef, useEffect } from "react";

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

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white table-auto">
        <thead>
          {/* First level headers - different for inputs vs flows */}
          {tableMode === "inputs" ? (
            <tr className="border-b border-neutral-200" style={{ backgroundColor: '#D6ECF5' }}>
              {columnVisibility.overview && (
                <th className="px-3 py-2 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider" colSpan={2}>
                  Overview
                </th>
              )}
              {columnVisibility.unapprovedLifeCover && (
                <th className="px-3 py-2 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider border-l border-neutral-300" colSpan={4}>
                  Unapproved life cover
                </th>
              )}
              {columnVisibility.monthlyDeathBenefit && (
                <th className="px-3 py-2 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider border-l border-neutral-300" colSpan={4}>
                  Monthly death benefit
                </th>
              )}
              {columnVisibility.fundValue && (
                <th className="px-3 py-2 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider border-l border-neutral-300" colSpan={3}>
                  Fund value
                </th>
              )}
              {columnVisibility.fundValueBeneficiaries && (
                <th className="px-3 py-2 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider border-l border-neutral-300" colSpan={8}>
                  Fund value beneficiaries
                </th>
              )}
            </tr>
          ) : (
            <tr className="border-b border-neutral-200" style={{ backgroundColor: '#D6ECF5' }}>
              {columnVisibility.overview && (
                <th className="px-3 py-2 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider" colSpan={2}>
                  Overview
                </th>
              )}
              {columnVisibility.unapprovedLifeCover && (
                <th className="px-3 py-2 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider border-l border-neutral-300" colSpan={4}>
                  Come sum life cover available as provision for
                </th>
              )}
              {columnVisibility.monthlyDeathBenefit && (
                <th className="px-3 py-2 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider border-l border-neutral-300" colSpan={4}>
                  Income provision options
                </th>
              )}
              {columnVisibility.fundValue && (
                <th className="px-3 py-2 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider border-l border-neutral-300" colSpan={3}>
                  Income provision others
                </th>
              )}
              {columnVisibility.fundValueBeneficiaries && (
                <th className="px-3 py-2 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider border-l border-neutral-300" colSpan={8}>
                  Percentage required for
                </th>
              )}
            </tr>
          )}
          
          {/* Second level headers - different for inputs vs flows */}
          {tableMode === "inputs" ? (
            <tr className="border-b border-neutral-200" style={{ backgroundColor: '#D6ECF5' }}>
              {columnVisibility.overview && (
                <>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Owner
                  </th>
                </>
              )}
              {columnVisibility.unapprovedLifeCover && (
                <>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider border-l border-neutral-300">
                    Cover amount
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Beneficiary
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    %
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Cover split
                  </th>
                </>
              )}
              {columnVisibility.monthlyDeathBenefit && (
                <>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider border-l border-neutral-300">
                    Monthly income
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Term (Years)
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Increase %
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider border-r border-neutral-300">
                    Escalation amount
                  </th>
                </>
              )}
              {columnVisibility.fundValue && (
                <>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider border-l border-neutral-300">
                    Approved life cover
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Fund value
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider border-r border-neutral-300">
                    Fund value at death
                  </th>
                </>
              )}
            </tr>
          ) : (
            <tr className="border-b border-neutral-200" style={{ backgroundColor: '#D6ECF5' }}>
              {columnVisibility.overview && (
                <>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Owner
                  </th>
                </>
              )}
              {columnVisibility.unapprovedLifeCover && (
                <>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider border-l border-neutral-300">
                    Estate
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Spouse
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Children
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Other
                  </th>
                </>
              )}
              {columnVisibility.monthlyDeathBenefit && (
                <>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider border-l border-neutral-300">
                    Amount
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Term (years)
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Increase %
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider border-r border-neutral-300">
                    Lump sum death
                  </th>
                </>
              )}
              {columnVisibility.fundValue && (
                <>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider border-l border-neutral-300">
                    Amount
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Term (years)
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider border-r border-neutral-300">
                    Increase %
                  </th>
                </>
              )}
              {tableMode === "inputs" && columnVisibility.fundValueBeneficiaries && (
                <>
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
                    Non deductible contribution amount
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Living annuity
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Income term
                  </th>
                </>
              )}
              {tableMode === "flows" && columnVisibility.fundValueBeneficiaries && (
                <>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider border-l border-neutral-300">
                    Actual value
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Estate duty (spouse life of deceased)
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Estate duty (no spouse)
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Estate duty (life others)
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Executors fee
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Masters fee
                  </th>
                </>
              )}
            </tr>
          )}
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {funds.map((fund) => (
            <tr key={fund.id} className="hover:bg-neutral-50">
              {/* Overview Section */}
              {columnVisibility.overview && (
                <>
                  {/* Description */}
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-neutral-900" style={{ backgroundColor: '#EFF5F9' }}>
                    <AutoSizeInput
                      type="text"
                      value={fund.description || ""}
                      onChange={(e) => handleInputChange(fund.id, "description", e.target.value)}
                      className="border-0 focus:bg-white focus:border focus:border-primary hover:bg-teal-50 text-left font-medium"
                      placeholder="Fund description"
                      disabled={isUpdating}
                    />
                  </td>
                  
                  {/* Owner */}
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900" style={{ backgroundColor: '#EFF5F9' }}>
                    <Select
                      value={fund.owner || "John Doe"}
                      onValueChange={(value) => handleInputChange(fund.id, "owner", value)}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="compact-input border-0 focus:bg-white focus:border focus:border-primary hover:bg-teal-50 transition-colors duration-200 group">
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
                </>
              )}

              {/* Unapproved Life Cover Section */}
              {columnVisibility.unapprovedLifeCover && (
                <>
                  {tableMode === "inputs" ? (
                    <>
                      {/* Cover amount - Unapproved */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-l border-neutral-300" style={{ backgroundColor: '#EFF5F9' }}>
                        <AutoSizeInput
                          type="text"
                          value={fund.coverAmount || ""}
                          onChange={(e) => handleInputChange(fund.id, "coverAmount", e.target.value)}
                          className="border-0 focus:bg-white focus:border focus:border-primary hover:bg-teal-50 text-right"
                          placeholder="R 0"
                          disabled={isUpdating}
                        />
                      </td>

                      {/* Unapproved life cover - Beneficiary */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900" style={{ backgroundColor: '#EFF5F9' }}>
                        <div className="text-right text-sm text-neutral-600">
                          {fund.unapprovedBeneficiaries ? 
                            JSON.parse(fund.unapprovedBeneficiaries).reduce((sum: number, b: any) => sum + (parseFloat(b.percentage) || 0), 0).toFixed(1) + '%' 
                            : '0%'}
                        </div>
                      </td>

                      {/* Unapproved life cover - % */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900" style={{ backgroundColor: '#EFF5F9' }}>
                        <div className="text-right text-sm text-neutral-600">
                          {fund.unapprovedBeneficiaries ? 
                            JSON.parse(fund.unapprovedBeneficiaries).reduce((sum: number, b: any) => sum + (parseFloat(b.coverSplit) || 0), 0).toFixed(0) 
                            : '0'}
                        </div>
                      </td>

                      {/* Unapproved life cover - Cover split */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900" style={{ backgroundColor: '#EFF5F9' }}>
                        <div className="text-right text-sm text-neutral-600">
                          R {((parseFloat(fund.coverAmount) || 0) * 0.8).toLocaleString()}
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      {/* Flows mode - Estate */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-l border-neutral-300">
                        <div className="text-right text-sm text-neutral-600">
                          R {((parseFloat(fund.fundValueAtDeath) || 0) * 0.4).toLocaleString()}
                        </div>
                      </td>

                      {/* Flows mode - Spouse */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                        <div className="text-right text-sm text-neutral-600">
                          R {((parseFloat(fund.fundValueAtDeath) || 0) * 0.3).toLocaleString()}
                        </div>
                      </td>

                      {/* Flows mode - Children */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                        <div className="text-right text-sm text-neutral-600">
                          R {((parseFloat(fund.fundValueAtDeath) || 0) * 0.2).toLocaleString()}
                        </div>
                      </td>

                      {/* Flows mode - Other */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                        <div className="text-right text-sm text-neutral-600">
                          R {((parseFloat(fund.fundValueAtDeath) || 0) * 0.1).toLocaleString()}
                        </div>
                      </td>
                    </>
                  )}
                </>
              )}

              {/* Monthly Death Benefit Section */}
              {columnVisibility.monthlyDeathBenefit && (
                <>
                  {tableMode === "inputs" ? (
                    <>
                      {/* Monthly death benefit - Monthly income */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-l border-neutral-300" style={{ backgroundColor: '#EFF5F9' }}>
                        <AutoSizeInput
                          type="text"
                          value={fund.monthlyIncome || ""}
                          onChange={(e) => handleInputChange(fund.id, "monthlyIncome", e.target.value)}
                          className="border-0 focus:bg-white focus:border focus:border-primary hover:bg-teal-50 text-right"
                          placeholder="R 0"
                          disabled={isUpdating}
                        />
                      </td>

                      {/* Monthly death benefit - Term (Years) */}
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

                      {/* Monthly death benefit - Increase % */}
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

                      {/* Monthly death benefit - Escalation amount */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-r border-neutral-300" style={{ backgroundColor: '#EFF5F9' }}>
                        <AutoSizeInput
                          type="text"
                          value={fund.lumpSumDeath || ""}
                          onChange={(e) => handleInputChange(fund.id, "lumpSumDeath", e.target.value)}
                          className="border-0 focus:bg-white focus:border focus:border-primary hover:bg-teal-50 text-right"
                          placeholder="R 0"
                          disabled={isUpdating}
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      {/* Flows mode - Amount */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-l border-neutral-300">
                        <div className="text-right text-sm text-neutral-600">
                          R {(parseFloat(fund.monthlyIncome) || 0).toLocaleString()}
                        </div>
                      </td>

                      {/* Flows mode - Term */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                        <div className="text-right text-sm text-neutral-600">
                          {fund.termYears || '0'} years
                        </div>
                      </td>

                      {/* Flows mode - Increase % */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                        <div className="text-right text-sm text-neutral-600">
                          {fund.increasePercentage || '0'}%
                        </div>
                      </td>

                      {/* Flows mode - Lump sum death */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-r border-neutral-300">
                        <div className="text-right text-sm text-neutral-600">
                          R {((parseFloat(fund.monthlyIncome) || 0) * (parseFloat(fund.termYears) || 0) * 12).toLocaleString()}
                        </div>
                      </td>
                    </>
                  )}
                </>
              )}

              {/* Fund Value Section */}
              {columnVisibility.fundValue && (
                <>
                  {tableMode === "flows" ? (
                    <>
                      {/* Flows mode - Amount */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-l border-neutral-300">
                        <div className="text-right text-sm text-neutral-600">
                          R {(parseFloat(fund.fundValue) || 0).toLocaleString()}
                        </div>
                      </td>

                      {/* Flows mode - Increase % */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                        <div className="text-right text-sm text-neutral-600">
                          6%
                        </div>
                      </td>

                      {/* Flows mode - Term */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-r border-neutral-300">
                        <div className="text-right text-sm text-neutral-600">
                          20 years
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-l border-neutral-300" style={{ backgroundColor: '#EFF5F9' }}>
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
                </>
              )}

              {/* Fund Value Beneficiaries Section */}
              {columnVisibility.fundValueBeneficiaries && (
                <>
                  {tableMode === "flows" ? (
                    <>
                      {/* Fund value beneficiaries - Name */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-l border-neutral-200" style={{ backgroundColor: '#EFF5F9' }}>
                        <div className="text-right text-sm text-neutral-600">
                          {fund.fundValueBeneficiaries ? 
                            JSON.parse(fund.fundValueBeneficiaries).map((b: any) => b.name).join(', ') || 'None'
                            : 'None'}
                        </div>
                      </td>

                      {/* Fund value beneficiaries - % */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900" style={{ backgroundColor: '#EFF5F9' }}>
                        <div className="text-right text-sm text-neutral-600">
                          {fund.fundValueBeneficiaries ? 
                            JSON.parse(fund.fundValueBeneficiaries).reduce((sum: number, b: any) => sum + (parseFloat(b.percentage) || 0), 0).toFixed(1) + '%'
                            : '0%'}
                        </div>
                      </td>

                      {/* Fund value beneficiaries - Amount */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900" style={{ backgroundColor: '#EFF5F9' }}>
                        <div className="text-right text-sm text-neutral-600">
                          R {((parseFloat(fund.fundValue) || 0) * 0.8).toLocaleString()}
                        </div>
                      </td>

                      {/* Fund value beneficiaries - Lump sum taken */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900" style={{ backgroundColor: '#EFF5F9' }}>
                        <div className="text-right text-sm text-neutral-600">
                          {fund.fundValueBeneficiaries ? 
                            'R ' + JSON.parse(fund.fundValueBeneficiaries).reduce((sum: number, b: any) => sum + (parseFloat(b.lumpSumTaken) || 0), 0).toLocaleString()
                            : 'R 0'}
                        </div>
                      </td>

                      {/* Fund value beneficiaries - Fund value at death */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900" style={{ backgroundColor: '#EFF5F9' }}>
                        <div className="text-right text-sm text-neutral-600">
                          R {(parseFloat(fund.fundValueAtDeath) || 0).toLocaleString()}
                        </div>
                      </td>

                      {/* Fund value beneficiaries - Non deductible contribution */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900" style={{ backgroundColor: '#EFF5F9' }}>
                        <div className="text-right text-sm text-neutral-600">
                          {fund.fundValueBeneficiaries ? 
                            'R ' + JSON.parse(fund.fundValueBeneficiaries).reduce((sum: number, b: any) => sum + (parseFloat(b.nondeductibleContribution) || 0), 0).toLocaleString()
                            : 'R 0'}
                        </div>
                      </td>

                      {/* Living Annuity */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900" style={{ backgroundColor: '#EFF5F9' }}>
                        <div className="text-right text-sm text-neutral-600">
                          {fund.fundValueBeneficiaries ? 
                            'R ' + JSON.parse(fund.fundValueBeneficiaries).reduce((sum: number, b: any) => sum + (parseFloat(b.livingAnnuity) || 0), 0).toLocaleString()
                            : 'R 0'}
                        </div>
                      </td>

                      {/* Income Term */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900" style={{ backgroundColor: '#EFF5F9' }}>
                        <div className="text-right text-sm text-neutral-600">
                          {fund.fundValueBeneficiaries ? 
                            JSON.parse(fund.fundValueBeneficiaries).reduce((sum: number, b: any) => sum + (parseFloat(b.incomeTerm) || 0), 0).toFixed(0) + ' years'
                            : '0 years'}
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      {/* Flows mode - Actual value */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-l border-neutral-200">
                        <div className="text-right text-sm text-neutral-600">
                          R {(parseFloat(fund.fundValue) || 0).toLocaleString()}
                        </div>
                      </td>

                      {/* Flows mode - Estate duty (spouse life of deceased) */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                        <div className="text-right text-sm text-neutral-600">
                          R {((parseFloat(fund.fundValue) || 0) * 0.15).toLocaleString()}
                        </div>
                      </td>

                      {/* Flows mode - Estate duty (no spouse) */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                        <div className="text-right text-sm text-neutral-600">
                          R {((parseFloat(fund.fundValue) || 0) * 0.20).toLocaleString()}
                        </div>
                      </td>

                      {/* Flows mode - Estate duty (life others) */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                        <div className="text-right text-sm text-neutral-600">
                          R {((parseFloat(fund.fundValue) || 0) * 0.25).toLocaleString()}
                        </div>
                      </td>

                      {/* Flows mode - Executors fee */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                        <div className="text-right text-sm text-neutral-600">
                          R {((parseFloat(fund.fundValue) || 0) * 0.035).toLocaleString()}
                        </div>
                      </td>

                      {/* Flows mode - Masters fee */}
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                        <div className="text-right text-sm text-neutral-600">
                          R {((parseFloat(fund.fundValue) || 0) * 0.006).toLocaleString()}
                        </div>
                      </td>
                    </>
                  )}
                </>
              )}
            </tr>
          ))}
          
          {/* Totals row */}
          <tr className="border-t-2 border-neutral-300 font-semibold" style={{ backgroundColor: '#D6ECF5' }}>
            {/* Overview Section */}
            {columnVisibility.overview && (
              <>
                {/* Description */}
                <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold" style={{ color: '#094161' }}>
                  Total
                </td>
                
                {/* Owner */}
                <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                  
                </td>
              </>
            )}
            
            {/* Unapproved Life Cover Section */}
            {columnVisibility.unapprovedLifeCover && (
              <>
                {/* Cover amount - TOTAL */}
                <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-l border-neutral-300">
                  <span className="font-semibold text-right block" style={{ color: '#094161' }}>
                    R {funds.reduce((sum, fund) => {
                      const amount = parseInt(fund.coverAmount?.replace(/[^0-9]/g, '') || '0');
                      return sum + amount;
                    }, 0).toLocaleString()}
                  </span>
                </td>
                
                {/* Beneficiary */}
                <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                  
                </td>
                
                {/* % */}
                <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                  
                </td>
                
                {/* Cover split */}
                <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                  
                </td>
              </>
            )}
            
            {/* Monthly Death Benefit Section */}
            {columnVisibility.monthlyDeathBenefit && (
              <>
                {/* Monthly income - TOTAL */}
                <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-l border-neutral-300">
                  <span className="font-semibold text-right block" style={{ color: '#094161' }}>
                    R {funds.reduce((sum, fund) => {
                      const amount = parseInt(fund.monthlyIncome?.replace(/[^0-9]/g, '') || '0');
                      return sum + amount;
                    }, 0).toLocaleString()}
                  </span>
                </td>
                
                {/* Term (Years) */}
                <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                  
                </td>
                
                {/* Increase % */}
                <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                  
                </td>
                
                {/* Escalation amount */}
                <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-r border-neutral-300">
                  
                </td>
              </>
            )}
            
            {/* Fund Value Section */}
            {columnVisibility.fundValue && (
              <>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-l border-neutral-300">
                  <span className="font-semibold text-right block" style={{ color: '#094161' }}>
                    R {funds.reduce((sum, fund) => {
                      const amount = parseInt(fund.approvedLifeCover?.replace(/[^0-9]/g, '') || '0');
                      return sum + amount;
                    }, 0).toLocaleString()}
                  </span>
                </td>
                
                <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                  <span className="font-semibold text-right block" style={{ color: '#094161' }}>
                    R {funds.reduce((sum, fund) => {
                      const amount = parseInt(fund.fundValue?.replace(/[^0-9]/g, '') || '0');
                      return sum + amount;
                    }, 0).toLocaleString()}
                  </span>
                </td>
                
                <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-r border-neutral-300">
                  <span className="font-semibold text-right block" style={{ color: '#094161' }}>
                    R {funds.reduce((sum, fund) => {
                      const amount = parseInt(fund.fundValueAtDeath?.replace(/[^0-9]/g, '') || '0');
                      return sum + amount;
                    }, 0).toLocaleString()}
                  </span>
                </td>
              </>
            )}
            
            {/* Fund Value Beneficiaries Section */}
            {columnVisibility.fundValueBeneficiaries && (
              <>
                {/* Fund value beneficiaries - Name */}
                <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900 border-l border-neutral-300">
                  
                </td>
                
                {/* Fund value beneficiaries - % */}
                <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                  
                </td>
                
                {/* Fund value beneficiaries - Amount */}
                <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                  
                </td>
                
                {/* Fund value beneficiaries - Lump sum taken */}
                <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                  
                </td>
                
                {/* Fund value beneficiaries - Fund value at death */}
                <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                  
                </td>
                
                {/* Fund value beneficiaries - Non deductible contribution amount */}
                <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                  
                </td>
                
                {/* Fund value beneficiaries - Living annuity */}
                <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                  
                </td>
                
                {/* Fund value beneficiaries - Income term */}
                <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-900">
                  
                </td>
              </>
            )}
          </tr>
        </tbody>
      </table>
    </div>
  );
}