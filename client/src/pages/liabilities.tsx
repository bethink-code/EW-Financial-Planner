import React, { useState, useCallback } from 'react';
import { CalculatorHeader } from '@/components/ui/calculator-header';
import { LiabilityTable } from '@/components/liabilities/liability-table';
import { LiabilitiesSummary } from '@/components/liabilities/liabilities-summary';
import { CategorySelectionDialog } from '@/components/ui/category-selection-dialog';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
export default function LiabilitiesPage() {
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

  return (
    <div className="">
      <div className="w-full px-6 pb-6">
        <div className="w-[1320px]">
          {/* Combined Header, Summary and Table */}
          <CalculatorHeader className="mb-6">
          {/* Summary with max width constraint */}
          <div className="max-w-6xl">
            <LiabilitiesSummary />
          </div>
          
          {/* Table with full width and margin */}
          <div className="table-container-wrapper">
            <LiabilityTable onAddLiability={handleAddLiability} />
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