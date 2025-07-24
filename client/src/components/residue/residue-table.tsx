import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { getFieldClass, getFieldWidth } from "@/lib/design-tokens";
import { formatPercentageValue, getValueClass, isDefaultValue } from "@/lib/formatting";
import { DeleteButton, DuplicateButton, ActionButtonGroup } from "@/components/ui/action-buttons";
import type { Residue, InsertResidue } from "@shared/schema";



const ENTITY_OPTIONS = [
  { value: "Donald Edwards", label: "Donald Edwards" },
  { value: "Betty Edwards", label: "Betty Edwards" },
  { value: "Both", label: "Both" },
];

export default function ResidueTable() {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  // Fetch residue items
  const { data: residueItems = [], isLoading, error } = useQuery<Residue[]>({
    queryKey: ['/api/residue'],
    queryFn: async () => {
      const response = await fetch('/api/residue');
      if (!response.ok) {
        throw new Error('Failed to fetch residue');
      }
      return response.json();
    }
  });

  // Add new entity mutation
  const addMutation = useMutation({
    mutationFn: async (): Promise<Residue> => {
      const newEntity: InsertResidue = {
        entity: "Donald Edwards",
        percentage: "0%",
        isCharityRow: false,
      };
      
      const response = await fetch('/api/residue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntity),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create residue entity');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/residue'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to add residue entity:', error);
      setIsUpdating(false);
    }
  });

  // Update entity mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Residue> }) => {
      const response = await fetch(`/api/residue/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update residue entity');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/residue'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to update residue entity:', error);
      setIsUpdating(false);
    }
  });

  // Delete entity mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/residue/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete residue entity');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/residue'] });
    }
  });

  // No filtering needed - show all items
  const filteredItems = residueItems;

  // Separate regular entities from charity row
  const { regularEntities, charityRow } = useMemo(() => {
    const regular = residueItems.filter(item => !item.isCharityRow);
    const charity = residueItems.find(item => item.isCharityRow);
    return { regularEntities: regular, charityRow: charity };
  }, [residueItems]);

  // Calculate totals
  const totals = useMemo(() => {
    const entityTotal = regularEntities.reduce((sum: number, item: Residue) => {
      const value = parseFloat(item.percentage.replace(/[^\d.-]/g, '')) || 0;
      return sum + value;
    }, 0);

    const charityPercentage = charityRow ? parseFloat(charityRow.percentage.replace(/[^\d.-]/g, '')) || 0 : 0;

    return {
      count: regularEntities.length,
      entityTotal,
      charityPercentage,
      grandTotal: entityTotal + charityPercentage,
    };
  }, [regularEntities, charityRow]);

  const handleAddEntity = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  const handleUpdateEntity = useCallback((id: number, field: keyof Residue, value: string | boolean) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof Residue, value: string) => {
    const formattedValue = field === 'percentage' ? formatPercentageValue(value) : value;
    handleUpdateEntity(id, field, formattedValue);
    
    // Update DOM element directly for immediate visual feedback
    const target = document.activeElement as HTMLInputElement;
    if (target && formattedValue !== value) {
      setTimeout(() => {
        target.value = formattedValue;
      }, 0);
    }
  }, [handleUpdateEntity]);

  const handleDeleteEntity = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this entity?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const handleDuplicateEntity = useCallback((entity: Residue) => {
    const duplicatedEntity: InsertResidue = {
      entity: entity.entity,
      percentage: entity.percentage,
      isCharityRow: entity.isCharityRow,
    };
    addMutation.mutate();
  }, [addMutation]);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading residue...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading residue. Please try again.</div>;
  }

  return (
    <div className="">
      {/* Table */}
      <table className="bg-white rounded-lg shadow-sm border border-neutral-200" className="min-w-full  border border-neutral-200 ">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider w-16">Actions</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Entity</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Percentage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {/* Regular Entity Rows */}
            {regularEntities.map((item: Residue) => (
              <tr key={item.id} className="">
                <td className="table-actions-cell text-center">
                  <ActionButtonGroup>
                    <DuplicateButton
                      onClick={() => handleDuplicateEntity(item)}
                      disabled={isUpdating}
                    />
                    <DeleteButton
                      onClick={() => handleDeleteEntity(item.id)}
                    />
                  </ActionButtonGroup>
                </td>
                <td className="px-3 py-2">
                  <select
                    value={item.entity}
                    onChange={(e) => handleUpdateEntity(item.id, 'entity', e.target.value)}
                    className={getFieldClass('name')}
                    style={getFieldWidth('name')}
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
                    defaultValue={item.percentage}
                    onBlur={(e) => handleInputBlur(item.id, 'percentage', e.target.value)}
                    className={getFieldClass('percentage')}
                    style={getFieldWidth('percentage')}
                    disabled={isUpdating}
                  />
                </td>
              </tr>
            ))}
            
            {/* Charity Row */}
            {charityRow && (
              <tr className="bg-neutral-50 border-t-2 border-neutral-300">
                <td className="px-3 py-2 text-center">
                  {/* No delete button for charity row */}
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value="Residue to registered charities"
                    className={getFieldClass('name')}
                    style={{...getFieldWidth('name'), backgroundColor: '#F5F5F5', cursor: 'not-allowed'}}
                    disabled
                    readOnly
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    defaultValue={charityRow.percentage}
                    onBlur={(e) => handleInputBlur(charityRow.id, 'percentage', e.target.value)}
                    className={getFieldClass('percentage')}
                    style={getFieldWidth('percentage')}
                    disabled={isUpdating}
                  />
                </td>
              </tr>
            )}
            
            {/* Total Row */}
            {residueItems.length > 0 && (
              <tr className="border-t-2 border-neutral-300 font-bold">
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-800">Total</td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                  {totals.grandTotal}%
                </td>
              </tr>
            )}
            
            {residueItems.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-8 text-center text-neutral-500">
                  No entities found. Add new entities using the header button.
                </td>
              </tr>
            )}
          </tbody>
      </table>
    </div>
  );
}