import { useQuery } from "@tanstack/react-query";
import type { AdditionalEstateDutyItems } from "@shared/schema";
import { SummaryBand, SummaryTile } from "@/components/common/summary-band";

export function AdditionalEstateDutyItemsSummary() {
  const { data: items = [], isLoading } = useQuery<AdditionalEstateDutyItems[]>({
    queryKey: ["/api/additional-estate-duty-items"],
  });

  if (isLoading) {
    return (
      <div className="px-6 py-3">
        <div className="text-neutral-500 text-sm">Loading summary...</div>
      </div>
    );
  }

  const totalAdditions = items
    .filter(item => !item.deduction)
    .reduce((sum, item) => sum + (parseFloat(item.amount.replace(/[^\d.-]/g, '')) || 0), 0);
  const totalDeductions = items
    .filter(item => item.deduction)
    .reduce((sum, item) => sum + (parseFloat(item.amount.replace(/[^\d.-]/g, '')) || 0), 0);
  const net = totalAdditions - totalDeductions;

  return (
    <SummaryBand>
      <SummaryTile label="Net" value={`R ${net.toLocaleString()}`} />
      <SummaryTile label="Additions" value={`R ${totalAdditions.toLocaleString()}`} />
      <SummaryTile label="Deductions" value={`R ${totalDeductions.toLocaleString()}`} />
    </SummaryBand>
  );
}
