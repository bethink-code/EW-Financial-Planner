import React, { useCallback, useMemo } from 'react';
import { RetirementFund } from '@shared/schema';
import { Plus, UserPlus, UserMinus, Trash2, Copy } from 'lucide-react';
import { formatCurrencyValue, formatPercentageValue, formatTextValue, cleanTextValue, formatYearsValue, getValueClass, isDefaultValue, handleDefaultValueFocus } from"@/lib/formatting";
import { createOwnerManager, createComplexBeneficiaryManager } from"@/lib/array-management";
import { getFieldClass, getCellClass } from"@/lib/field-types";
import { ActionButtonGroup, DuplicateButton, DeleteButton, AddButton } from"@/components/ui/action-buttons";

interface NewRetirementTableProps {
 funds: RetirementFund[];
 onFieldUpdate: (fundId: number, field: string, value: any) => void;
 onRemoveFund: (id: number) => void;
 onDuplicateFund: (fund: RetirementFund) => void;
 isUpdating?: boolean;
}

export function NewRetirementTable({ 
 funds, 
 onFieldUpdate, 
 onRemoveFund, 
 onDuplicateFund, 
 isUpdating 
}: NewRetirementTableProps) {

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

 const handleCellUpdate = useCallback((fundId: number, field: string, value: any) => {
 onFieldUpdate(fundId, field, value);
 }, [onFieldUpdate]);

 // Create unified array managers
 const ownerManager = createOwnerManager(funds, onFieldUpdate);
 const unapprovedBeneficiaryManager = createComplexBeneficiaryManager(
 funds, 
 onFieldUpdate, 
 'unapprovedBeneficiaries',
 'unapprovedPercentageSplits', 
 'unapprovedCoverSplits'
 );
 const fundValueBeneficiaryManager = createComplexBeneficiaryManager(
 funds, 
 onFieldUpdate, 
 'fundValueBeneficiaries',
 'fundValuePercentageSplits', 
 'fundValueCoverSplits'
 );

 // Legacy handlers using new managers
 const handleAddUnapprovedBeneficiary = useCallback((fundId: number) => {
 unapprovedBeneficiaryManager.addBeneficiary(fundId);
 }, [unapprovedBeneficiaryManager]);

 const handleRemoveUnapprovedBeneficiary = useCallback((fundId: number, beneficiaryIndex: number) => {
 unapprovedBeneficiaryManager.removeBeneficiary(fundId, beneficiaryIndex);
 }, [unapprovedBeneficiaryManager]);

 const handleAddFundValueBeneficiary = useCallback((fundId: number) => {
 fundValueBeneficiaryManager.addBeneficiary(fundId);
 }, [fundValueBeneficiaryManager]);

 const handleRemoveFundValueBeneficiary = useCallback((fundId: number, beneficiaryIndex: number) => {
 fundValueBeneficiaryManager.removeBeneficiary(fundId, beneficiaryIndex);
 }, [fundValueBeneficiaryManager]);

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
 <tr className="border-b border-border">
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center" rowSpan={2}>Actions</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={2}>Overview</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={4}>Unapproved Life Cover</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={4}>Monthly Death Benefit</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={3}>Approved Life Cover</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={7}>Fund Value Beneficiaries</th>
 </tr>
 
 {/* Individual column headers */}
 <tr className="border-b border-border">
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Description</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Owners</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Cover Amount</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Beneficiaries</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Percentage Split</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Cover Split</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Monthly Income</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Checkbox</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Term Years</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Increase %</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Cover</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Fund Value</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Fund Value at Death</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Beneficiary Name</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Percentage</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Amount</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Lump Sum Taken</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Non-deductible Contribution</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Living Annuity</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Income Term</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-neutral-200">
 {funds.map((fund, fundIndex) => {
 const maxRows = Math.max(
 fund.owners?.length || 1,
 fund.unapprovedBeneficiaries?.length || 1,
 fund.fundValueBeneficiaries?.length || 1
 );

 return Array.from({ length: maxRows }, (_, rowIndex) => (
 <tr key={`${fund.id}-${rowIndex}-${fund.owners?.length || 0}-${fund.unapprovedBeneficiaries?.length || 0}-${fund.fundValueBeneficiaries?.length || 0}`} className="hover:bg-neutral-50">
 {/* Actions */}
 <td className="table-actions-cell p-1 text-center section-start">
 {rowIndex === 0 && (
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
 )}
 </td>

 {/* Overview - Description */}
 <td className="p-1 section-start">
 {rowIndex === 0 && (
 <input
 type="text"
 defaultValue={formatTextValue(fund.description ||"")}
 className={`table-input ${getFieldClass('text')} ${getValueClass(fund.description, 'text')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => {
 const value = cleanTextValue(e.target.value);
 handleCellUpdate(fund.id, 'description', value);
 }}
 />
 )}
 </td>

 {/* Overview - Owner */}
 <td className="p-1">
 {rowIndex < (fund.owners?.length || 0) && (
 <div className="flex items-center gap-1">
 <input
 type="text"
 defaultValue={formatTextValue(fund.owners?.[rowIndex], 'owner')}
 className={`table-input ${getFieldClass('text')} flex-1 ${getValueClass(fund.owners?.[rowIndex], 'text')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => ownerManager.changeOwner(fund.id, rowIndex, e.target.value)}
 />
 {rowIndex === 0 ? (
 <AddButton
 onClick={() => ownerManager.addOwner(fund.id)}
 disabled={isUpdating}
 size="sm"
 />
 ) : (
 <DeleteButton
 onClick={() => ownerManager.removeOwner(fund.id, rowIndex)}
 disabled={isUpdating}
 size="sm"
 />
 )}
 </div>
 )}
 </td>

 {/* Unapproved Life Cover - Cover Amount */}
 <td className="p-1 section-start">
 {rowIndex === 0 && (
 <input
 type="text"
 defaultValue={formatCurrencyValue(fund.coverAmount)}
 className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.coverAmount, 'currency')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => {
 const value = e.target.value;
 handleCellUpdate(fund.id, 'coverAmount', value);
 }}
 />
 )}
 </td>

 {/* Unapproved Life Cover - Beneficiary */}
 <td className="p-1">
 {rowIndex < (fund.unapprovedBeneficiaries?.length || 0) && (
 <div className="flex items-center gap-1">
 <input
 type="text"
 defaultValue={formatTextValue(fund.unapprovedBeneficiaries?.[rowIndex])}
 className={`table-input ${getFieldClass('text')} flex-1 ${getValueClass(fund.unapprovedBeneficiaries?.[rowIndex], 'text')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => {
 unapprovedBeneficiaryManager.changeBeneficiary(fund.id, rowIndex, e.target.value);
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
 type="text"
 defaultValue={formatPercentageValue(fund.unapprovedPercentageSplits?.[rowIndex])}
 className={`table-input ${getFieldClass('percentage')} ${getValueClass(fund.unapprovedPercentageSplits?.[rowIndex], 'percentage')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => {
 const updatedSplits = [...(fund.unapprovedPercentageSplits || [])];
 updatedSplits[rowIndex] = e.target.value;
 onFieldUpdate(fund.id, 'unapprovedPercentageSplits', updatedSplits);
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
 <td className="p-1 section-start">
 {rowIndex === 0 && (
 <input
 type="text"
 defaultValue={formatCurrencyValue(fund.monthlyIncome)}
 className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.monthlyIncome, 'currency')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => {
 const value = e.target.value;
 handleCellUpdate(fund.id, 'monthlyIncome', value);
 }}
 />
 )}
 </td>

 {/* Monthly Death Benefit - Checkbox */}
 <td className="p-1 text-center">
 {rowIndex === 0 && (
 <input
 type="checkbox"
 checked={fund.monthlyIncomeCheckbox}
 onChange={(e) => handleCellUpdate(fund.id, 'monthlyIncomeCheckbox', e.target.checked)}
 className="text-xs"
 />
 )}
 </td>

 {/* Monthly Death Benefit - Term Years */}
 <td className="p-1">
 {rowIndex === 0 && (
 <input
 type="text"
 defaultValue={formatYearsValue(fund.termYears)}
 className={`table-input ${getFieldClass('years')} ${getValueClass(fund.termYears, 'years')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => {
 const value = e.target.value;
 handleCellUpdate(fund.id, 'termYears', value);
 }}
 />
 )}
 </td>

 {/* Monthly Death Benefit - Increase % */}
 <td className="p-1">
 {rowIndex === 0 && (
 <input
 type="text"
 defaultValue={formatPercentageValue(fund.increasePercentage)}
 className={`table-input ${getFieldClass('percentage')} ${getValueClass(fund.increasePercentage, 'percentage')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => {
 const value = e.target.value;
 handleCellUpdate(fund.id, 'increasePercentage', value);
 }}
 />
 )}
 </td>

 {/* Approved Life Cover - Cover */}
 <td className="p-1 section-start">
 {rowIndex === 0 && (
 <input
 type="text"
 defaultValue={formatCurrencyValue(fund.approvedLifeCover)}
 className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.approvedLifeCover, 'currency')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => {
 const value = e.target.value;
 handleCellUpdate(fund.id, 'approvedLifeCover', value);
 }}
 />
 )}
 </td>

 {/* Approved Life Cover - Fund Value */}
 <td className="p-1">
 {rowIndex === 0 && (
 <input
 type="text"
 defaultValue={formatCurrencyValue(fund.fundValue)}
 className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.fundValue, 'currency')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => {
 const value = e.target.value;
 handleCellUpdate(fund.id, 'fundValue', value);
 // Update calculated fund value at death
 const calculatedValue = calculateFundValueAtDeath(value);
 handleCellUpdate(fund.id, 'fundValueAtDeath', calculatedValue);
 }}
 />
 )}
 </td>

 {/* Approved Life Cover - Fund Value at Death (Calculated) */}
 <td className="p-1 bg-neutral-100 text-right">
 {rowIndex === 0 && (
 <span className="calculated-field">
 {fund.fundValueAtDeath}
 </span>
 )}
 </td>

 {/* Fund Value Beneficiaries - Beneficiary */}
 <td className="p-1 section-start">
 {rowIndex < (fund.fundValueBeneficiaries?.length || 0) && (
 <div className="flex items-center gap-1">
 <input
 type="text"
 defaultValue={formatTextValue(fund.fundValueBeneficiaries?.[rowIndex])}
 className={`table-input ${getFieldClass('text')} flex-1 ${getValueClass(fund.fundValueBeneficiaries?.[rowIndex], 'text')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => {
 fundValueBeneficiaryManager.changeBeneficiary(fund.id, rowIndex, e.target.value);
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
 type="text"
 defaultValue={formatPercentageValue(fund.fundValuePercentageSplits?.[rowIndex])}
 className={`table-input ${getFieldClass('percentage')} ${getValueClass(fund.fundValuePercentageSplits?.[rowIndex], 'percentage')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => {
 const updatedSplits = [...(fund.fundValuePercentageSplits || [])];
 updatedSplits[rowIndex] = e.target.value;
 onFieldUpdate(fund.id, 'fundValuePercentageSplits', updatedSplits);
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
 <td className="p-1">
 {rowIndex === 0 && (
 <input
 type="text"
 defaultValue={formatCurrencyValue(fund.lumpSumTaken)}
 className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.lumpSumTaken, 'currency')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => {
 const value = e.target.value;
 handleCellUpdate(fund.id, 'lumpSumTaken', value);
 }}
 />
 )}
 </td>

 {/* Fund Value Beneficiaries - Non Deductible */}
 <td className="p-1">
 {rowIndex === 0 && (
 <input
 type="text"
 defaultValue={formatCurrencyValue(fund.nonDeductibleContribution)}
 className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.nonDeductibleContribution, 'currency')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => {
 const value = e.target.value;
 handleCellUpdate(fund.id, 'nonDeductibleContribution', value);
 }}
 />
 )}
 </td>

 {/* Fund Value Beneficiaries - Living Annuity (Calculated) */}
 <td className="p-1 bg-neutral-100 text-right">
 {rowIndex === 0 && (
 <span className="calculated-field">
 {fund.livingAnnuity}
 </span>
 )}
 </td>

 {/* Fund Value Beneficiaries - Checkbox */}
 <td className="p-1 text-center">
 {rowIndex === 0 && (
 <input
 type="checkbox"
 checked={fund.livingAnnuityCheckbox}
 onChange={(e) => handleCellUpdate(fund.id, 'livingAnnuityCheckbox', e.target.checked)}
 className="text-xs"
 />
 )}
 </td>

 {/* Fund Value Beneficiaries - Income Term */}
 <td className="p-1">
 {rowIndex === 0 && (
 <input
 type="text"
 defaultValue={formatYearsValue(fund.incomeTerm)}
 className={`table-input ${getFieldClass('years')} ${getValueClass(fund.incomeTerm, 'years')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => {
 const value = e.target.value;
 handleCellUpdate(fund.id, 'incomeTerm', value);
 }}
 />
 )}
 </td>
 </tr>
 ));
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