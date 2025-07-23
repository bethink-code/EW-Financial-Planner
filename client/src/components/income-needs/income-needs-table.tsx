import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Search } from "lucide-react";
import type { IncomeNeed, InsertIncomeNeed } from "@shared/schema";

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

export default function IncomeNeedsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  // Fetch income needs
  const { data: needs = [], isLoading, error } = useQuery<IncomeNeed[]>({
    queryKey: ['/api/income-needs'],
    queryFn: async () => {
      const response = await fetch('/api/income-needs');
      if (!response.ok) {
        throw new Error('Failed to fetch income needs');
      }
      return response.json();
    }
  });

  // Add new need mutation
  const addMutation = useMutation({
    mutationFn: async (): Promise<IncomeNeed> => {
      const newNeed: InsertIncomeNeed = {
        description: "",
        entity: "Donald Edwards",
        start: "0",
        termYears: "0",
        termEditable: false,
        increasePercentage: "0",
        cpi: false,
        frequency: "Monthly",
        amount: "0",
        capitalisedAmount: "0",
      };
      
      const response = await fetch('/api/income-needs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNeed),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create income need');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-needs'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to add income need:', error);
      setIsUpdating(false);
    }
  });

  // Update need mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<IncomeNeed> }) => {
      const response = await fetch(`/api/income-needs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update income need');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-needs'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to update income need:', error);
      setIsUpdating(false);
    }
  });

  // Delete need mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/income-needs/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete income need');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-needs'] });
    }
  });

  // Filter needs based on search term
  const filteredNeeds = useMemo(() => {
    if (!searchTerm.trim()) return needs;
    
    const lowerQuery = searchTerm.toLowerCase();
    return needs.filter(need => 
      need.description.toLowerCase().includes(lowerQuery) ||
      need.entity.toLowerCase().includes(lowerQuery)
    );
  }, [needs, searchTerm]);

  // Calculate totals
  const totals = useMemo(() => {
    return {
      count: filteredNeeds.length,
      capitalisedAmount: filteredNeeds.reduce((sum: number, need: IncomeNeed) => {
        const value = parseFloat(need.capitalisedAmount.replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
    };
  }, [filteredNeeds]);

  const handleAddNeed = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  const handleUpdateNeed = useCallback((id: number, field: keyof IncomeNeed, value: string | boolean) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof IncomeNeed, value: string) => {
    const formattedValue = formatCurrencyValue(value, field);
    handleUpdateNeed(id, field, formattedValue);
    
    // Update DOM element directly for immediate visual feedback
    const target = document.activeElement as HTMLInputElement;
    if (target && formattedValue !== value) {
      setTimeout(() => {
        target.value = formattedValue;
      }, 0);
    }
  }, [handleUpdateNeed]);

  const handleDeleteNeed = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this income need?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading income needs...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading income needs. Please try again.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Search Controls */}
      <div className="flex justify-start items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search income needs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Summary Section */}
      {filteredNeeds.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-primary/10 px-4 py-3 border-b border-neutral-200">
            <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">Summary</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-neutral-50 p-3 rounded-lg">
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Number of Needs</p>
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
            </div>
          </div>
        </div>
      )}
      
      {/* Add Need Button */}
      <div className="flex justify-start mb-4">
        <button
          onClick={handleAddNeed}
          disabled={addMutation.isPending}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-[#014d6b] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Need
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-neutral-200 rounded-lg shadow-sm">
          <thead>
            <tr className="bg-primary/10 border-b border-neutral-200">
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Description</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Entity</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Start</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Term (Years)</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Increase %</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">CPI</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Frequency (Every)</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Amount</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Capitalised Amount</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {filteredNeeds.map((need: IncomeNeed) => (
              <tr key={need.id} className="hover:bg-neutral-50">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    defaultValue={need.description}
                    onBlur={(e) => handleUpdateNeed(need.id, 'description', e.target.value)}
                    className="table-input w-full px-2 py-1 text-sm border border-neutral-300 rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={need.entity}
                    onChange={(e) => handleUpdateNeed(need.id, 'entity', e.target.value)}
                    className="table-input w-full px-2 py-1 text-sm border border-neutral-300 rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                    defaultValue={need.start}
                    onBlur={(e) => handleInputBlur(need.id, 'start', e.target.value)}
                    className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={need.termEditable}
                      onChange={(e) => handleUpdateNeed(need.id, 'termEditable', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-primary border-gray-300 rounded"
                      disabled={isUpdating}
                    />
                    <input
                      type="text"
                      defaultValue={need.termYears}
                      onBlur={(e) => handleInputBlur(need.id, 'termYears', e.target.value)}
                      className="table-input flex-1 px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      disabled={isUpdating || !need.termEditable}
                      style={{ backgroundColor: need.termEditable ? 'hsl(var(--primary) / 0.05)' : '#F5F5F5' }}
                    />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    defaultValue={need.increasePercentage}
                    onBlur={(e) => handleInputBlur(need.id, 'increasePercentage', e.target.value)}
                    className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={need.cpi}
                    onChange={(e) => handleUpdateNeed(need.id, 'cpi', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-primary border-gray-300 rounded"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={need.frequency}
                    onChange={(e) => handleUpdateNeed(need.id, 'frequency', e.target.value)}
                    className="table-input w-full px-2 py-1 text-sm border border-neutral-300 rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                    defaultValue={need.amount}
                    onBlur={(e) => handleInputBlur(need.id, 'amount', e.target.value)}
                    className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={need.capitalisedAmount}
                    className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-neutral-100 cursor-not-allowed"
                    disabled
                    readOnly
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => handleDeleteNeed(need.id)}
                    className="text-[#4F4F4F] hover:text-red-600 transition-colors"
                    title="Delete income need"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            
            {/* Total Row */}
            {filteredNeeds.length > 0 && (
              <tr className="bg-neutral-100 border-t-2 border-neutral-300 font-bold">
                <td className="px-3 py-2 text-sm font-bold text-neutral-800">Total</td>
                <td colSpan={7} className="px-3 py-2"></td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                  {formatCurrencyValue(totals.capitalisedAmount.toString(), 'capitalisedAmount')}
                </td>
                <td className="px-3 py-2"></td>
              </tr>
            )}
            
            {filteredNeeds.length === 0 && (
              <tr>
                <td colSpan={10} className="px-3 py-8 text-center text-neutral-500">
                  {searchTerm ? "No income needs found matching your search." : "No income needs found. Click 'Add Need' to get started."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}