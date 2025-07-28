import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { DefinedBenefitFunds, InsertDefinedBenefitFunds } from '@shared/schema';
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
  const { data: funds = [], isLoading, error } = useQuery<DefinedBenefitFunds[]>({
    queryKey: ['/api/defined-benefit-funds'],
  });

  // Add fund mutation
  const addMutation = useMutation({
    mutationFn: async (): Promise<DefinedBenefitFunds> => {
      const newFund: InsertDefinedBenefitFunds = {
        description: "Enter details ...",
        owner: "Donald Edwards",
        amount: "R 0",
        increasePercentage: "0%",
        additionalOwners: [],
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
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<DefinedBenefitFunds> }) => {
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
      amount: funds.reduce((sum: number, fund: DefinedBenefitFunds) => {
        const value = parseFloat(fund.amount.replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
    };
  }, [funds]);

  const handleUpdateFund = useCallback((id: number, field: keyof DefinedBenefitFunds, value: string | string[]) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof DefinedBenefitFunds, value: string) => {
    let formattedValue: string;
    if (field === 'increasePercentage') {
      formattedValue = formatPercentageValue(value);
    } else if (field === 'amount') {
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
          <tr>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start section-end" rowSpan={2}>
              <AddButton onClick={() => addMutation.mutate()} disabled={isUpdating} />
            </th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={2}>Overview</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start section-end" colSpan={2}>Financial Details</th>
          </tr>
          <tr>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Description</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center">Owner</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start">Amount</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-end">Increase %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {funds.map((fund: DefinedBenefitFunds, index) => (
            <tr key={fund.id} className="hover:bg-neutral-50">
              <td className="table-actions-cell p-1 text-center section-start section-end">
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
              
              <td className="p-1 section-start">
                <input
                  type="text"
                  defaultValue={fund.description}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(fund.description, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(fund.id, 'description', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1">
                <input
                  type="text"
                  defaultValue={fund.owner}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(fund.owner, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(fund.id, 'owner', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1 section-start">
                <input
                  key={`amount-${fund.id}-${fund.amount}`}
                  type="text"
                  defaultValue={fund.amount}
                  className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.amount, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(fund.id, 'amount', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1 section-end">
                <input
                  key={`increasePercentage-${fund.id}-${fund.increasePercentage}`}
                  type="text"
                  defaultValue={fund.increasePercentage}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(fund.increasePercentage, 'percentage')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(fund.id, 'increasePercentage', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
            </tr>
          ))}
        </tbody>
        
        {/* Totals Footer */}
        <tfoot>
          <tr>
            <td className="totals-cell-label text-right" colSpan={3}>Totals</td>
            <td className="totals-cell-value section-start">R {totals.amount.toLocaleString()}</td>
            <td className="totals-cell-label section-end"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export { DefinedBenefitFundsTable };