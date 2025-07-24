import { useQuery } from "@tanstack/react-query";
import type { DefinedBenefitFund } from "@shared/schema";

export function DefinedBenefitFundsSummary() {
  const { data: funds = [], isLoading } = useQuery<DefinedBenefitFund[]>({
    queryKey: ["/api/defined-benefit-funds"],
  });

  if (isLoading) {
    return (
      <div className="px-5 pb-5">
        <div className="text-neutral-500">Loading summary...</div>
      </div>
    );
  }

  const totalFunds = funds.length;
  const totalPensionIncome = funds.reduce((sum, fund) => {
    const amount = parseFloat(fund.pensionIncomeAmount.replace(/[^\d.-]/g, '')) || 0;
    return sum + amount;
  }, 0);

  const totalDeathLumpSum = funds.reduce((sum, fund) => {
    const amount = parseFloat(fund.deathLumpSum.replace(/[^\d.-]/g, '')) || 0;
    return sum + amount;
  }, 0);

  return (
    <div className="px-5 pb-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200 shadow-sm">
          <div className="text-xs font-medium text-teal-700 mb-1">Total Funds</div>
          <div className="text-lg font-bold text-neutral-900">{totalFunds}</div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200 shadow-sm">
          <div className="text-xs font-medium text-teal-700 mb-1">Total Pension Income</div>
          <div className="text-lg font-bold text-neutral-900">R {totalPensionIncome.toLocaleString()}</div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200 shadow-sm">
          <div className="text-xs font-medium text-teal-700 mb-1">Total Death Lump Sum</div>
          <div className="text-lg font-bold text-neutral-900">R {totalDeathLumpSum.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}