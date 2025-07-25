import { useQuery } from "@tanstack/react-query";
import type { RetirementFund } from "@shared/schema";

export function RetirementFundsSummary() {
  const { data: funds = [], isLoading } = useQuery<RetirementFund[]>({
    queryKey: ["/api/retirement-funds"],
  });

  if (isLoading) {
    return (
      <div className="px-5 pb-5">
        <div className="text-neutral-500">Loading summary...</div>
      </div>
    );
  }

  const totalFunds = funds.length;
  
  // Calculate all totals
  const totals = funds.reduce((acc, fund) => {
    const parseCurrency = (value: string) => parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
    
    return {
      coverAmount: acc.coverAmount + parseCurrency(fund.coverAmount),
      monthlyIncome: acc.monthlyIncome + parseCurrency(fund.monthlyIncome),
      approvedLifeCover: acc.approvedLifeCover + parseCurrency(fund.approvedLifeCover),
      fundValue: acc.fundValue + parseCurrency(fund.fundValue),
      fundValueAtDeath: acc.fundValueAtDeath + parseCurrency(fund.fundValueAtDeath)
    };
  }, {
    coverAmount: 0,
    monthlyIncome: 0,
    approvedLifeCover: 0,
    fundValue: 0,
    fundValueAtDeath: 0
  });

  return (
    <div className="px-5 pb-5">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="summary-card">
          <div className="text-xs font-medium text-teal-700 mb-1">Total Funds</div>
          <div className="text-lg font-bold text-neutral-900">{totalFunds}</div>
        </div>
        
        <div className="summary-card">
          <div className="text-xs font-medium text-teal-700 mb-1">Cover Amount Total</div>
          <div className="text-lg font-bold text-neutral-900">R {totals.coverAmount.toLocaleString()}</div>
        </div>
        
        <div className="summary-card">
          <div className="text-xs font-medium text-teal-700 mb-1">Monthly Income Total</div>
          <div className="text-lg font-bold text-neutral-900">R {totals.monthlyIncome.toLocaleString()}</div>
        </div>
        
        <div className="summary-card">
          <div className="text-xs font-medium text-teal-700 mb-1">Approved Life Cover Total</div>
          <div className="text-lg font-bold text-neutral-900">R {totals.approvedLifeCover.toLocaleString()}</div>
        </div>
        
        <div className="summary-card">
          <div className="text-xs font-medium text-teal-700 mb-1">Fund Value Total</div>
          <div className="text-lg font-bold text-neutral-900">R {totals.fundValue.toLocaleString()}</div>
        </div>
        
        <div className="summary-card">
          <div className="text-xs font-medium text-teal-700 mb-1">Fund Value at Death Total</div>
          <div className="text-lg font-bold text-neutral-900">R {totals.fundValueAtDeath.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}