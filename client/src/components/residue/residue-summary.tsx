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
  const totalPercentage = residues.reduce((sum, residue) => {
    const percentage = parseFloat(residue.percentage.replace(/[^\d.-]/g, '')) || 0;
    return sum + percentage;
  }, 0);

  const charityEntries = residues.filter(residue => residue.isCharityRow).length;

  return (
    <div className="px-5 pb-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200 shadow-sm">
          <div className="text-xs font-medium text-teal-700 mb-1">Total Entries</div>
          <div className="text-lg font-bold text-neutral-900">{totalEntries}</div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200 shadow-sm">
          <div className="text-xs font-medium text-teal-700 mb-1">Total Percentage</div>
          <div className="text-lg font-bold text-neutral-900">{totalPercentage}%</div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200 shadow-sm">
          <div className="text-xs font-medium text-teal-700 mb-1">Charity Entries</div>
          <div className="text-lg font-bold text-neutral-900">{charityEntries}</div>
        </div>
      </div>
    </div>
  );
}