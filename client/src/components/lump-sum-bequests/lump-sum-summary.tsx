import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { LumpSumBequest } from "@shared/schema";
import { SummaryBand, SummaryTile } from "@/components/common/summary-band";

export function LumpSumSummary() {
  const { data: bequests = [] } = useQuery<LumpSumBequest[]>({
    queryKey: ['/api/lump-sum-bequests'],
  });

  const totals = useMemo(() => {
    return bequests.reduce(
      (acc, b) => {
        const valueAtDeath = parseFloat(b.valueAtDeath?.replace(/[^\d.-]/g, '') || '0') || 0;
        const amount = parseFloat(b.amount?.replace(/[^\d.-]/g, '') || '0') || 0;
        return {
          totalValueAtDeath: acc.totalValueAtDeath + valueAtDeath,
          totalAmount: acc.totalAmount + amount,
          count: acc.count + 1,
        };
      },
      { totalValueAtDeath: 0, totalAmount: 0, count: 0 },
    );
  }, [bequests]);

  return (
    <SummaryBand>
      <SummaryTile label="Bequests" value={String(totals.count)} />
      <SummaryTile label="Total amount" value={`R ${totals.totalAmount.toLocaleString()}`} />
      <SummaryTile label="Value at death" value={`R ${totals.totalValueAtDeath.toLocaleString()}`} />
    </SummaryBand>
  );
}
