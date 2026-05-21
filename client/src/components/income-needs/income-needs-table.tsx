import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { IncomeNeeds, InsertIncomeNeeds } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { HybridViewWrapper } from '@/components/common/hybrid-view-wrapper';
import { HybridHeaderBar } from '@/components/common/hybrid-header-bar';
import { HybridSidebar } from '@/components/common/hybrid-sidebar';
import { FieldGroup, FormField, GroupedDetailForm } from '@/components/common/grouped-detail-form';
import { IncomeNeedsSummary } from '@/components/income-needs/income-needs-summary';
import { useDebouncedUpdate } from '@/hooks/use-debounced-update';
import {
  formatCurrencyValue,
  formatPercentageValue,
  formatYearsValue,
  getValueClass,
  handleDefaultValueFocus,
} from '@/lib/formatting';
import { type ClientEntity } from '@/lib/entity-columns-utils';

interface IncomeNeedsTableProps {
  onAddIncomeNeed?: () => void;
  /** Hide the section summary band — used on Retirement routes where the
   *  phase-level projection ribbon already covers these stats. */
  showSummary?: boolean;
}

function IncomeNeedsTable({ onAddIncomeNeed, showSummary = true }: IncomeNeedsTableProps) {
  const [selectedIncomeNeedId, setSelectedIncomeNeedId] = React.useState<number | null>(null);

  const { data: incomeNeeds = [], isLoading } = useQuery<IncomeNeeds[]>({
    queryKey: ['/api/income-needs'],
  });

  const { data: clientEntities = [] } = useQuery<ClientEntity[]>({
    queryKey: ['/api/client-details'],
    select: (data: any[]) => data.map(entity => ({
      id: entity.id,
      entityName: entity.entityName,
      entityType: entity.entityType,
    })),
  });

  React.useEffect(() => {
    if (incomeNeeds.length > 0 && selectedIncomeNeedId === null) {
      setSelectedIncomeNeedId(incomeNeeds[0].id);
    }
  }, [incomeNeeds, selectedIncomeNeedId]);

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<IncomeNeeds> }) => {
      return apiRequest('PATCH', `/api/income-needs/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-needs'] });
    },
  });

  const debouncedUpdate = useDebouncedUpdate(
    (id: number, field: keyof IncomeNeeds, value: string | boolean) => {
      updateMutation.mutate({ id, updates: { [field]: value } });
    },
  );

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/income-needs/${id}`);
    },
    onSuccess: (_, id) => {
      if (id === selectedIncomeNeedId) setSelectedIncomeNeedId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/income-needs'] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (source: IncomeNeeds) => {
      const copy: InsertIncomeNeeds = {
        name: source.name ? `${source.name} (Copy)` : '',
        description: source.description,
        personName: source.personName,
        startDate: source.startDate,
        termYears: source.termYears,
        increasePercentage: source.increasePercentage,
        cpi: source.cpi,
        frequency: source.frequency,
        amount: source.amount,
        capitalisedAmount: source.capitalisedAmount,
      };
      return apiRequest('POST', '/api/income-needs', copy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-needs'] });
    },
  });

  const handleTextBlur = (id: number, field: keyof IncomeNeeds, value: string) => {
    let formatted: string = value;
    if (field === 'amount') formatted = formatCurrencyValue(value);
    else if (field === 'increasePercentage') formatted = formatPercentageValue(value);
    else if (field === 'termYears') formatted = formatYearsValue(value);
    debouncedUpdate(id, field, formatted);
  };

  const handleCheckbox = (id: number, field: keyof IncomeNeeds, checked: boolean) => {
    updateMutation.mutate({ id, updates: { [field]: checked } });
  };

  const handleImmediateUpdate = (id: number, field: keyof IncomeNeeds, value: string) => {
    updateMutation.mutate({ id, updates: { [field]: value } });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this income need? This cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDuplicate = (n: IncomeNeeds) => {
    duplicateMutation.mutate(n);
  };

  const isUpdating = deleteMutation.isPending || duplicateMutation.isPending;

  const selectedIncomeNeed = selectedIncomeNeedId
    ? incomeNeeds.find(n => n.id === selectedIncomeNeedId) ?? null
    : null;

  const needIndex = (n: IncomeNeeds) => incomeNeeds.findIndex(x => x.id === n.id);
  const titleFor = (n: IncomeNeeds) =>
    n.name?.trim() || `Need ${needIndex(n) + 1}`;

  const summaryCards = (
    <HybridSidebar
      items={incomeNeeds}
      selectedId={selectedIncomeNeedId}
      onSelect={setSelectedIncomeNeedId}
      getId={(n) => n.id}
      getTitle={titleFor}
      renderActive={(n) => {
        const lines: string[] = [];
        if (n.personName?.trim()) lines.push(`Entity: ${n.personName}`);
        if (n.frequency?.trim()) lines.push(`Frequency: ${n.frequency}`);
        if (n.termYears?.trim() && n.termYears !== '0') lines.push(`Term: ${n.termYears}`);
        return {
          subtitle: lines.join('\n') || 'No details entered',
          primaryValue: n.amount || 'R 0',
        };
      }}
    />
  );

  const detailForms = selectedIncomeNeed ? (
    <GroupedDetailForm>
      <div key={selectedIncomeNeed.id} className="space-y-10">
        <FieldGroup title="Overview">
          <div className="flex gap-3 flex-wrap">
            <FormField label="Name">
              <input
                type="text"
                defaultValue={selectedIncomeNeed.name}
                className={`table-input ${getValueClass(selectedIncomeNeed.name, 'text')}`}
                style={{ width: '100%', minWidth: '200px' }}
                onBlur={(e) => handleTextBlur(selectedIncomeNeed.id, 'name', e.target.value)}
              />
            </FormField>
            <FormField label="Description">
              <input
                type="text"
                defaultValue={selectedIncomeNeed.description}
                className={`table-input ${getValueClass(selectedIncomeNeed.description, 'text')}`}
                style={{ width: '100%', minWidth: '280px' }}
                onBlur={(e) => handleTextBlur(selectedIncomeNeed.id, 'description', e.target.value)}
              />
            </FormField>
          </div>
          <FormField label="Entity">
            <select
              className={`table-input table-dropdown ${getValueClass(selectedIncomeNeed.personName, 'text')}`}
              defaultValue={selectedIncomeNeed.personName || ''}
              onChange={(e) => handleImmediateUpdate(selectedIncomeNeed.id, 'personName', e.target.value)}
              style={{ minWidth: '200px' }}
            >
              <option value="">Select entity...</option>
              {clientEntities.map((entity) => (
                <option key={entity.id} value={entity.entityName ?? ''}>
                  {entity.entityName} ({entity.entityType})
                </option>
              ))}
            </select>
          </FormField>
        </FieldGroup>

        <FieldGroup title="Need Details">
          <div className="flex gap-3 flex-wrap">
            <FormField label="Amount">
              <input
                type="text"
                defaultValue={selectedIncomeNeed.amount || 'R 0'}
                className={`table-input ${getValueClass(selectedIncomeNeed.amount, 'currency')}`}
                style={{ width: 'fit-content', minWidth: '140px' }}
                onFocus={handleDefaultValueFocus}
                onBlur={(e) => handleTextBlur(selectedIncomeNeed.id, 'amount', e.target.value)}
              />
            </FormField>
            <FormField label="Frequency">
              <select
                className="table-input table-dropdown"
                defaultValue={selectedIncomeNeed.frequency || 'monthly'}
                onChange={(e) => handleImmediateUpdate(selectedIncomeNeed.id, 'frequency', e.target.value)}
                style={{ minWidth: '140px' }}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </FormField>
            <FormField label="Start date">
              <input
                type="text"
                defaultValue={selectedIncomeNeed.startDate}
                className={`table-input ${getValueClass(selectedIncomeNeed.startDate, 'text')}`}
                style={{ width: 'fit-content', minWidth: '120px' }}
                onBlur={(e) => handleTextBlur(selectedIncomeNeed.id, 'startDate', e.target.value)}
              />
            </FormField>
            <FormField label="Term (years)">
              <input
                type="text"
                defaultValue={selectedIncomeNeed.termYears}
                className={`table-input ${getValueClass(selectedIncomeNeed.termYears, 'years')}`}
                style={{ width: 'fit-content', minWidth: '100px' }}
                onFocus={handleDefaultValueFocus}
                onBlur={(e) => handleTextBlur(selectedIncomeNeed.id, 'termYears', e.target.value)}
              />
            </FormField>
            <FormField label="Increase %">
              <input
                type="text"
                defaultValue={formatPercentageValue(selectedIncomeNeed.increasePercentage)}
                className={`table-input ${getValueClass(selectedIncomeNeed.increasePercentage, 'percentage')}`}
                style={{ width: 'fit-content', minWidth: '80px' }}
                onFocus={handleDefaultValueFocus}
                onBlur={(e) => handleTextBlur(selectedIncomeNeed.id, 'increasePercentage', e.target.value)}
              />
            </FormField>
            <FormField label="CPI linked">
              <label className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--ew-primary-navy)' }}>
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={selectedIncomeNeed.cpi}
                  onChange={(e) => handleCheckbox(selectedIncomeNeed.id, 'cpi', e.target.checked)}
                />
                Increase with inflation
              </label>
            </FormField>
          </div>
        </FieldGroup>

        <FieldGroup title="Calculation">
          <FormField label="Capitalised amount">
            <div className="calculated-field" style={{ minWidth: '160px' }}>
              {selectedIncomeNeed.capitalisedAmount || 'R 0'}
            </div>
          </FormField>
        </FieldGroup>
      </div>
    </GroupedDetailForm>
  ) : null;

  if (isLoading) {
    return <div className="text-center py-4">Loading income needs...</div>;
  }

  return (
    <HybridViewWrapper
      summary={showSummary ? <IncomeNeedsSummary /> : undefined}
      header={
        <HybridHeaderBar
          add={onAddIncomeNeed ? { label: 'Add Need', onClick: onAddIncomeNeed } : undefined}
          title={selectedIncomeNeed?.name}
          emptyTitle={selectedIncomeNeed ? 'Unnamed Need' : undefined}
          onDuplicate={selectedIncomeNeed ? () => handleDuplicate(selectedIncomeNeed) : undefined}
          onDelete={selectedIncomeNeed ? () => handleDelete(selectedIncomeNeed.id) : undefined}
          disabled={isUpdating}
        />
      }
      summaryCards={summaryCards}
      detailForms={detailForms}
      isEmpty={incomeNeeds.length === 0}
      emptyStateMessage="No income needs added yet. Click 'Add Need' to create your first income need."
    />
  );
}

export default IncomeNeedsTable;
