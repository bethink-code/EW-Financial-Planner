import { useMemo, useCallback } from 'react';
import { useQuery } from "@tanstack/react-query";
import type { IncomeProvisions } from "@shared/schema";
import { formatCurrencyValue, parseCurrencyValue } from '@/lib/formatting';

interface IncomeProvisionsSummaryProps {
  searchTerm?: string;
}

export function IncomeProvisionsSummary({ searchTerm }: IncomeProvisionsSummaryProps) {
  const { data: provisions = [], isLoading } = useQuery<IncomeProvisions[]>({
    queryKey: ["/api/income-provisions"],
  });

  // Calculate capitalised amount using the exact same logic as the table
  const calculateCapitalisedAmount = useCallback((provision: IncomeProvisions): string => {
    const amount = parseCurrencyValue(provision.amount || '0');
    const termYears = parseFloat(provision.termYears?.replace(/[^\d.-]/g, '') || '0');
    const increaseRate = parseFloat(provision.increasePercentage?.replace(/[^\d.-]/g, '') || '0') / 100;
    const taxPercentage = parseFloat(provision.taxPercentage?.replace(/[^\d.-]/g, '') || '0') / 100;
    const taxRate = parseFloat(provision.taxRate?.replace(/[^\d.-]/g, '') || '0') / 100;
    
    if (amount <= 0 || termYears <= 0) {
      return 'R 0';
    }
    
    // Use standard financial planning assumptions
    const discountRate = provision.cpi ? 0.06 : 0.08; // 6% if CPI-linked, 8% otherwise
    const frequency = provision.frequency === 'monthly' ? 12 : provision.frequency === 'quarterly' ? 4 : 1;
    const periodsPerYear = frequency;
    const totalPeriods = termYears * periodsPerYear;
    const periodicDiscountRate = discountRate / periodsPerYear;
    const periodicIncreaseRate = increaseRate / periodsPerYear;
    
    let presentValue: number;
    
    if (Math.abs(periodicDiscountRate - periodicIncreaseRate) < 0.0001) {
      // When discount rate equals increase rate, use simplified formula
      presentValue = amount * totalPeriods;
    } else {
      // Present value of growing annuity formula
      const netRate = periodicDiscountRate - periodicIncreaseRate;
      const pvFactor = (1 - Math.pow((1 + periodicIncreaseRate) / (1 + periodicDiscountRate), totalPeriods)) / netRate;
      presentValue = amount * pvFactor;
    }
    
    // Return the gross present value before taxes - taxes are separate considerations
    return formatCurrencyValue(Math.round(presentValue).toString());
  }, []);

  // Filter provisions based on search term (same logic as the table)
  const filteredProvisions = useMemo(() => {
    if (!searchTerm) return provisions;
    return provisions.filter(provision => 
      provision.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provision.personName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [provisions, searchTerm]);

  if (isLoading) {
    return (
      <div className="px-5 pb-5">
        <div className="text-neutral-500">Loading summary...</div>
      </div>
    );
  }

  const totalProvisions = filteredProvisions.length;
  const totalAmount = filteredProvisions.reduce((sum, provision) => {
    const amount = parseCurrencyValue(provision.amount || '0');
    return sum + amount;
  }, 0);

  const totalCapitalisedAmount = filteredProvisions.reduce((sum, provision) => {
    const capitalisedAmount = parseFloat(calculateCapitalisedAmount(provision).replace(/[^\d.-]/g, '')) || 0;
    return sum + capitalisedAmount;
  }, 0);

  return (
    <div className="px-5 pb-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="summary-card">
          <div className="text-xs font-medium text-teal-700 mb-1">Total Provisions</div>
          <div className="text-lg font-bold text-neutral-900">{totalProvisions}</div>
        </div>
        
        <div className="summary-card">
          <div className="text-xs font-medium text-teal-700 mb-1">Annual Amount</div>
          <div className="text-lg font-bold text-neutral-900">R {totalAmount.toLocaleString()}</div>
        </div>

        <div className="summary-card">
          <div className="text-xs font-medium text-teal-700 mb-1">Capital Required</div>
          <div className="text-lg font-bold text-neutral-900">R {totalCapitalisedAmount.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}