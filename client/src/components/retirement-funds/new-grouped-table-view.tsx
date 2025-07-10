import React, { useRef, useEffect, useMemo, useCallback } from "react";
import { RetirementFund, UpdateRetirementFund, Beneficiary } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { parseBeneficiaries } from "@/lib/beneficiaries";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FundActions } from "./fund-actions";
import { nanoid } from "nanoid";

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
  
  // Memoized calculations for better performance
  const flowsTotals = useMemo(() => {
    const totals = {
      estate: 0,
      spouse: 0,
      other: 0
    };
    
    funds.forEach(fund => {
      // Clean the value by removing currency symbols, commas, and spaces, then parse
      const cleanValue = (fund.lumpSumLeftOverProvisions || "0")
        .replace(/[R\s,]/g, '') // Remove R, spaces, and commas
        .replace(/[^\d.-]/g, ''); // Keep only digits, dots, and minus signs
      
      const value = parseFloat(cleanValue) || 0; // Default to 0 if still NaN
      
      totals.estate += value;
      totals.spouse += value; 
      totals.other += value;
    });
    
    return totals;
  }, [funds]);

  // Memoized handlers
  const handleInputChange = useCallback((fundId: number, field: keyof UpdateRetirementFund, value: string) => {
    onFieldUpdate(fundId, field, value);
  }, [onFieldUpdate]);

  const handleBeneficiaryUpdate = useCallback((fundId: number, beneficiaryIndex: number, field: keyof Beneficiary, value: string | number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;

    const currentBeneficiaries = parseBeneficiaries(fund.beneficiaries);
    const updatedBeneficiaries = [...currentBeneficiaries];
    
    if (updatedBeneficiaries[beneficiaryIndex]) {
      if (field === 'percentage') {
        updatedBeneficiaries[beneficiaryIndex] = {
          ...updatedBeneficiaries[beneficiaryIndex],
          [field]: Math.max(0, Math.min(100, Number(value) || 0))
        };
      } else {
        updatedBeneficiaries[beneficiaryIndex] = {
          ...updatedBeneficiaries[beneficiaryIndex],
          [field]: value
        };
      }

      // Update cover splits when percentages change
      if (field === 'percentage') {
        const coverAmount = parseFloat(fund.coverAmount.replace(/[^\d.-]/g, '')) || 0;
        updatedBeneficiaries[beneficiaryIndex].coverSplit = 
          `R ${Math.round((coverAmount * updatedBeneficiaries[beneficiaryIndex].percentage / 100)).toLocaleString()}`;
      }

      onFieldUpdate(fundId, 'beneficiaries', JSON.stringify(updatedBeneficiaries));
    }
  }, [funds, onFieldUpdate]);

  const handleAddBeneficiary = useCallback((fundId: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;

    const currentBeneficiaries = parseBeneficiaries(fund.beneficiaries);
    const newBeneficiary: Beneficiary = {
      id: nanoid(),
      name: "",
      percentage: 0,
      coverSplit: "R 0"
    };

    const updatedBeneficiaries = [...currentBeneficiaries, newBeneficiary];
    onFieldUpdate(fundId, 'beneficiaries', JSON.stringify(updatedBeneficiaries));
  }, [funds, onFieldUpdate]);

  const handleRemoveBeneficiary = useCallback((fundId: number, beneficiaryIndex: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;

    const currentBeneficiaries = parseBeneficiaries(fund.beneficiaries);
    if (currentBeneficiaries.length <= 1) return;

    const updatedBeneficiaries = currentBeneficiaries.filter((_, index) => index !== beneficiaryIndex);
    
    // Auto-adjust percentages
    const totalPercentage = updatedBeneficiaries.reduce((sum, b) => sum + b.percentage, 0);
    if (totalPercentage > 0 && totalPercentage !== 100) {
      const adjustmentFactor = 100 / totalPercentage;
      const coverAmount = parseFloat(fund.coverAmount.replace(/[^\d.-]/g, '')) || 0;
      
      updatedBeneficiaries.forEach(b => {
        b.percentage = Math.round(b.percentage * adjustmentFactor * 100) / 100;
        b.coverSplit = `R ${Math.round((coverAmount * b.percentage / 100)).toLocaleString()}`;
      });
    }

    onFieldUpdate(fundId, 'beneficiaries', JSON.stringify(updatedBeneficiaries));
  }, [funds, onFieldUpdate]);

  const owners = useMemo(() => ["John Doe", "Jane Smith"], []);

  // Memoized editable cell renderer
  const renderEditableCell = useCallback((value: string, onChange: (value: string) => void, className = "") => {
    return (
      <AutoSizeInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`p-1 table-text-14 text-right bg-[#F2F7FB] border-none focus:bg-white focus:border focus:border-primary hover:bg-neutral-50 ${className}`}
        style={{ textAlign: 'right', minWidth: '60px' }}
        disabled={isUpdating}
      />
    );
  }, [isUpdating]);

  // Flows table structure - removed temporarily to fix JSX syntax error

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
                <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs border-l border-neutral-300" colSpan={3}>
                  Income provision source
                </th>
              )}
              {columnVisibility.fundValue && (
                <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs border-l border-neutral-300" colSpan={3}>
                  Income provision offered
                </th>
              )}
              {columnVisibility.fundValueBeneficiaries && (
                <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs border-l border-neutral-300" colSpan={5}>
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
                  <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs border-l border-neutral-300">
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
                  <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs border-l border-neutral-300">
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
                  <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs border-l border-neutral-300">
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
                    <td className="p-2 text-right border-l border-neutral-300">
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
            <tr className="bg-gray-100 font-bold">
              {columnVisibility.overview && (
                <>
                {/* Description */}
                <td className="table-cell whitespace-nowrap table-text-14 font-bold" style={{ color: '#094161' }}>
                  Total
                </td>
                
                {/* Estate */}
                <td className="p-2 text-right ">
                  <span className="font-bold text-right table-text-14" style={{ color: '#094161', fontWeight: '700' }}>
                    R {flowsTotals.estate.toLocaleString()}
                  </span>
                </td>
                
                {/* Spouse */}
                <td className="p-2 text-right ">
                  <span className="font-bold text-right table-text-14" style={{ color: '#094161', fontWeight: '700' }}>
                    R {flowsTotals.spouse.toLocaleString()}
                  </span>
                </td>
                
                {/* Other */}
                <td className="p-2 text-right ">
                  <span className="font-bold text-right table-text-14" style={{ color: '#094161', fontWeight: '700' }}>
                    R {flowsTotals.other.toLocaleString()}
                  </span>
                </td>
              </>
              )}
              {columnVisibility.monthlyDeathBenefit && (
                <>
                  <td className="p-2 text-right border-l border-neutral-300">
                    {/* Empty - no totals for this section */}
                  </td>
                  <td className="p-2 text-right ">
                    {/* Empty - no totals for this section */}
                  </td>
                  <td className="p-2 text-right ">
                    {/* Empty - no totals for this section */}
                  </td>
                </>
              )}
              {columnVisibility.fundValue && (
                <>
                  <td className="p-2 text-right border-l border-neutral-300">
                    {/* Empty - no totals for this section */}
                  </td>
                  <td className="p-2 text-right ">
                    {/* Empty - no totals for this section */}
                  </td>
                  <td className="p-2 text-right">
                    {/* Empty - no totals for this section */}
                  </td>
                </>
              )}
              {columnVisibility.fundValueBeneficiaries && (
                <>
                  {/* Estate Duty (Policies on life of deceased) */}
                  <td className="p-2 text-right border-l border-neutral-300">
                    {/* Empty - no totals for this section */}
                  </td>
                  
                  {/* Estate Duty (To spouse) */}
                  <td className="p-2 text-right ">
                    {/* Empty - no totals for this section */}
                  </td>
                  
                  {/* Estate Duty (To others) */}
                  <td className="p-2 text-right ">
                    {/* Empty - no totals for this section */}
                  </td>
                  
                  {/* Executor's fee */}
                  <td className="p-2 text-right ">
                    {/* Empty - no totals for this section */}
                  </td>
                  
                  {/* Master's fee */}
                  <td className="p-2 text-right ">
                    {/* Empty - no totals for this section */}
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
              <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs border-l border-neutral-300" colSpan={4}>
                Unapproved life cover
              </th>
            )}
            {columnVisibility.monthlyDeathBenefit && (
              <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs border-l border-neutral-300" colSpan={4}>
                Monthly death benefit
              </th>
            )}
            {columnVisibility.fundValue && (
              <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs border-l border-neutral-300" colSpan={3}>
                Fund value
              </th>
            )}
            {columnVisibility.fundValueBeneficiaries && (
              <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs border-l border-neutral-300" colSpan={8}>
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
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider border-l border-neutral-300">
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
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider border-l border-neutral-300">
                  Monthly income
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Term (Years)
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Increase %
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Escalation amount
                </th>
              </>
            )}
            {/* Fund Value Section */}
            {columnVisibility.fundValue && (
              <>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider border-l border-neutral-300">
                  Approved life cover
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Fund value
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Fund value at death
                </th>
              </>
            )}
            {columnVisibility.fundValueBeneficiaries && (
              <>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider border-l border-neutral-300">
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
          {funds.map((fund) => {
            const beneficiaries = parseBeneficiaries(fund.beneficiaries);
            
            return (
              <React.Fragment key={fund.id}>
                {/* Main fund row */}
                <tr className="hover:bg-neutral-50">
                  {/* Overview Section */}
                  {columnVisibility.overview && (
                    <>
                      {/* Description */}
                      <td className="table-cell whitespace-nowrap table-text-14 text-neutral-900" rowSpan={beneficiaries.length + 1}>
                        <AutoSizeInput
                          value={fund.description || ""}
                          onChange={(e) => handleInputChange(fund.id, "description", e.target.value)}
                          className="border-0 focus:bg-white focus:border focus:border-primary hover:bg-neutral-50 text-left font-medium"
                          placeholder="Fund description"
                          disabled={isUpdating}
                        />
                      </td>
                      
                      {/* Owner */}
                      <td className="p-2 text-right" rowSpan={beneficiaries.length + 1}>
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

                  {/* Unapproved Life Cover Section - Header Row */}
                  {columnVisibility.unapprovedLifeCover && (
                    <>
                      <td className="p-2 text-right border-l border-neutral-300 bg-teal-50" rowSpan={beneficiaries.length + 1}>
                        <AutoSizeInput
                          value={fund.coverAmount || ""}
                          onChange={(e) => handleInputChange(fund.id, "coverAmount", e.target.value)}
                          className="table-input" style={{ textAlign: "right" }}
                          placeholder="R 0"
                          disabled={isUpdating}
                        />
                      </td>
                      <td className="p-2 text-center bg-blue-50 text-sm font-semibold text-blue-700" colSpan={3}>
                        Beneficiaries
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddBeneficiary(fund.id)}
                          disabled={isUpdating || beneficiaries.length >= 10}
                          className="ml-2 h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </td>
                    </>
                  )}

                  {/* Monthly Death Benefit Section - Placeholder for Main Row */}
                  {columnVisibility.monthlyDeathBenefit && (
                    <>
                      <td className="p-2 border-l border-neutral-300" colSpan={4}></td>
                    </>
                  )}

                  {/* Fund Value Section - Placeholder for Main Row */}
                  {columnVisibility.fundValue && (
                    <>
                      <td className="p-2 border-l border-neutral-300" colSpan={3}></td>
                    </>
                  )}

                  {/* Fund Value Beneficiaries Section - Placeholder for Main Row */}
                  {columnVisibility.fundValueBeneficiaries && (
                    <>
                      <td className="p-2 border-l border-neutral-300" colSpan={8}></td>
                    </>
                  )}
                </tr>

                {/* Beneficiary Rows */}
                {beneficiaries.map((beneficiary, index) => (
                  <tr key={beneficiary.id} className="hover:bg-neutral-50 border-l-4 border-l-teal-200">
                    {/* Beneficiary details only in unapproved life cover section */}
                    {columnVisibility.unapprovedLifeCover && (
                      <>
                        {/* Beneficiary Name */}
                        <td className="p-2 text-left border-l border-neutral-300">
                          <Input
                            value={beneficiary.name}
                            onChange={(e) => handleBeneficiaryUpdate(fund.id, index, 'name', e.target.value)}
                            placeholder="Beneficiary name"
                            disabled={isUpdating}
                            className="h-6 text-xs text-left bg-[#F2F7FB] border-none focus:bg-white focus:border focus:border-primary"
                          />
                        </td>
                        
                        {/* Percentage */}
                        <td className="p-2 text-center">
                          <Input
                            type="number"
                            value={beneficiary.percentage}
                            onChange={(e) => handleBeneficiaryUpdate(fund.id, index, 'percentage', e.target.value)}
                            min="0"
                            max="100"
                            step="0.1"
                            disabled={isUpdating}
                            className="h-6 text-xs text-center bg-[#F2F7FB] border-none focus:bg-white focus:border focus:border-primary"
                          />
                        </td>
                        
                        {/* Cover Split */}
                        <td className="p-2 text-right">
                          <div className="h-6 text-xs text-right px-2 py-1 bg-gray-50 border rounded text-neutral-600">
                            {beneficiary.coverSplit}
                          </div>
                        </td>
                        
                        {/* Remove Button - Only in the last column */}
                        <td className="p-2 text-center">
                          {beneficiaries.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveBeneficiary(fund.id, index)}
                              disabled={isUpdating}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </td>
                      </>
                    )}

                    {/* Empty cells for other sections when not visible */}
                    {columnVisibility.monthlyDeathBenefit && (
                      <>
                        <td className="p-2 border-l border-neutral-300" colSpan={4}></td>
                      </>
                    )}

                    {columnVisibility.fundValue && (
                      <>
                        <td className="p-2 border-l border-neutral-300" colSpan={3}></td>
                      </>
                    )}

                    {columnVisibility.fundValueBeneficiaries && (
                      <>
                        <td className="p-2 border-l border-neutral-300" colSpan={8}></td>
                      </>
                    )}
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
          
          {/* Totals row */}
          <tr className="bg-gray-100 font-bold border-t-2 border-neutral-300">
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
              <td className="p-2 text-right border-l border-neutral-300">
                <span className="font-bold text-right table-text-14" style={{ color: '#094161', fontWeight: '700' }}>
                  R {funds.reduce((sum, fund) => {
                    const amount = parseInt(fund.coverAmount?.replace(/[^0-9]/g, '') || '0');
                    return sum + amount;
                  }, 0).toLocaleString()}
                </span>
              </td>
            )}
            
            {/* Monthly Death Benefit Section */}
            {columnVisibility.monthlyDeathBenefit && (
              <>
                {/* Monthly income - TOTAL */}
                <td className="p-2 text-right border-l border-neutral-300">
                  <span className="font-bold text-right table-text-14" style={{ color: '#094161', fontWeight: '700' }}>
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
                  <span className="font-bold text-right table-text-14" style={{ color: '#094161', fontWeight: '700' }}>
                    R {funds.reduce((sum, fund) => {
                      const amount = parseInt(fund.approvedLifeCover?.replace(/[^0-9]/g, '') || '0');
                      return sum + amount;
                    }, 0).toLocaleString()}
                  </span>
                </td>
                
                <td className="p-2 text-right ">
                  <span className="font-bold text-right table-text-14" style={{ color: '#094161', fontWeight: '700' }}>
                    R {funds.reduce((sum, fund) => {
                      const amount = parseInt(fund.fundValue?.replace(/[^0-9]/g, '') || '0');
                      return sum + amount;
                    }, 0).toLocaleString()}
                  </span>
                </td>
                
                <td className="p-2 text-right  ">
                  <span className="font-bold text-right table-text-14" style={{ color: '#094161', fontWeight: '700' }}>
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