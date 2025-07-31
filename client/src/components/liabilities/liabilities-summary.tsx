import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Assets, Liabilities } from '@shared/schema';

export function LiabilitiesSummary() {
  const { data: liabilities = [] } = useQuery<Liabilities[]>({
    queryKey: ['/api/liabilities'],
  });

  const { data: assets = [] } = useQuery<Assets[]>({
    queryKey: ['/api/assets'],
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

    // Group liabilities by section
    const groupedLiabilities = liabilities.reduce((groups, liability) => {
      const section = liability.section || 'Other';
      if (!groups[section]) {
        groups[section] = [];
      }
      groups[section].push(liability);
      return groups;
    }, {} as Record<string, Liabilities[]>);

    // Calculate totals by section
    const sectionTotals = Object.entries(groupedLiabilities).map(([sectionName, sectionLiabilities]) => {
      const debtAmount = sectionLiabilities.reduce((sum: number, liability: Liabilities) => {
        const amount = parseFloat(liability.debtAmount?.replace(/[^\d.-]/g, '') || '0') || 0;
        return sum + amount;
      }, 0);

      return {
        name: sectionName.replace('_', ' '),
        count: sectionLiabilities.length,
        debtAmount: `R ${debtAmount.toLocaleString()}`,
      };
    });

    // Add NET assets card at the beginning
    return [
      {
        name: 'NET Assets',
        count: 0,
        debtAmount: `R ${netAssets.toLocaleString()}`,
        isNetCard: true,
      },
      ...sectionTotals
    ];
  }, [assets, liabilities]);

  return (
    <div className="px-5 pb-5">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {summary.map((section) => (
          <div key={section.name} className={`summary-card ${(section as any).isNetCard ? 'bg-orange-50 !border-none' : ''}`}>
            <div className={`text-sm font-medium ${(section as any).isNetCard ? 'text-neutral-700' : 'text-neutral-600'}`}>{section.name}</div>
            <div className={`text-lg font-semibold ${(section as any).isNetCard ? 'text-neutral-800' : 'text-neutral-900'}`}>{section.debtAmount}</div>
            {!(section as any).isNetCard && (
              <div className="text-xs text-neutral-500">{section.count} liabilit{section.count !== 1 ? 'ies' : 'y'}</div>
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