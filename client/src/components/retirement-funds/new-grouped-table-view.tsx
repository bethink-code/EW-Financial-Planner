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
  onAddFund: () => void;
}
// Removed AutoSizeInput - optimized for better performance
export function NewGroupedTableView({ funds, columnVisibility, tableMode, onFieldUpdate, isUpdating, onAddFund }: NewGroupedTableViewProps) {
  
  // Memoized calculations for better performance
  const flowsTotals = useMemo(() => {
    const totals = {
      estate: 0,
      spouse: 0,
      other: 0
    };
    
    funds.forEach(fund => {
      // Parse Estate value
      const estateValue = parseFloat((fund.lumpSumProvisionEstate || "0").replace(/[R\s,]/g, '').replace(/[^\d.-]/g, '')) || 0;
      // Parse Spouse value  
      const spouseValue = parseFloat((fund.lumpSumProvisionSpouse || "0").replace(/[R\s,]/g, '').replace(/[^\d.-]/g, '')) || 0;
      // Parse Other value
      const otherValue = parseFloat((fund.lumpSumProvisionOther || "0").replace(/[R\s,]/g, '').replace(/[^\d.-]/g, '')) || 0;
      
      totals.estate += estateValue;
      totals.spouse += spouseValue; 
      totals.other += otherValue;
    });
    
    return totals;
  }, [funds]);
  // Format currency value
  const formatCurrencyValue = useCallback((value: string, field: string) => {
    // Fields that should have currency formatting (R prefix)
    const currencyFields = [
      'coverAmount', 'monthlyIncome', 'approvedLifeCover', 'fundValue', 'fundValueAtDeath', 
      'amount', 'lumpSumTaken', 'nondeductibleContribution', 'livingAnnuity', 'escalationAmount',
      'currentAnnualIncome', 'annualIncomeAtDeath', 'estateDeploymentDeceased', 'monthlyProvisionOffered',
      'lumpSumProvisionEstate', 'lumpSumProvisionSpouse', 'lumpSumProvisionOther'
    ];
    
    // Fields that should have thousand separators but no R prefix  
    const numericFields = [
      'lumpSumLeftOverProvisions', 'lumpSumDeath', 'previousLumpSums', 'additionalTaxFreeAmount'
    ];
    
    // Fields that should have percentage formatting (% suffix)
    const percentageFields = [
      'increasePercentage', 'beneficiaryPercentageSplit', 'percentage',
      'estateDutyPoliciesOnLife', 'estateDutyToSpouse', 'estateDutyToOthers', 
      'executorsFee', 'mastersFee', 'incomeEscalation'
    ];
    
    // Fields that should have years formatting (years suffix)
    const yearsFields = [
      'termYears', 'incomeTerm'
    ];
    
    if (!currencyFields.includes(field) && !numericFields.includes(field) && !percentageFields.includes(field) && !yearsFields.includes(field)) return value;
    
    // Remove existing formatting and non-numeric characters except decimals
    const numericValue = value.replace(/[^\d.-]/g, '');
    if (!numericValue || isNaN(Number(numericValue))) return value;
    
    if (currencyFields.includes(field)) {
      // Add R prefix and format with thousands separators
      return `R ${Math.round(Number(numericValue)).toLocaleString()}`;
    } else if (percentageFields.includes(field)) {
      // Add % suffix
      return `${Number(numericValue)}%`;
    } else if (yearsFields.includes(field)) {
      // Add years suffix
      return `${Number(numericValue)} years`;
    } else {
      // Just format with thousands separators (no R prefix)
      return Math.round(Number(numericValue)).toLocaleString();
    }
  }, []);
  // Memoized handlers
  const handleInputBlur = useCallback((fundId: number, field: keyof UpdateRetirementFund, value: string) => {
    const formattedValue = formatCurrencyValue(value, field);
    onFieldUpdate(fundId, field, formattedValue);
  }, [onFieldUpdate, formatCurrencyValue]);
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
  const renderEditableCell = useCallback((value: string, onChange: (value: string) => void, className = "", field = "") => {
    return (
      <input
        defaultValue={value}
        onBlur={(e) => {
          const formattedValue = formatCurrencyValue(e.target.value, field);
          if (formattedValue !== e.target.value) {
            e.target.value = formattedValue;
          }
          onChange(e.target.value);
        }}
        className={`p-1 table-text-14 text-right bg-[#F2F7FB] border-none focus:bg-white focus:border focus:border-primary hover:bg-neutral-50 table-input ${className}`}
        style={{ textAlign: 'right', minWidth: '60px' }}
        disabled={isUpdating}
      />
    );
  }, [isUpdating, formatCurrencyValue]);
  // Flows table structure - removed temporarily to fix JSX syntax error
  if (tableMode === "flows") {
    // Render flows table only
    return (
      <div>
        {/* Add Fund Button */}
        <div className="mb-4 flex justify-end">
          <Button 
            onClick={onAddFund}
            size="sm" 
            className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700"
          >
            <Plus size={14} className="mr-1" />
            Add Fund
          </Button>
        </div>
        
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
                <th className="p-2 text-left font-medium text-neutral-600 uppercase tracking-wider text-xs" style={{ minWidth: '200px', width: '200px' }}>
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
              <tr key={fund.id} className={index % 2 === 0 ? "bg-white" : "bg-teal-50/30"}>
                {columnVisibility.overview && (
                  <td className="p-2 table-text-14 text-neutral-900" style={{ minWidth: '200px', width: '200px' }}>
                    {fund.description}
                  </td>
                )}
                {columnVisibility.overview && (
                  <>
                    <td className="p-2 text-right ">
                      <input
                        defaultValue={fund.lumpSumProvisionEstate || "0"}
                        onBlur={(e) => {
                          const formattedValue = formatCurrencyValue(e.target.value, "lumpSumProvisionEstate");
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(fund.id, "lumpSumProvisionEstate", e.target.value);
                        }}
                        className="table-input"
                        style={{ textAlign: 'right', minWidth: '60px' }}
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right ">
                      <input
                        defaultValue={fund.lumpSumProvisionSpouse || "0"}
                        onBlur={(e) => {
                          const formattedValue = formatCurrencyValue(e.target.value, "lumpSumProvisionSpouse");
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(fund.id, "lumpSumProvisionSpouse", e.target.value);
                        }}
                        className="table-input"
                        style={{ textAlign: 'right', minWidth: '60px' }}
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right ">
                      <input
                        defaultValue={fund.lumpSumProvisionOther || "0"}
                        onBlur={(e) => {
                          const formattedValue = formatCurrencyValue(e.target.value, "lumpSumProvisionOther");
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(fund.id, "lumpSumProvisionOther", e.target.value);
                        }}
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
                      <input
                        defaultValue={fund.currentAnnualIncome || "0"}
                        onBlur={(e) => {
                          const formattedValue = formatCurrencyValue(e.target.value, "currentAnnualIncome");
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(fund.id, "currentAnnualIncome", e.target.value);
                        }}
                        className="table-input" style={{ textAlign: "right" }}
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right ">
                      <input
                        defaultValue={fund.termYears || "0"}
                        onBlur={(e) => {
                          const formattedValue = formatCurrencyValue(e.target.value, "termYears");
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(fund.id, "termYears", e.target.value);
                        }}
                        className="table-input" style={{ textAlign: "right" }}
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right ">
                      <input
                        defaultValue={fund.increasePercentage || "0%"}
                        onBlur={(e) => {
                          const formattedValue = formatCurrencyValue(e.target.value, "increasePercentage");
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(fund.id, "increasePercentage", e.target.value);
                        }}
                        className="table-input" style={{ textAlign: "right" }}
                        disabled={isUpdating}
                      />
                    </td>
                  </>
                )}
                {columnVisibility.fundValue && (
                  <>
                    <td className="p-2 text-right border-l border-neutral-300">
                      <input
                        defaultValue={fund.monthlyProvisionOffered || "0"}
                        onBlur={(e) => {
                          const formattedValue = formatCurrencyValue(e.target.value, "monthlyProvisionOffered");
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(fund.id, "monthlyProvisionOffered", e.target.value);
                        }}
                        className="table-input" style={{ textAlign: "right" }}
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right ">
                      <input
                        defaultValue={fund.incomeTerm || "0"}
                        onBlur={(e) => {
                          const formattedValue = formatCurrencyValue(e.target.value, "incomeTerm");
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(fund.id, "incomeTerm", e.target.value);
                        }}
                        className="table-input" style={{ textAlign: "right" }}
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right ">
                      <input
                        defaultValue={fund.incomeEscalation || "0%"}
                        onBlur={(e) => {
                          const formattedValue = formatCurrencyValue(e.target.value, "incomeEscalation");
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(fund.id, "incomeEscalation", e.target.value);
                        }}
                        className="table-input" style={{ textAlign: "right" }}
                        disabled={isUpdating}
                      />
                    </td>
                  </>
                )}
                {columnVisibility.fundValueBeneficiaries && (
                  <>
                    <td className="p-2 text-right border-l border-neutral-300">
                      <input
                        defaultValue={fund.estateDutyPoliciesOnLife || "0%"}
                        onBlur={(e) => {
                          const formattedValue = formatCurrencyValue(e.target.value, "estateDutyPoliciesOnLife");
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(fund.id, "estateDutyPoliciesOnLife", e.target.value);
                        }}
                        className="table-input" 
                        placeholder="0%"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right ">
                      <input
                        defaultValue={fund.estateDutyToSpouse || "0%"}
                        onBlur={(e) => {
                          const formattedValue = formatCurrencyValue(e.target.value, "estateDutyToSpouse");
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(fund.id, "estateDutyToSpouse", e.target.value);
                        }}
                        className="table-input" style={{ textAlign: "right" }}
                        placeholder="0%"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right ">
                      <input
                        defaultValue={fund.estateDutyToOthers || "0%"}
                        onBlur={(e) => {
                          const formattedValue = formatCurrencyValue(e.target.value, "estateDutyToOthers");
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(fund.id, "estateDutyToOthers", e.target.value);
                        }}
                        className="table-input"
                        placeholder="0%"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <input
                        defaultValue={fund.executorsFee || "0%"}
                        onBlur={(e) => {
                          const formattedValue = formatCurrencyValue(e.target.value, "executorsFee");
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(fund.id, "executorsFee", e.target.value);
                        }}
                        className="table-input"
                        placeholder="0%"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <input
                        defaultValue={fund.mastersFee || "0%"}
                        onBlur={(e) => {
                          const formattedValue = formatCurrencyValue(e.target.value, "mastersFee");
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(fund.id, "mastersFee", e.target.value);
                        }}
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
                <td className="table-cell whitespace-nowrap table-text-14 font-bold" style={{ color: '#094161', minWidth: '200px', width: '200px' }}>
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
    <div>
      {/* Add Fund Button */}
      <div className="mb-4 flex justify-end">
        <Button 
          onClick={onAddFund}
          size="sm" 
          className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700"
        >
          <Plus size={14} className="mr-1" />
          Add Fund
        </Button>
      </div>
      
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
                        <input
                          defaultValue={fund.description || ""}
                          onBlur={(e) => handleInputBlur(fund.id, "description", e.target.value)}
                          className="border-0 focus:bg-white focus:border focus:border-primary hover:bg-neutral-50 text-left font-medium table-input"
                          placeholder="Fund description"
                          disabled={isUpdating}
                        />
                      </td>
                      
                      {/* Owner */}
                      <td className="p-2 text-right" rowSpan={beneficiaries.length + 1}>
                        <Select
                          value={fund.owner || "John Doe"}
                          onValueChange={(value) => handleInputBlur(fund.id, "owner", value)}
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
                        <input
                          defaultValue={fund.coverAmount || ""}
                          onBlur={(e) => {
                            const formattedValue = formatCurrencyValue(e.target.value, "coverAmount");
                            if (formattedValue !== e.target.value) {
                              e.target.value = formattedValue;
                            }
                            handleInputBlur(fund.id, "coverAmount", e.target.value);
                            
                            // Recalculate cover splits for all beneficiaries
                            const beneficiaries = parseBeneficiaries(fund.beneficiaries);
                            if (beneficiaries.length > 0) {
                              const newCoverAmount = parseFloat(e.target.value.replace(/[^\d.-]/g, '')) || 0;
                              const updatedBeneficiaries = beneficiaries.map(b => ({
                                ...b,
                                coverSplit: `R ${Math.round((newCoverAmount * b.percentage / 100)).toLocaleString()}`
                              }));
                              handleInputBlur(fund.id, 'beneficiaries', JSON.stringify(updatedBeneficiaries));
                            }
                          }}
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
                  <tr key={`${fund.id}-beneficiary-${beneficiary.id}`} className="hover:bg-neutral-50 border-l-4 border-l-teal-200">
                    {/* Beneficiary details only in unapproved life cover section */}
                    {columnVisibility.unapprovedLifeCover && (
                      <>
                        {/* Beneficiary Name */}
                        <td className="p-2 text-left border-l border-neutral-300">
                          <input
                            type="text"
                            defaultValue={beneficiary.name}
                            onBlur={(e) => handleBeneficiaryUpdate(fund.id, index, 'name', e.target.value)}
                            placeholder="Beneficiary name"
                            disabled={isUpdating}
                            className="h-6 text-xs text-left bg-[#F2F7FB] border-none focus:bg-white focus:border focus:border-primary w-full px-2 py-1 rounded"
                          />
                        </td>
                        
                        {/* Percentage */}
                        <td className="p-2 text-center">
                          <input
                            type="text"
                            defaultValue={`${beneficiary.percentage}%`}
                            onBlur={(e) => {
                              const formattedValue = formatCurrencyValue(e.target.value, "percentage");
                              if (formattedValue !== e.target.value) {
                                e.target.value = formattedValue;
                              }
                              // Extract numeric value for backend
                              const numericValue = e.target.value.replace(/[^\d.-]/g, '');
                              handleBeneficiaryUpdate(fund.id, index, 'percentage', numericValue);
                            }}
                            disabled={isUpdating}
                            className="h-6 text-xs text-center bg-[#F2F7FB] border-none focus:bg-white focus:border focus:border-primary w-full px-2 py-1 rounded"
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
                <td className="table-cell whitespace-nowrap table-text-14 font-bold" style={{ color: '#094161', minWidth: '200px', width: '200px' }}>
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
    </div>
  );
}
