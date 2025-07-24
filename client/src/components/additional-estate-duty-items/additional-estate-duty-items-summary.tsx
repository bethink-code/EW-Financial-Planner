import { useQuery } from "@tanstack/react-query";
import type { AdditionalEstateDutyItem } from "@shared/schema";

export function AdditionalEstateDutyItemsSummary() {
  const { data: items = [], isLoading } = useQuery<AdditionalEstateDutyItem[]>({
    queryKey: ["/api/additional-estate-duty-items"],
  });

  if (isLoading) {
    return (
      <div className="px-5 pb-5">
        <div className="text-neutral-500">Loading summary...</div>
      </div>
    );
  }

  const totalItems = items.length;
  const totalAdditions = items.filter(item => !item.isDeduction).reduce((sum, item) => {
    const amount = parseFloat(item.amount.replace(/[^\d.-]/g, '')) || 0;
    return sum + amount;
  }, 0);

  const totalDeductions = items.filter(item => item.isDeduction).reduce((sum, item) => {
    const amount = parseFloat(item.amount.replace(/[^\d.-]/g, '')) || 0;
    return sum + amount;
  }, 0);

  return (
    <div className="px-5 pb-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div  className="rounded-lg p-4 text-center">
          <div className="text-xs font-medium text-teal-700 mb-1">Total Items</div>
          <div className="text-lg font-bold text-neutral-900">{totalItems}</div>
        </div>
        
        <div  className="rounded-lg p-4 text-center">
          <div className="text-xs font-medium text-teal-700 mb-1">Total Additions</div>
          <div className="text-lg font-bold text-neutral-900">R {totalAdditions.toLocaleString()}</div>
        </div>
        
        <div  className="rounded-lg p-4 text-center">
          <div className="text-xs font-medium text-teal-700 mb-1">Total Deductions</div>
          <div className="text-lg font-bold text-neutral-900">R {totalDeductions.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}