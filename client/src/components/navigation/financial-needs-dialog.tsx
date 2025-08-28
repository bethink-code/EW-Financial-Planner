import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface FinancialNeedsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  currentNeeds: Array<{ key: string; displayName: string }>;
}

const allFinancialNeeds = [
  { key: 'death', displayName: 'Death' },
  { key: 'death-estate-liquidity', displayName: 'Death with estate liquidity' },
  { key: 'permanent-disability', displayName: 'Permanent disability' },
  { key: 'temporary-disability', displayName: 'Temporary disability' },
  { key: 'dread-disease', displayName: 'Dread disease' },
  { key: 'retirement', displayName: 'Retirement' },
  { key: 'investment-planning', displayName: 'Investment planning' },
  { key: 'lump-sum-investment', displayName: 'Lump sum and recurring investment' },
  { key: 'portfolio-comparison', displayName: 'Portfolio comparison tool' },
  { key: 'contribution-income-analysis', displayName: 'Contribution and income analysis' },
  { key: 'saving-future-need', displayName: 'Saving for a future need' },
  { key: 'income-from-capital', displayName: 'Income from capital' },
  { key: 'debt-repayment', displayName: 'Debt repayment' }
];

export function FinancialNeedsDialog({ 
  isOpen, 
  onClose, 
  planId, 
  currentNeeds 
}: FinancialNeedsDialogProps) {
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>(
    currentNeeds.map(need => need.key)
  );
  
  const queryClient = useQueryClient();

  const updatePlanNeedsMutation = useMutation({
    mutationFn: async (needsToUpdate: string[]) => {
      const response = await fetch(`/api/financial-plans/${planId}/needs`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ needKeys: needsToUpdate })
      });
      if (!response.ok) throw new Error('Failed to update plan needs');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/financial-plans/${planId}/with-needs`] });
      queryClient.invalidateQueries({ queryKey: ['/api/financial-plans'] });
      onClose();
    }
  });

  const handleNeedToggle = (needKey: string, checked: boolean) => {
    if (checked) {
      setSelectedNeeds(prev => [...prev, needKey]);
    } else {
      setSelectedNeeds(prev => prev.filter(key => key !== needKey));
    }
  };

  const handleUpdate = () => {
    updatePlanNeedsMutation.mutate(selectedNeeds);
  };

  const handleCancel = () => {
    setSelectedNeeds(currentNeeds.map(need => need.key));
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Your financial needs</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-gray-600 mb-6">You can select multiple needs.</p>
          
          <div className="grid grid-cols-2 gap-4">
            {allFinancialNeeds.map((need) => {
              const isChecked = selectedNeeds.includes(need.key);
              const isCurrentlyInPlan = currentNeeds.some(current => current.key === need.key);
              
              return (
                <div key={need.key} className="flex items-center space-x-3">
                  <Checkbox
                    id={need.key}
                    checked={isChecked}
                    onCheckedChange={(checked) => handleNeedToggle(need.key, !!checked)}
                    className="data-[state=checked]:bg-[#016991] data-[state=checked]:border-[#016991]"
                  />
                  <label 
                    htmlFor={need.key}
                    className={`text-sm cursor-pointer ${
                      isCurrentlyInPlan ? 'bg-[#E6F0F5] px-2 py-1 rounded' : ''
                    }`}
                  >
                    {need.displayName}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-600 border-gray-200"
            disabled={updatePlanNeedsMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdate}
            className="flex-1 bg-[#E6F0F5] hover:bg-[#D6E7F0] text-[#016991] border-[#E6F0F5]"
            disabled={updatePlanNeedsMutation.isPending}
          >
            {updatePlanNeedsMutation.isPending ? 'Updating...' : '✓ Update plan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}