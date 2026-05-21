import { useQuery } from "@tanstack/react-query";
import type { RetirementFund } from "@shared/schema";
import { SummaryBand, SummaryTile } from "@/components/common/summary-band";

export function RetirementFundsSummary() {
  const { data: funds = [] } = useQuery<RetirementFund[]>({
    queryKey: ["/api/retirement-funds"],
  });

  const sum = (extract: (f: RetirementFund) => string | null | undefined) =>
    funds.reduce(
      (acc, f) => acc + (parseFloat((extract(f) || '').replace(/[^\d.-]/g, '')) || 0),
      0,
    );

  const fundValue = sum(f => f.fundValue);
  const fundValueAtDeath = sum(f => f.fundValueAtDeath);

  return (
    <SummaryBand>
      <SummaryTile label="Funds" value={String(funds.length)} />
      <SummaryTile label="Fund value" value={`R ${fundValue.toLocaleString()}`} />
      <SummaryTile label="Value at death" value={`R ${fundValueAtDeath.toLocaleString()}`} />
    </SummaryBand>
  );
}
