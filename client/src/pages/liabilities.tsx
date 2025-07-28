import React, { useState, useCallback } from 'react';
import { CalculatorHeader } from '@/components/ui/calculator-header';
import { LiabilitiesTable } from '@/components/liabilities/liabilities-table';
import { LiabilitiesSummary } from '@/components/liabilities/liabilities-summary';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';

export default function LiabilitiesPage() {
  const [viewMode, setViewMode] = useState<'table' | 'hybrid'>('table');

  // Fetch liabilities
  const { data: liabilities = [] } = useQuery<any[]>({
    queryKey: ['/api/liabilities'],
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/liabilities', {
      category: 'BONDS',
      description: 'Enter details...',
      currency: 'ZAR',
      debtAmount: 'R 0',
      johnDoe: '0%',
      janetteDoe: '0%',
      doeJunior: '0%',
      doeFamilyTrust: '0%',
      estate: 'R 0',
      others: 'R 0',
      client: 'R 0',
      section: 'BONDS',
      included: true
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/liabilities'] });
    },
  });

  const handleAddLiability = useCallback(() => {
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
            title="Liabilities"
            itemCount={liabilities.length}
            itemLabel="liabilities"
            onAddItem={handleAddLiability}
            addButtonText="Add Liability"
            isAddingItem={addMutation.isPending}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          >
            <LiabilitiesSummary />
          </CalculatorHeader>
        </div>
        
        <LiabilitiesTable viewMode={viewMode} />
      </div>
    </div>
  );
}