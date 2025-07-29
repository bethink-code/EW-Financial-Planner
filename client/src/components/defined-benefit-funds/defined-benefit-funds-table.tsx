import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { DefinedBenefitFund, InsertDefinedBenefitFund } from '@shared/schema';
import { AddButton, ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { getFieldClass, getCellClass } from '@/lib/field-types';
import { formatCurrencyValue, formatPercentageValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';

interface DefinedBenefitFundsTableProps {
 viewMode: 'table' | 'hybrid';
 searchTerm?: string;
}

function DefinedBenefitFundsTable({ viewMode, searchTerm }: DefinedBenefitFundsTableProps) {
 const [isUpdating, setIsUpdating] = useState(false);

 // Query for defined benefit funds
 const { data: funds = [], isLoading, error } = useQuery<DefinedBenefitFund[]>({
 queryKey: ['/api/defined-benefit-funds'],
 });

 // Add fund mutation
 const addMutation = useMutation({
 mutationFn: async (): Promise<DefinedBenefitFund> => {
 const newFund: InsertDefinedBenefitFund = {
 description:"",
 owners: ["Donald Edwards"],
 ownershipPercentages: ["100%"],
 yearsOfService:"0 years",
 finalMonthlySalary:"R 0",
 deathLumpSum:"R 0",
 additionalTaxFreeAmount:"R 0",
 pensionIncomeAmount:"R 0",
 pensionIncomeIncrease:"0%",
 };
 
 const response = await fetch('/api/defined-benefit-funds', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify(newFund),
 });
 
 if (!response.ok) {
 throw new Error('Failed to add defined benefit fund');
 }
 
 return response.json();
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['/api/defined-benefit-funds'] });
 setIsUpdating(false);
 },
 onError: (error) => {
 console.error('Failed to add defined benefit fund:', error);
 setIsUpdating(false);
 }
 });

 // Update fund mutation
 const updateMutation = useMutation({
 mutationFn: async ({ id, updates }: { id: number; updates: Partial<DefinedBenefitFund> }) => {
 const response = await fetch(`/api/defined-benefit-funds/${id}`, {
 method: 'PATCH',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify(updates),
 });
 
 if (!response.ok) {
 throw new Error('Failed to update defined benefit fund');
 }
 
 return response.json();
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['/api/defined-benefit-funds'] });
 setIsUpdating(false);
 },
 onError: (error) => {
 console.error('Failed to update defined benefit fund:', error);
 setIsUpdating(false);
 }
 });

 // Delete fund mutation
 const deleteMutation = useMutation({
 mutationFn: async (id: number) => {
 const response = await fetch(`/api/defined-benefit-funds/${id}`, {
 method: 'DELETE',
 });
 
 if (!response.ok) {
 throw new Error('Failed to delete defined benefit fund');
 }
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['/api/defined-benefit-funds'] });
 }
 });

 // Calculate totals
 const totals = useMemo(() => {
 return {
 count: funds.length,
 finalMonthlySalary: funds.reduce((sum: number, fund: DefinedBenefitFund) => {
 const value = parseFloat((fund.finalMonthlySalary || '0').replace(/[^\d.-]/g, '')) || 0;
 return sum + value;
 }, 0),
 deathLumpSum: funds.reduce((sum: number, fund: DefinedBenefitFund) => {
 const value = parseFloat((fund.deathLumpSum || '0').replace(/[^\d.-]/g, '')) || 0;
 return sum + value;
 }, 0),
 additionalTaxFreeAmount: funds.reduce((sum: number, fund: DefinedBenefitFund) => {
 const value = parseFloat((fund.additionalTaxFreeAmount || '0').replace(/[^\d.-]/g, '')) || 0;
 return sum + value;
 }, 0),
 pensionIncomeAmount: funds.reduce((sum: number, fund: DefinedBenefitFund) => {
 const value = parseFloat((fund.pensionIncomeAmount || '0').replace(/[^\d.-]/g, '')) || 0;
 return sum + value;
 }, 0),
 };
 }, [funds]);

 const handleUpdateFund = useCallback((id: number, field: keyof DefinedBenefitFund, value: string | string[]) => {
 setIsUpdating(true);
 const updates = { [field]: value };
 updateMutation.mutate({ id, updates });
 }, [updateMutation]);

 const handleInputBlur = useCallback((id: number, field: keyof DefinedBenefitFund, value: string) => {
 let formattedValue: string;
 if (field === 'pensionIncomeIncrease') {
 formattedValue = formatPercentageValue(value);
 } else if (field === 'deathLumpSum' || field === 'finalMonthlySalary' || field === 'additionalTaxFreeAmount' || field === 'pensionIncomeAmount') {
 formattedValue = formatCurrencyValue(value);
 } else {
 formattedValue = value;
 }
 handleUpdateFund(id, field, formattedValue);
 
 // Update DOM element for immediate visual feedback
 const target = document.activeElement as HTMLInputElement;
 if (target && formattedValue !== value) {
 setTimeout(() => {
 target.value = formattedValue;
 }, 0);
 }
 }, [handleUpdateFund]);

 const handleDeleteFund = useCallback((id: number) => {
 if (window.confirm('Are you sure you want to delete this defined benefit fund?')) {
 deleteMutation.mutate(id);
 }
 }, [deleteMutation]);

 if (isLoading) {
 return <div className="flex justify-center py-8">Loading defined benefit funds...</div>;
 }

 if (error) {
 return <div className="text-red-600 py-8">Error loading defined benefit funds. Please try again.</div>;
 }

 return (
 <div className="space-y-6">
 <table>
 <thead>
 {/* First Header Row - Section Groups */}
 <tr>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" rowSpan={2}>
 <AddButton onClick={() => addMutation.mutate()} disabled={isUpdating} />
 </th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={3}>Overview</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={4}>Fund Details</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={2}>Pension Income at Death</th>
 </tr>
 {/* Second Header Row - Individual Fields */}
 <tr>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Description</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Owner Name</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Ownership %</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Years of Service</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Final Monthly Salary</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Death Lump Sum</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Additional Tax Free Amount</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Amount</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Increase</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-neutral-200">
 {funds.map((fund: DefinedBenefitFund) => (
 <tr key={fund.id} className="hover:bg-neutral-50">
 <td className="table-actions-cell p-2 text-center section-start">
 <ActionButtonGroup>
 <DuplicateButton
 onClick={() => addMutation.mutate()}
 disabled={isUpdating}
 />
 <DeleteButton
 onClick={() => handleDeleteFund(fund.id)}
 disabled={isUpdating}
 />
 </ActionButtonGroup>
 </td>
 
 <td className="p-2 section-start">
 <input
 type="text"
 defaultValue={fund.description}
 className={`table-input ${getFieldClass('text')} ${getValueClass(fund.description, 'text')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => handleInputBlur(fund.id, 'description', e.target.value)}
 disabled={isUpdating}
 />
 </td>
 
 <td className="p-2">
 <input
 type="text"
 defaultValue={fund.owners?.[0] ||"Donald Edwards"}
 className={`table-input ${getFieldClass('text')} ${getValueClass(fund.owners?.[0] ||"Donald Edwards", 'text')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => handleInputBlur(fund.id, 'owners', e.target.value)}
 disabled={isUpdating}
 />
 </td>
 
 <td className="p-2">
 <input
 type="text"
 defaultValue={fund.ownershipPercentages?.[0] ||"100%"}
 className={`table-input ${getFieldClass('percentage')} ${getValueClass(fund.ownershipPercentages?.[0] ||"100%", 'percentage')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => handleInputBlur(fund.id, 'ownershipPercentages', e.target.value)}
 disabled={isUpdating}
 />
 </td>
 
 <td className="p-2 section-start">
 <input
 type="text"
 defaultValue={fund.yearsOfService ||"0 years"}
 className={`table-input ${getFieldClass('years')} ${getValueClass(fund.yearsOfService ||"0 years", 'years')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => handleInputBlur(fund.id, 'yearsOfService', e.target.value)}
 disabled={isUpdating}
 />
 </td>
 
 <td className="p-2">
 <input
 key={`finalMonthlySalary-${fund.id}-${fund.finalMonthlySalary}`}
 type="text"
 defaultValue={fund.finalMonthlySalary}
 className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.finalMonthlySalary, 'currency')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => handleInputBlur(fund.id, 'finalMonthlySalary', e.target.value)}
 disabled={isUpdating}
 />
 </td>
 
 <td className="p-2">
 <input
 key={`deathLumpSum-${fund.id}-${fund.deathLumpSum}`}
 type="text"
 defaultValue={fund.deathLumpSum}
 className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.deathLumpSum, 'currency')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => handleInputBlur(fund.id, 'deathLumpSum', e.target.value)}
 disabled={isUpdating}
 />
 </td>
 
 <td className="p-2">
 <input
 key={`additionalTaxFreeAmount-${fund.id}-${fund.additionalTaxFreeAmount}`}
 type="text"
 defaultValue={fund.additionalTaxFreeAmount}
 className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.additionalTaxFreeAmount, 'currency')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => handleInputBlur(fund.id, 'additionalTaxFreeAmount', e.target.value)}
 disabled={isUpdating}
 />
 </td>
 
 <td className="p-2 section-start">
 <input
 key={`pensionIncomeAmount-${fund.id}-${fund.pensionIncomeAmount}`}
 type="text"
 defaultValue={fund.pensionIncomeAmount}
 className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.pensionIncomeAmount, 'currency')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => handleInputBlur(fund.id, 'pensionIncomeAmount', e.target.value)}
 disabled={isUpdating}
 />
 </td>
 
 <td className="p-2">
 <input
 key={`pensionIncomeIncrease-${fund.id}-${fund.pensionIncomeIncrease}`}
 type="text"
 defaultValue={fund.pensionIncomeIncrease}
 className={`table-input ${getFieldClass('percentage')} ${getValueClass(fund.pensionIncomeIncrease, 'percentage')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => handleInputBlur(fund.id, 'pensionIncomeIncrease', e.target.value)}
 disabled={isUpdating}
 />
 </td>
 </tr>
 ))}
 </tbody>
 
 {/* Totals Footer */}
 <tfoot>
 <tr className="bg-neutral-50 border-t border-neutral-300">
 <td className="totals-cell-label text-right section-start" colSpan={5}>Totals</td>
 <td className="totals-cell-value section-start text-right">R {totals.finalMonthlySalary.toLocaleString()}</td>
 <td className="totals-cell-value text-right">R {totals.deathLumpSum.toLocaleString()}</td>
 <td className="totals-cell-value text-right">R {totals.additionalTaxFreeAmount.toLocaleString()}</td>
 <td className="totals-cell-value section-start text-right">R {totals.pensionIncomeAmount.toLocaleString()}</td>
 <td className="totals-cell-label"></td>
 </tr>
 </tfoot>
 </table>
 </div>
 );
}

export default DefinedBenefitFundsTable;