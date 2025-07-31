import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Assets, Liabilities } from '@shared/schema';

export function AssetsSummary() {
  const { data: assets = [] } = useQuery<Assets[]>({
    queryKey: ['/api/assets'],
  });

  const { data: liabilities = [] } = useQuery<Liabilities[]>({
    queryKey: ['/api/liabilities'],
  });

  // Calculate summary by category groups and NET assets
  const summary = React.useMemo(() => {
    // Calculate total assets value
    const totalAssetsValue = assets.reduce((sum: number, asset: Assets) => {
      const amount = parseFloat(asset.marketValue?.replace(/[^\d.-]/g, '') || '0') || 0;
      return sum + amount;
    }, 0);

    // Calculate total liabilities value
    const totalLiabilitiesValue = liabilities.reduce((sum: number, liability: Liabilities) => {
      const amount = parseFloat(liability.debtAmount?.replace(/[^\d.-]/g, '') || '0') || 0;
      return sum + amount;
    }, 0);

    // Calculate NET assets (assets minus liabilities)
    const netAssets = totalAssetsValue - totalLiabilitiesValue;

    // Group assets by section
    const groupedAssets = assets.reduce((groups, asset) => {
      const section = asset.section || 'Other';
      if (!groups[section]) {
        groups[section] = [];
      }
      groups[section].push(asset);
      return groups;
    }, {} as Record<string, Assets[]>);

    // Calculate totals by section
    const sectionTotals = Object.entries(groupedAssets).map(([sectionName, sectionAssets]) => {
      const marketValue = sectionAssets.reduce((sum: number, asset: Assets) => {
        const amount = parseFloat(asset.marketValue?.replace(/[^\d.-]/g, '') || '0') || 0;
        return sum + amount;
      }, 0);

      return {
        name: sectionName.replace('_', ' '),
        count: sectionAssets.length,
        marketValue: `R ${marketValue.toLocaleString()}`,
      };
    });

    // Add NET assets card at the beginning
    return [
      {
        name: 'NET Assets',
        count: 0,
        marketValue: `R ${netAssets.toLocaleString()}`,
        isNetCard: true,
      },
      ...sectionTotals
    ];
  }, [assets, liabilities]);

  return (
    <div className="px-5 pb-5">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {summary.map((section) => (
          <div key={section.name} className={`summary-card ${(section as any).isNetCard ? 'bg-orange-50 !border-none net-assets-card' : ''}`}>
            <div className={`text-sm font-medium ${(section as any).isNetCard ? 'text-neutral-700' : 'text-neutral-600'}`}>{section.name}</div>
            <div className={`text-lg font-semibold ${(section as any).isNetCard ? 'text-neutral-800' : 'text-neutral-900'}`}>{section.marketValue}</div>
            {!(section as any).isNetCard && (
              <div className="text-xs text-neutral-500">{section.count} asset{section.count !== 1 ? 's' : ''}</div>
            )}
            {(section as any).isNetCard && (
              <div className="text-xs text-neutral-600">Assets - Liabilities</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}