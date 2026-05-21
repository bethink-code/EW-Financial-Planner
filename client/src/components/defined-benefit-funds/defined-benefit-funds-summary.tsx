import { useQuery } from "@tanstack/react-query";
import type { DefinedBenefitFund } from "@shared/schema";
import { SummaryBand, SummaryTile } from "@/components/common/summary-band";

export function DefinedBenefitFundsSummary() {
  const { data: funds = [] } = useQuery<DefinedBenefitFund[]>({
    queryKey: ["/api/defined-benefit-funds"],
  });

  const sum = (extract: (f: DefinedBenefitFund) => string | null | undefined) =>
    funds.reduce(
      (acc, f) => acc + (parseFloat((extract(f) || '').replace(/[^\d.-]/g, '')) || 0),
      0,
    );
  const totalPensionIncome = sum(f => f.pensionIncomeAmount);
  const totalDeathLumpSum = sum(f => f.deathLumpSum);

  return (
    <SummaryBand>
      <SummaryTile label="Funds" value={String(funds.length)} />
      <SummaryTile label="Pension income" value={`R ${totalPensionIncome.toLocaleString()}`} />
      <SummaryTile label="Death lump sum" value={`R ${totalDeathLumpSum.toLocaleString()}`} />
    </SummaryBand>
  );
}
