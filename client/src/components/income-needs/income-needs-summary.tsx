import { useQuery } from "@tanstack/react-query";
import type { IncomeNeeds } from "@shared/schema";

export function IncomeNeedsSummary() {
  const { data: needs = [], isLoading } = useQuery<IncomeNeeds[]>({
    queryKey: ["/api/income-needs"],
  });

  if (isLoading) {
    return (
      <div className="px-5 pb-5">
        <div className="text-neutral-500">Loading summary...</div>
      </div>
    );
  }

  const totalNeeds = needs.length;
  const totalAmount = needs.reduce((sum, need) => {
    const amount = parseFloat(need.amount.replace(/[^\d.-]/g, '')) || 0;
    return sum + amount;
  }, 0);

  return (
    <div className="px-5 pb-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="summary-card">
          <div className="text-xs font-medium text-teal-700 mb-1">Total Needs</div>
          <div className="text-lg font-bold text-neutral-900">{totalNeeds}</div>
        </div>
        
        <div className="summary-card">
          <div className="text-xs font-medium text-teal-700 mb-1">Total Amount</div>
          <div className="text-lg font-bold text-neutral-900">R {totalAmount.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}