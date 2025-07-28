import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Assets } from '@shared/schema';

export function AssetsSummary() {
  const { data: assets = [] } = useQuery<Assets[]>({
    queryKey: ['/api/assets'],
  });

  // Calculate summary totals
  const summary = React.useMemo(() => {
    const totalMarketValue = assets.reduce((sum: number, asset: Assets) => {
      const amount = parseFloat(asset.marketValue?.replace(/[^\d.-]/g, '') || '0') || 0;
      return sum + amount;
    }, 0);

    const totalEstate = assets.reduce((sum: number, asset: Assets) => {
      const amount = parseFloat(asset.estate?.replace(/[^\d.-]/g, '') || '0') || 0;
      return sum + amount;
    }, 0);

    const totalOthers = assets.reduce((sum: number, asset: Assets) => {
      const amount = parseFloat(asset.others?.replace(/[^\d.-]/g, '') || '0') || 0;
      return sum + amount;
    }, 0);

    const totalClient = assets.reduce((sum: number, asset: Assets) => {
      const amount = parseFloat(asset.client?.replace(/[^\d.-]/g, '') || '0') || 0;
      return sum + amount;
    }, 0);

    return {
      totalAssets: assets.length,
      totalMarketValue: `R ${totalMarketValue.toLocaleString()}`,
      totalEstate: `R ${totalEstate.toLocaleString()}`,
      totalOthers: `R ${totalOthers.toLocaleString()}`,
      totalClient: `R ${totalClient.toLocaleString()}`,
    };
  }, [assets]);

  return (
    <div className="px-5 pb-5">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <div className="summary-card">
          <div className="text-sm font-medium text-neutral-600">Total Assets</div>
          <div className="text-2xl font-bold text-neutral-900">{summary.totalAssets}</div>
        </div>
        
        <div className="summary-card">
          <div className="text-sm font-medium text-neutral-600">Market Value</div>
          <div className="text-lg font-semibold text-neutral-900">{summary.totalMarketValue}</div>
        </div>
        
        <div className="summary-card">
          <div className="text-sm font-medium text-neutral-600">Estate</div>
          <div className="text-lg font-semibold text-neutral-900">{summary.totalEstate}</div>
        </div>
        
        <div className="summary-card">
          <div className="text-sm font-medium text-neutral-600">Others</div>
          <div className="text-lg font-semibold text-neutral-900">{summary.totalOthers}</div>
        </div>
        
        <div className="summary-card">
          <div className="text-sm font-medium text-neutral-600">Client</div>
          <div className="text-lg font-semibold text-neutral-900">{summary.totalClient}</div>
        </div>
      </div>
    </div>
  );
}