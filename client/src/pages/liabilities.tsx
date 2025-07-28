import React, { useState, useCallback } from 'react';
import { CalculatorHeader } from '@/components/ui/calculator-header';
import { LiabilitiesTable } from '@/components/liabilities/liabilities-table';
import { LiabilitiesSummary } from '@/components/liabilities/liabilities-summary';
import { CategorySelectionDialog } from '@/components/ui/category-selection-dialog';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';

export default function LiabilitiesPage() {
  const [viewMode, setViewMode] = useState<'table' | 'hybrid'>('table');
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
      description: 'Enter details...',
      debtAmount: 'R 0',
      johnDoe: '0%',
      janetteDoe: '0%',
      doeJunior: '0%',
      doeFamilyTrust: '0%',
      estate: 'R 0',
      others: 'R 0',
      client: 'R 0',
      section: category,
      included: true
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
        
        <LiabilitiesTable 
          viewMode={viewMode} 
          onShowCategoryDialog={() => setShowCategoryDialog(true)}
        />

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
  );
}