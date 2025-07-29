import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { LumpSumBequest, InsertLumpSumBequest } from '@shared/schema';
import { AddButton, ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { getFieldClass, getCellClass } from '@/lib/field-types';
import { formatCurrencyValue, formatPercentageValue, formatTextValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';

interface LumpSumTableProps {
 viewMode: 'table' | 'hybrid';
 searchTerm?: string;
}

function LumpSumTable({ viewMode, searchTerm }: LumpSumTableProps) {
 const [isUpdating, setIsUpdating] = useState(false);

 // Query for lump sum bequests
 const { data: bequests = [], isLoading, error } = useQuery<LumpSumBequest[]>({
 queryKey: ['/api/lump-sum-bequests'],
 });

 // Add bequest mutation
 const addMutation = useMutation({
 mutationFn: async (): Promise<LumpSumBequest> => {
 const newBequest: InsertLumpSumBequest = {
 description:"", // Store empty string, UI will show placeholder
 entity:"", // Store empty string, UI will show placeholder
 start:"", // Store empty string, UI will show placeholder
 amount:"R 0",
 increasePercentage:"0%",
 cpi: false,
 valueAtDeath:"R 0",
 };
 
 const response = await fetch('/api/lump-sum-bequests', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify(newBequest),
 });
 
 if (!response.ok) {
 throw new Error('Failed to add lump sum bequest');
 }
 
 return response.json();
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['/api/lump-sum-bequests'] });
 setIsUpdating(false);
 },
 onError: (error) => {
 console.error('Failed to add lump sum bequest:', error);
 setIsUpdating(false);
 }
 });

 // Update bequest mutation
 const updateMutation = useMutation({
 mutationFn: async ({ id, updates }: { id: number; updates: Partial<LumpSumBequests> }) => {
 const response = await fetch(`/api/lump-sum-bequests/${id}`, {
 method: 'PATCH',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify(updates),
 });
 
 if (!response.ok) {
 throw new Error('Failed to update lump sum bequest');
 }
 
 return response.json();
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['/api/lump-sum-bequests'] });
 setIsUpdating(false);
 },
 onError: (error) => {
 console.error('Failed to update lump sum bequest:', error);
 setIsUpdating(false);
 }
 });

 // Delete bequest mutation
 const deleteMutation = useMutation({
 mutationFn: async (id: number) => {
 const response = await fetch(`/api/lump-sum-bequests/${id}`, {
 method: 'DELETE',
 });
 
 if (!response.ok) {
 throw new Error('Failed to delete lump sum bequest');
 }
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['/api/lump-sum-bequests'] });
 }
 });

 // Calculate totals
 const totals = useMemo(() => {
 return {
 count: bequests.length,
 amount: bequests.reduce((sum: number, bequest: LumpSumBequest) => {
 const value = parseFloat((bequest.amount || '').replace(/[^\d.-]/g, '')) || 0;
 return sum + value;
 }, 0),
 increasePercentage: bequests.reduce((sum: number, bequest: LumpSumBequest) => {
 const value = parseFloat((bequest.increasePercentage || '').replace(/[^\d.-]/g, '')) || 0;
 return sum + value;
 }, 0),
 cpiCount: bequests.filter(bequest => bequest.cpi).length,
 valueAtDeath: bequests.reduce((sum: number, bequest: LumpSumBequest) => {
 const value = parseFloat((bequest.valueAtDeath || '').replace(/[^\d.-]/g, '')) || 0;
 return sum + value;
 }, 0),
 };
 }, [bequests]);

 const handleUpdateBequest = useCallback((id: number, field: keyof LumpSumBequest, value: string | string[] | boolean) => {
 setIsUpdating(true);
 const updates = { [field]: value };
 updateMutation.mutate({ id, updates });
 }, [updateMutation]);

 const handleInputBlur = useCallback((id: number, field: keyof LumpSumBequest, value: string, target?: HTMLInputElement) => {
 let formattedValue: string;
 switch (field) {
 case 'amount':
 case 'valueAtDeath':
 formattedValue = formatCurrencyValue(value);
 break;
 case 'increasePercentage':
 formattedValue = formatPercentageValue(value);
 break;
 case 'description':
 case 'entity':
 case 'start':
 formattedValue = formatTextValue(value);
 break;
 default:
 formattedValue = value;
 break;
 }
 
 // Update DOM element for immediate visual feedback
 if (target && formattedValue !== value) {
 target.value = formattedValue;
 }
 
 handleUpdateBequest(id, field, formattedValue);
 }, [handleUpdateBequest]);

 const handleDeleteBequest = useCallback((id: number) => {
 if (window.confirm('Are you sure you want to delete this lump sum bequest?')) {
 deleteMutation.mutate(id);
 }
 }, [deleteMutation]);

 if (isLoading) {
 return <div className="flex justify-center py-8">Loading lump sum bequests...</div>;
 }

 if (error) {
 return <div className="text-red-600 py-8">Error loading lump sum bequests. Please try again.</div>;
 }

 return (
 <div className="space-y-6">
 <table>
 <thead>
 <tr>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" rowSpan={2}>
 <AddButton onClick={() => addMutation.mutate()} disabled={isUpdating} />
 </th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={2}>Overview</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={4}>Need Details</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={1}>Calculation</th>
 </tr>
 <tr>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Description</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Entity</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Start</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Amount</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Increase %</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">CPI</th>
 <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Value at Death</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-neutral-200">
 {bequests.map((bequest: LumpSumBequests, index) => (
 <tr key={bequest.id} className="hover:bg-neutral-50">
 <td className="table-actions-cell p-1 text-center section-start">
 <ActionButtonGroup>
 <DuplicateButton
 onClick={() => addMutation.mutate()}
 disabled={isUpdating}
 />
 <DeleteButton
 onClick={() => handleDeleteBequest(bequest.id)}
 disabled={isUpdating}
 />
 </ActionButtonGroup>
 </td>
 
 <td className="p-2 text-left section-start">
 <input
 type="text"
 defaultValue={formatTextValue(bequest.description)}
 className={`table-input ${getFieldClass('text')} ${getValueClass(bequest.description, 'text')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => handleInputBlur(bequest.id, 'description', e.target.value, e.target)}
 disabled={isUpdating}
 />
 </td>
 
 <td className="p-2 text-left">
 <input
 type="text"
 defaultValue={formatTextValue(bequest.entity)}
 className={`table-input ${getFieldClass('text')} ${getValueClass(bequest.entity, 'text')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => handleInputBlur(bequest.id, 'entity', e.target.value, e.target)}
 disabled={isUpdating}
 />
 </td>
 
 <td className="p-2 text-left section-start">
 <input
 type="text"
 defaultValue={formatTextValue(bequest.start)}
 className={`table-input ${getFieldClass('text')} ${getValueClass(bequest.start, 'text')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => handleInputBlur(bequest.id, 'start', e.target.value, e.target)}
 disabled={isUpdating}
 />
 </td>
 
 <td className="p-2 text-right">
 <input
 key={`amount-${bequest.id}-${bequest.amount}`}
 type="text"
 defaultValue={bequest.amount}
 className={`table-input ${getFieldClass('currency')} ${getValueClass(bequest.amount, 'currency')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => handleInputBlur(bequest.id, 'amount', e.target.value, e.target)}
 disabled={isUpdating}
 />
 </td>
 
 <td className="p-2 text-center">
 <input
 key={`increasePercentage-${bequest.id}-${bequest.increasePercentage}`}
 type="text"
 defaultValue={bequest.increasePercentage}
 className={`table-input ${getFieldClass('percentage')} ${getValueClass(bequest.increasePercentage, 'percentage')}`}
 onFocus={handleDefaultValueFocus}
 onBlur={(e) => handleInputBlur(bequest.id, 'increasePercentage', e.target.value, e.target)}
 disabled={isUpdating}
 />
 </td>
 
 <td className="p-2 text-center">
 <input
 type="checkbox"
 defaultChecked={bequest.cpi}
 className="table-checkbox"
 onChange={(e) => handleUpdateBequest(bequest.id, 'cpi', e.target.checked)}
 disabled={isUpdating}
 />
 </td>
 
 <td className="p-2 text-right section-start">
 <input
 key={`valueAtDeath-${bequest.id}-${bequest.valueAtDeath}`}
 type="text"
 defaultValue={bequest.valueAtDeath}
 className="calculated-field"
 readOnly
 disabled
 />
 </td>
 </tr>
 ))}
 </tbody>
 
 {/* Totals Footer */}
 <tfoot>
 <tr>
 <td className="totals-cell-label text-right" colSpan={4}>Totals</td>
 <td className="totals-cell-value">R {totals.amount.toLocaleString()}</td>
 <td className="totals-cell-value">{totals.increasePercentage}%</td>
 <td className="totals-cell-value"></td>
 <td className="totals-cell-value section-start">R {totals.valueAtDeath.toLocaleString()}</td>
 </tr>
 </tfoot>
 </table>
 </div>
 );
}

export { LumpSumTable };