import React, { useState, useCallback } from 'react';
import { CalculatorHeader } from '@/components/ui/calculator-header';
import { LiabilitiesTable } from '@/components/liabilities/liabilities-table';
import { LiabilityHybridTable } from '@/components/liabilities/liability-hybrid-table';
import { LiabilitiesSummary } from '@/components/liabilities/liabilities-summary';
import { CategorySelectionDialog } from '@/components/ui/category-selection-dialog';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useViewMode } from '@/contexts/view-mode-context';

export default function LiabilitiesPage() {
  const { viewMode, setViewMode } = useViewMode();
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  // Fetch liabilities
  const { data: liabilities = [] } = useQuery<any[]>({
    queryKey: ['/api/liabilities'],
  });

  // Liability categories
  const liabilityCategories = [
    { value: 'BONDS', label: 'Home Bond' },
    { value: 'VEHICLE_FINANCE', label: 'Vehicle Finance' },
    { value: 'CREDIT_CARDS', label: 'Credit Cards' },
    { value: 'PERSONAL_LOANS', label: 'Personal Loans' },
    { value: 'BUSINESS_LOANS', label: 'Business Loans' },
    { value: 'SHORT_TERM_DEBT', label: 'Short Term Debt' },
    { value: 'OTHER_DEBT', label: 'Other Debt' }
  ];

  // Add mutation
  const addMutation = useMutation({
    mutationFn: (category: string) => apiRequest('POST', '/api/liabilities', {
      category,
      section: category
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/liabilities'] });
    },
  });

  const handleAddLiability = useCallback(() => {
    setShowCategoryDialog(true);
  }, []);

  // Handle category selection
  const handleCategorySelect = useCallback((category: string) => {
    addMutation.mutate(category);
  }, [addMutation]);

  const handleViewModeChange = useCallback((newMode: 'table' | 'hybrid') => {
    setViewMode(newMode);
  }, []);

  return (
    <div className="">
      <div className="w-full px-6 py-6">
        <div className="w-[1320px]">
          {/* Combined Header, Summary and Table */}
          <CalculatorHeader
          title="Liabilities"
          onAddItem={handleAddLiability}
          addButtonText="Add Liability"
          isAddingItem={addMutation.isPending}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          className="mb-6"
        >
          {/* Summary with max width constraint */}
          <div className="max-w-6xl">
            <LiabilitiesSummary />
          </div>
          
          {/* Table with full width and margin */}
          <div className="table-container-wrapper">
            {viewMode === 'hybrid' ? (
              <LiabilityHybridTable onAddLiability={handleAddLiability} />
            ) : (
              <LiabilitiesTable 
                viewMode={viewMode} 
                onShowCategoryDialog={() => setShowCategoryDialog(true)}
                onAddLiability={handleAddLiability}
              />
            )}
          </div>
        </CalculatorHeader>

        {/* Category Selection Dialog */}
        <CategorySelectionDialog
          isOpen={showCategoryDialog}
          onClose={() => setShowCategoryDialog(false)}
          onSelectCategory={handleCategorySelect}
          title="Select Liability Category"
          categories={liabilityCategories}
        />
        </div>
      </div>
    </div>
  );
}