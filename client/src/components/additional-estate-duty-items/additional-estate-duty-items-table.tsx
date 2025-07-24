import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { getFieldClass, getFieldWidth } from "@/lib/design-tokens";
import { formatCurrencyValue, getValueClass, isDefaultValue } from "@/lib/formatting";
import type { AdditionalEstateDutyItem, InsertAdditionalEstateDutyItem } from "@shared/schema";



export default function AdditionalEstateDutyItemsTable() {
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

  // No filtering needed - show all items
  const filteredItems = items;

  // Calculate totals
  const totals = useMemo(() => {
    return {
      count: items.length,
    };
  }, [items]);

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
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-neutral-200 rounded-lg shadow-sm">
          <thead>
            <tr className="bg-primary/10 border-b border-neutral-200">
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider w-16">Actions</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Description</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Amount</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Deduction?</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Exclude from joint estate for 'In community'?</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {items.map((item: AdditionalEstateDutyItem) => (
              <tr key={item.id} className="hover:bg-neutral-50">
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-[#4F4F4F] hover:text-red-600 transition-colors"
                    title="Delete estate duty item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
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
                    defaultValue={formatCurrencyValue(item.amount)}
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
              </tr>
            ))}
            
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-neutral-500">
                  No estate duty items found. Add new items using the header button.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}