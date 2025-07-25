import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Liabilities } from '@shared/schema';

export function LiabilitiesSummary() {
  const { data: liabilities = [] } = useQuery<Liabilities[]>({
    queryKey: ['/api/liabilities'],
  });

  // Calculate summary totals
  const summary = React.useMemo(() => {
    const totalDebtAmount = liabilities.reduce((sum: number, liability: Liabilities) => {
      const amount = parseFloat(liability.debtAmount?.replace(/[^\d.-]/g, '') || '0') || 0;
      return sum + amount;
    }, 0);

    const totalEstate = liabilities.reduce((sum: number, liability: Liabilities) => {
      const amount = parseFloat(liability.estate?.replace(/[^\d.-]/g, '') || '0') || 0;
      return sum + amount;
    }, 0);

    const totalOthers = liabilities.reduce((sum: number, liability: Liabilities) => {
      const amount = parseFloat(liability.others?.replace(/[^\d.-]/g, '') || '0') || 0;
      return sum + amount;
    }, 0);

    const totalClient = liabilities.reduce((sum: number, liability: Liabilities) => {
      const amount = parseFloat(liability.client?.replace(/[^\d.-]/g, '') || '0') || 0;
      return sum + amount;
    }, 0);

    return {
      totalLiabilities: liabilities.length,
      totalDebtAmount: `R ${totalDebtAmount.toLocaleString()}`,
      totalEstate: `R ${totalEstate.toLocaleString()}`,
      totalOthers: `R ${totalOthers.toLocaleString()}`,
      totalClient: `R ${totalClient.toLocaleString()}`,
    };
  }, [liabilities]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div className="summary-card">
        <div className="text-sm font-medium text-neutral-600">Total Liabilities</div>
        <div className="text-2xl font-bold text-neutral-900">{summary.totalLiabilities}</div>
      </div>
      
      <div className="summary-card">
        <div className="text-sm font-medium text-neutral-600">Total Debt Amount</div>
        <div className="text-lg font-semibold text-neutral-900">{summary.totalDebtAmount}</div>
      </div>
      
      <div className="summary-card">
        <div className="text-sm font-medium text-neutral-600">Estate Settlement</div>
        <div className="text-lg font-semibold text-neutral-900">{summary.totalEstate}</div>
      </div>
      
      <div className="summary-card">
        <div className="text-sm font-medium text-neutral-600">Others Settlement</div>
        <div className="text-lg font-semibold text-neutral-900">{summary.totalOthers}</div>
      </div>
      
      <div className="summary-card">
        <div className="text-sm font-medium text-neutral-600">Client Settlement</div>
        <div className="text-lg font-semibold text-neutral-900">{summary.totalClient}</div>
      </div>
    </div>
  );
}