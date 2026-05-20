import { useQuery } from "@tanstack/react-query";
import type { IncomeNeeds } from "@shared/schema";
import { SummaryBand, SummaryTile } from "@/components/common/summary-band";

export function IncomeNeedsSummary() {
  const { data: needs = [] } = useQuery<IncomeNeeds[]>({
    queryKey: ["/api/income-needs"],
  });

  const totalAmount = needs.reduce((sum, n) => {
    const amount = parseFloat(n.amount?.replace(/[^\d.-]/g, '') || '0') || 0;
    return sum + amount;
  }, 0);
  const totalCapitalised = needs.reduce((sum, n) => {
    const amount = parseFloat(n.capitalisedAmount?.replace(/[^\d.-]/g, '') || '0') || 0;
    return sum + amount;
  }, 0);

  return (
    <SummaryBand>
      <SummaryTile label="Needs" value={String(needs.length)} />
      <SummaryTile label="Total amount" value={`R ${totalAmount.toLocaleString()}`} />
      <SummaryTile label="Capital required" value={`R ${totalCapitalised.toLocaleString()}`} />
    </SummaryBand>
  );
}
