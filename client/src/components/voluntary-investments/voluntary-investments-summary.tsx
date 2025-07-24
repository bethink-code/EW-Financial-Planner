import { useQuery } from "@tanstack/react-query";
import type { VoluntaryInvestment } from "@shared/schema";

export function VoluntaryInvestmentsSummary() {
  const { data: investments = [], isLoading } = useQuery<VoluntaryInvestment[]>({
    queryKey: ["/api/voluntary-investments"],
  });

  if (isLoading) {
    return (
      <div className="px-5 pb-5">
        <div className="text-neutral-500">Loading summary...</div>
      </div>
    );
  }

  const totalInvestments = investments.length;
  const totalMarketValue = investments.reduce((sum, investment) => {
    const amount = parseFloat(investment.marketValue.replace(/[^\d.-]/g, '')) || 0;
    return sum + amount;
  }, 0);

  const totalBaseCost = investments.reduce((sum, investment) => {
    const amount = parseFloat(investment.baseCost.replace(/[^\d.-]/g, '')) || 0;
    return sum + amount;
  }, 0);

  return (
    <div className="px-5 pb-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div  >
          <div className="text-xs font-medium text-teal-700 mb-1">Total Investments</div>
          <div className="text-lg font-bold text-neutral-900">{totalInvestments}</div>
        </div>
        
        <div  >
          <div className="text-xs font-medium text-teal-700 mb-1">Total Market Value</div>
          <div className="text-lg font-bold text-neutral-900">R {totalMarketValue.toLocaleString()}</div>
        </div>
        
        <div  >
          <div className="text-xs font-medium text-teal-700 mb-1">Total Base Cost</div>
          <div className="text-lg font-bold text-neutral-900">R {totalBaseCost.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}