import { useQuery } from "@tanstack/react-query";
import type { IncomeProvision } from "@shared/schema";

export function IncomeProvisionsSummary() {
  const { data: provisions = [], isLoading } = useQuery<IncomeProvision[]>({
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
    const amount = parseFloat(provision.amount.replace(/[^\d.-]/g, '')) || 0;
    return sum + amount;
  }, 0);

  const totalCapitalisedAmount = provisions.reduce((sum, provision) => {
    const amount = parseFloat(provision.capitalisedAmount.replace(/[^\d.-]/g, '')) || 0;
    return sum + amount;
  }, 0);

  return (
    <div className="px-5 pb-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div style={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }} className="rounded-lg p-4 text-center">
          <div className="text-xs font-medium text-teal-700 mb-1">Total Provisions</div>
          <div className="text-lg font-bold text-neutral-900">{totalProvisions}</div>
        </div>
        
        <div style={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }} className="rounded-lg p-4 text-center">
          <div className="text-xs font-medium text-teal-700 mb-1">Total Amount</div>
          <div className="text-lg font-bold text-neutral-900">R {totalAmount.toLocaleString()}</div>
        </div>
        
        <div style={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }} className="rounded-lg p-4 text-center">
          <div className="text-xs font-medium text-teal-700 mb-1">Total Capitalised</div>
          <div className="text-lg font-bold text-neutral-900">R {totalCapitalisedAmount.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}