import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoluntaryInvestment, InsertVoluntaryInvestment } from '@shared/schema';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { VoluntaryInvestmentPreviewCard } from './voluntary-investment-preview-card';
import { VoluntaryInvestmentDetailForm } from './voluntary-investment-detail-form';
import { getDefaultOwners, getDefaultOwnershipPercentages } from '@/lib/entity-utils';
import type { ClientDetails } from '@shared/schema';

interface VoluntaryInvestmentTableProps {
  searchTerm?: string;
  onAddInvestment?: () => void;
}

export function VoluntaryInvestmentTable({ searchTerm, onAddInvestment }: VoluntaryInvestmentTableProps) {
  const [activeInvestmentId, setActiveInvestmentId] = useState<number | null>(null);

  // Fetch investments
  const { data: investments = [], isLoading } = useQuery<VoluntaryInvestment[]>({
    queryKey: ['/api/voluntary-investments'],
  });

  // Fetch client details for defaults
  const { data: clientDetails = [] } = useQuery<ClientDetails[]>({
    queryKey: ['/api/client-details']
  });

  // Filter investments based on search term
  const filteredInvestments = useMemo(() => {
    if (!searchTerm) return investments;
    return investments.filter(investment =>
      investment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investment.owners?.some(owner => owner.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [investments, searchTerm]);

  // Set active investment to first investment if none selected
  const activeInvestment = useMemo(() => {
    if (activeInvestmentId) {
      return filteredInvestments.find(investment => investment.id === activeInvestmentId);
    }
    return filteredInvestments[0] || null;
  }, [filteredInvestments, activeInvestmentId]);

  // Add investment mutation
  const addMutation = useMutation({
    mutationFn: async (): Promise<VoluntaryInvestment> => {
      const newInvestment: InsertVoluntaryInvestment = {
        description: "",
        owners: getDefaultOwners(clientDetails),
        ownershipPercentages: getDefaultOwnershipPercentages(),
        baseCost: "R 0",
        marketValue: "R 0",
        liquidationPercentage: "0%",
        spouse: "R 0",
        others: "R 0",
        excludedFromJointEstate: false,
        excludedFromEstateDuty: false,
        excludedFromCGT: false,
        excludedFromExecutorsFees: false
      };
      const response = await fetch('/api/voluntary-investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvestment),
      });
      if (!response.ok) throw new Error('Failed to add investment');
      return response.json();
    },
    onSuccess: (newInvestment: VoluntaryInvestment) => {
      queryClient.invalidateQueries({ queryKey: ["/api/voluntary-investments"] });
      setActiveInvestmentId(newInvestment.id);
      onAddInvestment?.();
    },
  });

  // Delete investment mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/voluntary-investments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voluntary-investments"] });
      setActiveInvestmentId(null);
    },
  });

  const handleDeleteInvestment = (id: number) => {
    if (window.confirm('Are you sure you want to delete this voluntary investment?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading voluntary investments...</div>;
  }

  if (filteredInvestments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">
          {searchTerm ? 'No investments match your search.' : 'No voluntary investments yet.'}
        </p>
        <button
          onClick={() => addMutation.mutate()}
          disabled={addMutation.isPending}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Add Investment
        </button>
      </div>
    );
  }

  return (
    <div className="flex border-t border-neutral-200">
      {/* Left Sidebar - Preview Cards */}
      <div className="w-80 flex-shrink-0 border-r border-neutral-200 bg-neutral-50">
        <div className="hybrid-add-button-container p-4 border-b border-neutral-200">
          <Button
            onClick={() => addMutation.mutate()}
            disabled={addMutation.isPending}
            className="bg-white text-gray-700 border border-neutral-200 hover:bg-gray-50 hover:text-gray-900 font-normal"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Investment
          </Button>
        </div>
        <div className="hybrid-tabs-list">
          {filteredInvestments.map((investment, index) => (
            <VoluntaryInvestmentPreviewCard
              key={investment.id}
              investment={investment}
              isActive={activeInvestment?.id === investment.id}
              onClick={() => setActiveInvestmentId(investment.id)}
              isFirst={index === 0}
              isLast={index === filteredInvestments.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Right Panel - Detail Form */}
      <div className="flex-1">
        {activeInvestment ? (
          <VoluntaryInvestmentDetailForm
            investment={activeInvestment}
            onDelete={handleDeleteInvestment}
          />
        ) : (
          <div className="p-6 text-center text-gray-500">
            Select an investment to view details
          </div>
        )}
      </div>
    </div>
  );
}