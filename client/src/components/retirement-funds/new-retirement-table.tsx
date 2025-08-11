import React, { useCallback, useMemo, useState } from 'react';
import { RetirementFund } from '@shared/schema';
import { Plus, UserPlus, UserMinus, Trash2, Copy } from 'lucide-react';
import { formatCurrencyValue, formatPercentageValue, formatTextValue, cleanTextValue, formatYearsValue, getValueClass, isDefaultValue, handleDefaultValueFocus } from"@/lib/formatting";
import { createOwnerManager, createComplexBeneficiaryManager } from"@/lib/array-management";
import { getFieldClass, getCellClass } from"@/lib/field-types";
import { ActionButtonGroup, DuplicateButton, DeleteButton, AddButton } from"@/components/ui/action-buttons";
import { TableHeaderAddButton } from "@/components/ui/table-header-add-button";
import { SafeFragment } from "@/lib/safe-fragment";
import EntityOwnerSelector from "@/components/common/entity-owner-selector";
import EntityBeneficiarySelector from "@/components/common/entity-beneficiary-selector";


import { useDebouncedUpdate } from"@/hooks/use-debounced-update";

interface NewRetirementTableProps {
 funds: RetirementFund[];
 onFieldUpdate: (fundId: number, field: string, value: any) => void;
 onRemoveFund: (id: number) => void;
 onDuplicateFund: (fund: RetirementFund) => void;
 onAddFund?: () => void;
 isUpdating?: boolean;
}

// Format currency value with R prefix and proper formatting - matches Assurance pattern
const formatCurrency = (value: string, fieldType: string): string => {
  if (!value?.trim()) return"R 0";
  
  // Remove existing formatting
  const cleanValue = value.replace(/[^\d.-]/g, '');
  if (!cleanValue) return"R 0";
  if (isNaN(parseFloat(cleanValue))) return"R 0";
  
  const numValue = parseFloat(cleanValue);
  
  if (fieldType.includes('percentage') || fieldType.includes('Percentage') || fieldType.includes('Split')) {
    return `${numValue}%`;
  }
  
  // Currency fields
  if (fieldType.includes('amount') || fieldType.includes('Amount') || fieldType.includes('benefit') || fieldType.includes('Benefit') || fieldType.includes('premium') || fieldType.includes('Premium') || fieldType.includes('income') || fieldType.includes('Income') || fieldType.includes('value') || fieldType.includes('Value') || fieldType.includes('cover') || fieldType.includes('Cover')) {
    return `R ${numValue.toLocaleString()}`;
  }
  
  return"R 0";
};

export function NewRetirementTable({ 
 funds, 
 onFieldUpdate, 
 onRemoveFund, 
 onDuplicateFund, 
 onAddFund,
 isUpdating 
}: NewRetirementTableProps) {
 
 // Dynamic Toggle Pattern Helper Functions
 const hasIncome = (fund: RetirementFund) => {
 const income = fund.monthlyIncome || "";
 const cleanValue = income.replace(/[^\d]/g, '');
 return cleanValue && cleanValue !== "0";
 };
 
 const getControlsEnabled = (fund: RetirementFund) => {
 return hasIncome(fund) && !isUpdating;
 };
 
 // Toggle shows "Years" when checked (true), "%" when unchecked (false)
 const isYearsMode = (fund: RetirementFund) => {
 return fund.monthlyIncomeCheckbox === true;
 };

 // Track which field is being edited to prevent jumping (from Assurance pattern)
 const [editingField, setEditingField] = useState<string | null>(null);

 // Debounced update for text fields (from Assurance pattern)
 const debouncedUpdate = useDebouncedUpdate(onFieldUpdate, 300);

 // Smart update handler - immediate for arrays, debounced for text (from Assurance pattern)
 const handleUpdateFund = useCallback((fundId: number, field: string, value: any) => {
   // Use immediate updates for array fields to prevent synchronization issues
   const arrayFields = ['owners', 'ownershipPercentages', 'unapprovedBeneficiaries', 'fundValueBeneficiaries', 'unapprovedPercentageSplits', 'fundValuePercentageSplits', 'unapprovedCoverSplits', 'fundValueCoverSplits'];
   
   if (arrayFields.includes(field)) {
     onFieldUpdate(fundId, field, value);
   } else {
     debouncedUpdate(fundId, field, value);
   }
 }, [onFieldUpdate, debouncedUpdate]);

 // OnBlur handler with formatting and jump prevention (from Assurance pattern)
 const handleInputBlur = useCallback((fundId: number, field: string, value: string, element: HTMLInputElement, fieldType: string) => {
   let formattedValue;
   
   // Special handling for years fields
   if (fieldType.includes('years') || fieldType.includes('Years') || field === 'termYears') {
     if (!value || value === "0" || value.trim() === "") {
       formattedValue = "0 years";
     } else {
       const cleanValue = value.toString().replace(/\s*years?\s*/gi, '').trim();
       if (cleanValue === "" || cleanValue === "0") {
         formattedValue = "0 years";
       } else {
         const numValue = parseFloat(cleanValue);
         if (isNaN(numValue)) {
           formattedValue = "0 years";
         } else {
           formattedValue = `${numValue} years`;
         }
       }
     }
   } else {
     formattedValue = formatCurrency(value, fieldType);
   }
   
   // Update the DOM directly to avoid re-render jump
   if (formattedValue !== value) {
     element.value = formattedValue;
   }
   
   // Only update if the actual value changed (not just formatting)
   const fund = funds.find((f: RetirementFund) => f.id === fundId);
   if (fund && fund[field as keyof RetirementFund] !== formattedValue) {
     handleUpdateFund(fundId, field, formattedValue);
   }
 }, [funds, handleUpdateFund]);

 // Helper function to calculate cover splits
 const calculateCoverSplit = useCallback((coverAmount: string, percentage: string) => {
 const amount = parseFloat(coverAmount.replace(/[^\d.]/g, '')) || 0;
 const percent = parseFloat(percentage.replace('%', '')) || 0;
 const result = (amount * percent) / 100;
 return `R ${result.toLocaleString()}`;
 }, []);

 // Helper function to calculate fund value at death (example: fund value * 1.1)
 const calculateFundValueAtDeath = useCallback((fundValue: string) => {
 const amount = parseFloat(fundValue.replace(/[^\d.]/g, '')) || 0;
 const result = amount * 1.1; // Example calculation
 return `R ${result.toLocaleString()}`;
 }, []);

 // Helper function to calculate living annuity (example: fund value * 0.05)
 const calculateLivingAnnuity = useCallback((fundValue: string) => {
 const amount = parseFloat(fundValue.replace(/[^\d.]/g, '')) || 0;
 const result = amount * 0.05; // Example calculation
 return `R ${result.toLocaleString()}`;
 }, []);

 // Owner management with percentage support (from Assurance pattern)
 const handleAddOwner = useCallback((fundId: number) => {
   const fund = funds.find((f: RetirementFund) => f.id === fundId);
   if (fund) {
     const newOwners = [...fund.owners,""];
     const newOwnershipPercentages = [...(fund.ownershipPercentages || []), "0%"];
     handleUpdateFund(fundId, 'owners', newOwners);
     handleUpdateFund(fundId, 'ownershipPercentages', newOwnershipPercentages);
   }
 }, [funds, handleUpdateFund]);

 const handleRemoveOwner = useCallback((fundId: number, ownerIndex: number) => {
   const fund = funds.find((f: RetirementFund) => f.id === fundId);
   if (fund && (fund.owners || []).length > 1 && ownerIndex > 0) { // Protect first owner
     const newOwners = [...(fund.owners || [])];
     const newOwnershipPercentages = [...(fund.ownershipPercentages || [])];
     newOwners.splice(ownerIndex, 1);
     newOwnershipPercentages.splice(ownerIndex, 1);
     handleUpdateFund(fundId, 'owners', newOwners);
     handleUpdateFund(fundId, 'ownershipPercentages', newOwnershipPercentages);
   }
 }, [funds, handleUpdateFund]);

 const handleOwnerChange = useCallback((fundId: number, ownerIndex: number, newOwner: string) => {
   const fund = funds.find((f: RetirementFund) => f.id === fundId);
   if (fund) {
     const updatedOwners = [...fund.owners];
     updatedOwners[ownerIndex] = newOwner;
     handleUpdateFund(fundId, 'owners', updatedOwners);
   }
 }, [funds, handleUpdateFund]);

 const handleOwnershipPercentageChange = useCallback((fundId: number, ownerIndex: number, newPercentage: string) => {
   const fund = funds.find((f: RetirementFund) => f.id === fundId);
   if (fund) {
     const updatedPercentages = [...(fund.ownershipPercentages || [])];
     updatedPercentages[ownerIndex] = newPercentage;
     handleUpdateFund(fundId, 'ownershipPercentages', updatedPercentages);
   }
 }, [funds, handleUpdateFund]);

 // Unapproved beneficiary management (from Assurance pattern)
 const handleAddUnapprovedBeneficiary = useCallback((fundId: number) => {
   const fund = funds.find((f: RetirementFund) => f.id === fundId);
   if (fund) {
     const newBeneficiaries = [...(fund.unapprovedBeneficiaries || []),""];
     const newPercentages = [...(fund.unapprovedPercentageSplits || []),"0%"];
     const newCoverSplits = [...(fund.unapprovedCoverSplits || []),"R 0"];
     
     handleUpdateFund(fundId, 'unapprovedBeneficiaries', newBeneficiaries);
     handleUpdateFund(fundId, 'unapprovedPercentageSplits', newPercentages);
     handleUpdateFund(fundId, 'unapprovedCoverSplits', newCoverSplits);
   }
 }, [funds, handleUpdateFund]);

 const handleRemoveUnapprovedBeneficiary = useCallback((fundId: number, beneficiaryIndex: number) => {
   const fund = funds.find((f: RetirementFund) => f.id === fundId);
   if (fund && (fund.unapprovedBeneficiaries || []).length > 1 && beneficiaryIndex > 0) { // Protect first beneficiary
     const newBeneficiaries = [...(fund.unapprovedBeneficiaries || [])];
     const newPercentages = [...(fund.unapprovedPercentageSplits || [])];
     const newCoverSplits = [...(fund.unapprovedCoverSplits || [])];
     
     newBeneficiaries.splice(beneficiaryIndex, 1);
     newPercentages.splice(beneficiaryIndex, 1);
     newCoverSplits.splice(beneficiaryIndex, 1);
     
     handleUpdateFund(fundId, 'unapprovedBeneficiaries', newBeneficiaries);
     handleUpdateFund(fundId, 'unapprovedPercentageSplits', newPercentages);
     handleUpdateFund(fundId, 'unapprovedCoverSplits', newCoverSplits);
   }
 }, [funds, handleUpdateFund]);

 // Fund value beneficiary management (from Assurance pattern)
 const handleAddFundValueBeneficiary = useCallback((fundId: number) => {
   const fund = funds.find((f: RetirementFund) => f.id === fundId);
   if (fund) {
     const newBeneficiaries = [...(fund.fundValueBeneficiaries || []),""];
     const newPercentages = [...(fund.fundValuePercentageSplits || []),"0%"];
     const newCoverSplits = [...(fund.fundValueCoverSplits || []),"R 0"];
     
     handleUpdateFund(fundId, 'fundValueBeneficiaries', newBeneficiaries);
     handleUpdateFund(fundId, 'fundValuePercentageSplits', newPercentages);
     handleUpdateFund(fundId, 'fundValueCoverSplits', newCoverSplits);
   }
 }, [funds, handleUpdateFund]);

 const handleRemoveFundValueBeneficiary = useCallback((fundId: number, beneficiaryIndex: number) => {
   const fund = funds.find((f: RetirementFund) => f.id === fundId);
   if (fund && (fund.fundValueBeneficiaries || []).length > 1 && beneficiaryIndex > 0) { // Protect first beneficiary
     const newBeneficiaries = [...(fund.fundValueBeneficiaries || [])];
     const newPercentages = [...(fund.fundValuePercentageSplits || [])];
     const newCoverSplits = [...(fund.fundValueCoverSplits || [])];
     
     newBeneficiaries.splice(beneficiaryIndex, 1);
     newPercentages.splice(beneficiaryIndex, 1);
     newCoverSplits.splice(beneficiaryIndex, 1);
     
     handleUpdateFund(fundId, 'fundValueBeneficiaries', newBeneficiaries);
     handleUpdateFund(fundId, 'fundValuePercentageSplits', newPercentages);
     handleUpdateFund(fundId, 'fundValueCoverSplits', newCoverSplits);
   }
 }, [funds, handleUpdateFund]);



 // Beneficiary change handlers (following Assurance pattern)
 const handleUnapprovedBeneficiaryChange = useCallback((fundId: number, beneficiaryIndex: number, value: string) => {
   const fund = funds.find((f: RetirementFund) => f.id === fundId);
   if (fund) {
     const newBeneficiaries = [...(fund.unapprovedBeneficiaries || [])];
     newBeneficiaries[beneficiaryIndex] = value;
     handleUpdateFund(fundId, 'unapprovedBeneficiaries', newBeneficiaries);
   }
 }, [funds, handleUpdateFund]);

 const handleUnapprovedPercentageChange = useCallback((fundId: number, beneficiaryIndex: number, value: string) => {
   const fund = funds.find((f: RetirementFund) => f.id === fundId);
   if (fund) {
     const newPercentages = [...(fund.unapprovedPercentageSplits || [])];
     newPercentages[beneficiaryIndex] = value;
     handleUpdateFund(fundId, 'unapprovedPercentageSplits', newPercentages);
   }
 }, [funds, handleUpdateFund]);

 const handleFundValueBeneficiaryChange = useCallback((fundId: number, beneficiaryIndex: number, value: string) => {
   const fund = funds.find((f: RetirementFund) => f.id === fundId);
   if (fund) {
     const newBeneficiaries = [...(fund.fundValueBeneficiaries || [])];
     newBeneficiaries[beneficiaryIndex] = value;
     handleUpdateFund(fundId, 'fundValueBeneficiaries', newBeneficiaries);
   }
 }, [funds, handleUpdateFund]);

 const handleFundValuePercentageChange = useCallback((fundId: number, beneficiaryIndex: number, value: string) => {
   const fund = funds.find((f: RetirementFund) => f.id === fundId);
   if (fund) {
     const newPercentages = [...(fund.fundValuePercentageSplits || [])];
     newPercentages[beneficiaryIndex] = value;
     handleUpdateFund(fundId, 'fundValuePercentageSplits', newPercentages);
   }
 }, [funds, handleUpdateFund]);

 // Calculate totals for summary display
 const totals = useMemo(() => {
 if (!funds || funds.length === 0) return {
 coverAmount: 0,
 monthlyIncome: 0,
 approvedLifeCover: 0,
 fundValue: 0,
 fundValueAtDeath: 0
 };

 return funds.reduce((acc, fund) => {
 const parseCurrency = (value: string) => parseFloat(value.replace(/[^\d.]/g, '')) || 0;
 
 return {
 coverAmount: acc.coverAmount + parseCurrency(fund.coverAmount),
 monthlyIncome: acc.monthlyIncome + parseCurrency(fund.monthlyIncome),
 approvedLifeCover: acc.approvedLifeCover + parseCurrency(fund.approvedLifeCover),
 fundValue: acc.fundValue + parseCurrency(fund.fundValue),
 fundValueAtDeath: acc.fundValueAtDeath + parseCurrency(fund.fundValueAtDeath)
 };
 }, {
 coverAmount: 0,
 monthlyIncome: 0,
 approvedLifeCover: 0,
 fundValue: 0,
 fundValueAtDeath: 0
 });
 }, [funds]);

 const formatTotal = useCallback((amount: number) => `R ${amount.toLocaleString()}`, []);

 if (!funds || funds.length === 0) {
 return (
 <div className="p-8 text-center text-gray-500">
 <p>No retirement funds found. Click"Add Fund" to create your first fund.</p>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 <table>
 <thead>
 {/* Main section headers */}
 <tr className="double-row-header-first">
 <th className="section-start table-actions-cell" rowSpan={2}>
   {onAddFund && (
     <TableHeaderAddButton
       onClick={onAddFund}
       title="Add new fund"
     />
   )}
 </th>
 <th className="section-start" colSpan={2}>Overview</th>
 <th className="section-start" colSpan={3}>Unapproved Life Cover</th>
 <th className="section-start" colSpan={3}>Monthly Death Benefit</th>
 <th className="section-start" colSpan={3}>Approved Life Cover</th>
 <th className="section-start" colSpan={6}>Fund Value Beneficiaries</th>
 </tr>
 
 {/* Individual column headers */}
 <tr className="double-row-header-second">
 <th className="section-start">Description</th>
 <th>Actions</th>
 <th>Owner Name</th>
 <th>Ownership %</th>
 <th className="section-start">Cover Amount</th>
 <th>Actions</th>
 <th>Beneficiary Name</th>
 <th>Benefit Split</th>
 <th>Cover Split</th>
 <th className="section-start">Monthly Income</th>
 <th>Toggle</th>
 <th>Term/Rate</th>
 <th className="section-start">Cover</th>
 <th>Fund Value</th>
 <th>Fund Value at Death</th>
 <th className="section-start">Beneficiary Name</th>
 <th>Amount</th>
 <th>Lump Sum Taken</th>
 <th>Non-deductible Contribution</th>
 <th>Living Annuity</th>
 <th>Income Term</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-neutral-200">
 {funds.map((fund, fundIndex) => {
 const maxRows = Math.max(
 fund.owners?.length || 1,
 fund.unapprovedBeneficiaries?.length || 1,
 fund.fundValueBeneficiaries?.length || 1
 );

 return (
 <SafeFragment key={`fund-${fund.id}-${maxRows}`}>
 {Array.from({ length: maxRows }, (_, rowIndex) => (
 <tr key={`${fund.id}-${rowIndex}`} className={`hover:bg-neutral-50 ${
   rowIndex === 0 && fundIndex > 0 ? 'policy-first-row' : ''
 } ${
   rowIndex === maxRows - 1 ? 'policy-last-row' : ''
 }`}>
 {/* Actions */}
 {rowIndex === 0 && (
 <td className="table-actions-cell p-1 text-center section-start align-top" rowSpan={maxRows}>
 <ActionButtonGroup>
 <DuplicateButton 
 onClick={() => onDuplicateFund(fund)} 
 disabled={isUpdating}
 />
 <DeleteButton 
 onClick={() => onRemoveFund(fund.id)} 
 disabled={isUpdating}
 />
 </ActionButtonGroup>
 </td>
 )}

 {/* Overview - Description */}
 {rowIndex === 0 && (
 <td className="p-1 section-start align-top" rowSpan={maxRows}>
 <input
 key={`desc-${fund.id}`}
 type="text"
 defaultValue={formatTextValue(fund.description ||"")}
 className={`table-input ${getFieldClass('text')} ${getValueClass(fund.description ||"", 'text')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => {
 const value = cleanTextValue(e.target.value);
 handleUpdateFund(fund.id, 'description', value);
 }}
 />
 </td>
 )}

 {/* Overview - Owner - EntityOwnerSelector renders its own td elements */}
 {rowIndex < (fund.owners?.length || 0) && (
 <EntityOwnerSelector
 policyId={fund.id}
 owners={fund.owners || []}
 ownershipPercentages={fund.ownershipPercentages || []}
 onOwnerChange={handleOwnerChange}
 onOwnershipPercentageChange={handleOwnershipPercentageChange}
 onAddOwner={handleAddOwner}
 onRemoveOwner={handleRemoveOwner}
 rowIndex={rowIndex}
 disabled={isUpdating}
 />
 )}

 {/* Unapproved Life Cover - Cover Amount */}
 {rowIndex === 0 && (
 <td className="p-1 section-start align-top" rowSpan={maxRows}>
 <input
 key={`cover-amount-${fund.id}`}
 type="text"
 defaultValue={formatCurrencyValue(fund.coverAmount)}
 className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.coverAmount, 'currency')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => {
 const value = e.target.value;
 handleUpdateFund(fund.id, 'coverAmount', value);
 }}
 />
 </td>
 )}

 {/* Unapproved Life Cover - Beneficiary - EntityBeneficiarySelector renders its own td elements */}
 {rowIndex < (fund.unapprovedBeneficiaries?.length || 0) && (
 <EntityBeneficiarySelector
 policyId={fund.id}
 beneficiaries={fund.unapprovedBeneficiaries || []}
 beneficiaryPercentages={fund.unapprovedPercentageSplits || []}
 onBeneficiaryChange={handleUnapprovedBeneficiaryChange}
 onBeneficiaryPercentageChange={handleUnapprovedPercentageChange}
 onAddBeneficiary={handleAddUnapprovedBeneficiary}
 onRemoveBeneficiary={handleRemoveUnapprovedBeneficiary}
 rowIndex={rowIndex}
 disabled={isUpdating}
 />
 )}



 {/* Unapproved Life Cover - Cover Split (Calculated) */}
 <td className="p-1 bg-neutral-100 text-right align-top">
 {rowIndex < (fund.unapprovedCoverSplits?.length || 0) && (
 <span className="calculated-field">
 {fund.unapprovedCoverSplits?.[rowIndex]}
 </span>
 )}
 </td>

 {/* Monthly Death Benefit - Monthly Income */}
 {rowIndex === 0 && (
 <td className="p-1 section-start align-top" rowSpan={maxRows}>
 <input
 key={`monthly-income-${fund.id}`}
 type="text"
 defaultValue={formatCurrencyValue(fund.monthlyIncome)}
 className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.monthlyIncome, 'currency')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => {
 const value = e.target.value;
 handleUpdateFund(fund.id, 'monthlyIncome', value);
 }}
 />
 </td>
 )}

 {/* Monthly Death Benefit - Toggle Button */}
 {rowIndex === 0 && (
 <td className="table-actions-cell align-top" rowSpan={maxRows}>
 <div className="pt-0.5">
 <button
 type="button"
 onClick={() => handleUpdateFund(fund.id, 'monthlyIncomeCheckbox', !fund.monthlyIncomeCheckbox)}
 className={`h-8 px-3 min-w-[48px] bg-[#E8F3F8] border border-[#E0E0E0] text-[#016991] hover:bg-[#D1E7F0] rounded-md flex items-center justify-center transition-colors text-sm font-medium ${
 !getControlsEnabled(fund) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
 }`}
 disabled={!getControlsEnabled(fund) || isUpdating}
 >
 {isYearsMode(fund) ? 'Years' : '%'}
 </button>
 </div>
 </td>
 )}

 {/* Monthly Death Benefit - Dynamic Field (Years OR Percentage) */}
 {rowIndex === 0 && (
 <td className="p-1 align-top" rowSpan={maxRows}>
 {isYearsMode(fund) ? (
 // Years Mode
 <input
 key={`term-years-${fund.id}`}
 type="text"
 defaultValue={formatYearsValue(fund.termYears)}
 className={`table-input ${getFieldClass('years')} ${getValueClass(fund.termYears, 'years')} ${
 !getControlsEnabled(fund) ? 'bg-neutral-100 cursor-not-allowed' : ''
 }`}
 onFocus={getControlsEnabled(fund) ? handleDefaultValueFocus : undefined}
 onBlur={getControlsEnabled(fund) ? (e) => {
 const value = e.target.value;
 handleUpdateFund(fund.id, 'termYears', value);
 } : undefined}
 disabled={!getControlsEnabled(fund) || isUpdating}
 placeholder="0 years"
 />
 ) : (
 // Percentage Mode
 <input
 key={`increase-percent-${fund.id}`}
 type="text"
 defaultValue={formatPercentageValue(fund.increasePercentage)}
 className={`table-input ${getFieldClass('percentage')} ${getValueClass(fund.increasePercentage, 'percentage')} ${
 !getControlsEnabled(fund) ? 'bg-neutral-100 cursor-not-allowed' : ''
 }`}
 onFocus={getControlsEnabled(fund) ? handleDefaultValueFocus : undefined}
 onBlur={getControlsEnabled(fund) ? (e) => {
 const value = e.target.value;
 handleUpdateFund(fund.id, 'increasePercentage', value);
 } : undefined}
 disabled={!getControlsEnabled(fund) || isUpdating}
 placeholder="0%"
 />
 )}
 </td>
 )}

 {/* Approved Life Cover - Cover */}
 {rowIndex === 0 && (
 <td className="p-1 section-start align-top" rowSpan={maxRows}>
 <input
 key={`approved-life-${fund.id}`}
 type="text"
 defaultValue={formatCurrencyValue(fund.approvedLifeCover)}
 className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.approvedLifeCover, 'currency')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => {
 const value = e.target.value;
 handleUpdateFund(fund.id, 'approvedLifeCover', value);
 }}
 />
 </td>
 )}

 {/* Approved Life Cover - Fund Value */}
 {rowIndex === 0 && (
 <td className="p-1 align-top" rowSpan={maxRows}>
 <input
 key={`fund-value-${fund.id}`}
 type="text"
 defaultValue={formatCurrencyValue(fund.fundValue)}
 className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.fundValue, 'currency')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => {
 const value = e.target.value;
 handleUpdateFund(fund.id, 'fundValue', value);
 // Update calculated fund value at death
 const calculatedValue = calculateFundValueAtDeath(value);
 handleUpdateFund(fund.id, 'fundValueAtDeath', calculatedValue);
 }}
 />
 </td>
 )}

 {/* Approved Life Cover - Fund Value at Death (Calculated) */}
 {rowIndex === 0 && (
 <td className="p-1 bg-neutral-100 text-right align-top" rowSpan={maxRows}>
 <span className="calculated-field">
 {fund.fundValueAtDeath}
 </span>
 </td>
 )}

 {/* Fund Value Beneficiaries - Beneficiary */}
 <td className="p-1 section-start align-top">
 {rowIndex < (fund.fundValueBeneficiaries?.length || 0) && (
 <EntityBeneficiarySelector
 policyId={fund.id}
 beneficiaries={fund.fundValueBeneficiaries || []}
 beneficiaryPercentages={fund.fundValuePercentageSplits || []}
 onBeneficiaryChange={handleFundValueBeneficiaryChange}
 onBeneficiaryPercentageChange={handleFundValuePercentageChange}
 onAddBeneficiary={handleAddFundValueBeneficiary}
 onRemoveBeneficiary={handleRemoveFundValueBeneficiary}
 rowIndex={rowIndex}
 disabled={isUpdating}
 />
 )}
 </td>



 {/* Fund Value Beneficiaries - Cover (Calculated) */}
 <td className="p-1 bg-neutral-100 text-right align-top">
 {rowIndex < (fund.fundValueCoverSplits?.length || 0) && (
 <span className="calculated-field">
 {fund.fundValueCoverSplits?.[rowIndex]}
 </span>
 )}
 </td>

 {/* Fund Value Beneficiaries - Lump Assessed */}
 {rowIndex === 0 && (
 <td className="p-1 align-top" rowSpan={maxRows}>
 <input
 key={`lump-sum-${fund.id}`}
 type="text"
 defaultValue={formatCurrencyValue(fund.lumpSumTaken)}
 className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.lumpSumTaken, 'currency')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => {
 const value = e.target.value;
 handleUpdateFund(fund.id, 'lumpSumTaken', value);
 }}
 />
 </td>
 )}

 {/* Fund Value Beneficiaries - Non Deductible */}
 {rowIndex === 0 && (
 <td className="p-1 align-top" rowSpan={maxRows}>
 <input
 key={`non-deduct-${fund.id}`}
 type="text"
 defaultValue={formatCurrencyValue(fund.nonDeductibleContribution)}
 className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.nonDeductibleContribution, 'currency')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => {
 const value = e.target.value;
 handleUpdateFund(fund.id, 'nonDeductibleContribution', value);
 }}
 />
 </td>
 )}

 {/* Fund Value Beneficiaries - Living Annuity (Calculated) */}
 {rowIndex === 0 && (
 <td className="p-1 bg-neutral-100 text-right align-top" rowSpan={maxRows}>
 <span className="calculated-field">
 {fund.livingAnnuity}
 </span>
 </td>
 )}

 {/* Fund Value Beneficiaries - Checkbox */}
 {rowIndex === 0 && (
 <td className="p-1 text-center align-top" rowSpan={maxRows}>
 <input
 type="checkbox"
 checked={fund.livingAnnuityCheckbox}
 onChange={(e) => handleUpdateFund(fund.id, 'livingAnnuityCheckbox', e.target.checked)}
 className="text-xs"
 />
 </td>
 )}

 {/* Fund Value Beneficiaries - Income Term */}
 {rowIndex === 0 && (
 <td className="p-1 align-top" rowSpan={maxRows}>
 <input
 key={`income-term-${fund.id}`}
 type="text"
 defaultValue={formatYearsValue(fund.incomeTerm)}
 className={`table-input ${getFieldClass('years')} ${getValueClass(fund.incomeTerm, 'years')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => {
 const value = e.target.value;
 handleUpdateFund(fund.id, 'incomeTerm', value);
 }}
 />
 </td>
 )}
 </tr>
 ))}
 </SafeFragment>
 );
 })}
 
 </tbody>
 
 {/* Totals Footer */}
 <tfoot>
 <tr>
 <td className="totals-cell-label section-start"></td>
 <td className="totals-cell-label text-right section-start" colSpan={2}>Totals</td>
 <td className="totals-cell-value section-start">{formatTotal(totals.coverAmount)}</td>
 <td className="totals-cell-label"></td>
 <td className="totals-cell-label"></td>
 <td className="totals-cell-label"></td>
 <td className="totals-cell-value section-start">{formatTotal(totals.monthlyIncome)}</td>
 <td className="totals-cell-label"></td>
 <td className="totals-cell-label"></td>
 <td className="totals-cell-label"></td>
 <td className="totals-cell-value section-start">{formatTotal(totals.approvedLifeCover)}</td>
 <td className="totals-cell-value">{formatTotal(totals.fundValue)}</td>
 <td className="totals-cell-value">{formatTotal(totals.fundValueAtDeath)}</td>
 <td className="totals-cell-label section-start"></td>
 <td className="totals-cell-label"></td>
 <td className="totals-cell-label"></td>
 <td className="totals-cell-label"></td>
 <td className="totals-cell-label"></td>
 <td className="totals-cell-label"></td>
 <td className="totals-cell-label"></td>
 </tr>
 </tfoot>
 </table>
 </div>
 );
}