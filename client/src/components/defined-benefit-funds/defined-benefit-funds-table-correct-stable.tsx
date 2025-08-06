import React, { useState, useCallback, useMemo } from"react";
import { useQuery, useMutation, useQueryClient } from"@tanstack/react-query";
import { AddButton, DeleteButton, DuplicateButton, ActionButtonGroup } from"@/components/ui/action-buttons";
import { TableHeaderAddButton } from "@/components/ui/table-header-add-button";
import { getFieldClass } from"@/lib/design-tokens";
import { getCellClass } from"@/lib/field-types";
import { formatCurrencyValue, formatPercentageValue, formatYearsValue, formatTextValue, getValueClass, isDefaultValue, handleDefaultValueFocus } from"@/lib/formatting";
import { useDebouncedUpdate } from"@/hooks/use-debounced-update";
import { SafeFragment } from"@/lib/safe-fragment";
import EntityOwnerSelector from "@/components/common/entity-owner-selector";
import type { DefinedBenefitFund, InsertDefinedBenefitFund } from"@shared/schema";

interface DefinedBenefitFundsTableProps {
  onAddFund?: () => void;
}

export default function DefinedBenefitFundsTable({ onAddFund }: DefinedBenefitFundsTableProps) {
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
        description:"",
        owners: ["Donald Edwards"],
        ownershipPercentages: ["100%"],
        yearsOfService:"0 years",
        finalMonthlySalary:"R 0",
        deathLumpSum:"R 0",
        additionalTaxFreeAmount:"R 0",
        pensionIncomeAmount:"R 0",
        pensionIncomeCheckbox: true, // Default to Years mode
        pensionIncomeYears:"0 years",
        pensionIncomeIncrease:"0%",
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

  // Dynamic Toggle Pattern Helper Functions (Based on New Retirement Funds Pattern)
  const hasIncomeAmount = (fund: DefinedBenefitFund) => {
    const income = fund.pensionIncomeAmount || "";
    const cleanValue = income.replace(/[^\d]/g, '');
    return cleanValue && cleanValue !== "0";
  };

  const getControlsEnabled = (fund: DefinedBenefitFund) => {
    return hasIncomeAmount(fund) && !isUpdating;
  };

  // Toggle shows "Years" when checked (true), "%" when unchecked (false)
  const isYearsMode = (fund: DefinedBenefitFund) => {
    return fund.pensionIncomeCheckbox === true;
  };

  // Base update handler
  const executeUpdate = useCallback((id: number, field: keyof DefinedBenefitFund, value: string | boolean | string[]) => {
    updateMutation.mutate({ id, updates: { [field]: value } });
  }, [updateMutation]);

  // Debounced update for text fields to prevent race conditions
  const debouncedUpdate = useDebouncedUpdate(executeUpdate, 300);

  // Unified update handler - use immediate updates for array fields to prevent synchronization issues
  const handleUpdateFund = useCallback((id: number, field: keyof DefinedBenefitFund, value: string | boolean | string[]) => {
    // Use immediate updates for array fields to prevent synchronization issues
    const arrayFields = ['owners', 'ownershipPercentages'];
    
    if (arrayFields.includes(field)) {
      executeUpdate(id, field, value);
    } else {
      debouncedUpdate(id, field, value);
    }
  }, [executeUpdate, debouncedUpdate]);



  // Add owner to fund
  const handleAddOwner = useCallback((id: number) => {
    const fund = funds.find((f: DefinedBenefitFund) => f.id === id);
    if (fund) {
      const newOwners = [...fund.owners, ""];
      const newOwnershipPercentages = [...(fund.ownershipPercentages || []), "0%"];
      handleUpdateFund(id, 'owners', newOwners);
      handleUpdateFund(id, 'ownershipPercentages', newOwnershipPercentages);
    }
  }, [funds, handleUpdateFund]);

  // Remove specific owner by index using splice method
  const handleRemoveOwner = useCallback((id: number, ownerIndex: number) => {
    const fund = funds.find((f: DefinedBenefitFund) => f.id === id);
    if (fund && fund.owners.length > 1 && ownerIndex > 0) { // Protect first owner
      const newOwners = [...fund.owners];
      const newOwnershipPercentages = [...(fund.ownershipPercentages || [])];
      newOwners.splice(ownerIndex, 1);
      newOwnershipPercentages.splice(ownerIndex, 1);
      handleUpdateFund(id, 'owners', newOwners);
      handleUpdateFund(id, 'ownershipPercentages', newOwnershipPercentages);
    }
  }, [funds, handleUpdateFund]);

  // Update owner name
  const handleOwnerChange = useCallback((id: number, ownerIndex: number, newOwner: string) => {
    const fund = funds.find((f: DefinedBenefitFund) => f.id === id);
    if (fund) {
      const updatedOwners = [...fund.owners];
      updatedOwners[ownerIndex] = newOwner;
      handleUpdateFund(id, 'owners', updatedOwners);
    }
  }, [funds, handleUpdateFund]);

  // Update ownership percentage 
  const handleOwnershipPercentageChange = useCallback((id: number, ownerIndex: number, newPercentage: string) => {
    const fund = funds.find((f: DefinedBenefitFund) => f.id === id);
    if (fund) {
      const updatedPercentages = [...(fund.ownershipPercentages || [])];
      updatedPercentages[ownerIndex] = newPercentage;
      handleUpdateFund(id, 'ownershipPercentages', updatedPercentages);
    }
  }, [funds, handleUpdateFund]);

  // Special onBlur handler with years formatting (Based on New Retirement Funds Pattern)
  const handleInputBlur = useCallback((id: number, field: keyof DefinedBenefitFund, value: string, target?: HTMLInputElement) => {
    // Map field names to field types for proper formatting
    const fieldTypeMap: Record<string, string> = {
      'yearsOfService': 'years',
      'pensionIncomeYears': 'years',
      'pensionIncomeIncrease': 'percentage',
      'finalMonthlySalary': 'currency',
      'deathLumpSum': 'currency',
      'additionalTaxFreeAmount': 'currency',
      'pensionIncomeAmount': 'currency'
    };
    
    const fieldType = fieldTypeMap[field] || field;
    
    let formattedValue;
    
    // Special handling for years fields
    if (fieldType === 'years' || field === 'pensionIncomeYears') {
      if (!value || value === "0" || value.trim() === "") {
        formattedValue = "0 years";
      } else {
        const cleanValue = value.toString().replace(/\s*years?\s*/gi, '').trim();
        if (cleanValue === "" || cleanValue === "0") {
          formattedValue = "0 years";
        } else {
          const numValue = parseFloat(cleanValue);
          if (isNaN(numValue)) {
            formattedValue = "0 years";
          } else {
            formattedValue = `${numValue} years`;
          }
        }
      }
    } else {
      // Use standard formatting for other fields
      formattedValue = fieldType === 'percentage' ? formatPercentageValue(value) : 
                        fieldType === 'currency' ? formatCurrencyValue(value) : 
                        value;
    }

    // Use debounced update for text fields, immediate for currency/percentage
    if (field === 'description') {
      debouncedUpdate(id, field, formattedValue);
    } else {
      handleUpdateFund(id, field, formattedValue);
    }

    // Update the input field with formatted value if it changed
    if (target && formattedValue !== value) {
      setTimeout(() => {
        target.value = formattedValue;
      }, 0);
    }
  }, [debouncedUpdate, handleUpdateFund]);

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
      pensionIncomeCheckbox: fund.pensionIncomeCheckbox,
      pensionIncomeYears: fund.pensionIncomeYears,
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
    return <div className="flex justify-center">Loading defined benefit funds...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error loading defined benefit funds. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      <table>
        <thead>
          {/* First Header Row - Section Groups */}
          <tr className="double-row-header-first">
            <th className="section-start table-actions-cell" rowSpan={2}>
              {onAddFund && (
                <TableHeaderAddButton
                  onClick={onAddFund}
                  title="Add new fund"
                />
              )}
            </th>
            <th className="section-start" colSpan={3}>Overview</th>
            <th className="section-start" colSpan={4}>Fund Details</th>
            <th className="section-start" colSpan={3}>Pension Income at Death</th>
          </tr>
          {/* Second Header Row - Individual Fields */}
          <tr className="double-row-header-second">
            <th className="section-start">Description</th>
            <th>Owner Name</th>
            <th>Ownership %</th>
            <th className="section-start">Years of Service</th>
            <th>Final Monthly Salary</th>
            <th>Death Lump Sum</th>
            <th>Additional Tax Free Amount</th>
            <th className="section-start">Amount</th>
            <th>Toggle</th>
            <th>Years / %</th>
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
                            const formattedValue = e.target.value ==="Enter details ..." ?"" : e.target.value;
                            handleUpdateFund(fund.id, 'description', formattedValue);
                          }}
                          disabled={isUpdating}
                        />
                      </td>
                    )}
                    
                    {/* Owner with Entity Selector and Percentage */}
                    <td className="p-2" colSpan={2}>
                      <EntityOwnerSelector
                        policyId={fund.id}
                        owners={fund.owners}
                        ownershipPercentages={fund.ownershipPercentages || ["100%"]}
                        onOwnerChange={handleOwnerChange}
                        onOwnershipPercentageChange={handleOwnershipPercentageChange}
                        onAddOwner={handleAddOwner}
                        onRemoveOwner={handleRemoveOwner}
                        rowIndex={rowIndex}
                        disabled={updateMutation.isPending}
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
                          onBlur={(e) => handleUpdateFund(fund.id, 'yearsOfService', e.target.value)}
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
                          onBlur={(e) => handleUpdateFund(fund.id, 'finalMonthlySalary', e.target.value)}
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
                          onBlur={(e) => handleUpdateFund(fund.id, 'deathLumpSum', e.target.value)}
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
                          onBlur={(e) => handleUpdateFund(fund.id, 'additionalTaxFreeAmount', e.target.value)}
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
                          onBlur={(e) => handleUpdateFund(fund.id, 'pensionIncomeAmount', e.target.value)}
                          disabled={isUpdating}
                        />
                      </td>
                    )}

                    {/* Pension Income Toggle Button */}
                    {rowIndex === 0 && (
                      <td className="table-actions-cell align-top" rowSpan={maxRows}>
                        <div className="pt-0.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateFund(fund.id, 'pensionIncomeCheckbox', !fund.pensionIncomeCheckbox)}
                            className={`h-8 px-3 min-w-[48px] bg-[#E8F3F8] border border-[#E0E0E0] text-[#016991] hover:bg-[#D1E7F0] rounded-md flex items-center justify-center transition-colors text-sm font-medium ${
                              !getControlsEnabled(fund) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                            disabled={!getControlsEnabled(fund) || isUpdating}
                          >
                            {isYearsMode(fund) ? 'Years' : '%'}
                          </button>
                        </div>
                      </td>
                    )}

                    {/* Pension Income Dynamic Field (Years OR Percentage) */}
                    {rowIndex === 0 && (
                      <td className="p-1 align-top" rowSpan={maxRows}>
                        {isYearsMode(fund) ? (
                          // Years Mode
                          <input
                            key={`pension-years-${fund.id}`}
                            type="text"
                            defaultValue={formatYearsValue(fund.pensionIncomeYears)}
                            className={`table-input ${getFieldClass('years')} ${getValueClass(fund.pensionIncomeYears, 'years')} ${
                              !getControlsEnabled(fund) ? 'bg-neutral-100 cursor-not-allowed' : ''
                            }`}
                            onFocus={handleDefaultValueFocus}
                            onBlur={(e) => handleInputBlur(fund.id, 'pensionIncomeYears', e.target.value, e.target)}
                            disabled={!getControlsEnabled(fund) || isUpdating}
                          />
                        ) : (
                          // Percentage Mode
                          <input
                            key={`pension-increase-${fund.id}`}
                            type="text"
                            defaultValue={fund.pensionIncomeIncrease || "0%"}
                            className={`table-input ${getFieldClass('percentage')} ${getValueClass(fund.pensionIncomeIncrease || "0%", 'percentage')} ${
                              !getControlsEnabled(fund) ? 'bg-neutral-100 cursor-not-allowed' : ''
                            }`}
                            onFocus={handleDefaultValueFocus}
                            onBlur={(e) => handleInputBlur(fund.id, 'pensionIncomeIncrease', e.target.value, e.target)}
                            disabled={!getControlsEnabled(fund) || isUpdating}
                          />
                        )}
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
            <td className="totals-cell-label text-right" colSpan={6}>Totals</td>
            <td className="totals-cell-value">R {totals.finalMonthlySalary.toLocaleString()}</td>
            <td className="totals-cell-value">R {totals.deathLumpSum.toLocaleString()}</td>
            <td className="totals-cell-value">R {totals.additionalTaxFreeAmount.toLocaleString()}</td>
            <td className="totals-cell-value">R {totals.pensionIncomeAmount.toLocaleString()}</td>
            <td className="totals-cell-label"></td>
            <td className="totals-cell-label"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}