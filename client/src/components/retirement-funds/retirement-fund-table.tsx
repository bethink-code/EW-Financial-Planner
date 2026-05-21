import React from 'react';
import { useLocation } from 'wouter';
import { RetirementFund, UpdateRetirementFund } from '@shared/schema';
import { HybridViewWrapper } from '@/components/common/hybrid-view-wrapper';
import { HybridHeaderBar } from '@/components/common/hybrid-header-bar';
import { HybridSidebar } from '@/components/common/hybrid-sidebar';
import { SummaryBand, SummaryTile } from '@/components/common/summary-band';
import { useRetirementProjection } from '@/hooks/use-retirement-projection';
import { formatCurrencyValue } from '@/lib/formatting';
import { RetirementFundDetailForm } from './retirement-fund-detail-form';
import { RetirementFundsSummary } from './retirement-funds-summary';

interface RetirementFundTableProps {
  funds: RetirementFund[];
  onUpdate: (id: number, field: keyof UpdateRetirementFund, value: any) => void;
  onDuplicate: (fund: RetirementFund) => void;
  onDelete: (id: number) => void;
  onAddFund?: () => void;
  disabled?: boolean;
  /** Hide the section summary band — used on Retirement routes where the
   *  phase-level projection ribbon already covers these stats. */
  showSummary?: boolean;
}

export function RetirementFundTable({
  funds,
  onUpdate,
  onDuplicate,
  onDelete,
  onAddFund,
  disabled = false,
  showSummary = true,
}: RetirementFundTableProps) {
  const [location] = useLocation();
  const isRetirementNeed = location.startsWith('/needs/retirement');
  const [selectedFundId, setSelectedFundId] = React.useState<number | null>(null);
  const { data: projection } = useRetirementProjection();
  const formatRand = (n: number | undefined) =>
    formatCurrencyValue(Math.round(n ?? 0).toString());

  React.useEffect(() => {
    if (funds.length > 0 && selectedFundId === null) {
      setSelectedFundId(funds[0].id);
    }
  }, [funds, selectedFundId]);

  const selectedFund = selectedFundId
    ? funds.find(f => f.id === selectedFundId) ?? null
    : null;

  const fundIndex = (f: RetirementFund) => funds.findIndex(x => x.id === f.id);
  const titleFor = (f: RetirementFund) =>
    f.description?.trim() || `Fund ${fundIndex(f) + 1}`;

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this retirement fund? This cannot be undone.')) {
      if (id === selectedFundId) setSelectedFundId(null);
      onDelete(id);
    }
  };

  const summaryCards = (
    <HybridSidebar
      items={funds}
      selectedId={selectedFundId}
      onSelect={setSelectedFundId}
      getId={(f) => f.id}
      getTitle={titleFor}
      renderActive={(f) => {
        const owners = (f.owners || []).filter(o => o?.trim());
        const lines: string[] = [];
        if (owners.length > 0) lines.push(`Owners: ${owners.join(', ')}`);
        if (isRetirementNeed) {
          // Retirement view: show contribution + growth context so the
          // active card reads as a savings vehicle, not an estate item.
          if (f.monthlyContribution && f.monthlyContribution !== 'R 0') {
            lines.push(`Contribution: ${f.monthlyContribution}/mo`);
          }
          if (f.growthRate) lines.push(`Growth: ${f.growthRate}`);
          return {
            subtitle: lines.join('\n') || 'No details entered',
            primaryValue: f.fundValue || 'R 0',
          };
        }
        // DEL view: emphasise the estate-side figures.
        if (f.fundValue && f.fundValue !== 'R 0') lines.push(`Fund value: ${f.fundValue}`);
        return {
          subtitle: lines.join('\n') || 'No details entered',
          primaryValue: f.fundValueAtDeath || 'R 0',
          secondaryInfo: f.coverAmount && f.coverAmount !== 'R 0' ? `Cover: ${f.coverAmount}` : undefined,
        };
      }}
    />
  );

  const detailForms = selectedFund ? (
    <RetirementFundDetailForm
      key={`form-${selectedFund.id}-${selectedFund.owners.length}`}
      fund={selectedFund}
      onUpdate={onUpdate}
      disabled={disabled}
    />
  ) : null;

  // Section summary: on Retirement, show aggregates across THIS tab's funds
  // (subset of the phase-level projection ribbon, which sums across every
  // retirement vehicle). On DEL, the existing aggregate summary when
  // showSummary is on.
  const aggregateRf = projection?.retirementFunds ?? [];
  const totalCapital = aggregateRf.reduce((sum, f) => sum + (f.capitalAtRetirement ?? 0), 0);
  const totalInCurrentTerms = aggregateRf.reduce((sum, f) => sum + (f.valueInCurrentTerms ?? 0), 0);
  const fundCount = funds.length;
  const countLabel = `${fundCount} ${fundCount === 1 ? 'fund' : 'funds'}`;
  const sectionSummary = isRetirementNeed
    ? (
        <SummaryBand>
          <SummaryTile
            variant="accent"
            label="Capital at retirement"
            value={formatRand(totalCapital)}
            subValue={countLabel}
          />
          <SummaryTile
            variant="accent"
            label="Value in current terms"
            value={formatRand(totalInCurrentTerms)}
            subValue={countLabel}
          />
        </SummaryBand>
      )
    : showSummary
      ? <RetirementFundsSummary />
      : undefined;

  return (
    <HybridViewWrapper
      summary={sectionSummary}
      header={
        <HybridHeaderBar
          add={onAddFund ? { label: 'Add Fund', onClick: onAddFund } : undefined}
          title={selectedFund?.description}
          emptyTitle={selectedFund ? 'Untitled Fund' : undefined}
          onDuplicate={selectedFund ? () => onDuplicate(selectedFund) : undefined}
          onDelete={selectedFund ? () => handleDelete(selectedFund.id) : undefined}
          disabled={disabled}
        />
      }
      summaryCards={summaryCards}
      detailForms={detailForms}
      isEmpty={funds.length === 0}
      emptyStateMessage="No retirement funds yet. Click 'Add Fund' to create your first fund."
    />
  );
}
