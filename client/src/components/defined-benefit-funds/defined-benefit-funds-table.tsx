import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { DefinedBenefitFund, InsertDefinedBenefitFund } from "@shared/schema";

// Utility function for formatting currency values
const formatCurrencyValue = (value: string, fieldType: string): string => {
  if (!value || value.trim() === '') return value;
  
  // Remove existing formatting
  const cleanValue = value.replace(/[^\d.-]/g, '');
  if (!cleanValue || isNaN(parseFloat(cleanValue))) return value;
  
  const numValue = parseFloat(cleanValue);
  
  if (fieldType === 'percentage' || fieldType.includes('increase')) {
    return `${numValue}%`;
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
        yearsOfService: "0",
        finalMonthlySalary: "0",
        deathLumpSum: "0",
        additionalTaxFreeAmount: "0",
        pensionIncomeAmount: "0",
        pensionIncomeIncrease: "0",
      };
      
      return await apiRequest('/api/defined-benefit-funds', {
        method: 'POST',
        body: JSON.stringify(newFund),
      });
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
      return await apiRequest(`/api/defined-benefit-funds/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
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
      await apiRequest(`/api/defined-benefit-funds/${id}`, { method: 'DELETE' });
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
    const formattedValue = formatCurrencyValue(value, field);
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
      {/* Search and Add Fund Controls */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search defined benefit funds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={handleAddFund}
          disabled={addMutation.isPending}
          className="bg-[#016991] text-white px-4 py-2 rounded-lg hover:bg-[#014d6b] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Fund
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-neutral-200 rounded-lg shadow-sm">
          <thead>
            <tr className="bg-[#E0F2FE] border-b border-neutral-200">
              <th className="px-3 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Description</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Owner</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Ownership</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Years of Service</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Final Monthly Salary</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Death Lump Sum</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Additional Tax Free Amount</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider" colSpan={2}>Pension Income at Death</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Actions</th>
            </tr>
            <tr className="bg-[#E0F2FE] border-b border-neutral-200">
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
                    className="table-input w-full px-2 py-1 text-sm border border-neutral-300 rounded bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={fund.owner}
                    onChange={(e) => handleUpdateFund(fund.id, 'owner', e.target.value)}
                    className="table-input w-full px-2 py-1 text-sm border border-neutral-300 rounded bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    type="text"
                    defaultValue={fund.yearsOfService}
                    onBlur={(e) => handleUpdateFund(fund.id, 'yearsOfService', e.target.value)}
                    className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    defaultValue={fund.finalMonthlySalary}
                    onBlur={(e) => handleInputBlur(fund.id, 'finalMonthlySalary', e.target.value)}
                    className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    defaultValue={fund.deathLumpSum}
                    onBlur={(e) => handleInputBlur(fund.id, 'deathLumpSum', e.target.value)}
                    className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    defaultValue={fund.additionalTaxFreeAmount}
                    onBlur={(e) => handleInputBlur(fund.id, 'additionalTaxFreeAmount', e.target.value)}
                    className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    defaultValue={fund.pensionIncomeAmount}
                    onBlur={(e) => handleInputBlur(fund.id, 'pensionIncomeAmount', e.target.value)}
                    className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    defaultValue={fund.pensionIncomeIncrease}
                    onBlur={(e) => handleInputBlur(fund.id, 'pensionIncomeIncrease', e.target.value)}
                    className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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