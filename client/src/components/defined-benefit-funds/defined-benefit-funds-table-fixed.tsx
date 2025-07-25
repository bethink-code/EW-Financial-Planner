import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AddButton, DeleteButton, DuplicateButton, ActionButtonGroup } from "@/components/ui/action-buttons";
import { getFieldClass } from "@/lib/design-tokens";
import { formatCurrencyValue, formatPercentageValue, getValueClass, isDefaultValue, handleDefaultValueFocus, createEnhancedBlurHandler } from "@/lib/formatting";
import type { DefinedBenefitFund, InsertDefinedBenefitFund } from "@shared/schema";

export default function DefinedBenefitFundsTable() {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  // Fetch defined benefit funds
  const { data: funds = [], isLoading, error } = useQuery<DefinedBenefitFund[]>({
    queryKey: ['/api/defined-benefit-funds'],
    queryFn: async () => {
      const response = await fetch('/api/defined-benefit-funds');
      if (!response.ok) {
        throw new Error('Failed to fetch defined benefit funds');
      }
      return response.json();
    }
  });

  // Add new fund mutation
  const addMutation = useMutation({
    mutationFn: async (): Promise<DefinedBenefitFund> => {
      const newFund: InsertDefinedBenefitFund = {
        description: "Enter details ...",
        owner: "Donald Edwards",
        pensionIncome: "R 0",
        pensionIncomeIncrease: "0%",
        spouseIncome: "R 0",
        spouseIncomeIncrease: "0%",
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
        throw new Error('Failed to create fund');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/defined-benefit-funds'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to add fund:', error);
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
        throw new Error('Failed to update fund');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/defined-benefit-funds'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to update fund:', error);
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
        throw new Error('Failed to delete fund');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/defined-benefit-funds'] });
    }
  });

  // Calculate totals
  const totals = useMemo(() => {
    return {
      pensionIncome: funds.reduce((sum: number, fund: DefinedBenefitFund) => {
        const value = parseFloat((fund.pensionIncome || '0').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      spouseIncome: funds.reduce((sum: number, fund: DefinedBenefitFund) => {
        const value = parseFloat((fund.spouseIncome || '0').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0)
    };
  }, [funds]);

  const handleUpdateFund = useCallback((id: number, field: keyof DefinedBenefitFund, value: string) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof DefinedBenefitFund, value: string, target?: HTMLInputElement) => {
    // Map field names to field types for proper formatting
    const fieldTypeMap: Record<string, string> = {
      'pensionIncomeIncrease': 'percentage',
      'spouseIncomeIncrease': 'percentage',
      'pensionIncome': 'currency',
      'spouseIncome': 'currency'
    };
    
    const fieldType = fieldTypeMap[field] || field;
    const formattedValue = fieldType === 'percentage' ? formatPercentageValue(value) : 
                         fieldType === 'currency' ? formatCurrencyValue(value) : 
                         value;

    handleUpdateFund(id, field, formattedValue);

    // Update the input field with formatted value if it changed
    if (target && formattedValue !== value) {
      setTimeout(() => {
        target.value = formattedValue;
      }, 0);
    }
  }, [handleUpdateFund]);

  const handleDeleteFund = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this fund?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const handleDuplicateFund = useCallback((fund: DefinedBenefitFund) => {
    const duplicatedFund: InsertDefinedBenefitFund = {
      description: fund.description,
      owner: fund.owner,
      pensionIncome: fund.pensionIncome,
      pensionIncomeIncrease: fund.pensionIncomeIncrease,
      spouseIncome: fund.spouseIncome,
      spouseIncomeIncrease: fund.spouseIncomeIncrease,
      additionalOwners: [...fund.additionalOwners],
    };
    
    fetch('/api/defined-benefit-funds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(duplicatedFund),
    }).then(res => {
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/defined-benefit-funds'] });
      }
    });
  }, [queryClient]);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading defined benefit funds...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading defined benefit funds. Please try again.</div>;
  }

  return (
    <div>
      {/* Table */}
      <table className="min-w-full border border-neutral-200">
        <thead>
          <tr className="border-b border-neutral-200">
            <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider w-16">Actions</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Description</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Owner</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider" colSpan={2}>Pension Income</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider" colSpan={2}>Spouse Income</th>
          </tr>
          <tr className="border-b border-neutral-200">
            <th></th>
            <th></th>
            <th></th>
            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Amount</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Increase %</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Amount</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Increase %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {funds.map((fund: DefinedBenefitFund) => (
            <tr key={fund.id} className="hover:bg-neutral-50">
              <td className="table-actions-cell text-center">
                <ActionButtonGroup>
                  <DuplicateButton
                    onClick={() => handleDuplicateFund(fund)}
                    disabled={isUpdating}
                  />
                  <DeleteButton
                    onClick={() => handleDeleteFund(fund.id)}
                    disabled={isUpdating}
                  />
                </ActionButtonGroup>
              </td>
              <td className="px-3 py-2">
                <input
                  type="text"
                  defaultValue={fund.description}
                  className={`table-input ${getFieldClass('text')} ${getValueClass(fund.description, 'text')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleUpdateFund(fund.id, 'description', e.target.value)}
                  disabled={isUpdating}
                />
              </td>
              <td className="px-3 py-2">
                <select
                  value={fund.owner}
                  onChange={(e) => handleUpdateFund(fund.id, 'owner', e.target.value)}
                  className={getFieldClass('text')}
                  disabled={isUpdating}
                >
                  <option value="Donald Edwards">Donald Edwards</option>
                  <option value="Betty Edwards">Betty Edwards</option>
                </select>
              </td>
              <td className="px-3 py-2">
                <input
                  key={`pensionIncome-${fund.id}-${fund.pensionIncome}`}
                  type="text"
                  defaultValue={fund.pensionIncome}
                  className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.pensionIncome, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(fund.id, 'pensionIncome', e.target.value, e.target)}
                  disabled={isUpdating}
                />
              </td>
              <td className="px-3 py-2">
                <input
                  key={`pensionIncomeIncrease-${fund.id}-${fund.pensionIncomeIncrease}`}
                  type="text"
                  defaultValue={fund.pensionIncomeIncrease || "0%"}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => createEnhancedBlurHandler(
                    (value) => handleInputBlur(fund.id, 'pensionIncomeIncrease', value, e.target),
                    'percentage'
                  )(e)}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(fund.pensionIncomeIncrease || "0%", 'percentage')}`}
                  disabled={isUpdating}
                />
              </td>
              <td className="px-3 py-2">
                <input
                  key={`spouseIncome-${fund.id}-${fund.spouseIncome}`}
                  type="text"
                  defaultValue={fund.spouseIncome}
                  className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.spouseIncome, 'currency')}`}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleInputBlur(fund.id, 'spouseIncome', e.target.value, e.target)}
                  disabled={isUpdating}
                />
              </td>
              <td className="px-3 py-2">
                <input
                  key={`spouseIncomeIncrease-${fund.id}-${fund.spouseIncomeIncrease}`}
                  type="text"
                  defaultValue={fund.spouseIncomeIncrease || "0%"}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => createEnhancedBlurHandler(
                    (value) => handleInputBlur(fund.id, 'spouseIncomeIncrease', value, e.target),
                    'percentage'
                  )(e)}
                  className={`table-input ${getFieldClass('percentage')} ${getValueClass(fund.spouseIncomeIncrease || "0%", 'percentage')}`}
                  disabled={isUpdating}
                />
              </td>
            </tr>
          ))}
          
          {/* Totals Row */}
          <tr className="table-total-row bg-neutral-100 font-bold">
            <td className="px-3 py-2 text-center font-bold">TOTALS</td>
            <td className="px-3 py-2 font-bold">-</td>
            <td className="px-3 py-2 font-bold">-</td>
            <td className="px-3 py-2 font-bold">R {totals.pensionIncome.toLocaleString()}</td>
            <td className="px-3 py-2 font-bold">-</td>
            <td className="px-3 py-2 font-bold">R {totals.spouseIncome.toLocaleString()}</td>
            <td className="px-3 py-2 font-bold">-</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}