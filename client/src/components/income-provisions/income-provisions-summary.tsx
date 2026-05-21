import { useCallback, useMemo } from 'react';
import { useQuery } from "@tanstack/react-query";
import type { IncomeProvisions } from "@shared/schema";
import { parseCurrencyValue } from '@/lib/formatting';
import { SummaryBand, SummaryTile } from '@/components/common/summary-band';

export function IncomeProvisionsSummary() {
  const { data: provisions = [] } = useQuery<IncomeProvisions[]>({
    queryKey: ["/api/income-provisions"],
  });

  const calculateCapitalisedAmount = useCallback((provision: IncomeProvisions): number => {
    const amount = parseCurrencyValue(provision.amount || '0');
    const termYears = parseFloat(provision.termYears?.replace(/[^\d.-]/g, '') || '0');
    const increaseRate = parseFloat(provision.increasePercentage?.replace(/[^\d.-]/g, '') || '0') / 100;
    if (amount <= 0 || termYears <= 0) return 0;
    const discountRate = provision.cpi ? 0.06 : 0.08;
    const frequency = provision.frequency === 'monthly' ? 12 : provision.frequency === 'quarterly' ? 4 : 1;
    const totalPeriods = termYears * frequency;
    const periodicDiscountRate = discountRate / frequency;
    const periodicIncreaseRate = increaseRate / frequency;
    if (Math.abs(periodicDiscountRate - periodicIncreaseRate) < 0.0001) {
      return amount * totalPeriods;
    }
    const netRate = periodicDiscountRate - periodicIncreaseRate;
    const pvFactor = (1 - Math.pow((1 + periodicIncreaseRate) / (1 + periodicDiscountRate), totalPeriods)) / netRate;
    return amount * pvFactor;
  }, []);

  const { count, totalAmount, totalCapitalised } = useMemo(() => {
    const totalAmount = provisions.reduce((sum, p) => sum + parseCurrencyValue(p.amount || '0'), 0);
    const totalCapitalised = provisions.reduce((sum, p) => sum + calculateCapitalisedAmount(p), 0);
    return { count: provisions.length, totalAmount, totalCapitalised };
  }, [provisions, calculateCapitalisedAmount]);

  return (
    <SummaryBand>
      <SummaryTile label="Provisions" value={String(count)} />
      <SummaryTile label="Annual amount" value={`R ${Math.round(totalAmount).toLocaleString()}`} />
      <SummaryTile label="Capital required" value={`R ${Math.round(totalCapitalised).toLocaleString()}`} />
    </SummaryBand>
  );
}
