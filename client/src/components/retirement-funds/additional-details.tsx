import React, { useCallback, useMemo } from "react";
import { RetirementFund, UpdateRetirementFund } from "@shared/schema";

interface AdditionalDetailsProps {
  funds: RetirementFund[];
  onFieldUpdate: (id: number, field: keyof UpdateRetirementFund, value: string) => void;
  isUpdating: boolean;
}

export function AdditionalDetails({ funds, onFieldUpdate, isUpdating }: AdditionalDetailsProps) {
  // Format currency value with proper validation
  const formatCurrencyValue = useCallback((value: string, field: string) => {
    // Fields that should have currency formatting (R prefix)
    const currencyFields = ['lumpSumDeath', 'previousLumpSums', 'additionalTaxFreeAmount'];
    
    if (!currencyFields.includes(field)) return value;
    
    // Remove existing formatting and non-numeric characters except decimals
    const numericValue = value.replace(/[^\d.-]/g, '');
    if (!numericValue || isNaN(Number(numericValue))) return value;
    
    // Add R prefix and format with thousands separators
    return `R ${Math.round(Number(numericValue)).toLocaleString()}`;
  }, []);

  // Handle input blur for formatting and updating
  const handleInputBlur = useCallback((fundId: number, field: keyof UpdateRetirementFund, value: string) => {
    const formattedValue = formatCurrencyValue(value, field);
    onFieldUpdate(fundId, field, formattedValue);
    
    // Update DOM element immediately for visual feedback
    const element = document.querySelector(`input[data-field="${field}-${fundId}"]`) as HTMLInputElement;
    if (element) {
      element.value = formattedValue;
    }
  }, [onFieldUpdate, formatCurrencyValue]);

  // Calculate totals for the table footer
  const totals = useMemo(() => {
    return {
      lumpSumDeath: funds.reduce((sum, fund) => {
        const value = fund.lumpSumDeath as string;
        const amount = parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
        return sum + amount;
      }, 0),
      previousLumpSums: funds.reduce((sum, fund) => {
        const value = fund.previousLumpSums as string;
        const amount = parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
        return sum + amount;
      }, 0),
      additionalTaxFreeAmount: funds.reduce((sum, fund) => {
        const value = fund.additionalTaxFreeAmount as string;
        const amount = parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
        return sum + amount;
      }, 0)
    };
  }, [funds]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
      <div className="p-6">
        <h2 className="font-bold text-neutral-900 mb-6 text-[16px]">Additional Details</h2>
        
        {/* Detail Table */}
        <div className="overflow-x-auto">
          <table className="bg-white table-auto">
            <thead>
              <tr className="border-b border-neutral-200" style={{ backgroundColor: '#D6ECF5' }}>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider" style={{ width: '250px' }}>
                  Description
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider" style={{ width: '140px' }}>
                  Lump Sum Death
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider" style={{ width: '140px' }}>
                  Previous Lump Sums
                </th>
                <th className="table-cell text-left table-header-12 text-neutral-600 uppercase tracking-wider" style={{ width: '180px' }}>
                  Additional Tax Free Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {funds.map((fund, index) => (
                <tr key={`additional-${fund.id}`} className="hover:bg-neutral-50">
                  <td className="table-cell text-sm font-medium text-neutral-900">
                    {fund.description}
                  </td>
                  <td className="p-2 text-right">
                    <input
                      type="text"
                      data-field={`lumpSumDeath-${fund.id}`}
                      defaultValue={fund.lumpSumDeath}
                      onBlur={(e) => {
                        const formattedValue = formatCurrencyValue(e.target.value, 'lumpSumDeath');
                        if (formattedValue !== e.target.value) {
                          e.target.value = formattedValue;
                        }
                        handleInputBlur(fund.id, 'lumpSumDeath', e.target.value);
                      }}
                      disabled={isUpdating}
                      className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary px-3 py-1 border rounded-md text-sm"
                      style={{ textAlign: 'right', width: '120px' }}
                      placeholder="R 0"
                    />
                  </td>
                  <td className="p-2 text-right">
                    <input
                      type="text"
                      data-field={`previousLumpSums-${fund.id}`}
                      defaultValue={fund.previousLumpSums}
                      onBlur={(e) => {
                        const formattedValue = formatCurrencyValue(e.target.value, 'previousLumpSums');
                        if (formattedValue !== e.target.value) {
                          e.target.value = formattedValue;
                        }
                        handleInputBlur(fund.id, 'previousLumpSums', e.target.value);
                      }}
                      disabled={isUpdating}
                      className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary px-3 py-1 border rounded-md text-sm"
                      style={{ textAlign: 'right', width: '120px' }}
                      placeholder="R 0"
                    />
                  </td>
                  <td className="p-2 text-right">
                    <input
                      type="text"
                      data-field={`additionalTaxFreeAmount-${fund.id}`}
                      defaultValue={fund.additionalTaxFreeAmount}
                      onBlur={(e) => {
                        const formattedValue = formatCurrencyValue(e.target.value, 'additionalTaxFreeAmount');
                        if (formattedValue !== e.target.value) {
                          e.target.value = formattedValue;
                        }
                        handleInputBlur(fund.id, 'additionalTaxFreeAmount', e.target.value);
                      }}
                      disabled={isUpdating}
                      className="table-input h-7 text-sm bg-white border-gray-200 focus:border-primary px-3 py-1 border rounded-md text-sm"
                      style={{ textAlign: 'right', width: '160px' }}
                      placeholder="R 0"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Totals Row */}
            <tfoot>
              <tr className="border-t border-neutral-300 bg-gray-100 table-total-row">
                <td className="table-cell text-sm text-neutral-900" style={{ fontWeight: 700 }}>
                  Total
                </td>
                <td className="table-cell text-right text-sm text-neutral-900" style={{ fontWeight: 700 }}>
                  R {totals.lumpSumDeath.toLocaleString()}
                </td>
                <td className="table-cell text-right text-sm text-neutral-900" style={{ fontWeight: 700 }}>
                  R {totals.previousLumpSums.toLocaleString()}
                </td>
                <td className="table-cell text-right text-sm text-neutral-900" style={{ fontWeight: 700 }}>
                  R {totals.additionalTaxFreeAmount.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}