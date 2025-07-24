import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { AddButton } from "@/components/ui/action-buttons";
import { getFieldClass, getFieldWidth } from "@/lib/design-tokens";
import { formatCurrencyValue, formatPercentageValue, formatYearsValue, getValueClass, isDefaultValue, handleDefaultValueFocus, createEnhancedBlurHandler } from "@/lib/formatting";
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
        description: "",
        owner: "Donald Edwards",
        yearsOfService: "0 years",
        finalMonthlySalary: "0",
        deathLumpSum: "0",
        additionalTaxFreeAmount: "0",
        pensionIncomeAmount: "0",
        pensionIncomeIncrease: "0%",
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

  // No filtering needed - show all funds
  const filteredFunds = funds;

  // Calculate totals
  const totals = useMemo(() => {
    return {
      finalMonthlySalary: funds.reduce((sum: number, fund: DefinedBenefitFund) => {
        const value = parseFloat(fund.finalMonthlySalary.replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      deathLumpSum: funds.reduce((sum: number, fund: DefinedBenefitFund) => {
        const value = parseFloat(fund.deathLumpSum.replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      additionalTaxFreeAmount: funds.reduce((sum: number, fund: DefinedBenefitFund) => {
        const value = parseFloat(fund.additionalTaxFreeAmount.replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      pensionIncomeAmount: funds.reduce((sum: number, fund: DefinedBenefitFund) => {
        const value = parseFloat(fund.pensionIncomeAmount.replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0)
    };
  }, [funds]);

  const handleAddFund = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  const handleUpdateFund = useCallback((id: number, field: keyof DefinedBenefitFund, value: string) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof DefinedBenefitFund, value: string) => {
    // Map field names to field types for proper formatting
    const fieldTypeMap: Record<string, string> = {
      'yearsOfService': 'years',
      'pensionIncomeIncrease': 'percentage',
      'finalMonthlySalary': 'currency',
      'deathLumpSum': 'currency',
      'additionalTaxFreeAmount': 'currency',
      'pensionIncomeAmount': 'currency'
    };
    
    const fieldType = fieldTypeMap[field] || field;
    const formattedValue = fieldType === 'percentage' ? formatPercentageValue(value) : 
                         fieldType === 'years' ? formatYearsValue(value) : 
                         formatCurrencyValue(value);
    handleUpdateFund(id, field, formattedValue);
    
    // Update DOM element directly for immediate visual feedback
    const target = document.activeElement as HTMLInputElement;
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

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading defined benefit funds...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading defined benefit funds. Please try again.</div>;
  }

  return (
    <div className="space-y-4">

      {/* Summary Section */}
      {funds.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-primary/10 px-4 py-3 border-b border-neutral-200">
            <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">Summary</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-neutral-50 p-3 rounded-lg">
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Total Final Monthly Salary</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {formatCurrencyValue(totals.finalMonthlySalary.toString())}
                </p>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg">
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Total Death Lump Sum</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {formatCurrencyValue(totals.deathLumpSum.toString())}
                </p>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg">
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Total Additional Tax Free Amount</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {formatCurrencyValue(totals.additionalTaxFreeAmount.toString())}
                </p>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg">
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Pension Income Amount at Death</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {formatCurrencyValue(totals.pensionIncomeAmount.toString())}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-neutral-200 rounded-lg shadow-sm">
          <thead>
            <tr className="bg-primary/10 border-b border-neutral-200">
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Description</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Owner</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Ownership</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Years of Service</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Final Monthly Salary</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Death Lump Sum</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Additional Tax Free Amount</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider" colSpan={2}>Pension Income at Death</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Actions</th>
            </tr>
            <tr className="bg-primary/10 border-b border-neutral-200">
              <th colSpan={7}></th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Amount</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Increase</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {funds.map((fund: DefinedBenefitFund) => (
              <tr key={fund.id} className="hover:bg-neutral-50">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    defaultValue={fund.description}
                    onBlur={(e) => handleUpdateFund(fund.id, 'description', e.target.value)}
                    className={getFieldClass('description')}
                    style={getFieldWidth('description')}
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={fund.owner}
                    onChange={(e) => handleUpdateFund(fund.id, 'owner', e.target.value)}
                    className={getFieldClass('owner')}
                    style={getFieldWidth('owner')}
                    disabled={isUpdating}
                  >
                    <option value="Donald Edwards">Donald Edwards</option>
                    <option value="Betty Edwards">Betty Edwards</option>
                  </select>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="text-sm text-neutral-700 bg-neutral-100 px-2 py-1 rounded">100%</span>
                </td>
                <td className="px-3 py-2">
                  <input
                    key={`yearsOfService-${fund.id}-${fund.yearsOfService}`}
                    type="text"
                    defaultValue={fund.yearsOfService.includes('years') ? fund.yearsOfService : `${fund.yearsOfService} years`}
                    onBlur={(e) => handleInputBlur(fund.id, 'yearsOfService', e.target.value)}
                    className={`${getFieldClass('years')} ${getValueClass(fund.yearsOfService.includes('years') ? fund.yearsOfService : `${fund.yearsOfService} years`, 'years')}`}
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    key={`finalMonthlySalary-${fund.id}-${fund.finalMonthlySalary}`}
                    type="text"
                    defaultValue={formatCurrencyValue(fund.finalMonthlySalary)}
                    onBlur={(e) => handleInputBlur(fund.id, 'finalMonthlySalary', e.target.value)}
                    className={`${getFieldClass('amount')} ${getValueClass(formatCurrencyValue(fund.finalMonthlySalary), 'currency')}`}
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    key={`deathLumpSum-${fund.id}-${fund.deathLumpSum}`}
                    type="text"
                    defaultValue={formatCurrencyValue(fund.deathLumpSum)}
                    onBlur={(e) => handleInputBlur(fund.id, 'deathLumpSum', e.target.value)}
                    className={`${getFieldClass('amount')} ${getValueClass(formatCurrencyValue(fund.deathLumpSum), 'currency')}`}
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    key={`additionalTaxFreeAmount-${fund.id}-${fund.additionalTaxFreeAmount}`}
                    type="text"
                    defaultValue={formatCurrencyValue(fund.additionalTaxFreeAmount)}
                    onBlur={(e) => handleInputBlur(fund.id, 'additionalTaxFreeAmount', e.target.value)}
                    className={`${getFieldClass('amount')} ${getValueClass(formatCurrencyValue(fund.additionalTaxFreeAmount), 'currency')}`}
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    key={`pensionIncomeAmount-${fund.id}-${fund.pensionIncomeAmount}`}
                    type="text"
                    defaultValue={formatCurrencyValue(fund.pensionIncomeAmount)}
                    onBlur={(e) => handleInputBlur(fund.id, 'pensionIncomeAmount', e.target.value)}
                    className={`${getFieldClass('amount')} ${getValueClass(formatCurrencyValue(fund.pensionIncomeAmount), 'currency')}`}
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    key={`pensionIncomeIncrease-${fund.id}-${fund.pensionIncomeIncrease}`}
                    type="text"
                    defaultValue={fund.pensionIncomeIncrease || "0%"}
                    onFocus={handleDefaultValueFocus}
                    onBlur={createEnhancedBlurHandler(
                      (e) => handleInputBlur(fund.id, 'pensionIncomeIncrease', e.target.value),
                      'percentage'
                    )}
                    className={`${getFieldClass('percentage')} ${getValueClass(fund.pensionIncomeIncrease || "0%", 'percentage')}`}
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => handleDeleteFund(fund.id)}
                    className="text-[#4F4F4F] hover:text-red-600 transition-colors"
                    title="Delete fund"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            
            {/* Total Row */}
            {filteredFunds.length > 0 && (
              <tr className="bg-neutral-100 border-t-2 border-neutral-300 font-bold">
                <td className="px-3 py-2 text-sm font-bold text-neutral-800">Total</td>
                <td colSpan={3} className="px-3 py-2"></td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                  {formatCurrencyValue(totals.finalMonthlySalary.toString())}
                </td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                  {formatCurrencyValue(totals.deathLumpSum.toString())}
                </td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                  {formatCurrencyValue(totals.additionalTaxFreeAmount.toString())}
                </td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                  {formatCurrencyValue(totals.pensionIncomeAmount.toString())}
                </td>
                <td colSpan={2} className="px-3 py-2"></td>
              </tr>
            )}
            
            {filteredFunds.length === 0 && (
              <tr>
                <td colSpan={10} className="px-3 py-8 text-center text-neutral-500">
                  {searchTerm ? "No defined benefit funds found matching your search." : "No defined benefit funds found. Click 'Add Fund' to get started."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}