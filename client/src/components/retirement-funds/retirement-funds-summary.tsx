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
  const totalCoverAmount = funds.reduce((sum, fund) => {
    const amount = parseFloat(fund.coverAmount.replace(/[^\d.-]/g, '')) || 0;
    return sum + amount;
  }, 0);

  const totalFundValue = funds.reduce((sum, fund) => {
    const amount = parseFloat(fund.fundValue.replace(/[^\d.-]/g, '')) || 0;
    return sum + amount;
  }, 0);

  return (
    <div className="px-5 pb-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div  className="rounded-lg p-4 text-center">
          <div className="text-xs font-medium text-teal-700 mb-1">Total Funds</div>
          <div className="text-lg font-bold text-neutral-900">{totalFunds}</div>
        </div>
        
        <div  className="rounded-lg p-4 text-center">
          <div className="text-xs font-medium text-teal-700 mb-1">Total Cover Amount</div>
          <div className="text-lg font-bold text-neutral-900">R {totalCoverAmount.toLocaleString()}</div>
        </div>
        
        <div  className="rounded-lg p-4 text-center">
          <div className="text-xs font-medium text-teal-700 mb-1">Total Fund Value</div>
          <div className="text-lg font-bold text-neutral-900">R {totalFundValue.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}