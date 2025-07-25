import React, { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { LiabilitiesTable } from '@/components/liabilities/liabilities-table';
import { LiabilitiesSummary } from '@/components/liabilities/liabilities-summary';
import { CalculatorHeader } from '@/components/ui/calculator-header';

export default function LiabilitiesPage() {
  const [viewMode, setViewMode] = useState<'table' | 'hybrid'>('table');

  // Fetch liabilities for count
  const { data: liabilities = [] } = useQuery<any[]>({
    queryKey: ['/api/liabilities'],
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: () => apiRequest('/api/liabilities', 'POST', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/liabilities'] });
    },
  });

  const handleAddLiability = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  const handleViewModeChange = useCallback((mode: 'table' | 'hybrid') => {
    setViewMode(mode);
  }, []);

  return (
    <div className="bg-gray-50">
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