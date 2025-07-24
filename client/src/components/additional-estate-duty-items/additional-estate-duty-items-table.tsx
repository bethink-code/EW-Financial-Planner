import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Search } from "lucide-react";
import { getFieldClass, getFieldWidth } from "@/lib/design-tokens";
import type { AdditionalEstateDutyItem, InsertAdditionalEstateDutyItem } from "@shared/schema";

// Utility function for formatting currency values
const formatCurrencyValue = (value: string): string => {
  if (!value || value.trim() === '') return value;
  
  // Remove existing formatting
  const cleanValue = value.replace(/[^\d.-]/g, '');
  if (!cleanValue || isNaN(parseFloat(cleanValue))) return value;
  
  const numValue = parseFloat(cleanValue);
  
  // Currency formatting
  if (numValue === 0) return 'R 0';
  
  // Format with thousands separators
  const formatted = new Intl.NumberFormat('en-ZA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(numValue));
  
  return `R ${formatted}`;
};

export default function AdditionalEstateDutyItemsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  // Fetch additional estate duty items
  const { data: items = [], isLoading, error } = useQuery<AdditionalEstateDutyItem[]>({
    queryKey: ['/api/additional-estate-duty-items'],
    queryFn: async () => {
      const response = await fetch('/api/additional-estate-duty-items');
      if (!response.ok) {
        throw new Error('Failed to fetch additional estate duty items');
      }
      return response.json();
    }
  });

  // Add new item mutation
  const addMutation = useMutation({
    mutationFn: async (): Promise<AdditionalEstateDutyItem> => {
      const newItem: InsertAdditionalEstateDutyItem = {
        description: "",
        amount: "0",
        isDeduction: false,
        excludeFromJointEstate: false,
      };
      
      const response = await fetch('/api/additional-estate-duty-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create additional estate duty item');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/additional-estate-duty-items'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to add additional estate duty item:', error);
      setIsUpdating(false);
    }
  });

  // Update item mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<AdditionalEstateDutyItem> }) => {
      const response = await fetch(`/api/additional-estate-duty-items/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update additional estate duty item');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/additional-estate-duty-items'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to update additional estate duty item:', error);
      setIsUpdating(false);
    }
  });

  // Delete item mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/additional-estate-duty-items/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete additional estate duty item');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/additional-estate-duty-items'] });
    }
  });

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    
    const lowerQuery = searchTerm.toLowerCase();
    return items.filter(item => 
      item.description.toLowerCase().includes(lowerQuery)
    );
  }, [items, searchTerm]);

  // Calculate totals
  const totals = useMemo(() => {
    return {
      count: filteredItems.length,
    };
  }, [filteredItems]);

  const handleAddItem = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  const handleUpdateItem = useCallback((id: number, field: keyof AdditionalEstateDutyItem, value: string | boolean) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof AdditionalEstateDutyItem, value: string) => {
    const formattedValue = field === 'amount' ? formatCurrencyValue(value) : value;
    handleUpdateItem(id, field, formattedValue);
    
    // Update DOM element directly for immediate visual feedback
    const target = document.activeElement as HTMLInputElement;
    if (target && formattedValue !== value) {
      setTimeout(() => {
        target.value = formattedValue;
      }, 0);
    }
  }, [handleUpdateItem]);

  const handleDeleteItem = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this estate duty item?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading additional estate duty items...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading additional estate duty items. Please try again.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Search Controls */}
      <div className="flex justify-start items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search estate duty items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Summary Section */}
      {filteredItems.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-primary/10 px-4 py-3 border-b border-neutral-200">
            <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">Summary</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-neutral-50 p-3 rounded-lg">
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Number of Estate Duty Items</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {totals.count}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Estate Duty Item Button */}
      <div className="flex justify-start mb-4">
        <button
          onClick={handleAddItem}
          disabled={addMutation.isPending}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-[#014d6b] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Estate Duty Item
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-neutral-200 rounded-lg shadow-sm">
          <thead>
            <tr className="bg-primary/10 border-b border-neutral-200">
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Description</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Amount</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Deduction?</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Exclude from joint estate for 'In community'?</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {filteredItems.map((item: AdditionalEstateDutyItem) => (
              <tr key={item.id} className="hover:bg-neutral-50">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    defaultValue={item.description}
                    onBlur={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                    className={getFieldClass('description')}
                    
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    key={`amount-${item.id}-${item.amount}`}
                    type="text"
                    defaultValue={item.amount}
                    onBlur={(e) => handleInputBlur(item.id, 'amount', e.target.value)}
                    className={getFieldClass('amount')}
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={item.isDeduction}
                    onChange={(e) => handleUpdateItem(item.id, 'isDeduction', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-primary border-gray-300 rounded"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={item.excludeFromJointEstate}
                    onChange={(e) => handleUpdateItem(item.id, 'excludeFromJointEstate', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-primary border-gray-300 rounded"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-[#4F4F4F] hover:text-red-600 transition-colors"
                    title="Delete estate duty item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-neutral-500">
                  {searchTerm ? "No estate duty items found matching your search." : "No estate duty items found. Click 'Add Estate Duty Item' to get started."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}