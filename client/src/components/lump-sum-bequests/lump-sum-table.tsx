import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { LumpSumBequest, InsertLumpSumBequest } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { HybridViewWrapper } from '@/components/common/hybrid-view-wrapper';
import { HybridHeaderBar } from '@/components/common/hybrid-header-bar';
import { HybridSidebar } from '@/components/common/hybrid-sidebar';
import { FieldGroup, FormField, GroupedDetailForm } from '@/components/common/grouped-detail-form';
import { LumpSumSummary } from '@/components/lump-sum-bequests/lump-sum-summary';
import { useDebouncedUpdate } from '@/hooks/use-debounced-update';
import { formatCurrencyValue, formatPercentageValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';

interface LumpSumTableProps {
  onAddBequest?: () => void;
}

export function LumpSumTable({ onAddBequest }: LumpSumTableProps) {
  const [selectedBequestId, setSelectedBequestId] = React.useState<number | null>(null);

  const { data: bequests = [], isLoading } = useQuery<LumpSumBequest[]>({
    queryKey: ['/api/lump-sum-bequests'],
  });

  React.useEffect(() => {
    if (bequests.length > 0 && selectedBequestId === null) {
      setSelectedBequestId(bequests[0].id);
    }
  }, [bequests, selectedBequestId]);

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<LumpSumBequest> }) => {
      return apiRequest('PATCH', `/api/lump-sum-bequests/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lump-sum-bequests'] });
    },
  });

  const debouncedUpdate = useDebouncedUpdate((id: number, field: keyof LumpSumBequest, value: string | boolean) => {
    updateMutation.mutate({ id, updates: { [field]: value } });
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/lump-sum-bequests/${id}`);
    },
    onSuccess: (_, id) => {
      if (id === selectedBequestId) setSelectedBequestId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/lump-sum-bequests'] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (source: LumpSumBequest) => {
      const copy: InsertLumpSumBequest = {
        name: source.name ? `${source.name} (Copy)` : '',
        description: source.description,
        entity: source.entity,
        start: source.start,
        amount: source.amount,
        increasePercentage: source.increasePercentage,
        cpi: source.cpi,
        valueAtDeath: source.valueAtDeath,
      };
      return apiRequest('POST', '/api/lump-sum-bequests', copy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lump-sum-bequests'] });
    },
  });

  const handleTextBlur = (id: number, field: keyof LumpSumBequest, value: string) => {
    let formatted: string = value;
    if (field === 'amount') formatted = formatCurrencyValue(value);
    else if (field === 'increasePercentage') formatted = formatPercentageValue(value);
    debouncedUpdate(id, field, formatted);
  };

  const handleCheckbox = (id: number, field: keyof LumpSumBequest, checked: boolean) => {
    updateMutation.mutate({ id, updates: { [field]: checked } });
  };

  const handleImmediateUpdate = (id: number, field: keyof LumpSumBequest, value: string) => {
    updateMutation.mutate({ id, updates: { [field]: value } });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this bequest? This cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDuplicate = (bequest: LumpSumBequest) => {
    duplicateMutation.mutate(bequest);
  };

  const isUpdating = deleteMutation.isPending || duplicateMutation.isPending;

  const selectedBequest = selectedBequestId
    ? bequests.find(b => b.id === selectedBequestId) ?? null
    : null;

  const bequestIndex = (b: LumpSumBequest) => bequests.findIndex(x => x.id === b.id);
  const titleFor = (b: LumpSumBequest) =>
    b.name?.trim() || `Bequest ${bequestIndex(b) + 1}`;

  const summaryCards = (
    <HybridSidebar
      items={bequests}
      selectedId={selectedBequestId}
      onSelect={setSelectedBequestId}
      getId={(b) => b.id}
      getTitle={titleFor}
      renderActive={(b) => {
        const lines: string[] = [];
        if (b.entity?.trim()) lines.push(`Entity: ${b.entity}`);
        if (b.start?.trim()) lines.push(`Start: ${b.start}`);
        if (b.cpi) lines.push('CPI linked: Yes');
        return {
          subtitle: lines.join('\n') || 'No details entered',
          primaryValue: b.amount || 'R 0',
        };
      }}
    />
  );

  const detailForms = selectedBequest ? (
    <GroupedDetailForm>
      <div key={selectedBequest.id} className="space-y-10">
        <FieldGroup title="Overview">
          <div className="flex gap-3 flex-wrap">
            <FormField label="Name">
              <input
                type="text"
                defaultValue={selectedBequest.name}
                className={`table-input ${getValueClass(selectedBequest.name, 'text')}`}
                style={{ width: '100%', minWidth: '200px' }}
                onBlur={(e) => handleTextBlur(selectedBequest.id, 'name', e.target.value)}
              />
            </FormField>
            <FormField label="Description">
              <input
                type="text"
                defaultValue={selectedBequest.description}
                className={`table-input ${getValueClass(selectedBequest.description, 'text')}`}
                style={{ width: '100%', minWidth: '280px' }}
                onBlur={(e) => handleTextBlur(selectedBequest.id, 'description', e.target.value)}
              />
            </FormField>
          </div>
          <div className="flex gap-3 flex-wrap">
            <FormField label="Entity">
              <input
                type="text"
                defaultValue={selectedBequest.entity}
                className={`table-input ${getValueClass(selectedBequest.entity, 'text')}`}
                style={{ width: 'fit-content', minWidth: '160px' }}
                onBlur={(e) => handleTextBlur(selectedBequest.id, 'entity', e.target.value)}
              />
            </FormField>
            <FormField label="Start">
              <input
                type="text"
                defaultValue={selectedBequest.start}
                className={`table-input ${getValueClass(selectedBequest.start, 'text')}`}
                style={{ width: 'fit-content', minWidth: '120px' }}
                onBlur={(e) => handleTextBlur(selectedBequest.id, 'start', e.target.value)}
              />
            </FormField>
          </div>
        </FieldGroup>

        <FieldGroup title="Bequest Details">
          <div className="flex gap-3 flex-wrap">
            <FormField label="Amount">
              <input
                type="text"
                defaultValue={selectedBequest.amount || 'R 0'}
                className={`table-input ${getValueClass(selectedBequest.amount, 'currency')}`}
                style={{ width: 'fit-content', minWidth: '160px' }}
                onFocus={handleDefaultValueFocus}
                onBlur={(e) => handleTextBlur(selectedBequest.id, 'amount', e.target.value)}
              />
            </FormField>
            <FormField label="Increase %">
              <input
                type="text"
                defaultValue={formatPercentageValue(selectedBequest.increasePercentage)}
                className={`table-input ${getValueClass(selectedBequest.increasePercentage, 'percentage')}`}
                style={{ width: 'fit-content', minWidth: '80px' }}
                onFocus={handleDefaultValueFocus}
                onBlur={(e) => handleTextBlur(selectedBequest.id, 'increasePercentage', e.target.value)}
              />
            </FormField>
            <FormField label="CPI linked">
              <label className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--ew-primary-navy)' }}>
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={selectedBequest.cpi}
                  onChange={(e) => handleCheckbox(selectedBequest.id, 'cpi', e.target.checked)}
                />
                Increase with inflation
              </label>
            </FormField>
          </div>
        </FieldGroup>

        <FieldGroup title="Calculation">
          <FormField label="Value at death">
            <div className="calculated-field" style={{ minWidth: '160px' }}>
              {selectedBequest.valueAtDeath}
            </div>
          </FormField>
        </FieldGroup>
      </div>
    </GroupedDetailForm>
  ) : null;

  if (isLoading) {
    return <div className="text-center py-4">Loading bequests...</div>;
  }

  return (
    <HybridViewWrapper
      summary={<LumpSumSummary />}
      header={
        <HybridHeaderBar
          add={onAddBequest ? { label: 'Add Bequest', onClick: onAddBequest } : undefined}
          title={selectedBequest?.name}
          emptyTitle={selectedBequest ? 'Unnamed Bequest' : undefined}
          onDuplicate={selectedBequest ? () => handleDuplicate(selectedBequest) : undefined}
          onDelete={selectedBequest ? () => handleDelete(selectedBequest.id) : undefined}
          disabled={isUpdating}
        />
      }
      summaryCards={summaryCards}
      detailForms={detailForms}
      isEmpty={bequests.length === 0}
      emptyStateMessage="No bequests added yet. Click 'Add Bequest' to create your first bequest."
    />
  );
}
