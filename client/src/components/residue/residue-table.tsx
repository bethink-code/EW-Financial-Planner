import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Residue, InsertResidue } from '@shared/schema';
import { AddButton, ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { getFieldClass, getCellClass } from '@/lib/field-types';
import { formatCurrencyValue, formatPercentageValue, formatTextValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';

interface ResidueTableProps {
  viewMode: 'table' | 'hybrid';
  searchTerm?: string;
}

function ResidueTable({ viewMode, searchTerm }: ResidueTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: residues = [], isLoading, error } = useQuery<Residue[]>({
    queryKey: ['/api/residue'],
  });

  const addMutation = useMutation({
    mutationFn: async (): Promise<Residue> => {
      const newResidue: InsertResidue = {
        description: "",
        amount: "R 0",
        increasePercentage: "0%",
        category: "",
        johnDoe: "0%",
        janetteDoe: "0%",
        doeJunior: "0%",
        doeFamilyTrust: "0%",
        estate: "R 0",
        others: "R 0",
        client: "R 0",
      };
      
      const response = await fetch('/api/residue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newResidue),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add residue');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/residue'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to add residue:', error);
      setIsUpdating(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Residue> }) => {
      const response = await fetch(`/api/residue/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update residue');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/residue'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to update residue:', error);
      setIsUpdating(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/residue/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete residue');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/residue'] });
    }
  });

  const totals = useMemo(() => {
    return {
      count: residues.length,
      amount: residues.reduce((sum: number, residue: Residue) => {
        const value = parseFloat((residue.amount || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      increasePercentage: residues.reduce((sum: number, residue: Residue) => {
        const value = parseFloat((residue.increasePercentage || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      johnDoe: residues.reduce((sum: number, residue: Residue) => {
        const value = parseFloat((residue.johnDoe || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      janetteDoe: residues.reduce((sum: number, residue: Residue) => {
        const value = parseFloat((residue.janetteDoe || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      doeJunior: residues.reduce((sum: number, residue: Residue) => {
        const value = parseFloat((residue.doeJunior || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      doeFamilyTrust: residues.reduce((sum: number, residue: Residue) => {
        const value = parseFloat((residue.doeFamilyTrust || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      estate: residues.reduce((sum: number, residue: Residue) => {
        const value = parseFloat((residue.estate || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      others: residues.reduce((sum: number, residue: Residue) => {
        const value = parseFloat((residue.others || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      client: residues.reduce((sum: number, residue: Residue) => {
        const value = parseFloat((residue.client || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
    };
  }, [residues]);

  const handleUpdateResidue = useCallback((id: number, field: keyof Residue, value: string | string[]) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof Residue, value: string) => {
    // Determine field type for formatting
    const fieldType = field === 'increasePercentage' || field === 'johnDoe' || field === 'janetteDoe' || field === 'doeJunior' || field === 'doeFamilyTrust' ? 'percentage' : 
                     field === 'amount' || field === 'estate' || field === 'others' || field === 'client' ? 'currency' : 'text';
    
    // Format the value based on field type
    const formattedValue = fieldType === 'percentage' ? formatPercentageValue(value) : 
                          fieldType === 'currency' ? formatCurrencyValue(value) : 
                          formatTextValue(value);
    
    handleUpdateResidue(id, field, formattedValue);
    
    // Update the input field with formatted value if it changed
    const target = document.activeElement as HTMLInputElement;
    if (target && formattedValue !== value) {
      setTimeout(() => {
        target.value = formattedValue;
      }, 0);
    }
  }, [handleUpdateResidue]);

  const handleDeleteResidue = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this residue?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading residue...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading residue. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      <table>
        <thead>
          <tr>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center" rowSpan={2}>
              <AddButton onClick={() => addMutation.mutate()} disabled={isUpdating} />
            </th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center" colSpan={2}>Overview</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center" colSpan={2}>Financial Details</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center" colSpan={4}>Distribution Split</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center" colSpan={3}>Beneficiaries</th>
          </tr>
          <tr>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Category</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Description</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Amount</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Increase %</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">John Doe</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Janette Doe (Spouse)</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Doe Junior</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Doe family trust</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Estate</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Others</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Client</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {residues.map((residue: Residue, index) => (
            <tr key={residue.id} className="hover:bg-neutral-50">
              <td className="table-actions-cell p-2 text-center">
                <ActionButtonGroup>
                  <DuplicateButton onClick={() => addMutation.mutate()} disabled={isUpdating} />
                  <DeleteButton onClick={() => handleDeleteResidue(residue.id)} disabled={isUpdating} />
                </ActionButtonGroup>
              </td>
              
              <td className="p-2 text-left">
                <input
                  type="text"
                  defaultValue={residue.category}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(residue.category, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(residue.id, 'category', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-left">
                <input
                  type="text"
                  defaultValue={formatTextValue(residue.description)}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(residue.description, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(residue.id, 'description', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-right">
                <input
                  key={`amount-${residue.id}-${residue.amount}`}
                  type="text"
                  defaultValue={residue.amount}
                  className={`table-input ${getFieldClass('currency')} ${getValueClass(residue.amount, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(residue.id, 'amount', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-center">
                <input
                  key={`increasePercentage-${residue.id}-${residue.increasePercentage}`}
                  type="text"
                  defaultValue={residue.increasePercentage}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(residue.increasePercentage, 'percentage')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(residue.id, 'increasePercentage', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-center">
                <input
                  key={`johnDoe-${residue.id}-${residue.johnDoe}`}
                  type="text"
                  defaultValue={residue.johnDoe}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(residue.johnDoe, 'percentage')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(residue.id, 'johnDoe', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-center">
                <input
                  key={`janetteDoe-${residue.id}-${residue.janetteDoe}`}
                  type="text"
                  defaultValue={residue.janetteDoe}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(residue.janetteDoe, 'percentage')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(residue.id, 'janetteDoe', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-center">
                <input
                  key={`doeJunior-${residue.id}-${residue.doeJunior}`}
                  type="text"
                  defaultValue={residue.doeJunior}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(residue.doeJunior, 'percentage')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(residue.id, 'doeJunior', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-center">
                <input
                  key={`doeFamilyTrust-${residue.id}-${residue.doeFamilyTrust}`}
                  type="text"
                  defaultValue={residue.doeFamilyTrust}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(residue.doeFamilyTrust, 'percentage')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(residue.id, 'doeFamilyTrust', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-right">
                <input
                  key={`estate-${residue.id}-${residue.estate}`}
                  type="text"
                  defaultValue={residue.estate}
                  className={`table-input ${getFieldClass('currency')} ${getValueClass(residue.estate, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(residue.id, 'estate', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-right">
                <input
                  key={`others-${residue.id}-${residue.others}`}
                  type="text"
                  defaultValue={residue.others}
                  className={`table-input ${getFieldClass('currency')} ${getValueClass(residue.others, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(residue.id, 'others', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-2 text-right">
                <input
                  key={`client-${residue.id}-${residue.client}`}
                  type="text"
                  defaultValue={residue.client}
                  className={`table-input ${getFieldClass('currency')} ${getValueClass(residue.client, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(residue.id, 'client', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
            </tr>
          ))}
        </tbody>
        
        <tfoot>
          <tr>
            <td className="totals-cell-label text-right" colSpan={3}>Totals</td>
            <td className="totals-cell-value">R {totals.amount.toLocaleString()}</td>
            <td className="totals-cell-value">{totals.increasePercentage}%</td>
            <td className="totals-cell-value">{totals.johnDoe}%</td>
            <td className="totals-cell-value">{totals.janetteDoe}%</td>
            <td className="totals-cell-value">{totals.doeJunior}%</td>
            <td className="totals-cell-value">{totals.doeFamilyTrust}%</td>
            <td className="totals-cell-value">R {totals.estate.toLocaleString()}</td>
            <td className="totals-cell-value">R {totals.others.toLocaleString()}</td>
            <td className="totals-cell-value">R {totals.client.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default ResidueTable;