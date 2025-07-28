import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Liabilities, InsertLiabilities } from '@shared/schema';
import { AddButton, ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { getFieldClass, getCellClass } from '@/lib/field-types';
import { formatCurrencyValue, formatPercentageValue, getValueClass, handleDefaultValueFocus, formatTextValue } from '@/lib/formatting';

interface LiabilitiesTableProps {
  viewMode: 'table' | 'hybrid';
  searchTerm?: string;
}

function LiabilitiesTable({ viewMode, searchTerm }: LiabilitiesTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Query for liabilities
  const { data: liabilities = [], isLoading, error } = useQuery<Liabilities[]>({
    queryKey: ['/api/liabilities'],
  });

  // Add liability mutation
  const addMutation = useMutation({
    mutationFn: async (): Promise<Liabilities> => {
      const newLiability: InsertLiabilities = {
        description: "",
        debtAmount: "R 0",
        peterLambie: "0%",
        victoriaLambie: "0%",
        juniorLambie: "0%",
        lambiesFamilyTrust: "0%",
        estateDuty: "R 0",
        others: "R 0",
        client: "R 0",
        section: "BONDS",
        included: true,
      };
      
      const response = await fetch('/api/liabilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLiability),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add liability');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/liabilities'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to add liability:', error);
      setIsUpdating(false);
    }
  });

  // Update liability mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Liabilities> }) => {
      const response = await fetch(`/api/liabilities/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update liability');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/liabilities'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to update liability:', error);
      setIsUpdating(false);
    }
  });

  // Delete liability mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/liabilities/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete liability');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/liabilities'] });
    }
  });

  // Calculate totals
  const totals = useMemo(() => {
    if (!liabilities || liabilities.length === 0) {
      return { count: 0, amount: 0, estate: 0, others: 0, client: 0 };
    }
    return {
      count: liabilities.length,
      amount: liabilities.reduce((sum: number, liability: Liabilities) => {
        const value = parseFloat((liability.debtAmount || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      estate: liabilities.reduce((sum: number, liability: Liabilities) => {
        const value = parseFloat((liability.estate || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      others: liabilities.reduce((sum: number, liability: Liabilities) => {
        const value = parseFloat((liability.others || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      client: liabilities.reduce((sum: number, liability: Liabilities) => {
        const value = parseFloat((liability.client || '').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
    };
  }, [liabilities]);

  const handleUpdateLiability = useCallback((id: number, field: keyof Liabilities, value: string | string[]) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof Liabilities, value: string) => {
    let formattedValue: string;
    if (field === 'peterLambie' || field === 'victoriaLambie' || field === 'juniorLambie' || field === 'lambiesFamilyTrust') {
      formattedValue = formatPercentageValue(value);
    } else if (field === 'debtAmount' || field === 'estate' || field === 'others' || field === 'client') {
      formattedValue = formatCurrencyValue(value);
    } else {
      formattedValue = value;
    }
    handleUpdateLiability(id, field, formattedValue);
    
    // Update DOM element for immediate visual feedback
    const target = document.activeElement as HTMLInputElement;
    if (target && formattedValue !== value) {
      setTimeout(() => {
        target.value = formattedValue;
      }, 0);
    }
  }, [handleUpdateLiability]);

  const handleDeleteLiability = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this liability?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading liabilities...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading liabilities. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      <table>
        <thead>
          <tr>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center" rowSpan={2}>
              <AddButton onClick={() => addMutation.mutate()} disabled={isUpdating} />
            </th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={1}>Overview</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={1}>Liability Details</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={4}>Ownership Split</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={3}>Settlement</th>
          </tr>
          <tr>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Description</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Debt Amount</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Peter Lambie</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Victoria Lambie (Spouse)</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Junior Lambie</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Lambies Family Trust</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Estate Duty</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Others</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-end">Client</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {(() => {
            // Group liabilities by section/category
            const groupedLiabilities = liabilities.reduce((groups, liability) => {
              const section = liability.section || 'Other';
              if (!groups[section]) {
                groups[section] = [];
              }
              groups[section].push(liability);
              return groups;
            }, {} as Record<string, Liabilities[]>);

            return Object.entries(groupedLiabilities).map(([sectionName, sectionLiabilities]) => [
              // Section Header
              <tr key={`section-${sectionName}`} className="bg-blue-50">
                <td colSpan={10} className="px-4 py-2 text-sm font-medium text-neutral-700 uppercase tracking-wider">
                  {sectionName.replace('_', ' ')}
                </td>
              </tr>,
              // Section Liabilities
              ...sectionLiabilities.map((liability: Liabilities) => (
                <tr key={liability.id} className="hover:bg-neutral-50">
                  <td className="table-actions-cell p-2 text-center">
                    <ActionButtonGroup>
                      <DuplicateButton
                        onClick={() => addMutation.mutate()}
                        disabled={isUpdating}
                      />
                      <DeleteButton
                        onClick={() => handleDeleteLiability(liability.id)}
                        disabled={isUpdating}
                      />
                    </ActionButtonGroup>
                  </td>
                  
                  <td className="p-2 text-left section-start">
                    <input
                      type="text"
                      defaultValue={formatTextValue(liability.description)}
                      className={`table-input ${getFieldClass('text')} ${getValueClass(liability.description, 'text')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(liability.id, 'description', e.target.value)}
                      disabled={isUpdating}
                    />
                  </td>
                  
                  <td className="p-2 text-right section-start">
                    <input
                      key={`debtAmount-${liability.id}-${liability.debtAmount}`}
                      type="text"
                      defaultValue={liability.debtAmount}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(liability.debtAmount, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(liability.id, 'debtAmount', e.target.value)}
                      disabled={isUpdating}
                    />
                  </td>
                  
                  <td className="p-2 text-center section-start">
                    <input
                      key={`peterLambie-${liability.id}-${liability.peterLambie}`}
                      type="text"
                      defaultValue={liability.peterLambie}
                      className={`table-input ${getFieldClass('percentage')} ${getValueClass(liability.peterLambie, 'percentage')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(liability.id, 'peterLambie', e.target.value)}
                      disabled={isUpdating}
                    />
                  </td>
                  
                  <td className="p-2 text-center">
                    <input
                      key={`victoriaLambie-${liability.id}-${liability.victoriaLambie}`}
                      type="text"
                      defaultValue={liability.victoriaLambie}
                      className={`table-input ${getFieldClass('percentage')} ${getValueClass(liability.victoriaLambie, 'percentage')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(liability.id, 'victoriaLambie', e.target.value)}
                      disabled={isUpdating}
                    />
                  </td>
                  
                  <td className="p-2 text-center">
                    <input
                      key={`juniorLambie-${liability.id}-${liability.juniorLambie}`}
                      type="text"
                      defaultValue={liability.juniorLambie}
                      className={`table-input ${getFieldClass('percentage')} ${getValueClass(liability.juniorLambie, 'percentage')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(liability.id, 'juniorLambie', e.target.value)}
                      disabled={isUpdating}
                    />
                  </td>
                  
                  <td className="p-2 text-center">
                    <input
                      key={`lambiesFamilyTrust-${liability.id}-${liability.lambiesFamilyTrust}`}
                      type="text"
                      defaultValue={liability.lambiesFamilyTrust}
                      className={`table-input ${getFieldClass('percentage')} ${getValueClass(liability.lambiesFamilyTrust, 'percentage')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(liability.id, 'lambiesFamilyTrust', e.target.value)}
                      disabled={isUpdating}
                    />
                  </td>
                  
                  <td className="p-2 text-right section-start">
                    <input
                      key={`estate-${liability.id}-${liability.estate}`}
                      type="text"
                      defaultValue={liability.estate}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(liability.estate, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(liability.id, 'estate', e.target.value)}
                      disabled={isUpdating}
                    />
                  </td>
                  
                  <td className="p-2 text-right">
                    <input
                      key={`others-${liability.id}-${liability.others}`}
                      type="text"
                      defaultValue={liability.others}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(liability.others, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(liability.id, 'others', e.target.value)}
                      disabled={isUpdating}
                    />
                  </td>
                  
                  <td className="p-2 text-right">
                    <input
                      key={`client-${liability.id}-${liability.client}`}
                      type="text"
                      defaultValue={liability.client}
                      className={`table-input ${getFieldClass('currency')} ${getValueClass(liability.client, 'currency')}`}
                      onFocus={handleDefaultValueFocus}
                      onBlur={(e) => handleInputBlur(liability.id, 'client', e.target.value)}
                      disabled={isUpdating}
                    />
                  </td>
                </tr>
              ))
            ]).flat();
          })()}
        </tbody>
        
        {/* Totals Footer */}
        <tfoot>
          <tr className="bg-neutral-50 border-t border-neutral-300">
            <td className="totals-cell-label text-right" colSpan={1}>Totals</td>
            <td className="totals-cell-value section-start text-right">R {totals.amount.toLocaleString()}</td>
            <td className="totals-cell-label"></td>
            <td className="totals-cell-label"></td>
            <td className="totals-cell-label"></td>
            <td className="totals-cell-label"></td>
            <td className="totals-cell-value section-start text-right">R {totals.estate.toLocaleString()}</td>
            <td className="totals-cell-value text-right">R {totals.others.toLocaleString()}</td>
            <td className="totals-cell-value section-end text-right">R {totals.client.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export { LiabilitiesTable };