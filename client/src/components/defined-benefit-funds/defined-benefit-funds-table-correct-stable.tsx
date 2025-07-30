import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AddButton, DeleteButton, DuplicateButton, ActionButtonGroup } from "@/components/ui/action-buttons";
import { getFieldClass } from "@/lib/design-tokens";
import { getCellClass } from "@/lib/field-types";
import { formatCurrencyValue, formatPercentageValue, formatYearsValue, formatTextValue, getValueClass, isDefaultValue, handleDefaultValueFocus } from "@/lib/formatting";
import { useDebouncedUpdate } from "@/hooks/use-debounced-update";
import { SafeFragment } from "@/lib/safe-fragment";
import type { DefinedBenefitFund, InsertDefinedBenefitFund } from "@shared/schema";

export default function DefinedBenefitFundsTable() {
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
        owners: ["Donald Edwards"],
        ownershipPercentages: ["100%"],
        yearsOfService: "0 years",
        finalMonthlySalary: "R 0",
        deathLumpSum: "R 0",
        additionalTaxFreeAmount: "R 0",
        pensionIncomeAmount: "R 0",
        pensionIncomeIncrease: "0%",
      };
      
      const response = await fetch('/api/defined-benefit-funds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFund),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create fund');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/defined-benefit-funds'] });
    },
    onError: (error) => {
      console.error('Failed to add fund:', error);
    }
  });

  // Update fund mutation - unified approach for all updates
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<DefinedBenefitFund> }) => {
      const response = await fetch(`/api/defined-benefit-funds/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update fund');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/defined-benefit-funds'] });
    },
    onError: (error) => {
      console.error('Failed to update fund:', error);
    }
  });

  // Delete fund mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/defined-benefit-funds/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete fund');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/defined-benefit-funds'] });
    }
  });

  // Calculate totals
  const totals = useMemo(() => {
    return {
      finalMonthlySalary: funds.reduce((sum: number, fund: DefinedBenefitFund) => {
        const value = parseFloat((fund.finalMonthlySalary || '0').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      deathLumpSum: funds.reduce((sum: number, fund: DefinedBenefitFund) => {
        const value = parseFloat((fund.deathLumpSum || '0').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      additionalTaxFreeAmount: funds.reduce((sum: number, fund: DefinedBenefitFund) => {
        const value = parseFloat((fund.additionalTaxFreeAmount || '0').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0),
      pensionIncomeAmount: funds.reduce((sum: number, fund: DefinedBenefitFund) => {
        const value = parseFloat((fund.pensionIncomeAmount || '0').replace(/[^\d.-]/g, '')) || 0;
        return sum + value;
      }, 0)
    };
  }, [funds]);

  // Unified update handler for all fund updates
  const handleUpdateFund = useCallback((id: number, updates: Partial<DefinedBenefitFund>) => {
    updateMutation.mutate({ id, updates });
  }, [updateMutation]);

  // Debounced update for text fields to prevent jumping
  const debouncedUpdateFund = useDebouncedUpdate(handleUpdateFund, 300);

  // Owner management functions
  const handleAddOwner = useCallback((fundId: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    const newOwners = [...fund.owners, "Donald Edwards"];
    const newPercentages = [...fund.ownershipPercentages, "0%"];
    
    handleUpdateFund(fundId, { 
      owners: newOwners,
      ownershipPercentages: newPercentages
    });
  }, [funds, handleUpdateFund]);

  const handleRemoveOwner = useCallback((fundId: number, ownerIndex: number) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund || fund.owners.length <= 1) return; // Keep at least one owner
    
    const newOwners = [...fund.owners];
    const newPercentages = [...fund.ownershipPercentages];
    
    newOwners.splice(ownerIndex, 1);
    newPercentages.splice(ownerIndex, 1);
    
    handleUpdateFund(fundId, { 
      owners: newOwners,
      ownershipPercentages: newPercentages
    });
  }, [funds, handleUpdateFund]);

  const handleOwnerUpdate = useCallback((fundId: number, ownerIndex: number, field: 'name' | 'percentage', value: string) => {
    const fund = funds.find(f => f.id === fundId);
    if (!fund) return;
    
    if (field === 'name') {
      const newOwners = [...fund.owners];
      newOwners[ownerIndex] = value;
      handleUpdateFund(fundId, { owners: newOwners });
    } else if (field === 'percentage') {
      const formattedValue = formatPercentageValue(value);
      const newPercentages = [...fund.ownershipPercentages];
      newPercentages[ownerIndex] = formattedValue;
      handleUpdateFund(fundId, { ownershipPercentages: newPercentages });
    }
  }, [funds, handleUpdateFund]);

  const handleInputBlur = useCallback((id: number, field: keyof DefinedBenefitFund, value: string, target?: HTMLInputElement) => {
    // Map field names to field types for proper formatting
    const fieldTypeMap: Record<string, string> = {
      'yearsOfService': 'years',
      'pensionIncomeIncrease': 'percentage',
      'finalMonthlySalary': 'currency',
      'deathLumpSum': 'currency',
      'additionalTaxFreeAmount': 'currency',
      'pensionIncomeAmount': 'currency'
    };
    
    const fieldType = fieldTypeMap[field] || field;
    const formattedValue = fieldType === 'percentage' ? formatPercentageValue(value) : 
                          fieldType === 'years' ? formatYearsValue(value) : 
                          fieldType === 'currency' ? formatCurrencyValue(value) : 
                          value;

    // Use debounced update for text fields, immediate for currency/percentage
    if (field === 'description') {
      debouncedUpdateFund(id, { [field]: formattedValue });
    } else {
      handleUpdateFund(id, { [field]: formattedValue });
    }

    // Update the input field with formatted value if it changed
    if (target && formattedValue !== value) {
      setTimeout(() => {
        target.value = formattedValue;
      }, 0);
    }
  }, [debouncedUpdateFund, handleUpdateFund]);

  const handleDeleteFund = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this fund?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const handleDuplicateFund = useCallback((fund: DefinedBenefitFund) => {
    
    const duplicatedFund: InsertDefinedBenefitFund = {
      description: fund.description,
      owners: [...fund.owners],
      ownershipPercentages: [...fund.ownershipPercentages],
      yearsOfService: fund.yearsOfService,
      finalMonthlySalary: fund.finalMonthlySalary,
      deathLumpSum: fund.deathLumpSum,
      additionalTaxFreeAmount: fund.additionalTaxFreeAmount,
      pensionIncomeAmount: fund.pensionIncomeAmount,
      pensionIncomeIncrease: fund.pensionIncomeIncrease,
    };
    
    fetch('/api/defined-benefit-funds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(duplicatedFund),
    }).then(res => {
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/defined-benefit-funds'] });
      }
    });
  }, [queryClient]);

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading defined benefit funds...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error loading defined benefit funds. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      <table>
        <thead>
          {/* First Header Row - Section Groups */}
          <tr className="border-b border-neutral-200">
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center bg-neutral-50 section-start" rowSpan={2}>Actions</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center bg-neutral-50 section-start" colSpan={3}>Overview</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center bg-neutral-50 section-start" colSpan={4}>Fund Details</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center bg-neutral-50 section-start" colSpan={2}>Pension Income at Death</th>
          </tr>
          {/* Second Header Row - Individual Fields */}
          <tr className="border-b border-neutral-200">
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center bg-neutral-50 section-start">Description</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center bg-neutral-50">Owner Name</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center bg-neutral-50">Ownership %</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center bg-neutral-50 section-start">Years of Service</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center bg-neutral-50">Final Monthly Salary</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center bg-neutral-50">Death Lump Sum</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center bg-neutral-50">Additional Tax Free Amount</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center bg-neutral-50 section-start">Amount</th>
            <th className="px-3 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider text-center bg-neutral-50">Increase</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {funds.map((fund: DefinedBenefitFund) => {
            const maxRows = Math.max(fund.owners.length, 1);
            
            return (
              <SafeFragment key={fund.id}>
                {fund.owners.map((owner: string, rowIndex: number) => (
                  <tr key={`${fund.id}-${rowIndex}`} className="hover:bg-neutral-50">
                    {/* Actions Section - Only show on first row */}
                    {rowIndex === 0 && (
                      <td className="table-actions-cell p-2 text-center section-start align-top" rowSpan={maxRows}>
                        <ActionButtonGroup>
                          <DuplicateButton
                            onClick={() => handleDuplicateFund(fund)}
                            disabled={isUpdating}
                          />
                          <DeleteButton
                            onClick={() => handleDeleteFund(fund.id)}
                            disabled={isUpdating}
                          />
                        </ActionButtonGroup>
                      </td>
                    )}
                    
                    {/* Overview Section - Only show on first row */}
                    {rowIndex === 0 && (
                      <td className="p-2 section-start align-top" rowSpan={maxRows}>
                        <input
                          type="text"
                          defaultValue={formatTextValue(fund.description)}
                          className={`table-input ${getFieldClass('text')} ${getValueClass(fund.description, 'text')}`}
                          onFocus={handleDefaultValueFocus}
                          onBlur={(e) => {
                            const formattedValue = e.target.value === "Enter details ..." ? "" : e.target.value;
                            handleInputBlur(fund.id, 'description', formattedValue);
                          }}
                          disabled={isUpdating}
                        />
                      </td>
                    )}
                    
                    {/* Owner Name and Percentage - One per row */}
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <input
                          key={`owner-${fund.id}-${rowIndex}-${fund.owners[rowIndex]}`}
                          type="text"
                          defaultValue={formatTextValue(fund.owners[rowIndex], 'owner')}
                          className={`table-input ${getFieldClass('text')} ${getValueClass(fund.owners[rowIndex], 'text')}`}
                          style={{ flex: 1 }}
                          onFocus={handleDefaultValueFocus}
                          onBlur={(e) => handleOwnerUpdate(fund.id, rowIndex, 'name', e.target.value)}
                          disabled={isUpdating}
                        />
                        {rowIndex === 0 ? (
                          <AddButton
                            onClick={() => handleAddOwner(fund.id)}
                            disabled={isUpdating}
                            size="sm"
                          />
                        ) : (
                          <DeleteButton
                            onClick={() => handleRemoveOwner(fund.id, rowIndex)}
                            disabled={isUpdating}
                            size="sm"
                          />
                        )}
                      </div>
                    </td>
                    <td className={`p-2 ${getCellClass('percentage')}`}>
                      <input
                        key={`percentage-${fund.id}-${rowIndex}-${fund.ownershipPercentages[rowIndex]}`}
                        type="text"
                        defaultValue={fund.ownershipPercentages[rowIndex] || "0%"}
                        onFocus={handleDefaultValueFocus}
                        onBlur={(e) => {
                          const formattedValue = formatPercentageValue(e.target.value);
                          handleOwnerUpdate(fund.id, rowIndex, 'percentage', formattedValue);
                          e.target.value = formattedValue;
                        }}
                        className={`table-input ${getFieldClass('percentage')} ${getValueClass(fund.ownershipPercentages[rowIndex] || "0%", 'percentage')}`}
                        disabled={isUpdating}
                      />
                    </td>
                    
                    {/* Fund Details Section - Only show on first row */}
                    {rowIndex === 0 && (
                      <td className={`p-2 section-start align-top ${getCellClass('years')}`} rowSpan={maxRows}>
                        <input
                          key={`yearsOfService-${fund.id}-${fund.yearsOfService}`}
                          type="text"
                          defaultValue={fund.yearsOfService}
                          className={`table-input ${getFieldClass('years')} ${getValueClass(fund.yearsOfService, 'years')}`}
                          onFocus={handleDefaultValueFocus}
                          onBlur={(e) => handleInputBlur(fund.id, 'yearsOfService', e.target.value, e.target)}
                          disabled={isUpdating}
                        />
                      </td>
                    )}
                    {rowIndex === 0 && (
                      <td className={`p-2 align-top ${getCellClass('currency')}`} rowSpan={maxRows}>
                        <input
                          key={`finalMonthlySalary-${fund.id}-${fund.finalMonthlySalary}`}
                          type="text"
                          defaultValue={fund.finalMonthlySalary}
                          className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.finalMonthlySalary, 'currency')}`}
                          onFocus={handleDefaultValueFocus}
                          onBlur={(e) => handleInputBlur(fund.id, 'finalMonthlySalary', e.target.value, e.target)}
                          disabled={isUpdating}
                        />
                      </td>
                    )}
                    {rowIndex === 0 && (
                      <td className={`p-2 align-top ${getCellClass('currency')}`} rowSpan={maxRows}>
                        <input
                          key={`deathLumpSum-${fund.id}-${fund.deathLumpSum}`}
                          type="text"
                          defaultValue={fund.deathLumpSum}
                          className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.deathLumpSum, 'currency')}`}
                          onFocus={handleDefaultValueFocus}
                          onBlur={(e) => handleInputBlur(fund.id, 'deathLumpSum', e.target.value, e.target)}
                          disabled={isUpdating}
                        />
                      </td>
                    )}
                    {rowIndex === 0 && (
                      <td className={`p-2 align-top ${getCellClass('currency')}`} rowSpan={maxRows}>
                        <input
                          key={`additionalTaxFreeAmount-${fund.id}-${fund.additionalTaxFreeAmount}`}
                          type="text"
                          defaultValue={fund.additionalTaxFreeAmount}
                          className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.additionalTaxFreeAmount, 'currency')}`}
                          onFocus={handleDefaultValueFocus}
                          onBlur={(e) => handleInputBlur(fund.id, 'additionalTaxFreeAmount', e.target.value, e.target)}
                          disabled={isUpdating}
                        />
                      </td>
                    )}
                    
                    {/* Pension Income at Death Section */}
                    {rowIndex === 0 && (
                      <td className={`p-2 section-start align-top ${getCellClass('currency')}`} rowSpan={maxRows}>
                        <input
                          key={`pensionIncomeAmount-${fund.id}-${fund.pensionIncomeAmount}`}
                          type="text"
                          defaultValue={fund.pensionIncomeAmount}
                          className={`table-input ${getFieldClass('currency')} ${getValueClass(fund.pensionIncomeAmount, 'currency')}`}
                          onFocus={handleDefaultValueFocus}
                          onBlur={(e) => handleInputBlur(fund.id, 'pensionIncomeAmount', e.target.value, e.target)}
                          disabled={isUpdating}
                        />
                      </td>
                    )}
                    {rowIndex === 0 && (
                      <td className={`p-2 align-top ${getCellClass('percentage')}`} rowSpan={maxRows}>
                        <input
                          key={`pensionIncomeIncrease-${fund.id}-${fund.pensionIncomeIncrease}`}
                          type="text"
                          defaultValue={fund.pensionIncomeIncrease || "0%"}
                          onFocus={handleDefaultValueFocus}
                          onBlur={(e) => handleInputBlur(fund.id, 'pensionIncomeIncrease', e.target.value, e.target)}
                          className={`table-input ${getFieldClass('percentage')} ${getValueClass(fund.pensionIncomeIncrease || "0%", 'percentage')}`}
                          disabled={isUpdating}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </SafeFragment>
            );
          })}
        </tbody>

        {/* Totals Footer */}
        <tfoot>
          <tr>
            <td className="totals-cell-label text-right" colSpan={5}>Totals</td>
            <td className="totals-cell-value">R {totals.finalMonthlySalary.toLocaleString()}</td>
            <td className="totals-cell-value">R {totals.deathLumpSum.toLocaleString()}</td>
            <td className="totals-cell-value">R {totals.additionalTaxFreeAmount.toLocaleString()}</td>
            <td className="totals-cell-value">R {totals.pensionIncomeAmount.toLocaleString()}</td>
            <td className="totals-cell-label"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}