import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Liabilities } from '@shared/schema';

export function LiabilitiesSummary() {
  const { data: liabilities = [] } = useQuery<Liabilities[]>({
    queryKey: ['/api/liabilities'],
  });

  // Calculate summary by category groups
  const summary = React.useMemo(() => {
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

    return sectionTotals;
  }, [liabilities]);

  return (
    <div className="px-5 pb-5">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {summary.map((section) => (
          <div key={section.name} className="summary-card">
            <div className="text-sm font-medium text-neutral-600">{section.name}</div>
            <div className="text-lg font-semibold text-neutral-900">{section.debtAmount}</div>
            <div className="text-xs text-neutral-500">{section.count} liabilit{section.count !== 1 ? 'ies' : 'y'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}