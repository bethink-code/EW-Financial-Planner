import React, { useRef, useEffect, useMemo, useCallback } from "react";
import { RetirementFund, UpdateRetirementFund, Beneficiary } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit3, Plus, Trash2, UserPlus, UserMinus } from "lucide-react";
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
  
  // Owner management functions
  const handleAddOwner = useCallback((fundId: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const owners = JSON.parse(fund.owners || '["John Doe"]');
    const percentages = JSON.parse(fund.ownershipPercentages || '["100"]');
    
    owners.push('John Doe');
    percentages.push('0');
    
    onFieldUpdate(fundId, 'owners', JSON.stringify(owners));
    onFieldUpdate(fundId, 'ownershipPercentages', JSON.stringify(percentages));
  }, [funds, onFieldUpdate]);

  const handleRemoveOwner = useCallback((fundId: number, ownerIndex: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const owners = JSON.parse(fund.owners || '["John Doe"]');
    const percentages = JSON.parse(fund.ownershipPercentages || '["100"]');
    
    if (owners.length <= 1) return; // Don't allow removing the last owner
    
    owners.splice(ownerIndex, 1);
    percentages.splice(ownerIndex, 1);
    
    onFieldUpdate(fundId, 'owners', JSON.stringify(owners));
    onFieldUpdate(fundId, 'ownershipPercentages', JSON.stringify(percentages));
  }, [funds, onFieldUpdate]);

  const handleOwnerChange = useCallback((fundId: number, ownerIndex: number, newOwner: string) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const owners = JSON.parse(fund.owners || '["John Doe"]');
    owners[ownerIndex] = newOwner;
    
    onFieldUpdate(fundId, 'owners', JSON.stringify(owners));
  }, [funds, onFieldUpdate]);

  const handlePercentageChange = useCallback((fundId: number, ownerIndex: number, newPercentage: string) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const percentages = JSON.parse(fund.ownershipPercentages || '["100"]');
    percentages[ownerIndex] = newPercentage;
    
    onFieldUpdate(fundId, 'ownershipPercentages', JSON.stringify(percentages));
  }, [funds, onFieldUpdate]);

  const owners = useMemo(() => ["John Doe", "Jane Smith", "Donald Edwards", "Betty Edwards"], []);
  return (
    <div>
      
      <table className="min-w-full bg-white table-auto">
        <thead>
          {/* First level headers */}
          <tr className="border-b border-neutral-200" style={{ backgroundColor: '#D6ECF5' }}>
            {columnVisibility.overview && (
              <th className="p-2 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs" colSpan={3}>
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
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider percentage-column">
                  %
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
            const fundOwners = JSON.parse(fund.owners || '["John Doe"]');
            const ownershipPercentages = JSON.parse(fund.ownershipPercentages || '["100"]');
            const rows: JSX.Element[] = [];
            
            // Create rows for each owner
            fundOwners.forEach((owner: string, ownerIndex: number) => {
              const isFirstOwner = ownerIndex === 0;
              const isLastOwner = ownerIndex === fundOwners.length - 1;
              
              rows.push(
                <tr key={`${fund.id}-owner-${ownerIndex}`} className="hover:bg-neutral-50">
                  {/* Overview Section */}
                  {columnVisibility.overview && (
                    <>
                      {isFirstOwner && (
                        <td className="table-cell whitespace-nowrap table-text-14 text-neutral-900" rowSpan={fundOwners.length}>
                          <input
                            defaultValue={fund.description || ""}
                            onBlur={(e) => onFieldUpdate(fund.id, "description", e.target.value)}
                            className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                            style={{ textAlign: "left", fontWeight: "500", minWidth: "140px" }}
                            placeholder="Fund description"
                            disabled={isUpdating}
                          />
                        </td>
                      )}
                      <td className="p-2 text-right">
                        <div className="flex items-center gap-2">
                          <Select
                            value={owner}
                            onValueChange={(value) => handleOwnerChange(fund.id, ownerIndex, value)}
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="table-input h-7 min-w-[120px] w-full max-w-[160px] text-right border-0 focus:bg-white focus:border focus:border-primary hover:bg-neutral-50 transition-colors duration-200 group">
                              <SelectValue className="text-right pr-6" />
                              <Edit3 size={12} className="ml-1 text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            </SelectTrigger>
                            <SelectContent>
                              {owners.map((ownerOption) => (
                                <SelectItem key={ownerOption} value={ownerOption}>
                                  {ownerOption}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {fundOwners.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveOwner(fund.id, ownerIndex)}
                              disabled={isUpdating}
                              className="h-6 w-6 p-0 bg-white text-[#4F4F4F] hover:text-red-600 hover:bg-red-50 border border-gray-300"
                              title="Remove owner"
                            >
                              <UserMinus className="h-3 w-3" />
                            </Button>
                          )}
                          {isLastOwner && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddOwner(fund.id)}
                              disabled={isUpdating}
                              className="h-6 w-6 p-0 bg-blue-50 text-primary hover:bg-blue-100 border-0"
                              title="Add owner"
                            >
                              <UserPlus className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="p-2 text-right">
                        <input
                          type="text"
                          defaultValue={`${ownershipPercentages[ownerIndex] || '0'}%`}
                          onBlur={(e) => {
                            const formattedValue = formatCurrencyValue(e.target.value, "percentage");
                            if (formattedValue !== e.target.value) {
                              e.target.value = formattedValue;
                            }
                            handlePercentageChange(fund.id, ownerIndex, e.target.value);
                          }}
                          className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary w-full px-3 py-1 border rounded-md text-sm"
                          style={{ textAlign: "right", minWidth: "60px" }}
                          disabled={isUpdating}
                        />
                      </td>
                    </>
                  )}
                
                {/* Remaining sections - only show for first owner row */}
                {isFirstOwner && columnVisibility.unapprovedLifeCover && (
                  <>
                    <td className="p-2 text-right border-l border-neutral-300" rowSpan={fundOwners.length}>Cover Amount</td>
                    <td className="p-2" rowSpan={fundOwners.length}>Beneficiary</td>
                    <td className="p-2" rowSpan={fundOwners.length}>%</td>
                    <td className="p-2" rowSpan={fundOwners.length}>Cover Split</td>
                    <td className="p-2" rowSpan={fundOwners.length}>Actions</td>
                  </>
                )}
                
                {/* Fund Actions Cell */}
                <td className="p-2 border-l border-neutral-300">
                  <FundActions fund={fund} />
                </td>
                
                </tr>
              );
            });
            
            return rows;
          })}
        </tbody>
      </table>
    </div>
  );
}
