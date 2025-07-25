import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { VoluntaryInvestment, InsertVoluntaryInvestment } from '@shared/schema';
import { ActionButtonGroup, DuplicateButton, DeleteButton } from '@/components/ui/action-buttons';
import { getFieldClass, getFieldWidth } from '@/lib/field-types';
import { formatCurrencyValue, formatPercentageValue, isDefaultValue, getValueClass } from '@/lib/formatting';
import { handleDefaultValueFocus, createEnhancedBlurHandler } from '@/lib/formatting';

interface VoluntaryInvestmentsTableProps {
  viewMode: 'table' | 'hybrid';
  searchTerm?: string;
}

export default function VoluntaryInvestmentsTable({ viewMode, searchTerm }: VoluntaryInvestmentsTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Query for investments
  const { data: investments = [], isLoading, error } = useQuery<VoluntaryInvestment[]>({
    queryKey: ['/api/voluntary-investments'],
  });

  // Add investment mutation
  const addMutation = useMutation({
    mutationFn: async (): Promise<VoluntaryInvestment> => {
      const newInvestment: InsertVoluntaryInvestment = {
        description: "Enter details ...",
        owners: ["Donald Edwards"],
        ownershipPercentages: ["100%"],
        amount: "R 0",
        increasePercentage: "0%",
        beneficiaries: ["Enter details ..."],
        benefitSplits: ["0%"],
      };
      
      const response = await fetch('/api/voluntary-investments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newInvestment),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add investment');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/voluntary-investments'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to add investment:', error);
      setIsUpdating(false);
    }
  });

  // Update investment mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<VoluntaryInvestment> }) => {
      const response = await fetch(`/api/voluntary-investments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update investment');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/voluntary-investments'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to update investment:', error);
      setIsUpdating(false);
    }
  });

  // Delete investment mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/voluntary-investments/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete investment');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/voluntary-investments'] });
    }
  });

  // Calculate totals
  const totals = useMemo(() => {
    return {
      count: investments.length,
      amount: investments.reduce((sum: number, investment: VoluntaryInvestment) => {
        const value = parseFloat(investment.amount.replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
    };
  }, [investments]);

  const handleAddInvestment = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  const handleUpdateInvestment = useCallback((id: number, field: keyof VoluntaryInvestment, value: string | string[]) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof VoluntaryInvestment, value: string) => {
    // Determine field type and format accordingly
    let formattedValue: string;
    if (field === 'increasePercentage') {
      formattedValue = formatPercentageValue(value);
    } else if (field === 'amount') {
      formattedValue = formatCurrencyValue(value);
    } else {
      formattedValue = value;
    }
    handleUpdateInvestment(id, field, formattedValue);
    
    // Update DOM element directly for immediate visual feedback
    const target = document.activeElement as HTMLInputElement;
    if (target && formattedValue !== value) {
      setTimeout(() => {
        target.value = formattedValue;
      }, 0);
    }
  }, [handleUpdateInvestment]);

  const handleDeleteInvestment = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading voluntary investments...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading voluntary investments. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      <table>
        <thead>
          <tr className="border-b border-border">
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start section-end" rowSpan={2}>Actions</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={3}>Overview</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start" colSpan={2}>Financial Details</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start section-end" colSpan={2}>Beneficiary Details</th>
          </tr>
          <tr className="border-b border-border">
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start border-b border-neutral-200">Description</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Owners</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Ownership %</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start border-b border-neutral-200">Amount</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center border-b border-neutral-200">Increase %</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-start border-b border-neutral-200">Beneficiaries</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center section-end border-b border-neutral-200">Benefit Split %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {investments.map((investment: VoluntaryInvestment, investmentIndex) => (
            <tr key={investment.id} className="hover:bg-neutral-50">
              <td className="table-actions-cell p-1 text-center section-start section-end">
                <ActionButtonGroup>
                  <DuplicateButton
                    onClick={() => addMutation.mutate()}
                    disabled={isUpdating}
                  />
                  <DeleteButton
                    onClick={() => handleDeleteInvestment(investment.id)}
                    disabled={isUpdating}
                  />
                </ActionButtonGroup>
              </td>
              
              <td className="p-1 section-start">
                <input
                  type="text"
                  defaultValue={investment.description}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(investment.description, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(investment.id, 'description', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1">
                <input
                  type="text"
                  defaultValue={investment.owners.join(', ')}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(investment.owners.join(', '), 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleUpdateInvestment(investment.id, 'owners', e.target.value.split(', '))}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1">
                <input
                  type="text"
                  defaultValue={investment.ownershipPercentages.join(', ')}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(investment.ownershipPercentages.join(', '), 'percentage')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleUpdateInvestment(investment.id, 'ownershipPercentages', e.target.value.split(', '))}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1 section-start">
                <input
                  key={`amount-${investment.id}-${investment.amount}`}
                  type="text"
                  defaultValue={investment.amount}
                  className={`table-input ${getFieldClass('currency')} ${getValueClass(investment.amount, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(investment.id, 'amount', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1">
                <input
                  key={`increasePercentage-${investment.id}-${investment.increasePercentage}`}
                  type="text"
                  defaultValue={investment.increasePercentage}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(investment.increasePercentage, 'percentage')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(investment.id, 'increasePercentage', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1 section-start">
                <input
                  type="text"
                  defaultValue={investment.beneficiaries.join(', ')}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(investment.beneficiaries.join(', '), 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleUpdateInvestment(investment.id, 'beneficiaries', e.target.value.split(', '))}
                  disabled={isUpdating}
                />
              </td>
              
              <td className="p-1 section-end">
                <input
                  type="text"
                  defaultValue={investment.benefitSplits.join(', ')}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(investment.benefitSplits.join(', '), 'percentage')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleUpdateInvestment(investment.id, 'benefitSplits', e.target.value.split(', '))}
                  disabled={isUpdating}
                />
              </td>
            </tr>
          ))}
          
          {/* Totals Row */}
          <tr className="table-total-row bg-neutral-100 font-bold">
            <td className="section-start section-end p-1 text-center font-bold">TOTALS</td>
            <td className="section-start p-1 font-bold">-</td>
            <td className="p-1 font-bold">-</td>
            <td className="p-1 font-bold">-</td>
            <td className="section-start p-1 font-bold">R {totals.amount.toLocaleString()}</td>
            <td className="p-1 font-bold">-</td>
            <td className="section-start p-1 font-bold">-</td>
            <td className="section-end p-1 font-bold">-</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}