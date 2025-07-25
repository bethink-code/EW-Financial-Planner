import { useQuery } from "@tanstack/react-query";
import type { AssetsAndLiabilities } from "@shared/schema";

export function AssetsAndLiabilitiesSummary() {
  const { data: items = [], isLoading } = useQuery<AssetsAndLiabilities[]>({
    queryKey: ["/api/assets-and-liabilities"],
  });

  if (isLoading) {
    return (
      <div className="px-5 pb-5">
        <div className="text-neutral-500">Loading summary...</div>
      </div>
    );
  }

  const totalItems = items.length;
  const totalAmount = items.reduce((sum, item) => {
    const amount = parseFloat(item.amount.replace(/[^\d.-]/g, '')) || 0;
    return sum + amount;
  }, 0);

  return (
    <div className="px-5 pb-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="summary-card">
          <div className="text-xs font-medium text-teal-700 mb-1">Total Items</div>
          <div className="text-lg font-bold text-neutral-900">{totalItems}</div>
        </div>
        
        <div className="summary-card">
          <div className="text-xs font-medium text-teal-700 mb-1">Total Amount</div>
          <div className="text-lg font-bold text-neutral-900">R {totalAmount.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}