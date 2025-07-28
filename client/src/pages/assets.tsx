import React, { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Assets } from '@shared/schema';
import { AssetsTable } from '@/components/assets/assets-table';
import { AssetsSummary } from '@/components/assets/assets-summary';
import { CalculatorHeader } from '@/components/ui/calculator-header';
import { apiRequest, queryClient } from '@/lib/queryClient';

export function AssetsPage() {
  const [viewMode, setViewMode] = useState<'table' | 'hybrid'>('table');

  const { data: assets = [] } = useQuery<Assets[]>({
    queryKey: ['/api/assets'],
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/assets', {
      category: 'PROPERTY',
      description: 'Enter details...',
      marketValue: 'R 0',
      johnDoe: '0%',
      janetteDoe: '0%',
      doeJunior: '0%',
      doeFamilyTrust: '0%',
      estate: 'R 0',
      others: 'R 0',
      client: 'R 0',
      section: 'PROPERTY',
      included: true
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
    },
  });

  const handleAddAsset = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  const handleViewModeChange = useCallback((newMode: 'table' | 'hybrid') => {
    setViewMode(newMode);
  }, []);

  return (
    <div className="">
      <div className="w-full px-6 py-6">
        {/* Combined Header and Summary */}
        <div className="mb-6 max-w-6xl">
          <CalculatorHeader
            title="Assets"
            itemCount={assets.length}
            itemLabel="assets"
            onAddItem={handleAddAsset}
            addButtonText="Add Asset"
            isAddingItem={addMutation.isPending}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          >
            <AssetsSummary />
          </CalculatorHeader>
        </div>
        
        <AssetsTable viewMode={viewMode} />
      </div>
    </div>
  );
}