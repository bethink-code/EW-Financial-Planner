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
interface SimpleTableWithBeneficiariesProps {
  funds: RetirementFund[];
  columnVisibility: ColumnVisibility;
  tableMode: "inputs" | "flows";
  onFieldUpdate: (id: number, field: keyof UpdateRetirementFund, value: string) => void;
  isUpdating: boolean;
}
// Removed AutoSizeInput component - no longer needed for optimized performance
export function SimpleTableWithBeneficiaries({ funds, columnVisibility, tableMode, onFieldUpdate, isUpdating }: SimpleTableWithBeneficiariesProps) {
  
  // Format currency value
  const formatCurrencyValue = useCallback((value: string, field: string) => {
    // Fields that should have currency formatting (R prefix)
    const currencyFields = [
      'coverAmount', 'monthlyIncome', 'approvedLifeCover', 'fundValue', 'fundValueAtDeath', 
      'amount', 'lumpSumTaken', 'nondeductibleContribution', 'livingAnnuity', 'escalationAmount'
    ];
    
    // Fields that should have thousand separators but no R prefix  
    const numericFields = [
      'lumpSumLeftOverProvisions', 'currentAnnualIncome', 'annualIncomeAtDeath', 
      'estateDeploymentDeceased', 'lumpSumDeath', 'previousLumpSums', 'additionalTaxFreeAmount'
    ];
    
    // Fields that should have percentage formatting (% suffix)
    const percentageFields = [
      'increasePercentage', 'beneficiaryPercentageSplit', 'percentage'
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
    const coverAmount = parseFloat(fund.coverAmount?.replace(/[^\d.-]/g, '') || '0') || 0;
    const newBeneficiary: Beneficiary = {
      id: nanoid(),
      name: "",
      percentage: 100,
      coverSplit: `R ${Math.round(coverAmount).toLocaleString()}`
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
  return (
    <div>
      
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
              <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs border-l border-neutral-300" colSpan={5}>
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
            {/* Fund Actions Column */}
            <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs border-l border-neutral-300" colSpan={1}>
              Fund Actions
            </th>
          </tr>
          
          {/* Second level headers */}
          <tr className="border-b border-neutral-200" style={{ backgroundColor: '#D6ECF5' }}>
            {columnVisibility.overview && (
              <>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Description
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider min-w-[140px]">
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
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider percentage-column">
                  %
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider">
                  Cover split
                </th>
                <th className="table-cell text-center table-header-12 text-neutral-600 uppercase tracking-wider">
                  Actions
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
            {/* Fund Actions Header */}
            <th className="table-cell text-center table-header-12 text-neutral-600 uppercase tracking-wider border-l border-neutral-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {funds.flatMap((fund) => {
            const beneficiaries = parseBeneficiaries(fund.beneficiaries);
            const rows = [];
            
            // Create main fund row
            rows.push(
              <tr key={fund.id} className="hover:bg-neutral-50">
                {/* Overview Section */}
                {columnVisibility.overview && (
                  <>
                    <td className="table-cell whitespace-nowrap table-text-14 text-neutral-900">
                      <input
                        defaultValue={fund.description || ""}
                        onBlur={(e) => onFieldUpdate(fund.id, "description", e.target.value)}
                        className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                        style={{ textAlign: "left", fontWeight: "500", minWidth: "140px" }}
                        placeholder="Fund description"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <Select
                        value={fund.owner || "John Doe"}
                        onValueChange={(value) => onFieldUpdate(fund.id, "owner", value)}
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="table-input h-7 min-w-[140px] w-full max-w-[180px] text-right border-0 focus:bg-white focus:border focus:border-primary hover:bg-neutral-50 transition-colors duration-200 group">
                          <SelectValue className="text-right pr-6" />
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
                    <td className="p-2 text-right border-l border-neutral-300">
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
                            onFieldUpdate(fund.id, 'beneficiaries', JSON.stringify(updatedBeneficiaries));
                          }
                        }}
                        className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                        style={{ textAlign: "right", minWidth: "100px" }}
                        placeholder="R 0"
                        disabled={isUpdating}
                      />
                    </td>
                    {beneficiaries.length > 0 ? (
                      <>
                        <td className="p-2">
                          <input
                            defaultValue={beneficiaries[0].name}
                            onBlur={(e) => handleBeneficiaryUpdate(fund.id, 0, 'name', e.target.value)}
                            placeholder="Beneficiary name"
                            disabled={isUpdating}
                            className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                            style={{ textAlign: "left", minWidth: "120px" }}
                          />
                        </td>
                        <td className="p-2 percentage-column">
                          <input
                            type="text"
                            defaultValue={`${beneficiaries[0].percentage || 0}%`}
                            onBlur={(e) => {
                              const formattedValue = formatCurrencyValue(e.target.value, "percentage");
                              if (formattedValue !== e.target.value) {
                                e.target.value = formattedValue;
                              }
                              // Extract numeric value for backend
                              const numericValue = e.target.value.replace(/[^\d.-]/g, '');
                              handleBeneficiaryUpdate(fund.id, 0, 'percentage', numericValue);
                            }}
                            disabled={isUpdating}
                            className="w-full h-7 text-sm text-center bg-white border-gray-200 focus:border-primary percentage-input px-3 py-1 border rounded-md"
                            placeholder="0%"
                          />
                        </td>
                        <td className="p-2">
                          <div className="h-7 text-sm text-right px-2 py-1 text-gray-900 flex items-center">
                            <span className="truncate flex-1">{beneficiaries[0].coverSplit}</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-1 justify-start">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddBeneficiary(fund.id)}
                              disabled={isUpdating || beneficiaries.length >= 10}
                              className="h-7 w-7 p-0 text-white"
                              style={{ 
                                backgroundColor: '#016991',
                                borderColor: '#016991'
                              }}
                              onMouseEnter={(e) => { 
                                e.currentTarget.style.backgroundColor = '#014d6b'; 
                              }}
                              onMouseLeave={(e) => { 
                                e.currentTarget.style.backgroundColor = '#016991'; 
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-2">
                          <div className="h-7 text-sm text-gray-400 px-2 py-1 bg-gray-50 border border-dashed rounded flex items-center justify-center">
                            No beneficiaries
                          </div>
                        </td>
                        <td className="p-2 percentage-column"></td>
                        <td className="p-2"></td>
                        <td className="p-2">
                          <div className="flex justify-start">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddBeneficiary(fund.id)}
                              disabled={isUpdating}
                              className="h-7 w-7 p-0 text-white"
                              style={{ 
                                backgroundColor: '#016991',
                                borderColor: '#016991'
                              }}
                              onMouseEnter={(e) => { 
                                e.currentTarget.style.backgroundColor = '#014d6b'; 
                              }}
                              onMouseLeave={(e) => { 
                                e.currentTarget.style.backgroundColor = '#016991'; 
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  </>
                )}
                {/* Other sections for main row */}
                {columnVisibility.monthlyDeathBenefit && (
                  <>
                    <td className="p-2 text-right border-l border-neutral-300">
                      <input
                        defaultValue={fund.monthlyIncome || ""}
                        onBlur={(e) => {
                          const formattedValue = formatCurrencyValue(e.target.value, "monthlyIncome");
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(fund.id, "monthlyIncome", e.target.value);
                        }}
                        className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                        style={{ textAlign: "right", minWidth: "80px" }}
                        placeholder="R 0"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <input
                        defaultValue={fund.termYears || ""}
                        onBlur={(e) => {
                          const formattedValue = formatCurrencyValue(e.target.value, "termYears");
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(fund.id, "termYears", e.target.value);
                        }}
                        className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                        style={{ textAlign: "right", minWidth: "60px" }}
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <input
                        defaultValue={fund.increasePercentage || ""}
                        onBlur={(e) => {
                          const formattedValue = formatCurrencyValue(e.target.value, "increasePercentage");
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(fund.id, "increasePercentage", e.target.value);
                        }}
                        className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                        style={{ textAlign: "right", minWidth: "60px" }}
                        placeholder="0%"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <input
                        defaultValue={fund.approvedLifeCover || ""}
                        onBlur={(e) => {
                          const formattedValue = formatCurrencyValue(e.target.value, "approvedLifeCover");
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(fund.id, "approvedLifeCover", e.target.value);
                        }}
                        className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                        style={{ textAlign: "right", minWidth: "80px" }}
                        placeholder="R 0"
                        disabled={isUpdating}
                      />
                    </td>
                  </>
                )}
                {columnVisibility.fundValue && (
                  <>
                    <td className="p-2 text-right border-l border-neutral-300">
                      <input
                        defaultValue={fund.approvedLifeCover || ""}
                        onBlur={(e) => {
                          const formattedValue = formatCurrencyValue(e.target.value, "approvedLifeCover");
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(fund.id, "approvedLifeCover", e.target.value);
                        }}
                        className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                        style={{ textAlign: "right", minWidth: "80px" }}
                        placeholder="R 0"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <input
                        defaultValue={fund.fundValue || ""}
                        onBlur={(e) => {
                          const formattedValue = formatCurrencyValue(e.target.value, "fundValue");
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(fund.id, "fundValue", e.target.value);
                        }}
                        className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                        style={{ textAlign: "right", minWidth: "80px" }}
                        placeholder="R 0"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <input
                        
                        defaultValue={fund.fundValueAtDeath || ""}
                        onBlur={(e) => {
                          const formattedValue = formatCurrencyValue(e.target.value, "fundValueAtDeath");
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(fund.id, "fundValueAtDeath", e.target.value);
                        }}
                        className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                        style={{ textAlign: "right", minWidth: "80px" }}
                        placeholder="R 0"
                        disabled={isUpdating}
                      />
                    </td>
                  </>
                )}
                {columnVisibility.fundValueBeneficiaries && (
                  <>
                    <td className="p-2 text-right border-l border-neutral-300">
                      <input
                        
                        defaultValue={fund.beneficiaryName || ""}
                        onBlur={(e) => handleInputBlur(fund.id, "beneficiaryName", e.target.value)}
                        className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                        style={{ textAlign: "left", minWidth: "120px" }}
                        placeholder="Beneficiary name"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <input
                        
                        defaultValue={fund.beneficiaryPercentageSplit || ""}
                        onBlur={(e) => {
                          const formattedValue = formatCurrencyValue(e.target.value, "beneficiaryPercentageSplit");
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(fund.id, "beneficiaryPercentageSplit", e.target.value);
                        }}
                        className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                        style={{ textAlign: "right", minWidth: "60px" }}
                        placeholder="0%"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <input
                        
                        defaultValue={fund.amount || ""}
                        onBlur={(e) => {
                          const formattedValue = formatCurrencyValue(e.target.value, "amount");
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(fund.id, "amount", e.target.value);
                        }}
                        className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                        style={{ textAlign: "right", minWidth: "80px" }}
                        placeholder="R 0"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <input
                        
                        defaultValue={fund.lumpSumTaken || ""}
                        onBlur={(e) => {
                          const formattedValue = formatCurrencyValue(e.target.value, "lumpSumTaken");
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(fund.id, "lumpSumTaken", e.target.value);
                        }}
                        className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                        style={{ textAlign: "right", minWidth: "80px" }}
                        placeholder="R 0"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <input
                        
                        defaultValue={fund.fundValueAtDeath || ""}
                        onBlur={(e) => {
                          const formattedValue = formatCurrencyValue(e.target.value, "fundValueAtDeath");
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(fund.id, "fundValueAtDeath", e.target.value);
                        }}
                        className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                        style={{ textAlign: "right", minWidth: "80px" }}
                        placeholder="R 0"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <input
                        
                        defaultValue={fund.nondeductibleContribution || ""}
                        onBlur={(e) => {
                          const formattedValue = formatCurrencyValue(e.target.value, "nondeductibleContribution");
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(fund.id, "nondeductibleContribution", e.target.value);
                        }}
                        className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                        style={{ textAlign: "right", minWidth: "80px" }}
                        placeholder="R 0"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <input
                        
                        defaultValue={fund.livingAnnuity || ""}
                        onBlur={(e) => {
                          const formattedValue = formatCurrencyValue(e.target.value, "livingAnnuity");
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(fund.id, "livingAnnuity", e.target.value);
                        }}
                        className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                        style={{ textAlign: "right", minWidth: "80px" }}
                        placeholder="R 0"
                        disabled={isUpdating}
                      />
                    </td>
                    <td className="p-2 text-right">
                      <input
                        
                        defaultValue={fund.incomeTerm || ""}
                        onBlur={(e) => {
                          const formattedValue = formatCurrencyValue(e.target.value, "incomeTerm");
                          if (formattedValue !== e.target.value) {
                            e.target.value = formattedValue;
                          }
                          handleInputBlur(fund.id, "incomeTerm", e.target.value);
                        }}
                        className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                        style={{ textAlign: "right", minWidth: "80px" }}
                        placeholder="Income term"
                        disabled={isUpdating}
                      />
                    </td>
                  </>
                )}
                {/* Fund Actions Cell */}
                <td className="p-2 text-center border-l border-neutral-300">
                  <FundActions fund={fund} />
                </td>
              </tr>
            );
            // Add additional beneficiary rows (starting from index 1)
            beneficiaries.slice(1).forEach((beneficiary, index) => {
              const actualIndex = index + 1; // Since we're starting from slice(1)
              const beneficiaryIndex = actualIndex; // This is the correct index in the original array
              rows.push(
                <tr key={`${fund.id}-beneficiary-${beneficiary.id}`} className="bg-teal-50/30 hover:bg-teal-50">
                  {/* Empty cells for overview columns */}
                  {columnVisibility.overview && (
                    <>
                      <td className="p-2 text-xs text-gray-500 pl-6">↳ Beneficiary {actualIndex + 1}</td>
                      <td className="p-2"></td>
                    </>
                  )}
                  {/* Beneficiary details in unapproved life cover section */}
                  {columnVisibility.unapprovedLifeCover && (
                    <>
                      <td className="p-2 border-l border-neutral-300"></td>
                      <td className="p-2">
                        <input
                          type="text"
                          defaultValue={beneficiary.name}
                          onBlur={(e) => handleBeneficiaryUpdate(fund.id, beneficiaryIndex, 'name', e.target.value)}
                          placeholder="Beneficiary name"
                          disabled={isUpdating}
                          className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                          style={{ textAlign: "left", minWidth: "120px" }}
                        />
                      </td>
                      <td className="p-2 percentage-column">
                        <input
                          type="text"
                          defaultValue={`${beneficiary.percentage || 0}%`}
                          onBlur={(e) => {
                            const formattedValue = formatCurrencyValue(e.target.value, "percentage");
                            if (formattedValue !== e.target.value) {
                              e.target.value = formattedValue;
                            }
                            // Extract numeric value for backend
                            const numericValue = e.target.value.replace(/[^\d.-]/g, '');
                            handleBeneficiaryUpdate(fund.id, beneficiaryIndex, 'percentage', numericValue);
                          }}
                          disabled={isUpdating}
                          className="w-full h-7 text-sm text-center bg-white border-gray-200 focus:border-primary percentage-input px-3 py-1 border rounded-md"
                          placeholder="0%"
                        />
                      </td>
                      <td className="p-2">
                        <div className="h-7 text-sm text-right px-2 py-1 text-gray-900 flex items-center">
                          <span className="truncate flex-1">{beneficiary.coverSplit}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex justify-start">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveBeneficiary(fund.id, beneficiaryIndex)}
                            disabled={isUpdating}
                            className="h-7 w-7 p-0 text-white"
                            style={{ 
                              backgroundColor: '#016991',
                              borderColor: '#016991'
                            }}
                            onMouseEnter={(e) => { 
                              e.currentTarget.style.backgroundColor = '#014d6b'; 
                            }}
                            onMouseLeave={(e) => { 
                              e.currentTarget.style.backgroundColor = '#016991'; 
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </>
                  )}
                  {/* Empty cells for other sections */}
                  {columnVisibility.monthlyDeathBenefit && (
                    <>
                      <td className="p-2 border-l border-neutral-300"></td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                    </>
                  )}
                  {columnVisibility.fundValue && (
                    <>
                      <td className="p-2 border-l border-neutral-300"></td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                    </>
                  )}
                  {columnVisibility.fundValueBeneficiaries && (
                    <>
                      <td className="p-2 border-l border-neutral-300"></td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                    </>
                  )}
                  {/* Empty Fund Actions Cell */}
                  <td className="p-2 border-l border-neutral-300"></td>
                </tr>
              );
            });
            return rows;
          })}
          
          {/* Totals row */}
          <tr className="bg-gray-100 font-bold border-t-2 border-neutral-300">
            {columnVisibility.overview && (
              <>
                <td className="table-cell whitespace-nowrap table-text-14 font-bold" style={{ color: '#094161' }}>
                  Total
                </td>
                <td className="p-2 text-right"></td>
              </>
            )}
            
            {columnVisibility.unapprovedLifeCover && (
              <>
                <td className="p-2 text-right border-l border-neutral-300">
                  <span className="font-bold text-right table-text-14" style={{ color: '#094161', fontWeight: '700' }}>
                    R {funds.reduce((sum, fund) => {
                      const amount = parseInt(fund.coverAmount?.replace(/[^0-9]/g, '') || '0');
                      return sum + amount;
                    }, 0).toLocaleString()}
                  </span>
                </td>
                <td className="p-2 text-right"></td>
                <td className="p-2 text-right"></td>
                <td className="p-2 text-right"></td>
                <td className="p-2 text-right"></td>
              </>
            )}
            
            {columnVisibility.monthlyDeathBenefit && (
              <>
                <td className="p-2 text-right border-l border-neutral-300">
                  <span className="font-bold text-right table-text-14" style={{ color: '#094161', fontWeight: '700' }}>
                    R {funds.reduce((sum, fund) => {
                      const amount = parseInt(fund.monthlyIncome?.replace(/[^0-9]/g, '') || '0');
                      return sum + amount;
                    }, 0).toLocaleString()}
                  </span>
                </td>
                <td className="p-2 text-right"></td>
                <td className="p-2 text-right"></td>
                <td className="p-2 text-right"></td>
              </>
            )}
            
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
                <td className="p-2 text-right">
                  <span className="font-bold text-right table-text-14" style={{ color: '#094161', fontWeight: '700' }}>
                    R {funds.reduce((sum, fund) => {
                      const amount = parseInt(fund.fundValue?.replace(/[^0-9]/g, '') || '0');
                      return sum + amount;
                    }, 0).toLocaleString()}
                  </span>
                </td>
                <td className="p-2 text-right">
                  <span className="font-bold text-right table-text-14" style={{ color: '#094161', fontWeight: '700' }}>
                    R {funds.reduce((sum, fund) => {
                      const amount = parseInt(fund.fundValueAtDeath?.replace(/[^0-9]/g, '') || '0');
                      return sum + amount;
                    }, 0).toLocaleString()}
                  </span>
                </td>
              </>
            )}
            
            {columnVisibility.fundValueBeneficiaries && (
              <>
                <td className="p-2 text-right border-l border-neutral-300"></td>
                <td className="p-2 text-right"></td>
                <td className="p-2 text-right"></td>
                <td className="p-2 text-right"></td>
                <td className="p-2 text-right"></td>
                <td className="p-2 text-right"></td>
                <td className="p-2 text-right"></td>
                <td className="p-2 text-right"></td>
              </>
            )}
            {/* Empty Fund Actions Cell for Totals Row */}
            <td className="p-2 border-l border-neutral-300"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
