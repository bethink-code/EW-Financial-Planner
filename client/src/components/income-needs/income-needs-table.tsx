import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { IncomeNeeds, InsertIncomeNeeds } from '@shared/schema';
import { AddButton } from '@/components/ui/action-buttons';
import { HybridViewWrapper } from '@/components/common/hybrid-view-wrapper';
import { IncomeNeedPreviewCard } from './income-need-preview-card';
import { IncomeNeedDetailForm } from './income-need-detail-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface IncomeNeedsTableProps {
  searchTerm?: string;
  onAddIncomeNeed?: () => void;
}

function IncomeNeedsTable({ searchTerm, onAddIncomeNeed }: IncomeNeedsTableProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedIncomeNeedId, setSelectedIncomeNeedId] = useState<number | null>(null);

  const { data: incomeNeeds = [], isLoading, error } = useQuery<IncomeNeeds[]>({
    queryKey: ['/api/income-needs'],
  });

  // Filter income needs based on search term
  const filteredIncomeNeeds = useMemo(() => {
    if (!searchTerm) return incomeNeeds;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return incomeNeeds.filter(incomeNeed =>
      incomeNeed.description?.toLowerCase().includes(lowerSearchTerm) ||
      incomeNeed.personName?.toLowerCase().includes(lowerSearchTerm) ||
      incomeNeed.amount?.toLowerCase().includes(lowerSearchTerm) ||
      incomeNeed.frequency?.toLowerCase().includes(lowerSearchTerm)
    );
  }, [incomeNeeds, searchTerm]);

  // Auto-select first item
  useEffect(() => {
    if (filteredIncomeNeeds.length > 0 && !selectedIncomeNeedId) {
      setSelectedIncomeNeedId(filteredIncomeNeeds[0].id);
    }
  }, [filteredIncomeNeeds, selectedIncomeNeedId]);

  const addMutation = useMutation({
    mutationFn: async (): Promise<IncomeNeeds> => {
      const newIncomeNeed: InsertIncomeNeeds = {
        description:"",
        personName:"",
        startDate:"Enter details ...",
        termYears:"0",
        increasePercentage:"0%",
        cpi: false,
        frequency:"monthly",
        amount:"R 0",
        capitalisedAmount:"R 0",
      };

      const response = await fetch('/api/income-needs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newIncomeNeed),
      });

      if (!response.ok) {
        throw new Error('Failed to add income need');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-needs'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Failed to add income need:', error);
      setIsUpdating(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/income-needs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete income need');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-needs'] });
    }
  });

  // Get selected income need for detail pane
  const selectedIncomeNeed = selectedIncomeNeedId
    ? filteredIncomeNeeds.find(inc => inc.id === selectedIncomeNeedId)
    : null;

  const handleDeleteIncomeNeed = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to delete this income need?')) {
      // If deleting the selected item, clear selection
      if (id === selectedIncomeNeedId) {
        setSelectedIncomeNeedId(null);
      }
      deleteMutation.mutate(id);
    }
  }, [deleteMutation, selectedIncomeNeedId]);

  const handleDuplicateIncomeNeed = useCallback((incomeNeed: IncomeNeeds) => {
    setIsUpdating(true);
    addMutation.mutate();
  }, [addMutation]);

  if (isLoading) {
    return <div className="flex justify-center">Loading income needs...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error loading income needs. Please try again.</div>;
  }

  return (
    <HybridViewWrapper
      summaryCards={
        <div>
          {onAddIncomeNeed && (
            <div className="hybrid-add-button-container p-4 border-b border-neutral-200">
              <Button
                onClick={onAddIncomeNeed}
                disabled={isUpdating}
                className="bg-white text-gray-700 border border-neutral-200 hover:bg-gray-50 hover:text-gray-900 font-normal"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Need
              </Button>
            </div>
          )}
          <div className="hybrid-tabs-list">
            {filteredIncomeNeeds.map((incomeNeed, index) => (
              <IncomeNeedPreviewCard
                key={incomeNeed.id}
                incomeNeed={incomeNeed}
                isActive={selectedIncomeNeedId === incomeNeed.id}
                onClick={() => setSelectedIncomeNeedId(incomeNeed.id)}
                isFirst={index === 0}
                isLast={index === filteredIncomeNeeds.length - 1}
              />
            ))}
          </div>
        </div>
      }
      detailForms={
        selectedIncomeNeed ? (
          <IncomeNeedDetailForm
            incomeNeed={selectedIncomeNeed}
            onDelete={handleDeleteIncomeNeed}
            onDuplicate={handleDuplicateIncomeNeed}
          />
        ) : filteredIncomeNeeds.length === 0 ? (
          <div className="hybrid-empty-state text-center py-8">
            <h3 className="text-lg font-medium text-neutral-500 mb-2">No Income Needs Found</h3>
            <p className="text-neutral-400 mb-4">
              {searchTerm ? 'No income needs match your search criteria.' : 'Start by adding your first income need.'}
            </p>
            {onAddIncomeNeed && (
              <AddButton
                onClick={onAddIncomeNeed}
                disabled={isUpdating}
              />
            )}
          </div>
        ) : (
          <div className="hybrid-select-state text-center py-8">
            <h3 className="text-lg font-medium text-neutral-500 mb-2">Select an Income Need</h3>
            <p className="text-neutral-400">Choose an income need from the tabs on the left to view and edit details.</p>
          </div>
        )
      }
      isUpdating={isUpdating}
      isEmpty={filteredIncomeNeeds.length === 0}
      emptyStateMessage={searchTerm ? "No income needs match your search criteria." : "No income needs found. Add your first income need to get started."}
    />
  );
}

export default IncomeNeedsTable;
