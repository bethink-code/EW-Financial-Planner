import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Search } from "lucide-react";
import type { IncomeProvision, InsertIncomeProvision } from "@shared/schema";

// Utility function for formatting currency values
const formatCurrencyValue = (value: string, fieldType: string): string => {
  if (!value || value.trim() === '') return value;
  
  // Remove existing formatting
  const cleanValue = value.replace(/[^\d.-]/g, '');
  if (!cleanValue || isNaN(parseFloat(cleanValue))) return value;
  
  const numValue = parseFloat(cleanValue);
  
  if (fieldType === 'percentage' || fieldType.includes('percentage')) {
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

const ENTITY_OPTIONS = [
  { value: "Donald Edwards", label: "Donald Edwards" },
  { value: "Betty Edwards", label: "Betty Edwards" },
  { value: "Both", label: "Both" },
];

const FREQUENCY_OPTIONS = [
  { value: "Monthly", label: "Monthly" },
  { value: "Quarterly", label: "Quarterly" },
  { value: "Semi-annually", label: "Semi-annually" },
  { value: "Annually", label: "Annually" },
];

export default function IncomeProvisionsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  // Fetch income provisions
  const { data: provisions = [], isLoading, error } = useQuery<IncomeProvision[]>({
    queryKey: ['/api/income-provisions'],
    queryFn: async () => {
      const response = await fetch('/api/income-provisions');
      if (!response.ok) {
        throw new Error('Failed to fetch income provisions');
      }
      return response.json();
    }
  });

  // Add new provision mutation
  const addMutation = useMutation({
    mutationFn: async (): Promise<IncomeProvision> => {
      const newProvision: InsertIncomeProvision = {
        description: "",
        entity: "Donald Edwards",
        start: "0",
        termYears: "0",
        termEditable: false,
        increasePercentage: "0",
        cpi: false,
        frequency: "Monthly",
        amount: "0",
        taxablePercentage: "0",
        taxPercentage: "0",
        capitalisedAmount: "0",
      };
      
      const response = await fetch('/api/income-provisions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProvision),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create income provision');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-provisions'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to add income provision:', error);
      setIsUpdating(false);
    }
  });

  // Update provision mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<IncomeProvision> }) => {
      const response = await fetch(`/api/income-provisions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update income provision');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-provisions'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to update income provision:', error);
      setIsUpdating(false);
    }
  });

  // Delete provision mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/income-provisions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete income provision');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-provisions'] });
    }
  });

  // Filter provisions based on search term
  const filteredProvisions = useMemo(() => {
    if (!searchTerm.trim()) return provisions;
    
    const lowerQuery = searchTerm.toLowerCase();
    return provisions.filter(provision => 
      provision.description.toLowerCase().includes(lowerQuery) ||
      provision.entity.toLowerCase().includes(lowerQuery)
    );
  }, [provisions, searchTerm]);

  // Calculate totals
  const totals = useMemo(() => {
    const capitalisedAmount = filteredProvisions.reduce((sum: number, provision: IncomeProvision) => {
      const value = parseFloat(provision.capitalisedAmount.replace(/[^\d.-]/g, '')) || 0;
      return sum + value;
    }, 0);

    // Calculate capital shortfall (same as capitalised amount for this example)
    const capitalShortfall = capitalisedAmount;

    return {
      count: filteredProvisions.length,
      capitalisedAmount,
      capitalShortfall,
    };
  }, [filteredProvisions]);

  const handleAddProvision = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  const handleUpdateProvision = useCallback((id: number, field: keyof IncomeProvision, value: string | boolean) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof IncomeProvision, value: string) => {
    const formattedValue = formatCurrencyValue(value, field);
    handleUpdateProvision(id, field, formattedValue);
    
    // Update DOM element directly for immediate visual feedback
    const target = document.activeElement as HTMLInputElement;
    if (target && formattedValue !== value) {
      setTimeout(() => {
        target.value = formattedValue;
      }, 0);
    }
  }, [handleUpdateProvision]);

  const handleDeleteProvision = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this income provision?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading income provisions...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading income provisions. Please try again.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Search Controls */}
      <div className="flex justify-start items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search income provisions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Summary Section */}
      {filteredProvisions.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-[#E0F2FE] px-4 py-3 border-b border-neutral-200">
            <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">Summary</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-neutral-50 p-3 rounded-lg">
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Number of Income Provisions</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {totals.count}
                </p>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg">
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Total Capitalised Amount</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {formatCurrencyValue(totals.capitalisedAmount.toString(), 'capitalisedAmount')}
                </p>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg">
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Total Capital Required for Shortfall</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {formatCurrencyValue(totals.capitalShortfall.toString(), 'capitalShortfall')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Income Button */}
      <div className="flex justify-start mb-4">
        <button
          onClick={handleAddProvision}
          disabled={addMutation.isPending}
          className="bg-[#016991] text-white px-4 py-2 rounded-lg hover:bg-[#014d6b] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Income
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-neutral-200 rounded-lg shadow-sm">
          <thead>
            <tr className="bg-[#E0F2FE] border-b border-neutral-200">
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Description</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Entity</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Start</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Term (Years)</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Increase %</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">CPI</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Frequency (Every)</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Amount</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Taxable %</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Tax %</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Capitalised Amount</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {filteredProvisions.map((provision: IncomeProvision) => (
              <tr key={provision.id} className="hover:bg-neutral-50">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    defaultValue={provision.description}
                    onBlur={(e) => handleUpdateProvision(provision.id, 'description', e.target.value)}
                    className="table-input w-full px-2 py-1 text-sm border border-neutral-300 rounded bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={provision.entity}
                    onChange={(e) => handleUpdateProvision(provision.id, 'entity', e.target.value)}
                    className="table-input w-full px-2 py-1 text-sm border border-neutral-300 rounded bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isUpdating}
                  >
                    {ENTITY_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    defaultValue={provision.start}
                    onBlur={(e) => handleInputBlur(provision.id, 'start', e.target.value)}
                    className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={provision.termEditable}
                      onChange={(e) => handleUpdateProvision(provision.id, 'termEditable', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={isUpdating}
                    />
                    <input
                      type="text"
                      defaultValue={provision.termYears}
                      onBlur={(e) => handleInputBlur(provision.id, 'termYears', e.target.value)}
                      className="table-input flex-1 px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isUpdating || !provision.termEditable}
                      style={{ backgroundColor: provision.termEditable ? '#E3F2FD' : '#F5F5F5' }}
                    />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    defaultValue={provision.increasePercentage}
                    onBlur={(e) => handleInputBlur(provision.id, 'increasePercentage', e.target.value)}
                    className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={provision.cpi}
                    onChange={(e) => handleUpdateProvision(provision.id, 'cpi', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={provision.frequency}
                    onChange={(e) => handleUpdateProvision(provision.id, 'frequency', e.target.value)}
                    className="table-input w-full px-2 py-1 text-sm border border-neutral-300 rounded bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isUpdating}
                  >
                    {FREQUENCY_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    defaultValue={provision.amount}
                    onBlur={(e) => handleInputBlur(provision.id, 'amount', e.target.value)}
                    className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    defaultValue={provision.taxablePercentage}
                    onBlur={(e) => handleInputBlur(provision.id, 'taxablePercentage', e.target.value)}
                    className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={provision.taxPercentage}
                    className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-neutral-100 cursor-not-allowed"
                    disabled
                    readOnly
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={provision.capitalisedAmount}
                    className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-neutral-100 cursor-not-allowed"
                    disabled
                    readOnly
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => handleDeleteProvision(provision.id)}
                    className="text-[#4F4F4F] hover:text-red-600 transition-colors"
                    title="Delete income provision"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            
            {/* Total Row */}
            {filteredProvisions.length > 0 && (
              <tr className="bg-neutral-100 border-t-2 border-neutral-300 font-bold">
                <td className="px-3 py-2 text-sm font-bold text-neutral-800">Total</td>
                <td colSpan={9} className="px-3 py-2"></td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                  {formatCurrencyValue(totals.capitalisedAmount.toString(), 'capitalisedAmount')}
                </td>
                <td className="px-3 py-2"></td>
              </tr>
            )}
            
            {/* Capital Shortfall Row */}
            {filteredProvisions.length > 0 && (
              <tr className="bg-neutral-100 border-t border-neutral-300 font-bold">
                <td className="px-3 py-2 text-sm font-bold text-neutral-800">Capital required to provide for income shortfall</td>
                <td colSpan={9} className="px-3 py-2"></td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                  {formatCurrencyValue(totals.capitalShortfall.toString(), 'capitalShortfall')}
                </td>
                <td className="px-3 py-2"></td>
              </tr>
            )}
            
            {filteredProvisions.length === 0 && (
              <tr>
                <td colSpan={12} className="px-3 py-8 text-center text-neutral-500">
                  {searchTerm ? "No income provisions found matching your search." : "No income provisions found. Click 'Add Income' to get started."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}