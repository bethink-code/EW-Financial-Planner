import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { VoluntaryInvestment, InsertVoluntaryInvestment } from '@shared/schema';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { HybridViewWrapper } from '@/components/common/hybrid-view-wrapper';
import { HybridHeaderBar } from '@/components/common/hybrid-header-bar';
import { HybridSidebar } from '@/components/common/hybrid-sidebar';
import { VoluntaryInvestmentDetailForm } from './voluntary-investment-detail-form';
import { VoluntaryInvestmentsSummary } from './voluntary-investments-summary';

interface VoluntaryInvestmentTableProps {
  onAddInvestment?: () => void;
  /** Hide the section summary band — used on Retirement routes where the
   *  phase-level projection ribbon already covers these stats. */
  showSummary?: boolean;
}

export function VoluntaryInvestmentTable({ onAddInvestment, showSummary = true }: VoluntaryInvestmentTableProps) {
  const [selectedInvestmentId, setSelectedInvestmentId] = React.useState<number | null>(null);

  const { data: investments = [], isLoading } = useQuery<VoluntaryInvestment[]>({
    queryKey: ['/api/voluntary-investments'],
  });

  React.useEffect(() => {
    if (investments.length > 0 && selectedInvestmentId === null) {
      setSelectedInvestmentId(investments[0].id);
    }
  }, [investments, selectedInvestmentId]);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/voluntary-investments/${id}`);
    },
    onSuccess: (_, id) => {
      if (id === selectedInvestmentId) setSelectedInvestmentId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/voluntary-investments'] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (source: VoluntaryInvestment) => {
      const copy: InsertVoluntaryInvestment = {
        description: source.description ? `${source.description} (Copy)` : '',
        owners: [...(source.owners || [])],
        ownershipPercentages: [...(source.ownershipPercentages || [])],
        baseCost: source.baseCost,
        marketValue: source.marketValue,
        liquidationPercentage: source.liquidationPercentage,
        spouse: source.spouse,
        others: source.others,
        excludedFromJointEstate: source.excludedFromJointEstate,
        excludedFromEstateDuty: source.excludedFromEstateDuty,
        excludedFromCGT: source.excludedFromCGT,
        excludedFromExecutorsFees: source.excludedFromExecutorsFees,
      };
      return apiRequest('POST', '/api/voluntary-investments', copy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/voluntary-investments'] });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this voluntary investment? This cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDuplicate = (investment: VoluntaryInvestment) => {
    duplicateMutation.mutate(investment);
  };

  const isUpdating = deleteMutation.isPending || duplicateMutation.isPending;

  const selectedInvestment = selectedInvestmentId
    ? investments.find(i => i.id === selectedInvestmentId) ?? null
    : null;

  const investmentIndex = (i: VoluntaryInvestment) => investments.findIndex(x => x.id === i.id);
  const titleFor = (i: VoluntaryInvestment) =>
    i.description?.trim() || `Investment ${investmentIndex(i) + 1}`;

  const summaryCards = (
    <HybridSidebar
      items={investments}
      selectedId={selectedInvestmentId}
      onSelect={setSelectedInvestmentId}
      getId={(i) => i.id}
      getTitle={titleFor}
      renderActive={(i) => {
        const owners = (i.owners || []).filter(o => o?.trim());
        const lines: string[] = [];
        if (owners.length > 0) lines.push(`Owners: ${owners.join(', ')}`);
        return {
          subtitle: lines.join('\n') || 'No details entered',
          primaryValue: i.marketValue || 'R 0',
          secondaryInfo: i.baseCost && i.baseCost !== 'R 0' ? `Base: ${i.baseCost}` : undefined,
        };
      }}
    />
  );

  const detailForms = selectedInvestment ? (
    <VoluntaryInvestmentDetailForm
      key={`form-${selectedInvestment.id}-${selectedInvestment.owners?.length ?? 0}`}
      investment={selectedInvestment}
    />
  ) : null;

  if (isLoading) {
    return <div className="text-center py-4">Loading voluntary investments...</div>;
  }

  return (
    <HybridViewWrapper
      card
      summary={showSummary ? <VoluntaryInvestmentsSummary /> : undefined}
      header={
        <HybridHeaderBar
          add={onAddInvestment ? { label: 'Add Investment', onClick: onAddInvestment } : undefined}
          title={selectedInvestment?.description}
          emptyTitle={selectedInvestment ? 'Untitled Investment' : undefined}
          onDuplicate={selectedInvestment ? () => handleDuplicate(selectedInvestment) : undefined}
          onDelete={selectedInvestment ? () => handleDelete(selectedInvestment.id) : undefined}
          disabled={isUpdating}
        />
      }
      summaryCards={summaryCards}
      detailForms={detailForms}
      isEmpty={investments.length === 0}
      emptyStateMessage="No voluntary investments yet. Click 'Add Investment' to create your first investment."
    />
  );
}
