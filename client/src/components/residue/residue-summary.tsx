import { useQuery } from "@tanstack/react-query";
import type { Residue } from "@shared/schema";

export function ResidueSummary() {
  const { data: residues = [], isLoading } = useQuery<Residue[]>({
    queryKey: ["/api/residue"],
  });

  if (isLoading) {
    return (
      <div className="px-5 pb-5">
        <div className="text-neutral-500">Loading summary...</div>
      </div>
    );
  }

  const totalEntries = residues.length;
  const totalAmount = residues.reduce((sum, residue) => {
    const amount = parseFloat(residue.amount.replace(/[^\d.-]/g, '')) || 0;
    return sum + amount;
  }, 0);

  return (
    <div className="px-5 pb-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="summary-card">
          <div className="text-xs font-medium text-teal-700 mb-1">Total Entries</div>
          <div className="text-lg font-bold text-neutral-900">{totalEntries}</div>
        </div>
        
        <div className="summary-card">
          <div className="text-xs font-medium text-teal-700 mb-1">Total Amount</div>
          <div className="text-lg font-bold text-neutral-900">R {totalAmount.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}