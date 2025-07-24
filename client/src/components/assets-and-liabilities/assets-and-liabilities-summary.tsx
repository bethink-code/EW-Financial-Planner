import { useQuery } from "@tanstack/react-query";
import type { AssetAndLiability } from "@shared/schema";

export function AssetsAndLiabilitiesSummary() {
  const { data: items = [], isLoading } = useQuery<AssetAndLiability[]>({
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
  const totalMarketValue = items.reduce((sum, item) => {
    const amount = parseFloat(item.marketValue.replace(/[^\d.-]/g, '')) || 0;
    return sum + amount;
  }, 0);

  const totalBaseCost = items.reduce((sum, item) => {
    const amount = parseFloat(item.baseCost.replace(/[^\d.-]/g, '')) || 0;
    return sum + amount;
  }, 0);

  return (
    <div className="px-5 pb-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200 shadow-sm">
          <div className="text-xs font-medium text-teal-700 mb-1">Total Items</div>
          <div className="text-lg font-bold text-neutral-900">{totalItems}</div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200 shadow-sm">
          <div className="text-xs font-medium text-teal-700 mb-1">Total Market Value</div>
          <div className="text-lg font-bold text-neutral-900">R {totalMarketValue.toLocaleString()}</div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200 shadow-sm">
          <div className="text-xs font-medium text-teal-700 mb-1">Total Base Cost</div>
          <div className="text-lg font-bold text-neutral-900">R {totalBaseCost.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}