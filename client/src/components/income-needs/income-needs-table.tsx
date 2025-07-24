import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { getFieldClass, getFieldWidth } from "@/lib/design-tokens";
import { formatCurrencyValue, formatPercentageValue, formatYearsValue, getValueClass, isDefaultValue } from "@/lib/formatting";
import { DeleteButton, DuplicateButton, ActionButtonGroup } from "@/components/ui/action-buttons";
import type { IncomeNeed, InsertIncomeNeed } from "@shared/schema";



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
        start: "0 years",
        termYears: "0 years",
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

  // No filtering needed - show all needs
  const filteredNeeds = needs;

  // Calculate totals
  const totals = useMemo(() => {
    return {
      count: needs.length,
      capitalisedAmount: needs.reduce((sum: number, need: IncomeNeed) => {
        const value = parseFloat(need.capitalisedAmount.replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
    };
  }, [needs]);

  const handleAddNeed = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  const handleUpdateNeed = useCallback((id: number, field: keyof IncomeNeed, value: string | boolean) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof IncomeNeed, value: string) => {
    // Map field names to field types for proper formatting
    const fieldTypeMap: Record<string, string> = {
      'start': 'years',
      'termYears': 'years', 
      'increasePercentage': 'percentage',
      'amount': 'currency',
      'capitalisedAmount': 'currency'
    };
    
    const fieldType = fieldTypeMap[field] || field;
    const formattedValue = formatCurrencyValue(value, fieldType);
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

  const handleDuplicateNeed = useCallback((need: IncomeNeed) => {
    const duplicatedNeed: InsertIncomeNeed = {
      description: need.description,
      entity: need.entity,
      start: need.start,
      termYears: need.termYears,
      termEditable: need.termEditable,
      increasePercentage: need.increasePercentage,
      cpi: need.cpi,
      frequency: need.frequency,
      amount: need.amount,
      capitalisedAmount: need.capitalisedAmount,
    };
    addMutation.mutate(duplicatedNeed);
  }, [addMutation]);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading income needs...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading income needs. Please try again.</div>;
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
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Entity</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Start</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Term (Years)</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Increase %</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">CPI</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Frequency (Every)</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Amount</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Capitalised Amount</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {needs.map((need: IncomeNeed) => (
              <tr key={need.id} className="hover:bg-neutral-50">
                <td className="px-3 py-2 text-center">
                  <ActionButtonGroup>
                    <DuplicateButton
                      onClick={() => handleDuplicateNeed(need)}
                      disabled={isUpdating}
                    />
                    <DeleteButton
                      onClick={() => handleDeleteNeed(need.id)}
                    />
                  </ActionButtonGroup>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    defaultValue={need.description}
                    onBlur={(e) => handleUpdateNeed(need.id, 'description', e.target.value)}
                    className={`${getFieldClass('description')} ${getValueClass(need.description, 'text')}`}
                    style={getFieldWidth('description')}
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={need.entity}
                    onChange={(e) => handleUpdateNeed(need.id, 'entity', e.target.value)}
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
                    key={`start-${need.id}-${need.start}`}
                    type="text"
                    defaultValue={need.start.includes('years') ? need.start : `${need.start} years`}
                    onBlur={(e) => handleInputBlur(need.id, 'start', e.target.value)}
                    className={getFieldClass('years')}
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
                      key={`termYears-${need.id}-${need.termYears}`}
                      type="text"
                      defaultValue={need.termYears.includes('years') ? need.termYears : `${need.termYears} years`}
                      onBlur={(e) => handleInputBlur(need.id, 'termYears', e.target.value)}
                      className={getFieldClass('years')}
                      style={{backgroundColor: need.termEditable ? 'hsl(var(--primary) / 0.05)' : '#F5F5F5'}}
                      disabled={isUpdating || !need.termEditable}
                    />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    defaultValue={need.increasePercentage}
                    onBlur={(e) => handleInputBlur(need.id, 'increasePercentage', e.target.value)}
                    className={getFieldClass('percentage')}
                    style={getFieldWidth('percentage')}
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
                    className={getFieldClass('name')}
                    style={getFieldWidth('name')}
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
                    key={`amount-${need.id}-${need.amount}`}
                    type="text"
                    defaultValue={formatCurrencyValue(need.amount, 'amount')}
                    onBlur={(e) => handleInputBlur(need.id, 'amount', e.target.value)}
                    className={getFieldClass('amount')}
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={need.capitalisedAmount}
                    className={getFieldClass('amount')}
                    disabled
                    readOnly
                  />
                </td>
              </tr>
            ))}
            
            {/* Total Row */}
            {needs.length > 0 && (
              <tr className="bg-neutral-100 border-t-2 border-neutral-300 font-bold">
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-800">Total</td>
                <td colSpan={7} className="px-3 py-2"></td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                  {formatCurrencyValue(totals.capitalisedAmount.toString(), 'capitalisedAmount')}
                </td>
              </tr>
            )}
            
            {needs.length === 0 && (
              <tr>
                <td colSpan={10} className="px-3 py-8 text-center text-neutral-500">
                  No income needs found. Add new needs using the header button.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}