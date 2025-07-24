import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { getFieldClass, getFieldWidth } from "@/lib/design-tokens";
import { formatCurrencyValue, formatPercentageValue, formatYearsValue, getValueClass, isDefaultValue, handleDefaultValueFocus } from "@/lib/formatting";
import type { IncomeProvision, InsertIncomeProvision } from "@shared/schema";

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
        start: "0 years",
        termYears: "0 years",
        termEditable: false,
        increasePercentage: "0%",
        cpi: false,
        frequency: "Monthly",
        amount: "0",
        taxablePercentage: "0%",
        taxPercentage: "0%",
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

  // No filtering needed - show all provisions
  const filteredProvisions = provisions;

  // Calculate totals
  const totals = useMemo(() => {
    const capitalisedAmount = provisions.reduce((sum: number, provision: IncomeProvision) => {
      const value = parseFloat(provision.capitalisedAmount.replace(/[^\d.-]/g, '')) || 0;
      return sum + value;
    }, 0);

    // Calculate capital shortfall (same as capitalised amount for this example)
    const capitalShortfall = capitalisedAmount;

    return {
      count: provisions.length,
      capitalisedAmount,
      capitalShortfall,
    };
  }, [provisions]);

  const handleAddProvision = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  const handleUpdateProvision = useCallback((id: number, field: keyof IncomeProvision, value: string | boolean) => {
    setIsUpdating(true);
    const updates = { [field]: value };
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  const handleInputBlur = useCallback((id: number, field: keyof IncomeProvision, value: string) => {
    // Determine field type and format accordingly
    let formattedValue: string;
    if (field === 'start' || field === 'termYears') {
      formattedValue = formatYearsValue(value);
    } else if (field === 'increasePercentage' || field === 'taxablePercentage' || field === 'taxPercentage') {
      formattedValue = formatPercentageValue(value);
    } else {
      formattedValue = formatCurrencyValue(value);
    }
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
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Taxable %</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Tax %</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Capitalised Amount</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-neutral-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {provisions.map((provision: IncomeProvision) => (
              <tr key={provision.id} className="hover:bg-neutral-50">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    defaultValue={provision.description}
                    onBlur={(e) => handleUpdateProvision(provision.id, 'description', e.target.value)}
                    className={getFieldClass('description')}
                    style={getFieldWidth('description')}
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={provision.entity}
                    onChange={(e) => handleUpdateProvision(provision.id, 'entity', e.target.value)}
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
                    key={`start-${provision.id}-${provision.start}`}
                    type="text"
                    defaultValue={provision.start.includes('years') ? provision.start : `${provision.start} years`}
                    onBlur={(e) => handleInputBlur(provision.id, 'start', e.target.value)}
                    className={getFieldClass('years')}
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={provision.termEditable}
                      onChange={(e) => handleUpdateProvision(provision.id, 'termEditable', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-primary border-gray-300 rounded"
                      disabled={isUpdating}
                    />
                    <input
                      key={`termYears-${provision.id}-${provision.termYears}`}
                      type="text"
                      defaultValue={provision.termYears.includes('years') ? provision.termYears : `${provision.termYears} years`}
                      onBlur={(e) => handleInputBlur(provision.id, 'termYears', e.target.value)}
                      className={getFieldClass('years')}
                      style={{backgroundColor: provision.termEditable ? 'hsl(var(--primary) / 0.05)' : '#F5F5F5'}}
                      disabled={isUpdating || !provision.termEditable}
                    />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    defaultValue={provision.increasePercentage || "0%"}
                    onFocus={handleDefaultValueFocus}
                    onBlur={(e) => {
                      const formattedValue = formatPercentageValue(e.target.value);
                      if (formattedValue !== e.target.value) {
                        e.target.value = formattedValue;
                      }
                      handleInputBlur(provision.id, 'increasePercentage', e.target.value);
                    }}
                    className={`${getFieldClass('percentage')} ${getValueClass(provision.increasePercentage || "0%", 'percentage')}`}
                    style={getFieldWidth('percentage')}
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={provision.cpi}
                    onChange={(e) => handleUpdateProvision(provision.id, 'cpi', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-primary border-gray-300 rounded"
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={provision.frequency}
                    onChange={(e) => handleUpdateProvision(provision.id, 'frequency', e.target.value)}
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
                    key={`amount-${provision.id}-${provision.amount}`}
                    type="text"
                    defaultValue={formatCurrencyValue(provision.amount)}
                    onBlur={(e) => handleInputBlur(provision.id, 'amount', e.target.value)}
                    className={getFieldClass('amount')}
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    defaultValue={provision.taxablePercentage || "0%"}
                    onFocus={handleDefaultValueFocus}
                    onBlur={(e) => {
                      const formattedValue = formatPercentageValue(e.target.value);
                      if (formattedValue !== e.target.value) {
                        e.target.value = formattedValue;
                      }
                      handleInputBlur(provision.id, 'taxablePercentage', e.target.value);
                    }}
                    className={`${getFieldClass('percentage')} ${getValueClass(provision.taxablePercentage || "0%", 'percentage')}`}
                    style={getFieldWidth('percentage')}
                    disabled={isUpdating}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={provision.taxPercentage}
                    className={getFieldClass('percentage')}
                    style={{backgroundColor: '#F5F5F5', cursor: 'not-allowed'}}
                    disabled
                    readOnly
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={provision.capitalisedAmount}
                    className={getFieldClass('amount')}
                    style={{backgroundColor: '#F5F5F5', cursor: 'not-allowed'}}
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
            {provisions.length > 0 && (
              <tr className="bg-neutral-100 border-t-2 border-neutral-300 font-bold">
                <td className="px-3 py-2 text-sm font-bold text-neutral-800">Total</td>
                <td colSpan={9} className="px-3 py-2"></td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                  {formatCurrencyValue(totals.capitalisedAmount.toString())}
                </td>
                <td className="px-3 py-2"></td>
              </tr>
            )}
            
            {/* Capital Shortfall Row */}
            {provisions.length > 0 && (
              <tr className="bg-neutral-100 border-t border-neutral-300 font-bold">
                <td className="px-3 py-2 text-sm font-bold text-neutral-800">Capital required to provide for income shortfall</td>
                <td colSpan={9} className="px-3 py-2"></td>
                <td className="px-3 py-2 text-sm font-bold text-neutral-800 text-right">
                  {formatCurrencyValue(totals.capitalShortfall.toString())}
                </td>
                <td className="px-3 py-2"></td>
              </tr>
            )}
            
            {provisions.length === 0 && (
              <tr>
                <td colSpan={12} className="px-3 py-8 text-center text-neutral-500">
                  No income provisions found. Add new provisions using the header button.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}