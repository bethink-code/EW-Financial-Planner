import { useQuery } from "@tanstack/react-query";
import type { Assurance } from "@shared/schema";
import { SummaryBand, SummaryTile } from "@/components/common/summary-band";

export function AssuranceSummary() {
  const { data: policies = [] } = useQuery<Assurance[]>({
    queryKey: ["/api/assurance"],
    queryFn: async () => {
      const response = await fetch("/api/assurance");
      if (!response.ok) throw new Error('Failed to fetch assurance policies');
      return response.json();
    },
  });

  const sum = (extract: (p: Assurance) => string) =>
    policies.reduce((acc, p) => acc + (parseFloat(extract(p)?.replace(/[^\d.-]/g, '') || '0') || 0), 0);

  const totalDeathBenefit = sum(p => p.deathBenefit);
  const totalPremiumsByOthers = sum(p => p.premiumsByOthers);

  return (
    <SummaryBand>
      <SummaryTile label="Policies" value={String(policies.length)} />
      <SummaryTile label="Total cover" value={`R ${totalDeathBenefit.toLocaleString()}`} />
      <SummaryTile label="Premiums by others" value={`R ${totalPremiumsByOthers.toLocaleString()}`} />
    </SummaryBand>
  );
}

export default AssuranceSummary;
