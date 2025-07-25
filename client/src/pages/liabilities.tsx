import React, { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { LiabilitiesTable } from '@/components/liabilities/liabilities-table';
import { LiabilitiesSummary } from '@/components/liabilities/liabilities-summary';
import { CalculatorHeader } from '@/components/ui/calculator-header';
import { CategorySelector } from '@/components/liabilities/category-selector';

export default function LiabilitiesPage() {
  const [viewMode, setViewMode] = useState<'table' | 'hybrid'>('table');

  // Fetch liabilities for count
  const { data: liabilities = [] } = useQuery<any[]>({
    queryKey: ['/api/liabilities'],
  });

  // Add mutation with category selection
  const addMutation = useMutation({
    mutationFn: (category: string) => apiRequest('/api/liabilities', 'POST', { section: category }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/liabilities'] });
    },
  });

  const handleAddLiability = useCallback((category: string) => {
    addMutation.mutate(category);
  }, [addMutation]);

  const handleViewModeChange = useCallback((mode: 'table' | 'hybrid') => {
    setViewMode(mode);
  }, []);

  return (
    <div className="bg-gray-50">
      <div className="w-full px-6 py-6">
        {/* Combined Header and Summary */}
        <div className="mb-6 max-w-6xl">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
            <div className="px-6 py-6">
              {/* Header Section */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold text-neutral-900">Liabilities</h1>
                  <div className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-sm font-medium">
                    {liabilities.length} {liabilities.length === 1 ? 'liability' : 'liabilities'}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <CategorySelector 
                    onAddLiability={handleAddLiability}
                    isLoading={addMutation.isPending}
                  />
                  
                  {/* View Mode Toggle */}
                  <div className="flex bg-neutral-100 rounded-full p-1">
                    <button
                      onClick={() => handleViewModeChange('table')}
                      className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                        viewMode === 'table'
                          ? 'bg-[#016991] text-white'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      Table
                    </button>
                    <button
                      onClick={() => handleViewModeChange('hybrid')}
                      className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                        viewMode === 'hybrid'
                          ? 'bg-[#016991] text-white'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      Hybrid
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Summary Section */}
              <LiabilitiesSummary />
            </div>
          </div>
        </div>
        
        <LiabilitiesTable viewMode={viewMode} />
      </div>
    </div>
  );
}