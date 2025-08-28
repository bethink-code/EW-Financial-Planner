import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [planName, setPlanName] = useState('');
  
  const queryClient = useQueryClient();
  
  // Fetch current plan data to get the plan name
  const { data: currentPlan } = useQuery({
    queryKey: [`/api/financial-plans/${planId}`],
    queryFn: () => fetch(`/api/financial-plans/${planId}`).then(res => res.json()),
    enabled: isOpen && planId !== 'new',
  });
  
  // Update plan name when currentPlan data is loaded
  useEffect(() => {
    if (planId === 'new') {
      setPlanName('');
    } else if (currentPlan?.name) {
      setPlanName(currentPlan.name);
    }
  }, [planId, currentPlan?.name]);
  
  // Update selected needs when currentNeeds changes
  useEffect(() => {
    if (isOpen) {
      setSelectedNeeds(currentNeeds.map(need => need.key));
    }
  }, [currentNeeds, isOpen]);

  const updatePlanNeedsMutation = useMutation({
    mutationFn: async (needsToUpdate: string[]) => {
      if (planId === 'new') {
        // Create new plan
        const createResponse = await fetch('/api/financial-plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: planName || 'New Financial Plan',
            description: 'Financial plan created with selected needs',
            dateApplicable: new Date().toISOString().split('T')[0]
          })
        });
        if (!createResponse.ok) throw new Error('Failed to create plan');
        const newPlan = await createResponse.json();
        
        // Add needs to the new plan
        const needsResponse = await fetch(`/api/financial-plans/${newPlan.id}/needs`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ needKeys: needsToUpdate })
        });
        if (!needsResponse.ok) throw new Error('Failed to add needs to plan');
        return needsResponse.json();
      } else {
        // Update existing plan name if changed
        if (currentPlan?.name && planName !== currentPlan.name) {
          const planUpdateResponse = await fetch(`/api/financial-plans/${planId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              name: planName,
              description: currentPlan.description,
              dateApplicable: currentPlan.dateApplicable
            })
          });
          if (!planUpdateResponse.ok) throw new Error('Failed to update plan name');
        }
        
        // Update existing plan needs
        const response = await fetch(`/api/financial-plans/${planId}/needs`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ needKeys: needsToUpdate })
        });
        if (!response.ok) throw new Error('Failed to update plan needs');
        return response.json();
      }
    },
    onSuccess: () => {
      if (planId !== 'new') {
        // Invalidate the specific plan query
        queryClient.invalidateQueries({ queryKey: [`/api/financial-plans/${planId}`] });
        // Invalidate the plan with needs queries (multiple patterns)
        queryClient.invalidateQueries({ queryKey: [`/api/financial-plans/${planId}/with-needs`] });
        queryClient.invalidateQueries({ queryKey: ["/api/financial-plans", parseInt(planId), "with-needs"] });
      }
      // Invalidate all financial plans queries (including search variations)
      queryClient.invalidateQueries({ queryKey: ['/api/financial-plans'] });
      // Invalidate any search-based queries
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          Array.isArray(query.queryKey) && 
          query.queryKey.length >= 1 && 
          query.queryKey[0] === '/api/financial-plans'
      });
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
    if (planId === 'new') {
      setPlanName('');
    } else if (currentPlan?.name) {
      setPlanName(currentPlan.name);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Your financial needs</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-6">
            <Label htmlFor="planName" className="text-sm font-medium text-gray-700">
              Plan name
            </Label>
            <Input
              id="planName"
              type="text"
              placeholder={planId === 'new' ? "Enter plan name" : "Loading..."}
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="mt-1"
              disabled={planId !== 'new' && !currentPlan}
            />
          </div>
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
                      isChecked ? 'bg-[#E6F0F5] px-2 py-1 rounded' : ''
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
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={updatePlanNeedsMutation.isPending}
          >
            {updatePlanNeedsMutation.isPending ? (planId === 'new' ? 'Creating...' : 'Updating...') : (planId === 'new' ? '✓ Create plan' : '✓ Update plan')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}