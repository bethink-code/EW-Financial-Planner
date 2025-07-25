import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Assets } from '@shared/schema';
import { AssetsTable } from '@/components/assets/assets-table';
import { AssetsSummary } from '@/components/assets/assets-summary';
import { CalculatorHeader } from '@/components/ui/calculator-header';
import { Switcher } from '@/components/ui/switcher';

export function AssetsPage() {
  const [viewMode, setViewMode] = useState<'table' | 'hybrid'>('table');

  const { data: assets = [] } = useQuery<Assets[]>({
    queryKey: ['/api/assets'],
  });

  return (
    <div className="space-y-6 py-6">
      <CalculatorHeader
        title="Assets"
        itemCount={assets.length}
        itemLabel="assets"
        addButtonText="Add Asset"
        onAddItem={() => {
          // This will be handled by the table component
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      >        
        <AssetsSummary />
      </CalculatorHeader>

      <AssetsTable viewMode={viewMode} />
    </div>
  );
}