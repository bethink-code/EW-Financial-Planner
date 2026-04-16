import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Assurance, InsertAssurance } from '@shared/schema';
import { AddButton, ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { getFieldClass, getCellClass } from '@/lib/field-types';
import { formatCurrencyValue, formatPercentageValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';

interface AssuranceTableProps {
 viewMode: 'table' | 'hybrid';
 searchTerm?: string;
}

function AssuranceTable({ viewMode, searchTerm }: AssuranceTableProps) {
 const [isUpdating, setIsUpdating] = useState(false);

 const { data: assurances = [], isLoading, error } = useQuery<Assurance[]>({
 queryKey: ['/api/assurance'],
 });

 const addMutation = useMutation({
 mutationFn: async (): Promise<Assurance> => {
 const newAssurance: InsertAssurance = {
 description:"",
 owners:["Donald Edwards"],
 beneficiaries:[""],
 deathBenefit:"R 0",
 amount:"R 0",
 premiumsByOthers:"R 0",
 collateralSession:"R 0",
 benefitSplit:"0%",
 additionalInfo:"",
 };
 
 const response = await fetch('/api/assurance', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify(newAssurance),
 });
 
 if (!response.ok) {
 throw new Error('Failed to add assurance');
 }
 
 return response.json();
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['/api/assurance'] });
 setIsUpdating(false);
 },
 onError: (error) => {
 console.error('Failed to add assurance:', error);
 setIsUpdating(false);
 }
 });

 const updateMutation = useMutation({
 mutationFn: async ({ id, updates }: { id: number; updates: Partial<Assurance> }) => {
 const response = await fetch(`/api/assurance/${id}`, {
 method: 'PATCH',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify(updates),
 });
 
 if (!response.ok) {
 throw new Error('Failed to update assurance');
 }
 
 return response.json();
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['/api/assurance'] });
 setIsUpdating(false);
 },
 onError: (error) => {
 console.error('Failed to update assurance:', error);
 setIsUpdating(false);
 }
 });

 const deleteMutation = useMutation({
 mutationFn: async (id: number) => {
 const response = await fetch(`/api/assurance/${id}`, {
 method: 'DELETE',
 });
 
 if (!response.ok) {
 throw new Error('Failed to delete assurance');
 }
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['/api/assurance'] });
 }
 });

 const totals = useMemo(() => {
 return {
 count: assurances.length,
 amount: assurances.reduce((sum: number, assurance: Assurance) => {
 const value = parseFloat(assurance.amount.replace(/[^\d.-]/g, '')) || 0;
 return sum + value;
 }, 0),
 };
 }, [assurances]);

 const handleUpdateAssurance = useCallback((id: number, field: keyof Assurance, value: string | string[]) => {
 setIsUpdating(true);
 const updates = { [field]: value };
 updateMutation.mutate({ id, updates });
 }, [updateMutation]);

 const handleInputBlur = useCallback((id: number, field: keyof Assurance, value: string) => {
 let formattedValue: string;
 if (field === 'benefitSplit') {
 formattedValue = formatPercentageValue(value);
 } else if (field === 'amount') {
 formattedValue = formatCurrencyValue(value);
 } else {
 formattedValue = value;
 }
 handleUpdateAssurance(id, field, formattedValue);

 const target = document.activeElement as HTMLInputElement;
 if (target && formattedValue !== value) {
 setTimeout(() => {
 target.value = formattedValue;
 }, 0);
 }
 }, [handleUpdateAssurance]);

 const handleDeleteAssurance = useCallback((id: number) => {
 if (window.confirm('Are you sure you want to delete this assurance?')) {
 deleteMutation.mutate(id);
 }
 }, [deleteMutation]);

 if (isLoading) {
 return <div className="flex justify-center">Loading assurance...</div>;
 }

 if (error) {
 return <div className="text-red-600">Error loading assurance. Please try again.</div>;
 }

 return (
 <div className="space-y-6">
 <table>
 <thead>
 <tr>
 <th className="px-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" rowSpan={2}>
 <AddButton onClick={() => addMutation.mutate()} disabled={isUpdating} />
 </th>
 <th className="px-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={2}>Overview</th>
 <th className="px-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={2}>Financial Details</th>
 </tr>
 <tr>
 <th className="px-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Description</th>
 <th className="px-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Owner</th>
 <th className="px-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Amount</th>
 <th className="px-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Increase %</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-neutral-200">
 {assurances.map((assurance: Assurance, index) => (
 <tr key={assurance.id} className="hover:bg-neutral-50">
 <td className="table-actions-cell p-2 text-center section-start">
 <ActionButtonGroup>
 <DuplicateButton onClick={() => addMutation.mutate()} disabled={isUpdating} />
 <DeleteButton onClick={() => handleDeleteAssurance(assurance.id)} disabled={isUpdating} />
 </ActionButtonGroup>
 </td>
 
 <td className="p-2 section-start">
 <input
 type="text"
 defaultValue={assurance.description}
 className={`table-input ${getFieldClass('text')} ${getValueClass(assurance.description, 'text')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => handleInputBlur(assurance.id, 'description', e.target.value)}
 disabled={isUpdating}
 />
 </td>
 
 <td className="p-2">
 <input
 type="text"
 defaultValue={assurance.owners[0] ||"Donald Edwards"}
 className={`table-input ${getFieldClass('text')} ${getValueClass(assurance.owners[0] ||"", 'text')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => handleUpdateAssurance(assurance.id, 'owners', [e.target.value])}
 disabled={isUpdating}
 />
 </td>
 
 <td className="p-2 section-start">
 <input
 key={`amount-${assurance.id}-${assurance.amount}`}
 type="text"
 defaultValue={assurance.amount}
 className={`table-input ${getFieldClass('currency')} ${getValueClass(assurance.amount, 'currency')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => handleInputBlur(assurance.id, 'amount', e.target.value)}
 disabled={isUpdating}
 />
 </td>
 
 <td className="p-2">
 <input
 key={`benefitSplit-${assurance.id}-${assurance.benefitSplit}`}
 type="text"
 defaultValue={assurance.benefitSplit}
 className={`table-input ${getFieldClass('percentage')} ${getValueClass(assurance.benefitSplit, 'percentage')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => handleInputBlur(assurance.id, 'benefitSplit', e.target.value)}
 disabled={isUpdating}
 />
 </td>
 </tr>
 ))}
 </tbody>
 
 <tfoot>
 <tr>
 <td className="totals-cell-label text-right section-start" colSpan={3}>Totals</td>
 <td className="totals-cell-value section-start">R {totals.amount.toLocaleString()}</td>
 <td className="totals-cell-label"></td>
 </tr>
 </tfoot>
 </table>
 </div>
 );
}

export default AssuranceTable;