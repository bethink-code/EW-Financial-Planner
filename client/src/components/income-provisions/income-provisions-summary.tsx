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

  const totalProvisions = provisions.length;
  const totalAmount = provisions.reduce((sum, provision) => {
    const amount = parseFloat(provision.amount?.replace(/[^\d.-]/g, '') || '0') || 0;
    return sum + amount;
  }, 0);

  return (
    <div className="px-5 pb-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="summary-card">
          <div className="text-xs font-medium text-teal-700 mb-1">Total Provisions</div>
          <div className="text-lg font-bold text-neutral-900">{totalProvisions}</div>
        </div>
        
        <div className="summary-card">
          <div className="text-xs font-medium text-teal-700 mb-1">Total Amount</div>
          <div className="text-lg font-bold text-neutral-900">R {totalAmount.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}