import React, { useCallback, useMemo, useState } from 'react';
import { RetirementFund } from '@shared/schema';
import { Plus, UserPlus, UserMinus, Trash2, Copy } from 'lucide-react';
import { formatCurrencyValue, formatPercentageValue, formatTextValue, cleanTextValue, formatYearsValue, getValueClass, isDefaultValue, handleDefaultValueFocus } from"@/lib/formatting";
import { createOwnerManager, createComplexBeneficiaryManager } from"@/lib/array-management";
import { getFieldClass, getCellClass } from"@/lib/field-types";
import { ActionButtonGroup, DuplicateButton, DeleteButton, AddButton } from"@/components/ui/action-buttons";
import { TableHeaderAddButton } from "@/components/ui/table-header-add-button";

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

 // Track which field is being edited to prevent jumping (from Assurance pattern)
 const [editingField, setEditingField] = useState<string | null>(null);

 // Debounced update for text fields (from Assurance pattern)
 const debouncedUpdate = useDebouncedUpdate(onFieldUpdate, 300);

 // Smart update handler - immediate for arrays, debounced for text (from Assurance pattern)
 const handleUpdateFund = useCallback((fundId: number, field: string, value: any) => {
   // Use immediate updates for array fields to prevent synchronization issues
   const arrayFields = ['owners', 'unapprovedBeneficiaries', 'fundValueBeneficiaries', 'unapprovedPercentageSplits', 'fundValuePercentageSplits', 'unapprovedCoverSplits', 'fundValueCoverSplits'];
   
   if (arrayFields.includes(field)) {
     onFieldUpdate(fundId, field, value);
   } else {
     debouncedUpdate(fundId, field, value);
   }
 }, [onFieldUpdate, debouncedUpdate]);

 // OnBlur handler with formatting and jump prevention (from Assurance pattern)
 const handleInputBlur = useCallback((fundId: number, field: string, value: string, element: HTMLInputElement, fieldType: string) => {
   const formattedValue = formatCurrency(value, fieldType);
   
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

 // Owner management (from Assurance pattern)
 const handleAddOwner = useCallback((fundId: number) => {
   const fund = funds.find((f: RetirementFund) => f.id === fundId);
   if (fund) {
     const newOwners = [...fund.owners,""];
     handleUpdateFund(fundId, 'owners', newOwners);
   }
 }, [funds, handleUpdateFund]);

 const handleRemoveOwner = useCallback((fundId: number, ownerIndex: number) => {
   const fund = funds.find((f: RetirementFund) => f.id === fundId);
   if (fund && (fund.owners || []).length > 1 && ownerIndex > 0) { // Protect first owner
     const newOwners = [...(fund.owners || [])];
     newOwners.splice(ownerIndex, 1);
     handleUpdateFund(fundId, 'owners', newOwners);
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
 <th className="section-start" colSpan={4}>Unapproved Life Cover</th>
 <th className="section-start" colSpan={4}>Monthly Death Benefit</th>
 <th className="section-start" colSpan={3}>Approved Life Cover</th>
 <th className="section-start" colSpan={7}>Fund Value Beneficiaries</th>
 </tr>
 
 {/* Individual column headers */}
 <tr className="double-row-header-second">
 <th className="section-start">Description</th>
 <th>Owners</th>
 <th className="section-start">Cover Amount</th>
 <th>Beneficiaries</th>
 <th>Percentage Split</th>
 <th>Cover Split</th>
 <th className="section-start">Monthly Income</th>
 <th>Checkbox</th>
 <th>Term Years</th>
 <th>Increase %</th>
 <th className="section-start">Cover</th>
 <th>Fund Value</th>
 <th>Fund Value at Death</th>
 <th className="section-start">Beneficiary Name</th>
 <th>Percentage</th>
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
 <React.Fragment key={`fund-${fund.id}-${maxRows}`}>
 {Array.from({ length: maxRows }, (_, rowIndex) => (
 <tr key={`${fund.id}-${rowIndex}`} className="hover:bg-neutral-50">
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

 {/* Overview - Owner */}
 <td className="p-1">
 {rowIndex < (fund.owners?.length || 0) && (
 <div className="flex items-center gap-1">
 <input
 key={`owner-${fund.id}-${rowIndex}`}
 type="text"
 defaultValue={formatTextValue(fund.owners?.[rowIndex], 'owner')}
 className={`table-input ${getFieldClass('text')} flex-1 ${getValueClass(fund.owners?.[rowIndex], 'text')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => handleOwnerChange(fund.id, rowIndex, e.target.value)}
 />
 {rowIndex === 0 ? (
 <AddButton
 onClick={() => handleAddOwner(fund.id)}
 disabled={isUpdating}
 size="sm"
 />
 ) : (
 <DeleteButton
 onClick={() => handleRemoveOwner(fund.id, rowIndex)}
 disabled={isUpdating}
 size="sm"
 />
 )}
 </div>
 )}
 </td>

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

 {/* Unapproved Life Cover - Beneficiary */}
 <td className="p-1">
 {rowIndex < (fund.unapprovedBeneficiaries?.length || 0) && (
 <div className="flex items-center gap-1">
 <input
 key={`unapproved-benef-${fund.id}-${rowIndex}`}
 type="text"
 defaultValue={formatTextValue(fund.unapprovedBeneficiaries?.[rowIndex] ||"")}
 className={`table-input ${getFieldClass('text')} flex-1 ${getValueClass(fund.unapprovedBeneficiaries?.[rowIndex] ||"", 'text')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => {
 handleUnapprovedBeneficiaryChange(fund.id, rowIndex, e.target.value);
 }}
 />
 {rowIndex === 0 ? (
 <AddButton
 onClick={() => handleAddUnapprovedBeneficiary(fund.id)}
 disabled={isUpdating}
 size="sm"
 />
 ) : (
 <DeleteButton
 onClick={() => handleRemoveUnapprovedBeneficiary(fund.id, rowIndex)}
 disabled={isUpdating}
 size="sm"
 />
 )}
 </div>
 )}
 </td>

 {/* Unapproved Life Cover - Percentage Split */}
 <td className="p-1">
 {rowIndex < (fund.unapprovedPercentageSplits?.length || 0) && (
 <input
 key={`unapproved-percent-${fund.id}-${rowIndex}`}
 type="text"
 defaultValue={formatPercentageValue(fund.unapprovedPercentageSplits?.[rowIndex])}
 className={`table-input ${getFieldClass('percentage')} ${getValueClass(fund.unapprovedPercentageSplits?.[rowIndex], 'percentage')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => {
 handleUnapprovedPercentageChange(fund.id, rowIndex, e.target.value);
 // Update calculated cover split
 const updatedCoverSplits = [...(fund.unapprovedCoverSplits || [])];
 updatedCoverSplits[rowIndex] = calculateCoverSplit(fund.coverAmount, e.target.value);
 onFieldUpdate(fund.id, 'unapprovedCoverSplits', updatedCoverSplits);
 }}
 />
 )}
 </td>

 {/* Unapproved Life Cover - Cover Split (Calculated) */}
 <td className="p-1 bg-neutral-100 text-right">
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

 {/* Monthly Death Benefit - Checkbox */}
 {rowIndex === 0 && (
 <td className="p-1 text-center align-top" rowSpan={maxRows}>
 <input
 type="checkbox"
 checked={fund.monthlyIncomeCheckbox}
 onChange={(e) => handleUpdateFund(fund.id, 'monthlyIncomeCheckbox', e.target.checked)}
 className="text-xs"
 />
 </td>
 )}

 {/* Monthly Death Benefit - Term Years */}
 {rowIndex === 0 && (
 <td className="p-1 align-top" rowSpan={maxRows}>
 <input
 key={`term-years-${fund.id}`}
 type="text"
 defaultValue={formatYearsValue(fund.termYears)}
 className={`table-input ${getFieldClass('years')} ${getValueClass(fund.termYears, 'years')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => {
 const value = e.target.value;
 handleUpdateFund(fund.id, 'termYears', value);
 }}
 />
 </td>
 )}

 {/* Monthly Death Benefit - Increase % */}
 {rowIndex === 0 && (
 <td className="p-1 align-top" rowSpan={maxRows}>
 <input
 key={`increase-percent-${fund.id}`}
 type="text"
 defaultValue={formatPercentageValue(fund.increasePercentage)}
 className={`table-input ${getFieldClass('percentage')} ${getValueClass(fund.increasePercentage, 'percentage')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => {
 const value = e.target.value;
 handleUpdateFund(fund.id, 'increasePercentage', value);
 }}
 />
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
 <td className="p-1 section-start">
 {rowIndex < (fund.fundValueBeneficiaries?.length || 0) && (
 <div className="flex items-center gap-1">
 <input
 key={`fundvalue-benef-${fund.id}-${rowIndex}`}
 type="text"
 defaultValue={formatTextValue(fund.fundValueBeneficiaries?.[rowIndex] ||"")}
 className={`table-input ${getFieldClass('text')} flex-1 ${getValueClass(fund.fundValueBeneficiaries?.[rowIndex] ||"", 'text')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => {
 handleFundValueBeneficiaryChange(fund.id, rowIndex, e.target.value);
 }}
 />
 {rowIndex === 0 ? (
 <AddButton
 onClick={() => handleAddFundValueBeneficiary(fund.id)}
 disabled={isUpdating}
 size="sm"
 />
 ) : (
 <DeleteButton
 onClick={() => handleRemoveFundValueBeneficiary(fund.id, rowIndex)}
 disabled={isUpdating}
 size="sm"
 />
 )}
 </div>
 )}
 </td>

 {/* Fund Value Beneficiaries - Cover % Split */}
 <td className="p-1">
 {rowIndex < (fund.fundValuePercentageSplits?.length || 0) && (
 <input
 key={`fundvalue-percent-${fund.id}-${rowIndex}`}
 type="text"
 defaultValue={formatPercentageValue(fund.fundValuePercentageSplits?.[rowIndex])}
 className={`table-input ${getFieldClass('percentage')} ${getValueClass(fund.fundValuePercentageSplits?.[rowIndex], 'percentage')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => {
 handleFundValuePercentageChange(fund.id, rowIndex, e.target.value);
 // Update calculated cover split
 const updatedCoverSplits = [...(fund.fundValueCoverSplits || [])];
 updatedCoverSplits[rowIndex] = calculateCoverSplit(fund.fundValue, e.target.value);
 onFieldUpdate(fund.id, 'fundValueCoverSplits', updatedCoverSplits);
 }}
 />
 )}
 </td>

 {/* Fund Value Beneficiaries - Cover (Calculated) */}
 <td className="p-1 bg-neutral-100 text-right">
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
 </React.Fragment>
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