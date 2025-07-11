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

  // Calculate totals for summary display
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
        <h2 className="text-xl font-bold text-neutral-900 mb-6">Additional Details</h2>
        
        {/* Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div style={{ backgroundColor: '#E8F4F8' }} className="rounded-lg p-4 text-center">
            <div className="text-sm font-medium text-neutral-600 mb-2">Total Lump Sum Death</div>
            <div className="text-xl font-bold text-neutral-900">
              R {totals.lumpSumDeath.toLocaleString()}
            </div>
          </div>
          <div style={{ backgroundColor: '#E8F4F8' }} className="rounded-lg p-4 text-center">
            <div className="text-sm font-medium text-neutral-600 mb-2">Total Previous Lump Sums</div>
            <div className="text-xl font-bold text-neutral-900">
              R {totals.previousLumpSums.toLocaleString()}
            </div>
          </div>
          <div style={{ backgroundColor: '#E8F4F8' }} className="rounded-lg p-4 text-center">
            <div className="text-sm font-medium text-neutral-600 mb-2">Total Additional Tax Free</div>
            <div className="text-xl font-bold text-neutral-900">
              R {totals.additionalTaxFreeAmount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Detail Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200" style={{ backgroundColor: '#D6ECF5' }}>
                <th className="p-3 text-left font-medium text-neutral-600 uppercase tracking-wider text-xs">
                  Fund Description
                </th>
                <th className="p-3 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs">
                  Lump Sum Death
                </th>
                <th className="p-3 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs">
                  Previous Lump Sums
                </th>
                <th className="p-3 text-center font-medium text-neutral-600 uppercase tracking-wider text-xs">
                  Additional Tax Free Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {funds.map((fund, index) => (
                <tr key={`additional-${fund.id}`} className={index % 2 === 0 ? "bg-white" : "bg-neutral-50"}>
                  <td className="p-3 text-sm font-medium text-neutral-900">
                    {fund.description}
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="text"
                      data-field={`lumpSumDeath-${fund.id}`}
                      defaultValue={fund.lumpSumDeath}
                      onBlur={(e) => handleInputBlur(fund.id, 'lumpSumDeath', e.target.value)}
                      disabled={isUpdating}
                      className="w-full h-8 px-2 text-sm text-right bg-white border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary hover:border-neutral-400 transition-colors"
                      style={{ minWidth: '120px' }}
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="text"
                      data-field={`previousLumpSums-${fund.id}`}
                      defaultValue={fund.previousLumpSums}
                      onBlur={(e) => handleInputBlur(fund.id, 'previousLumpSums', e.target.value)}
                      disabled={isUpdating}
                      className="w-full h-8 px-2 text-sm text-right bg-white border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary hover:border-neutral-400 transition-colors"
                      style={{ minWidth: '120px' }}
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="text"
                      data-field={`additionalTaxFreeAmount-${fund.id}`}
                      defaultValue={fund.additionalTaxFreeAmount}
                      onBlur={(e) => handleInputBlur(fund.id, 'additionalTaxFreeAmount', e.target.value)}
                      disabled={isUpdating}
                      className="w-full h-8 px-2 text-sm text-right bg-white border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary hover:border-neutral-400 transition-colors"
                      style={{ minWidth: '120px' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Totals Row */}
            <tfoot>
              <tr className="border-t-2 border-neutral-300 bg-neutral-100">
                <td className="p-3 text-sm font-bold text-neutral-900">
                  Total
                </td>
                <td className="p-3 text-center text-sm font-bold text-neutral-900" style={{ fontWeight: 700 }}>
                  R {totals.lumpSumDeath.toLocaleString()}
                </td>
                <td className="p-3 text-center text-sm font-bold text-neutral-900" style={{ fontWeight: 700 }}>
                  R {totals.previousLumpSums.toLocaleString()}
                </td>
                <td className="p-3 text-center text-sm font-bold text-neutral-900" style={{ fontWeight: 700 }}>
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