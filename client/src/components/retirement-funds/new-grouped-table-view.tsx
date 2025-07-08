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
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={onChange}
      className={`${className} table-input`}
      placeholder={placeholder}
      disabled={disabled}
      style={{ 
        ...style, 
        minWidth: '60px', 
        maxWidth: '250px', 
        textAlign: 'right', 
        width: '100%',
        outline: 'none'
      }}
      {...props}
    />
  );
};

export function NewGroupedTableView({ funds, columnVisibility, tableMode, onFieldUpdate, isUpdating }: NewGroupedTableViewProps) {
  const handleInputChange = (fundId: number, field: keyof UpdateRetirementFund, value: string) => {
    onFieldUpdate(fundId, field, value);
  };

  const owners = ["John Doe", "Jane Smith"];

  const renderEditableCell = (value: string, onChange: (value: string) => void, className = "") => {
    return (
      <AutoSizeInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`p-1 table-text-14 text-right bg-[#F2F7FB] border-none focus:bg-white focus:border focus:border-primary hover:bg-neutral-50 ${className}`}
        style={{ textAlign: 'right', minWidth: '60px' }}
        disabled={isUpdating}
      />
    );
  };

  // Flows table structure - following exact same patterns as inputs table
  const renderFlowsTable = () => {
    return (
      <div className="space-y-4">
        {/* Lump sum life cover available as provision to */}
        {columnVisibility.overview && (
          <div style={{ backgroundColor: '#F0F9FF' }} className="border border-teal-200 rounded-lg p-4">
            <h3 className="table-text-14 font-semibold text-teal-800 mb-3">Lump sum life cover available as provision to</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-teal-200">
                    <th className="text-left p-2 w-32">Client name</th>
                    <th className="text-right p-2 w-20">Estate</th>
                    <th className="text-right p-2 w-20">Spouse</th>
                    <th className="text-right p-2 w-20">Child</th>
                    <th className="text-right p-2 w-20">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {funds.map((fund, index) => (
                    <tr key={fund.id} className={index % 2 === 0 ? "bg-white" : "bg-teal-50/30"}>
                      <td className="p-2 ">{fund.description}</td>
                      <td className="p-2 text-right ">
                        {renderEditableCell(fund.lumpSumLeftOverProvisions || "0", (value) => onFieldUpdate(fund.id, "lumpSumLeftOverProvisions", value))}
                      </td>
                      <td className="p-2 text-right ">
                        {renderEditableCell(fund.lumpSumLeftOverProvisions || "0", (value) => onFieldUpdate(fund.id, "lumpSumLeftOverProvisions", value))}
                      </td>
                      <td className="p-2 text-right ">
                        {renderEditableCell(fund.lumpSumLeftOverProvisions || "0", (value) => onFieldUpdate(fund.id, "lumpSumLeftOverProvisions", value))}
                      </td>
                      <td className="p-2 text-right">
                        {renderEditableCell(fund.lumpSumLeftOverProvisions || "0", (value) => onFieldUpdate(fund.id, "lumpSumLeftOverProvisions", value))}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-semibold border-t-2 border-neutral-300">
                    <td className="p-2 ">Total</td>
                    <td className="p-2 text-right ">0</td>
                    <td className="p-2 text-right ">0</td>
                    <td className="p-2 text-right ">0</td>
                    <td className="p-2 text-right">0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Income provision options */}
        {columnVisibility.monthlyDeathBenefit && (
          <div style={{ backgroundColor: '#F0F9FF' }} className="border border-teal-200 rounded-lg p-4">
            <h3 className="table-text-14 font-semibold text-teal-800 mb-3">Income provision options</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-teal-200">
                    <th className="text-left p-2 w-32">Client name</th>
                    <th className="text-right p-2 w-24">Term (years)</th>
                    <th className="text-right p-2 w-24">Payments</th>
                    <th className="text-right p-2 w-20">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {funds.map((fund, index) => (
                    <tr key={fund.id} className={index % 2 === 0 ? "bg-white" : "bg-teal-50/30"}>
                      <td className="p-2 ">{fund.description}</td>
                      <td className="p-2 text-right ">
                        {renderEditableCell(fund.incomeTerm || "0", (value) => onFieldUpdate(fund.id, "incomeTerm", value))}
                      </td>
                      <td className="p-2 text-right ">
                        {renderEditableCell(fund.monthlyProvisionOffered || "0", (value) => onFieldUpdate(fund.id, "monthlyProvisionOffered", value))}
                      </td>
                      <td className="p-2 text-right">
                        {renderEditableCell(fund.currentAnnualIncome || "0", (value) => onFieldUpdate(fund.id, "currentAnnualIncome", value))}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-semibold border-t-2 border-neutral-300">
                    <td className="p-2 ">Total</td>
                    <td className="p-2 text-right ">0</td>
                    <td className="p-2 text-right ">0</td>
                    <td className="p-2 text-right">0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Annual costs */}
        {columnVisibility.fundValue && (
          <div style={{ backgroundColor: '#F0F9FF' }} className="border border-teal-200 rounded-lg p-4">
            <h3 className="table-text-14 font-semibold text-teal-800 mb-3">Annual costs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-teal-200">
                    <th className="text-left p-2 w-32">Client name</th>
                    <th className="text-right p-2 w-24">Estate duty (incl tax on proceeds)</th>
                    <th className="text-right p-2 w-24">Estate duty (ex capital)</th>
                    <th className="text-right p-2 w-20">Executors fee</th>
                    <th className="text-right p-2 w-20">Master's fee</th>
                  </tr>
                </thead>
                <tbody>
                  {funds.map((fund, index) => (
                    <tr key={fund.id} className={index % 2 === 0 ? "bg-white" : "bg-teal-50/30"}>
                      <td className="p-2 ">{fund.description}</td>
                      <td className="p-2 text-right ">
                        {renderEditableCell(fund.estateDeploymentDeceased || "0", (value) => onFieldUpdate(fund.id, "estateDeploymentDeceased", value))}
                      </td>
                      <td className="p-2 text-right ">
                        {renderEditableCell(fund.annualIncomeAtDeath || "0", (value) => onFieldUpdate(fund.id, "annualIncomeAtDeath", value))}
                      </td>
                      <td className="p-2 text-right ">
                        {renderEditableCell(fund.executorsFee || "0", (value) => onFieldUpdate(fund.id, "executorsFee", value))}
                      </td>
                      <td className="p-2 text-right">
                        {renderEditableCell(fund.mastersFee || "0", (value) => onFieldUpdate(fund.id, "mastersFee", value))}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-semibold border-t-2 border-neutral-300">
                    <td className="p-2 ">Total</td>
                    <td className="p-2 text-right ">0</td>
                    <td className="p-2 text-right ">0</td>
                    <td className="p-2 text-right ">0</td>
                    <td className="p-2 text-right">0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Percentage included for */}
        {columnVisibility.fundValueBeneficiaries && (
          <div style={{ backgroundColor: '#F0F9FF' }} className="border border-teal-200 rounded-lg p-4">
            <h3 className="table-text-14 font-semibold text-teal-800 mb-3">Percentage included for</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-teal-200">
                    <th className="text-left p-2 w-32">Client name</th>
                    <th className="text-right p-2 w-20">Estate</th>
                    <th className="text-right p-2 w-20">Spouse</th>
                    <th className="text-right p-2 w-20">Children</th>
                    <th className="text-right p-2 w-20">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {funds.map((fund, index) => (
                    <tr key={fund.id} className={index % 2 === 0 ? "bg-white" : "bg-teal-50/30"}>
                      <td className="p-2 ">{fund.description}</td>
                      <td className="p-2 text-right ">
                        {renderEditableCell("0", (value) => onFieldUpdate(fund.id, "beneficiaryPercentageSplit", value))}
                      </td>
                      <td className="p-2 text-right ">
                        {renderEditableCell("0", (value) => onFieldUpdate(fund.id, "beneficiaryPercentageSplit", value))}
                      </td>
                      <td className="p-2 text-right ">
                        {renderEditableCell("0", (value) => onFieldUpdate(fund.id, "beneficiaryPercentageSplit", value))}
                      </td>
                      <td className="p-2 text-right">
                        {renderEditableCell("0", (value) => onFieldUpdate(fund.id, "beneficiaryPercentageSplit", value))}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-semibold border-t-2 border-neutral-300">
                    <td className="p-2 ">Total</td>
                    <td className="p-2 text-right ">0</td>
                    <td className="p-2 text-right ">0</td>
                    <td className="p-2 text-right ">0</td>
                    <td className="p-2 text-right">0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (tableMode === "flows") {
    // Render flows table only
    return (
      <div className="overflow-x-auto">
        <table className="w-full bg-white table-auto">
          <thead>
            {/* First level headers - Flows */}
            <tr className="border-b border-neutral-200" style={{ backgroundColor: '#D6ECF5' }}>
              {columnVisibility.overview && (
                <>
                  <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs">
                    {/* Description column - standalone */}
                  </th>
                  <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs " colSpan={3}>
                    Lump sum life cover available as provision to
                  </th>
                </>
              )}
              {columnVisibility.monthlyDeathBenefit && (
                <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs " colSpan={3}>
                  Income provision source
                </th>
              )}
              {columnVisibility.fundValue && (
                <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs " colSpan={3}>
                  Income provision offered
                </th>
              )}
              {columnVisibility.fundValueBeneficiaries && (
                <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs " colSpan={5}>
                  Percentage included for
                </th>
              )}
            </tr>
            
            {/* Second level headers - Flows */}
            <tr className="border-b border-neutral-200" style={{ backgroundColor: '#D6ECF5' }}>
              {columnVisibility.overview && (
                <th className="p-2 text-left font-medium text-neutral-600 uppercase tracking-wider text-xs">
                  Description
                </th>
              )}
              {columnVisibility.overview && (
                <>
                  <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs ">
                    Estate
                  </th>
                  <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs">
                    Spouse
                  </th>
                  <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs">
                    Other
                  </th>
                </>
              )}
              {columnVisibility.monthlyDeathBenefit && (
                <>
                  <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs ">
                    Amount
                  </th>
                  <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs">
                    Term (years)
                  </th>
                  <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs">
                    Increase %
                  </th>
                </>
              )}
              {columnVisibility.fundValue && (
                <>
                  <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs ">
                    Amount
                  </th>
                  <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs">
                    Term (years)
                  </th>
                  <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs">
                    Increase %
                  </th>
                </>
              )}
              {columnVisibility.fundValueBeneficiaries && (
                <>
                  <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs ">
                    Estate Duty (Policies on life of deceased)
                  </th>
                  <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs">
                    Estate Duty (To spouse)
                  </th>
                  <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs">
                    Estate Duty (To others)
                  </th>
                  <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs">
                    Executor's fee
                  </th>
                  <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs">
                    Master's fee
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {/* Flows data rows */}
            {funds.map((fund, index) => (
              <tr key={`flows-${fund.id}`} className={index % 2 === 0 ? "bg-white" : "bg-teal-50/30"}>
                {columnVisibility.overview && (
                  <td className="p-2  table-text-14 text-neutral-900">
                    {fund.description}
                  </td>
                )}
                {columnVisibility.overview && (
                  <>
                    <td className="p-2 text-right ">
                      <AutoSizeInput
                        value={fund.lumpSumLeftOverProvisions || "0"}
                        onChange={(e) => handleInputChange(fund.id, "lumpSumLeftOverProvisions", e.target.value)}
                        className="table-input"
                        style={{ textAlign: 'right', minWidth: '60px' }}
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right ">
                      <AutoSizeInput
                        value={fund.lumpSumLeftOverProvisions || "0"}
                        onChange={(e) => handleInputChange(fund.id, "lumpSumLeftOverProvisions", e.target.value)}
                        className="table-input"
                        style={{ textAlign: 'right', minWidth: '60px' }}
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right ">
                      <AutoSizeInput
                        value={fund.lumpSumLeftOverProvisions || "0"}
                        onChange={(e) => handleInputChange(fund.id, "lumpSumLeftOverProvisions", e.target.value)}
                        className="table-input"
                        style={{ textAlign: 'right', minWidth: '60px' }}
                        disabled={isUpdating}
                      />
                    </td>
                  </>
                )}
                {columnVisibility.monthlyDeathBenefit && (
                  <>
                    <td className="p-2 text-right border-l border-neutral-300">
                      <AutoSizeInput
                        
                        value={fund.lumpSumLeftOverProvisions || "0"}
                        onChange={(e) => handleInputChange(fund.id, "lumpSumLeftOverProvisions", e.target.value)}
                        className="table-input" style={{ textAlign: "right" }}
                        
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right ">
                      <AutoSizeInput
                        
                        value={fund.incomeTerm || "0"}
                        onChange={(e) => handleInputChange(fund.id, "incomeTerm", e.target.value)}
                        className="table-input" style={{ textAlign: "right" }}
                        
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right ">
                      <AutoSizeInput
                        
                        value={fund.incomeEscalation || "0%"}
                        onChange={(e) => handleInputChange(fund.id, "incomeEscalation", e.target.value)}
                        className="table-input" style={{ textAlign: "right" }}
                        
                        disabled={isUpdating}
                      />
                    </td>
                  </>
                )}
                {columnVisibility.fundValue && (
                  <>
                    <td className="p-2 text-right  ">
                      <AutoSizeInput
                        
                        value={fund.estateDeploymentDeceased || "0"}
                        onChange={(e) => handleInputChange(fund.id, "estateDeploymentDeceased", e.target.value)}
                        className="table-input" style={{ textAlign: "right" }}
                        
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right ">
                      <AutoSizeInput
                        
                        value={fund.incomeTerm || "0"}
                        onChange={(e) => handleInputChange(fund.id, "incomeTerm", e.target.value)}
                        className="table-input" style={{ textAlign: "right" }}
                        
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right ">
                      <AutoSizeInput
                        
                        value={fund.incomeEscalation || "0%"}
                        onChange={(e) => handleInputChange(fund.id, "incomeEscalation", e.target.value)}
                        className="table-input" style={{ textAlign: "right" }}
                        
                        disabled={isUpdating}
                      />
                    </td>
                  </>
                )}
                {columnVisibility.fundValueBeneficiaries && (
                  <>
                    <td className="p-2 text-right border-l border-neutral-300">
                      <AutoSizeInput
                        
                        value={fund.estateDutyPoliciesOnLife || "0%"}
                        onChange={(e) => handleInputChange(fund.id, "estateDutyPoliciesOnLife", e.target.value)}
                        className="table-input" 
                        placeholder="0%"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right ">
                      <AutoSizeInput
                        
                        value={fund.estateDutyToSpouse || "0%"}
                        onChange={(e) => handleInputChange(fund.id, "estateDutyToSpouse", e.target.value)}
                        className="table-input" style={{ textAlign: "right" }}
                        placeholder="0%"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right ">
                      <AutoSizeInput
                        
                        value={fund.estateDutyToOthers || "0%"}
                        onChange={(e) => handleInputChange(fund.id, "estateDutyToOthers", e.target.value)}
                        className="table-input"
                        placeholder="0%"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <AutoSizeInput
                        
                        value={fund.executorsFee || "0%"}
                        onChange={(e) => handleInputChange(fund.id, "executorsFee", e.target.value)}
                        className="table-input"
                        placeholder="0%"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <AutoSizeInput
                        
                        value={fund.mastersFee || "0%"}
                        onChange={(e) => handleInputChange(fund.id, "mastersFee", e.target.value)}
                        className="table-input"
                        placeholder="0%"
                        disabled={isUpdating}
                      />
                    </td>
                  </>
                )}
              </tr>
            ))}
            
            {/* Flows total row */}
            <tr className="bg-gray-100 font-semibold">
              {columnVisibility.overview && (
                <>
                {/* Description */}
                <td className="table-cell whitespace-nowrap table-text-14 font-bold" style={{ color: '#094161' }}>
                  Total
                </td>
                
                {/* Owner */}
                <td className="p-2 text-right ">
                  
                </td>
              </>
              )}
              {columnVisibility.monthlyDeathBenefit && (
                <>
                  <td className="p-2 text-right ">
                    <span className="font-bold text-right table-text-14 compact-total-span" style={{ color: '#094161' }}>
                      0
                    </span>
                  </td>
                  <td className="p-2 text-right ">
                    <span className="font-bold text-right table-text-14 compact-total-span" style={{ color: '#094161' }}>
                      0
                    </span>
                  </td>
                  <td className="p-2 text-right ">
                    <span className="font-bold text-right table-text-14 compact-total-span" style={{ color: '#094161' }}>
                      0%
                    </span>
                  </td>
                </>
              )}
              {columnVisibility.fundValueBeneficiaries && (
                <>
                  <td className="p-2 text-right ">
                    <span className="font-bold text-right table-text-14 compact-total-span" style={{ color: '#094161' }}>
                      0%
                    </span>
                  </td>
                  <td className="p-2 text-right ">
                    <span className="font-bold text-right table-text-14 compact-total-span" style={{ color: '#094161' }}>
                      0%
                    </span>
                  </td>
                  <td className="p-2 text-right ">
                    <span className="font-bold text-right table-text-14 compact-total-span" style={{ color: '#094161' }}>
                      0%
                    </span>
                  </td>
                  <td className="p-2 text-right">
                    <span className="font-bold text-right table-text-14 compact-total-span" style={{ color: '#094161' }}>
                      3.5%
                    </span>
                  </td>
                  <td className="p-2 text-right">
                    <span className="font-bold text-right table-text-14 compact-total-span" style={{ color: '#094161' }}>
                      1.75%
                    </span>
                  </td>
                </>
              )}
              {columnVisibility.fundValueBeneficiaries && (
                <>
                  {/* Estate Duty (Policies on life of deceased) */}
                  <td className="p-2 text-right ">
                    <span className="font-bold text-right table-text-14 compact-total-span" style={{ color: '#094161' }}>
                      0%
                    </span>
                  </td>
                  
                  {/* Estate Duty (To spouse) */}
                  <td className="p-2 text-right ">
                    <span className="font-bold text-right table-text-14 compact-total-span" style={{ color: '#094161' }}>
                      0%
                    </span>
                  </td>
                  
                  {/* Estate Duty (To others) */}
                  <td className="p-2 text-right ">
                    <span className="font-bold text-right table-text-14 compact-total-span" style={{ color: '#094161' }}>
                      0%
                    </span>
                  </td>
                  
                  {/* Executor's fee */}
                  <td className="p-2 text-right ">
                    <span className="font-bold text-right table-text-14 compact-total-span" style={{ color: '#094161' }}>
                      3.5%
                    </span>
                  </td>
                  
                  {/* Master's fee */}
                  <td className="p-2 text-right ">
                    <span className="font-bold text-right table-text-14 compact-total-span" style={{ color: '#094161' }}>
                      1.75%
                    </span>
                  </td>
                </>
              )}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // Render inputs table only
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white table-auto">
        <thead>
          {/* First level headers */}
          <tr className="border-b border-neutral-200" style={{ backgroundColor: '#D6ECF5' }}>
            {columnVisibility.overview && (
              <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs" colSpan={2}>
                Overview
              </th>
            )}
            {columnVisibility.unapprovedLifeCover && (
              <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs " colSpan={4}>
                Unapproved life cover
              </th>
            )}
            {columnVisibility.monthlyDeathBenefit && (
              <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs " colSpan={4}>
                Monthly death benefit
              </th>
            )}
            {columnVisibility.fundValue && (
              <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs " colSpan={3}>
                Fund value
              </th>
            )}
            {columnVisibility.fundValueBeneficiaries && (
              <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs " colSpan={8}>
                Fund value beneficiaries
              </th>
            )}
          </tr>
          
          {/* Second level headers */}
          <tr className="border-b border-neutral-200" style={{ backgroundColor: '#D6ECF5' }}>
            {columnVisibility.overview && (
              <>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Description
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Owner
                </th>
              </>
            )}
            {columnVisibility.unapprovedLifeCover && (
              <>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider ">
                  Cover amount
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Beneficiary
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  %
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Cover split
                </th>
              </>
            )}
            {columnVisibility.monthlyDeathBenefit && (
              <>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider ">
                  Monthly income
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Term (Years)
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Increase %
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider ">
                  Escalation amount
                </th>
              </>
            )}
            {/* Fund Value Section */}
            {columnVisibility.fundValue && (
              <>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider ">
                  Approved life cover
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Fund value
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider ">
                  Fund value at death
                </th>
              </>
            )}
            {columnVisibility.fundValueBeneficiaries && (
              <>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider ">
                  Name
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  %
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Lump sum taken
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Fund value at death
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Non deductible contribution amount
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Living annuity
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Income term
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
                  {/* Description */}
                  <td className="table-cell whitespace-nowrap table-text-14 text-neutral-900">
                    <AutoSizeInput
                      
                      value={fund.description || ""}
                      onChange={(e) => handleInputChange(fund.id, "description", e.target.value)}
                      className="border-0 focus:bg-white focus:border focus:border-primary hover:bg-neutral-50 text-left font-medium"
                      placeholder="Fund description"
                      disabled={isUpdating}
                    />
                  </td>
                  
                  {/* Owner */}
                  <td className="p-2 text-right ">
                    <Select
                      value={fund.owner || "John Doe"}
                      onValueChange={(value) => handleInputChange(fund.id, "owner", value)}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="compact-input border-0 focus:bg-white focus:border focus:border-primary hover:bg-neutral-50 transition-colors duration-200 group">
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
                  {/* Cover amount - Unapproved */}
                  <td className="p-2 text-right border-l border-neutral-300">
                    <AutoSizeInput
                      value={fund.coverAmount || ""}
                      onChange={(e) => handleInputChange(fund.id, "coverAmount", e.target.value)}
                      className="table-input" style={{ textAlign: "right" }}
                      placeholder="R 0"
                      disabled={isUpdating}
                    />
                  </td>

                  {/* Unapproved life cover - Beneficiary */}
                  <td className="p-2 text-right ">
                    <Select
                      value={fund.beneficiary || "No beneficiary"}
                      onValueChange={(value) => handleInputChange(fund.id, "beneficiary", value)}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="compact-input border-0 focus:bg-white focus:border focus:border-primary hover:bg-neutral-50 transition-colors duration-200 group">
                        <SelectValue placeholder="No beneficiary" />
                        <Edit3 size={12} className="ml-1 text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="No beneficiary">No beneficiary</SelectItem>
                        <SelectItem value="Spouse">Spouse</SelectItem>
                        <SelectItem value="Child">Child</SelectItem>
                        <SelectItem value="Parent">Parent</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>

                  {/* Unapproved life cover - % */}
                  <td className="p-2 text-right ">
                    <AutoSizeInput
                      
                      value={fund.beneficiaryPercentage || ""}
                      onChange={(e) => handleInputChange(fund.id, "beneficiaryPercentage", e.target.value)}
                      className="table-input" style={{ textAlign: "right" }}
                      placeholder="100"
                      disabled={isUpdating}
                    />
                  </td>

                  {/* Unapproved life cover - Cover split */}
                  <td className="p-2 text-right ">
                    <AutoSizeInput
                      
                      value={fund.coverSplit || ""}
                      onChange={(e) => handleInputChange(fund.id, "coverSplit", e.target.value)}
                      className="table-input" style={{ textAlign: "right" }}
                      
                      disabled={isUpdating}
                    />
                  </td>
                </>
              )}

              {/* Monthly Death Benefit Section */}
              {columnVisibility.monthlyDeathBenefit && (
                <>
                  {/* Monthly death benefit - Monthly income */}
                  <td className="p-2 text-right border-l border-neutral-300">
                    <AutoSizeInput
                      
                      value={fund.monthlyIncome || ""}
                      onChange={(e) => handleInputChange(fund.id, "monthlyIncome", e.target.value)}
                      className="table-input" style={{ textAlign: "right" }}
                      placeholder="R 0"
                      disabled={isUpdating}
                    />
                  </td>

                  {/* Monthly death benefit - Term (Years) */}
                  <td className="p-2 text-right ">
                    <AutoSizeInput
                      
                      value={fund.termYears || ""}
                      onChange={(e) => handleInputChange(fund.id, "termYears", e.target.value)}
                      className="table-input" style={{ textAlign: "right" }}
                      
                      disabled={isUpdating}
                    />
                  </td>

                  {/* Monthly death benefit - Increase % */}
                  <td className="p-2 text-right ">
                    <AutoSizeInput
                      
                      value={fund.increasePercentage || ""}
                      onChange={(e) => handleInputChange(fund.id, "increasePercentage", e.target.value)}
                      className="table-input" style={{ textAlign: "right" }}
                      placeholder="0%"
                      disabled={isUpdating}
                    />
                  </td>

                  {/* Monthly death benefit - Escalation amount */}
                  <td className="p-2 text-right  ">
                    <AutoSizeInput
                      
                      value={fund.lumpSumDeath || ""}
                      onChange={(e) => handleInputChange(fund.id, "lumpSumDeath", e.target.value)}
                      className="table-input" style={{ textAlign: "right" }}
                      placeholder="R 0"
                      disabled={isUpdating}
                    />
                  </td>
                </>
              )}

              {/* Fund Value Section */}
              {columnVisibility.fundValue && (
                <>
                  <td className="p-2 text-right border-l border-neutral-300">
                    <AutoSizeInput
                      
                      value={fund.approvedLifeCover || ""}
                      onChange={(e) => handleInputChange(fund.id, "approvedLifeCover", e.target.value)}
                      className="table-input" style={{ textAlign: "right" }}
                      placeholder="R 0"
                      disabled={isUpdating}
                    />
                  </td>

                  <td className="p-2 text-right ">
                    <AutoSizeInput
                      
                      value={fund.fundValue || ""}
                      onChange={(e) => handleInputChange(fund.id, "fundValue", e.target.value)}
                      className="table-input" style={{ textAlign: "right" }}
                      placeholder="R 0"
                      disabled={isUpdating}
                    />
                  </td>

                  <td className="p-2 text-right  ">
                    <AutoSizeInput
                      value={fund.fundValueAtDeath || ""}
                      onChange={(e) => handleInputChange(fund.id, "fundValueAtDeath", e.target.value)}
                      className="table-input" style={{ textAlign: "right" }}
                      placeholder="R 0"
                      disabled={isUpdating}
                    />
                  </td>
                </>
              )}

              {/* Fund Value Beneficiaries Section */}
              {columnVisibility.fundValueBeneficiaries && (
                <>
                  {/* Fund value beneficiaries - Name */}
                  <td className="p-2 text-right border-l border-neutral-300">
                    <Select
                      value={fund.beneficiaryName || ""}
                      onValueChange={(value) => handleInputChange(fund.id, "beneficiaryName", value)}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-auto min-w-[120px] h-8 table-text-14 border-0 bg-[#F2F7FB] focus:bg-white focus:border focus:border-primary hover:bg-neutral-50 text-right">
                        <SelectValue placeholder="Select beneficiary" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Spouse">Spouse</SelectItem>
                        <SelectItem value="Child">Child</SelectItem>
                        <SelectItem value="Estate">Estate</SelectItem>
                        <SelectItem value="Trust">Trust</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>

                  {/* Fund value beneficiaries - % */}
                  <td className="p-2 text-right ">
                    <AutoSizeInput
                      
                      value={fund.beneficiaryPercentageSplit || ""}
                      onChange={(e) => handleInputChange(fund.id, "beneficiaryPercentageSplit", e.target.value)}
                      className="table-input" style={{ textAlign: "right" }}
                      placeholder="0%"
                      disabled={isUpdating}
                    />
                  </td>

                  {/* Fund value beneficiaries - Amount */}
                  <td className="p-2 text-right ">
                    <AutoSizeInput
                      value={fund.amount || ""}
                      onChange={(e) => handleInputChange(fund.id, "amount", e.target.value)}
                      className="table-input" style={{ textAlign: "right" }}
                      placeholder="R 0"
                      disabled={isUpdating}
                    />
                  </td>

                  {/* Fund value beneficiaries - Lump sum taken */}
                  <td className="p-2 text-right ">
                    <AutoSizeInput
                      
                      value={fund.lumpSumTaken || ""}
                      onChange={(e) => handleInputChange(fund.id, "lumpSumTaken", e.target.value)}
                      className="table-input" style={{ textAlign: "right" }}
                      placeholder="R 0"
                      disabled={isUpdating}
                    />
                  </td>

                  {/* Fund value beneficiaries - Fund value at death */}
                  <td className="p-2 text-right ">
                    <AutoSizeInput
                      value={fund.fundValueAtDeath || ""}
                      onChange={(e) => handleInputChange(fund.id, "fundValueAtDeath", e.target.value)}
                      className="table-input" style={{ textAlign: "right" }}
                      placeholder="R 0"
                      disabled={isUpdating}
                    />
                  </td>

                  {/* Fund value beneficiaries - Unappropriated fund commencement amount */}
                  <td className="p-2 text-right ">
                    <AutoSizeInput
                      
                      value={fund.nondeductibleContribution || ""}
                      onChange={(e) => handleInputChange(fund.id, "nondeductibleContribution", e.target.value)}
                      className="table-input" style={{ textAlign: "right" }}
                      placeholder="R 0"
                      disabled={isUpdating}
                    />
                  </td>

                  {/* Living Annuity */}
                  <td className="p-2 text-right ">
                    <AutoSizeInput
                      value={fund.livingAnnuity || ""}
                      onChange={(e) => handleInputChange(fund.id, "livingAnnuity", e.target.value)}
                      className="table-input" style={{ textAlign: "right" }}
                      placeholder=""
                      disabled={isUpdating}
                    />
                  </td>

                  {/* Income from */}
                  <td className="p-2 text-right ">
                    <AutoSizeInput
                      
                      value={fund.incomeTerm || ""}
                      onChange={(e) => handleInputChange(fund.id, "incomeTerm", e.target.value)}
                      className="table-input" style={{ textAlign: "right" }}
                      placeholder="Income term"
                      disabled={isUpdating}
                    />
                  </td>
                </>
              )}
            </tr>
          ))}
          
          {/* Totals row */}
          <tr className="bg-gray-100 font-semibold border-t-2 border-neutral-300">
            {/* Overview Section */}
            {columnVisibility.overview && (
              <>
                {/* Description */}
                <td className="table-cell whitespace-nowrap table-text-14 font-bold" style={{ color: '#094161' }}>
                  Total
                </td>
                
                {/* Owner */}
                <td className="p-2 text-right ">
                  
                </td>
              </>
            )}
            
            {/* Unapproved Life Cover Section */}
            {columnVisibility.unapprovedLifeCover && (
              <>
                {/* Cover amount - TOTAL */}
                <td className="p-2 text-right border-l border-neutral-300">
                  <span className="font-bold text-right table-text-14 compact-total-span" style={{ color: '#094161' }}>
                    R {funds.reduce((sum, fund) => {
                      const amount = parseInt(fund.coverAmount?.replace(/[^0-9]/g, '') || '0');
                      return sum + amount;
                    }, 0).toLocaleString()}
                  </span>
                </td>
                
                {/* Beneficiary */}
                <td className="p-2 text-right ">
                  
                </td>
                
                {/* % */}
                <td className="p-2 text-right ">
                  
                </td>
                
                {/* Cover split */}
                <td className="p-2 text-right ">
                  
                </td>
              </>
            )}
            
            {/* Monthly Death Benefit Section */}
            {columnVisibility.monthlyDeathBenefit && (
              <>
                {/* Monthly income - TOTAL */}
                <td className="p-2 text-right border-l border-neutral-300">
                  <span className="font-bold text-right table-text-14 compact-total-span" style={{ color: '#094161' }}>
                    R {funds.reduce((sum, fund) => {
                      const amount = parseInt(fund.monthlyIncome?.replace(/[^0-9]/g, '') || '0');
                      return sum + amount;
                    }, 0).toLocaleString()}
                  </span>
                </td>
                
                {/* Term (Years) */}
                <td className="p-2 text-right ">
                  
                </td>
                
                {/* Increase % */}
                <td className="p-2 text-right ">
                  
                </td>
                
                {/* Escalation amount */}
                <td className="p-2 text-right  ">
                  
                </td>
              </>
            )}
            
            {/* Fund Value Section */}
            {columnVisibility.fundValue && (
              <>
                <td className="p-2 text-right border-l border-neutral-300">
                  <span className="font-bold text-right table-text-14 compact-total-span" style={{ color: '#094161' }}>
                    R {funds.reduce((sum, fund) => {
                      const amount = parseInt(fund.approvedLifeCover?.replace(/[^0-9]/g, '') || '0');
                      return sum + amount;
                    }, 0).toLocaleString()}
                  </span>
                </td>
                
                <td className="p-2 text-right ">
                  <span className="font-bold text-right table-text-14 compact-total-span" style={{ color: '#094161' }}>
                    R {funds.reduce((sum, fund) => {
                      const amount = parseInt(fund.fundValue?.replace(/[^0-9]/g, '') || '0');
                      return sum + amount;
                    }, 0).toLocaleString()}
                  </span>
                </td>
                
                <td className="p-2 text-right  ">
                  <span className="font-bold text-right table-text-14 compact-total-span" style={{ color: '#094161' }}>
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
                <td className="p-2 text-right border-l border-neutral-300">
                  
                </td>
                
                {/* Fund value beneficiaries - % */}
                <td className="p-2 text-right ">
                  
                </td>
                
                {/* Fund value beneficiaries - Amount */}
                <td className="p-2 text-right ">
                  
                </td>
                
                {/* Fund value beneficiaries - Lump sum taken */}
                <td className="p-2 text-right ">
                  
                </td>
                
                {/* Fund value beneficiaries - Fund value at death */}
                <td className="p-2 text-right ">
                  
                </td>
                
                {/* Fund value beneficiaries - Non deductible contribution amount */}
                <td className="p-2 text-right ">
                  
                </td>
                
                {/* Fund value beneficiaries - Living annuity */}
                <td className="p-2 text-right ">
                  
                </td>
                
                {/* Fund value beneficiaries - Income term */}
                <td className="p-2 text-right ">
                  
                </td>
              </>
            )}
          </tr>
        </tbody>
      </table>
    </div>
  );
}