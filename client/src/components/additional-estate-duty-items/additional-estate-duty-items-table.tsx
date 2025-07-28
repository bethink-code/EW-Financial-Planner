import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { getFieldClass, getFieldWidth } from "@/lib/design-tokens";
import { getCellClass } from "@/lib/field-types";
import { formatCurrencyValue, getValueClass, isDefaultValue } from "@/lib/formatting";
import { AddButton, DeleteButton, DuplicateButton, ActionButtonGroup } from "@/components/ui/action-buttons";
import type { AdditionalEstateDutyItems, InsertAdditionalEstateDutyItems } from "@shared/schema";

export default function AdditionalEstateDutyItemsTable() {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  // Fetch additional estate duty items
  const { data: items = [], isLoading, error } = useQuery<AdditionalEstateDutyItems[]>({
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
    mutationFn: async (): Promise<AdditionalEstateDutyItems> => {
      const newItem: InsertAdditionalEstateDutyItems = {
        description: "Enter details ...",
        amount: "R 0",
        increasePercentage: "0%",
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
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<AdditionalEstateDutyItems> }) => {
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

  const handleUpdateItem = useCallback((id: number, field: keyof AdditionalEstateDutyItems, value: string | boolean) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof AdditionalEstateDutyItems, value: string) => {
    const formattedValue = field === 'amount' ? formatCurrencyValue(value) : field === 'increasePercentage' ? value + '%' : value;
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

  const handleDuplicateItem = useCallback((item: AdditionalEstateDutyItems) => {
    const duplicatedItem: InsertAdditionalEstateDutyItems = {
      description: item.description,
      amount: item.amount,
      increasePercentage: item.increasePercentage,
    };
    addMutation.mutate();
  }, [addMutation]);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading additional estate duty items...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading additional estate duty items. Please try again.</div>;
  }

  return (
    <div>
      {/* Table */}
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider w-16">
              <AddButton onClick={handleAddItem} disabled={isUpdating} />
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Description</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Amount</th>
            <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Increase %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {items.map((item: AdditionalEstateDutyItems) => (
            <tr key={item.id}>
              <td className="table-actions-cell text-center">
                <ActionButtonGroup>
                  <DuplicateButton onClick={() => handleDuplicateItem(item)} disabled={isUpdating} />
                  <DeleteButton onClick={() => handleDeleteItem(item.id)} />
                </ActionButtonGroup>
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
              <td className="px-3 py-2">
                <input
                  key={`increasePercentage-${item.id}-${item.increasePercentage}`}
                  type="text"
                  defaultValue={item.increasePercentage}
                  onBlur={(e) => handleInputBlur(item.id, 'increasePercentage', e.target.value)}
                  className={getFieldClass('percentage')}
                  disabled={isUpdating}
                />
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={4} className="px-3 py-8 text-center text-neutral-500">
                No estate duty items found. Add new items using the header button.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}