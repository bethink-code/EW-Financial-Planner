import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Assets } from '@shared/schema';

export function AssetsSummary() {
  const { data: assets = [] } = useQuery<Assets[]>({
    queryKey: ['/api/assets'],
  });

  // Calculate summary by category groups
  const summary = React.useMemo(() => {
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

    return sectionTotals;
  }, [assets]);

  return (
    <div className="px-5 pb-5">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {summary.map((section) => (
          <div key={section.name} className="summary-card">
            <div className="text-sm font-medium text-neutral-600">{section.name}</div>
            <div className="text-lg font-semibold text-neutral-900">{section.marketValue}</div>
            <div className="text-xs text-neutral-500">{section.count} asset{section.count !== 1 ? 's' : ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
}