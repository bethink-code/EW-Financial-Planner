import React, { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Assets } from '@shared/assets-schema';
import { AssetTable } from '@/components/assets/asset-table';
import { AssetsSummary } from '@/components/assets/assets-summary';
import { CalculatorHeader } from '@/components/ui/calculator-header';
import { CategorySelectionDialog } from '@/components/ui/category-selection-dialog';
import { apiRequest, queryClient } from '@/lib/queryClient';

export function AssetsPage() {
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  const { data: assets = [] } = useQuery<Assets[]>({
    queryKey: ['/api/assets'],
  });

  // Asset categories
  const assetCategories = [
    { value: 'PROPERTY', label: 'Property' },
    { value: 'VEHICLES', label: 'Vehicles' },
    { value: 'INVESTMENTS', label: 'Investments' },
    { value: 'CASH', label: 'Cash & Bank' },
    { value: 'PERSONAL', label: 'Personal Assets' },
    { value: 'BUSINESS', label: 'Business Assets' },
    { value: 'OTHER', label: 'Other Assets' }
  ];

  // Add mutation
  const addMutation = useMutation({
    mutationFn: (category: string) => apiRequest('POST', '/api/assets', {
      category,
      section: category
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
    },
  });

  const handleAddAsset = useCallback(() => {
    setShowCategoryDialog(true);
  }, []);

  // Handle category selection
  const handleCategorySelect = useCallback((category: string) => {
    addMutation.mutate(category);
  }, [addMutation]);

  return (
    <div className="">
      <div className="w-full px-6 py-6">
        <div className="w-[1320px]">
          {/* Combined Header, Summary and Table */}
          <CalculatorHeader
          title="Assets"
          onAddItem={handleAddAsset}
          addButtonText="Add Asset"
          isAddingItem={addMutation.isPending}
          className="mb-6"
        >
          {/* Summary with max width constraint */}
          <div className="max-w-6xl">
            <AssetsSummary />
          </div>
          
          {/* Table with full width and margin */}
          <div className="table-container-wrapper">
            <AssetTable onAddAsset={handleAddAsset} />
          </div>
        </CalculatorHeader>

        {/* Category Selection Dialog */}
        <CategorySelectionDialog
          isOpen={showCategoryDialog}
          onClose={() => setShowCategoryDialog(false)}
          onSelectCategory={handleCategorySelect}
          title="Select Asset Category"
          categories={assetCategories}
        />
        </div>
      </div>
    </div>
  );
}