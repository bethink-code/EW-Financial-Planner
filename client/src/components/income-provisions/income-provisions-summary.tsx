import { useQuery } from "@tanstack/react-query";
import type { IncomeProvisions } from "@shared/schema";

export function IncomeProvisionsSummary() {
  const { data: provisions = [], isLoading } = useQuery<IncomeProvisions[]>({
    queryKey: ["/api/income-provisions"],
  });

  if (isLoading) {
    return (
      <div className="px-5 pb-5">
        <div className="text-neutral-500">Loading summary...</div>
      </div>
    );
  }

  // Calculate capitalised amount for each provision using the same logic as the table
  const calculateCapitalisedAmount = (provision: IncomeProvisions): string => {
    const amount = parseFloat(provision.amount?.replace(/[^\d.-]/g, '') || '0') || 0;
    const startDate = parseInt(provision.startDate?.replace(/[^\d]/g, '') || '0') || 0;
    const termYears = parseFloat(provision.termYears?.replace(/[^\d.-]/g, '') || '0') || 0;
    const increasePercentage = parseFloat(provision.increasePercentage?.replace(/[^\d.-]/g, '') || '0') || 0;
    const isCpi = provision.cpi === true;

    if (amount === 0 || termYears === 0) return 'R 0';

    const discountRate = isCpi ? 0.06 : 0.08; // 6% for CPI-linked, 8% for non-CPI
    const realGrowthRate = isCpi ? 0 : (increasePercentage / 100) - 0.06; // Real growth above CPI

    let presentValue: number;
    
    if (Math.abs(realGrowthRate) < 0.0001) {
      // No real growth case - standard annuity
      presentValue = amount * ((1 - Math.pow(1 + discountRate, -termYears)) / discountRate);
    } else {
      // Growing annuity case
      const numerator = 1 - Math.pow((1 + realGrowthRate) / (1 + discountRate), termYears);
      const denominator = discountRate - realGrowthRate;
      presentValue = amount * (numerator / denominator);
    }

    // Discount to present value if starting in the future
    if (startDate > 0) {
      presentValue = presentValue / Math.pow(1 + discountRate, startDate);
    }

    return `R ${Math.round(presentValue).toLocaleString()}`;
  };

  const totalProvisions = provisions.length;
  const totalAmount = provisions.reduce((sum, provision) => {
    const amount = parseFloat(provision.amount?.replace(/[^\d.-]/g, '') || '0') || 0;
    return sum + amount;
  }, 0);

  const totalCapitalisedAmount = provisions.reduce((sum, provision) => {
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