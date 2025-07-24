import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { AddButton } from "@/components/ui/action-buttons";
import { getFieldClass, getFieldWidth } from "@/lib/design-tokens";
import type { DefinedBenefitFund, InsertDefinedBenefitFund } from "@shared/schema";

// Utility function for formatting currency values
const formatCurrencyValue = (value: string, fieldType: string): string => {
  if (!value || value.trim() === '') return 'R 0';
  
  // Remove existing formatting
  const cleanValue = value.replace(/[^\d.-]/g, '');
  if (!cleanValue) return 'R 0';
  if (isNaN(parseFloat(cleanValue))) return 'R 0';
  
  const numValue = parseFloat(cleanValue);
  
  if (fieldType === 'percentage' || fieldType.includes('increase')) {
    return `${numValue}%`;
  }
  
  if (fieldType === 'years' || fieldType.includes('years')) {
    return `${numValue} years`;
  }
  
  // Currency formatting
  if (numValue === 0) return 'R 0';
  
  // Format with thousands separators
  const formatted = new Intl.NumberFormat('en-ZA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(numValue));
  
  return `R ${formatted}`;
};

export default function DefinedBenefitFundsTable() {
  const [searchTerm, setSearchTerm] = useState("");
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

  // Filter funds based on search term
  const filteredFunds = useMemo(() => {
    if (!searchTerm.trim()) return funds;
    
    const lowerQuery = searchTerm.toLowerCase();
    return funds.filter(fund =>
      fund.description.toLowerCase().includes(lowerQuery) ||
      fund.owner.toLowerCase().includes(lowerQuery)
    );
  }, [funds, searchTerm]);

  // Calculate totals
  const totals = useMemo(() => {
    return {
      finalMonthlySalary: filteredFunds.reduce((sum: number, fund: DefinedBenefitFund) => {
        const value = parseFloat(fund.finalMonthlySalary.replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      deathLumpSum: filteredFunds.reduce((sum: number, fund: DefinedBenefitFund) => {
        const value = parseFloat(fund.deathLumpSum.replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      additionalTaxFreeAmount: filteredFunds.reduce((sum: number, fund: DefinedBenefitFund) => {
        const value = parseFloat(fund.additionalTaxFreeAmount.replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      pensionIncomeAmount: filteredFunds.reduce((sum: number, fund: DefinedBenefitFund) => {
        const value = parseFloat(fund.pensionIncomeAmount.replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0)
    };
  }, [filteredFunds]);

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
    const formattedValue = formatCurrencyValue(value, fieldType);
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
      {/* Search Controls */}
      <div className="flex justify-start items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search defined benefit funds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Summary Section */}
      {filteredFunds.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-primary/10 px-4 py-3 border-b border-neutral-200">
            <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">Summary</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-neutral-50 p-3 rounded-lg">
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Total Final Monthly Salary</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {formatCurrencyValue(totals.finalMonthlySalary.toString(), 'finalMonthlySalary')}
                </p>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg">
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Total Death Lump Sum</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {formatCurrencyValue(totals.deathLumpSum.toString(), 'deathLumpSum')}
                </p>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg">
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Total Additional Tax Free Amount</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {formatCurrencyValue(totals.additionalTaxFreeAmount.toString(), 'additionalTaxFreeAmount')}
                </p>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg">
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Pension Income Amount at Death</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {formatCurrencyValue(totals.pensionIncomeAmount.toString(), 'pensionIncomeAmount')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Fund Button */}
      <div className="flex justify-start mb-4">
        <AddButton
          onClick={handleAddFund}
          disabled={addMutation.isPending}
          className="px-4 py-2"
        >
          Add Fund
        </AddButton>
      </div>

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
            {filteredFunds.map((fund: DefinedBenefitFund) => (
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
                    className={getFieldClass('years')}
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    key={`finalMonthlySalary-${fund.id}-${fund.finalMonthlySalary}`}
                    type="text"
                    defaultValue={formatCurrencyValue(fund.finalMonthlySalary, 'finalMonthlySalary')}
                    onBlur={(e) => handleInputBlur(fund.id, 'finalMonthlySalary', e.target.value)}
                    className={getFieldClass('amount')}
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    key={`deathLumpSum-${fund.id}-${fund.deathLumpSum}`}
                    type="text"
                    defaultValue={formatCurrencyValue(fund.deathLumpSum, 'deathLumpSum')}
                    onBlur={(e) => handleInputBlur(fund.id, 'deathLumpSum', e.target.value)}
                    className={getFieldClass('amount')}
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    key={`additionalTaxFreeAmount-${fund.id}-${fund.additionalTaxFreeAmount}`}
                    type="text"
                    defaultValue={formatCurrencyValue(fund.additionalTaxFreeAmount, 'additionalTaxFreeAmount')}
                    onBlur={(e) => handleInputBlur(fund.id, 'additionalTaxFreeAmount', e.target.value)}
                    className={getFieldClass('amount')}
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    key={`pensionIncomeAmount-${fund.id}-${fund.pensionIncomeAmount}`}
                    type="text"
                    defaultValue={formatCurrencyValue(fund.pensionIncomeAmount, 'pensionIncomeAmount')}
                    onBlur={(e) => handleInputBlur(fund.id, 'pensionIncomeAmount', e.target.value)}
                    className={getFieldClass('amount')}
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    key={`pensionIncomeIncrease-${fund.id}-${fund.pensionIncomeIncrease}`}
                    type="text"
                    defaultValue={fund.pensionIncomeIncrease || "0%"}
                    onBlur={(e) => handleInputBlur(fund.id, 'pensionIncomeIncrease', e.target.value)}
                    className={getFieldClass('percentage')}
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
                  {formatCurrencyValue(totals.finalMonthlySalary.toString(), 'finalMonthlySalary')}
                </td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                  {formatCurrencyValue(totals.deathLumpSum.toString(), 'deathLumpSum')}
                </td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                  {formatCurrencyValue(totals.additionalTaxFreeAmount.toString(), 'additionalTaxFreeAmount')}
                </td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                  {formatCurrencyValue(totals.pensionIncomeAmount.toString(), 'pensionIncomeAmount')}
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