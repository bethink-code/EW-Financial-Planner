import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { IncomeProvisions, InsertIncomeProvisions } from '@shared/schema';
import { AddButton, ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { getFieldClass, getCellClass } from '@/lib/field-types';
import { formatCurrencyValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';

interface IncomeProvisionsTableProps {
 viewMode: 'table' | 'hybrid';
 searchTerm?: string;
}

function IncomeProvisionsTable({ viewMode, searchTerm }: IncomeProvisionsTableProps) {
 const [isUpdating, setIsUpdating] = useState(false);

 const { data: incomeProvisions = [], isLoading, error } = useQuery<IncomeProvisions[]>({
 queryKey: ['/api/income-provisions'],
 });

 const addMutation = useMutation({
 mutationFn: async (): Promise<IncomeProvisions> => {
 const newIncomeProvision: InsertIncomeProvisions = {
 description:"",
 beneficiary:"Enter beneficiary",
 monthlyAmount:"R 0",
 additionalBeneficiaries: [],
 };
 
 const response = await fetch('/api/income-provisions', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify(newIncomeProvision),
 });
 
 if (!response.ok) {
 throw new Error('Failed to add income provision');
 }
 
 return response.json();
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['/api/income-provisions'] });
 setIsUpdating(false);
 },
 onError: (error) => {
 console.error('Failed to add income provision:', error);
 setIsUpdating(false);
 }
 });

 const updateMutation = useMutation({
 mutationFn: async ({ id, updates }: { id: number; updates: Partial<IncomeProvisions> }) => {
 const response = await fetch(`/api/income-provisions/${id}`, {
 method: 'PATCH',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify(updates),
 });
 
 if (!response.ok) {
 throw new Error('Failed to update income provision');
 }
 
 return response.json();
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['/api/income-provisions'] });
 setIsUpdating(false);
 },
 onError: (error) => {
 console.error('Failed to update income provision:', error);
 setIsUpdating(false);
 }
 });

 const deleteMutation = useMutation({
 mutationFn: async (id: number) => {
 const response = await fetch(`/api/income-provisions/${id}`, {
 method: 'DELETE',
 });
 
 if (!response.ok) {
 throw new Error('Failed to delete income provision');
 }
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['/api/income-provisions'] });
 }
 });

 const totals = useMemo(() => {
 return {
 count: incomeProvisions.length,
 monthlyAmount: incomeProvisions.reduce((sum: number, incomeProvision: IncomeProvisions) => {
 const value = parseFloat(incomeProvision.monthlyAmount.replace(/[^\d.-]/g, '')) || 0;
 return sum + value;
 }, 0),
 };
 }, [incomeProvisions]);

 const handleUpdateIncomeProvision = useCallback((id: number, field: keyof IncomeProvisions, value: string | string[]) => {
 setIsUpdating(true);
 const updates = { [field]: value };
 updateMutation.mutate({ id, updates });
 }, [updateMutation]);

 const handleInputBlur = useCallback((id: number, field: keyof IncomeProvisions, value: string) => {
 let formattedValue: string;
 if (field === 'monthlyAmount') {
 formattedValue = formatCurrencyValue(value);
 } else {
 formattedValue = value;
 }
 handleUpdateIncomeProvision(id, field, formattedValue);
 
 const target = document.activeElement as HTMLInputElement;
 if (target && formattedValue !== value) {
 setTimeout(() => {
 target.value = formattedValue;
 }, 0);
 }
 }, [handleUpdateIncomeProvision]);

 const handleDeleteIncomeProvision = useCallback((id: number) => {
 if (window.confirm('Are you sure you want to delete this income provision?')) {
 deleteMutation.mutate(id);
 }
 }, [deleteMutation]);

 if (isLoading) {
 return <div className="flex justify-center">Loading income provisions...</div>;
 }

 if (error) {
 return <div className="text-red-600">Error loading income provisions. Please try again.</div>;
 }

 return (
 <div className="space-y-6">
 <div className="overflow-x-auto">
 <table>
 <thead>
 <tr className="double-row-header-first">
 <th className="section-start" rowSpan={2}>
 <AddButton onClick={() => addMutation.mutate()} disabled={isUpdating} />
 </th>
 <th className="section-start" colSpan={2}>Overview</th>
 <th className="section-start">Financial Details</th>
 </tr>
 <tr className="double-row-header-second">
 <th className="section-start">Description</th>
 <th>Beneficiary</th>
 <th>Monthly Amount</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-neutral-200">
 {incomeProvisions.map((incomeProvision: IncomeProvisions, index) => (
 <tr key={incomeProvision.id} className="hover:bg-neutral-50">
 <td className="table-actions-cell section-start">
 <ActionButtonGroup>
 <DuplicateButton onClick={() => addMutation.mutate()} disabled={isUpdating} />
 <DeleteButton onClick={() => handleDeleteIncomeProvision(incomeProvision.id)} disabled={isUpdating} />
 </ActionButtonGroup>
 </td>
 
 <td className="section-start">
 <input
 type="text"
 defaultValue={incomeProvision.description}
 className={`table-input ${getFieldClass('text')} ${getValueClass(incomeProvision.description, 'text')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => handleInputBlur(incomeProvision.id, 'description', e.target.value)}
 disabled={isUpdating}
 />
 </td>
 
 <td className="">
 <input
 type="text"
 defaultValue={incomeProvision.beneficiary}
 className={`table-input ${getFieldClass('text')} ${getValueClass(incomeProvision.beneficiary, 'text')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => handleInputBlur(incomeProvision.id, 'beneficiary', e.target.value)}
 disabled={isUpdating}
 />
 </td>
 
 <td className="section-start">
 <input
 key={`monthlyAmount-${incomeProvision.id}-${incomeProvision.monthlyAmount}`}
 type="text"
 defaultValue={incomeProvision.monthlyAmount}
 className={`table-input ${getFieldClass('currency')} ${getValueClass(incomeProvision.monthlyAmount, 'currency')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => handleInputBlur(incomeProvision.id, 'monthlyAmount', e.target.value)}
 disabled={isUpdating}
 />
 </td>
 </tr>
 ))}
 </tbody>
 
 <tfoot>
 <tr>
 <td className="totals-cell-label section-start" colSpan={2}>Totals</td>
 <td className="totals-cell-value section-start">R {totals.monthlyAmount.toLocaleString()}</td>
 </tr>
 </tfoot>
 </table>
 </div>
 </div>
 );
}

export default IncomeProvisionsTable;