import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { DefinedBenefitFund, InsertDefinedBenefitFund } from '@shared/schema';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { DefinedBenefitFundPreviewCard } from './defined-benefit-fund-preview-card';
import { DefinedBenefitFundDetailForm } from './defined-benefit-fund-detail-form';
import { getDefaultOwners, getDefaultOwnershipPercentages } from '@/lib/entity-utils';
import type { ClientDetails } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface DefinedBenefitFundHybridTableProps {
  searchTerm?: string;
  onAddFund?: () => void;
}

export function DefinedBenefitFundHybridTable({ searchTerm, onAddFund }: DefinedBenefitFundHybridTableProps) {
  const [activeFundId, setActiveFundId] = useState<number | null>(null);

  // Fetch funds
  const { data: funds = [], isLoading } = useQuery<DefinedBenefitFund[]>({
    queryKey: ['/api/defined-benefit-funds'],
  });

  // Fetch client details for defaults
  const { data: clientDetails = [] } = useQuery<ClientDetails[]>({
    queryKey: ['/api/client-details']
  });

  // Filter funds based on search term
  const filteredFunds = useMemo(() => {
    if (!searchTerm) return funds;
    return funds.filter(fund =>
      fund.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fund.owners?.some(owner => owner.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [funds, searchTerm]);

  // Set active fund to first fund if none selected
  const activeFund = useMemo(() => {
    if (activeFundId) {
      return filteredFunds.find(fund => fund.id === activeFundId);
    }
    return filteredFunds[0] || null;
  }, [filteredFunds, activeFundId]);

  // Add fund mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      const newFund: InsertDefinedBenefitFund = {
        description: "",
        owners: getDefaultOwners(clientDetails),
        ownershipPercentages: getDefaultOwnershipPercentages(),
        yearsOfService: "0 years",
        finalMonthlySalary: "R 0",
        deathLumpSum: "R 0",
        additionalTaxFreeAmount: "R 0",
        pensionIncomeAmount: "R 0",
        pensionIncomeCheckbox: true,
        pensionIncomeYears: "0 years",
        pensionIncomeIncrease: "0%"
      };
      return await apiRequest("POST", "/api/defined-benefit-funds", newFund);
    },
    onSuccess: (newFund: DefinedBenefitFund) => {
      queryClient.invalidateQueries({ queryKey: ["/api/defined-benefit-funds"] });
      setActiveFundId(newFund.id);
      onAddFund?.();
    },
  });

  // Delete fund mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/defined-benefit-funds/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/defined-benefit-funds"] });
      setActiveFundId(null);
    },
  });

  const handleDeleteFund = (id: number) => {
    if (window.confirm('Are you sure you want to delete this defined benefit fund?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading defined benefit funds...</div>;
  }

  if (filteredFunds.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">
          {searchTerm ? 'No funds match your search.' : 'No defined benefit funds yet.'}
        </p>
        <button
          onClick={() => addMutation.mutate()}
          disabled={addMutation.isPending}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Add Fund
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
            Add Fund
          </Button>
        </div>
        <div className="hybrid-tabs-list">
          {filteredFunds.map((fund, index) => (
            <DefinedBenefitFundPreviewCard
              key={fund.id}
              fund={fund}
              isActive={activeFund?.id === fund.id}
              onClick={() => setActiveFundId(fund.id)}
              isFirst={index === 0}
              isLast={index === filteredFunds.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Right Panel - Detail Form */}
      <div className="flex-1">
        {activeFund ? (
          <DefinedBenefitFundDetailForm
            fund={activeFund}
            onDelete={handleDeleteFund}
          />
        ) : (
          <div className="p-6 text-center text-gray-500">
            Select a fund to view details
          </div>
        )}
      </div>
    </div>
  );
}