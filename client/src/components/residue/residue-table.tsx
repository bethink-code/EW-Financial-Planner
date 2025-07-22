import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Search } from "lucide-react";
import type { Residue, InsertResidue } from "@shared/schema";

// Utility function for formatting percentage values
const formatPercentageValue = (value: string): string => {
  if (!value || value.trim() === '') return value;
  
  // Remove existing formatting
  const cleanValue = value.replace(/[^\d.-]/g, '');
  if (!cleanValue || isNaN(parseFloat(cleanValue))) return value;
  
  const numValue = parseFloat(cleanValue);
  return `${numValue}%`;
};

const ENTITY_OPTIONS = [
  { value: "Donald Edwards", label: "Donald Edwards" },
  { value: "Betty Edwards", label: "Betty Edwards" },
  { value: "Both", label: "Both" },
];

export default function ResidueTable() {
  const [searchTerm, setSearchTerm] = useState("");
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

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return residueItems;
    
    const lowerQuery = searchTerm.toLowerCase();
    return residueItems.filter(item => 
      item.entity.toLowerCase().includes(lowerQuery)
    );
  }, [residueItems, searchTerm]);

  // Separate regular entities from charity row
  const { regularEntities, charityRow } = useMemo(() => {
    const regular = filteredItems.filter(item => !item.isCharityRow);
    const charity = filteredItems.find(item => item.isCharityRow);
    return { regularEntities: regular, charityRow: charity };
  }, [filteredItems]);

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

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading residue...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading residue. Please try again.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Search Controls */}
      <div className="flex justify-start items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search entities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Summary Section */}
      {filteredItems.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-[#E0F2FE] px-4 py-3 border-b border-neutral-200">
            <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">Summary</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-neutral-50 p-3 rounded-lg">
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Number of Entities</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {totals.count}
                </p>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg">
                <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Residue to Registered Charities</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {totals.charityPercentage}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Entity Button */}
      <div className="flex justify-start mb-4">
        <button
          onClick={handleAddEntity}
          disabled={addMutation.isPending}
          className="bg-[#016991] text-white px-4 py-2 rounded-lg hover:bg-[#014d6b] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Entity
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-neutral-200 rounded-lg shadow-sm">
          <thead>
            <tr className="bg-[#E0F2FE] border-b border-neutral-200">
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Entity</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Percentage</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {/* Regular Entity Rows */}
            {regularEntities.map((item: Residue) => (
              <tr key={item.id} className="hover:bg-neutral-50">
                <td className="px-3 py-2">
                  <select
                    value={item.entity}
                    onChange={(e) => handleUpdateEntity(item.id, 'entity', e.target.value)}
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
                    defaultValue={item.percentage}
                    onBlur={(e) => handleInputBlur(item.id, 'percentage', e.target.value)}
                    className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => handleDeleteEntity(item.id)}
                    className="text-[#4F4F4F] hover:text-red-600 transition-colors"
                    title="Delete entity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            
            {/* Charity Row */}
            {charityRow && (
              <tr className="bg-neutral-50 border-t-2 border-neutral-300">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value="Residue to registered charities"
                    className="table-input w-full px-2 py-1 text-sm border border-neutral-300 rounded bg-neutral-100 cursor-not-allowed font-medium"
                    disabled
                    readOnly
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    defaultValue={charityRow.percentage}
                    onBlur={(e) => handleInputBlur(charityRow.id, 'percentage', e.target.value)}
                    className="table-input w-full px-2 py-1 text-sm text-right border border-neutral-300 rounded bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  {/* No delete button for charity row */}
                </td>
              </tr>
            )}
            
            {/* Total Row */}
            {filteredItems.length > 0 && (
              <tr className="bg-neutral-100 border-t-2 border-neutral-300 font-bold">
                <td className="px-3 py-2 text-sm font-bold text-neutral-800">Total</td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                  {totals.grandTotal}%
                </td>
                <td className="px-3 py-2"></td>
              </tr>
            )}
            
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-8 text-center text-neutral-500">
                  {searchTerm ? "No entities found matching your search." : "No entities found. Click 'Add Entity' to get started."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}