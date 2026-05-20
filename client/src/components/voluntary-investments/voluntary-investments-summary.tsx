import { useQuery } from "@tanstack/react-query";
import type { VoluntaryInvestment } from "@shared/schema";
import { SummaryBand, SummaryTile } from "@/components/common/summary-band";

export function VoluntaryInvestmentsSummary() {
  const { data: investments = [] } = useQuery<VoluntaryInvestment[]>({
    queryKey: ["/api/voluntary-investments"],
  });

  const sum = (extract: (i: VoluntaryInvestment) => string | null | undefined) =>
    investments.reduce(
      (acc, i) => acc + (parseFloat((extract(i) || '').replace(/[^\d.-]/g, '')) || 0),
      0,
    );
  const totalBaseCost = sum(i => i.baseCost);
  const totalMarketValue = sum(i => i.marketValue);

  return (
    <SummaryBand>
      <SummaryTile label="Investments" value={String(investments.length)} />
      <SummaryTile label="Base cost" value={`R ${totalBaseCost.toLocaleString()}`} />
      <SummaryTile label="Market value" value={`R ${totalMarketValue.toLocaleString()}`} />
    </SummaryBand>
  );
}
