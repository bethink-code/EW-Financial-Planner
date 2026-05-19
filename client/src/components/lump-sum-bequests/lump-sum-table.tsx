import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { LumpSumBequest, InsertLumpSumBequest } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { HybridViewWrapper } from '@/components/common/hybrid-view-wrapper';
import { HybridItemPreviewCard } from '@/components/common/hybrid-item-preview-card';
import { FieldGroup, FormField, GroupedDetailForm } from '@/components/common/grouped-detail-form';
import { useDebouncedUpdate } from '@/hooks/use-debounced-update';
import { formatTextValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';
import { useLoading } from '@/contexts/loading-context';
import { Button } from '@/components/ui/button';
import { DetailFormHeader } from '@/components/common/detail-form-header';
import { Plus } from 'lucide-react';

interface LumpSumTableProps {
  onAddBequest?: () => void;
}

export function LumpSumTable({ onAddBequest }: LumpSumTableProps) {
  const { isLoading: globalLoading } = useLoading();
  const [selectedBequestId, setSelectedBequestId] = React.useState<number | null>(null);

  const { data: bequests = [], isLoading } = useQuery<LumpSumBequest[]>({
    queryKey: ['/api/lump-sum-bequests'],
  });

  // Auto-select first item when data loads
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lump-sum-bequests'] });
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const newBequest: InsertLumpSumBequest = {
        description: "Enter details ...",
        entity: "Enter details ...",
        start: "Enter details ...",
        amount: "R 0",
        increasePercentage: "0%",
        cpi: false,
        valueAtDeath: "R 0"
      };
      return apiRequest('POST', '/api/lump-sum-bequests', newBequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lump-sum-bequests'] });
    },
  });

  const handleFieldUpdate = (id: number, field: keyof LumpSumBequest, value: string | boolean) => {
    debouncedUpdate(id, field, value);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleDuplicate = (bequest: LumpSumBequest) => {
    const duplicate: InsertLumpSumBequest = {
      description: bequest.description,
      entity: bequest.entity,
      start: bequest.start,
      amount: bequest.amount,
      increasePercentage: bequest.increasePercentage,
      cpi: bequest.cpi,
      valueAtDeath: bequest.valueAtDeath
    };
    addMutation.mutate();
  };

  const isUpdating = deleteMutation.isPending || addMutation.isPending;

  // Generate preview cards
  const summaryCards = bequests.map((bequest, index) => {
    const isFirst = index === 0;
    const isLast = index === bequests.length - 1;
    const isActive = bequest.id === selectedBequestId;

    // Generate preview content
    const title = bequest.description && bequest.description.trim() !== '' && bequest.description !== 'Enter details ...' 
      ? bequest.description 
      : `Bequest ${index + 1}`;

    const previewLines = [];
    
    if (bequest.entity && bequest.entity.trim() !== '' && bequest.entity !== 'Enter details ...') {
      previewLines.push(`Entity: ${bequest.entity}`);
    }
    
    if (bequest.start && bequest.start.trim() !== '' && bequest.start !== 'Enter details ...') {
      previewLines.push(`Start: ${bequest.start}`);
    }
    
    if (bequest.amount && bequest.amount !== 'R 0') {
      previewLines.push(`Amount: ${bequest.amount}`);
    }
    
    if (bequest.increasePercentage && bequest.increasePercentage !== '0%') {
      previewLines.push(`Increase: ${bequest.increasePercentage}`);
    }

    if (bequest.cpi) {
      previewLines.push('CPI Linked: Yes');
    }

    const preview = previewLines.length > 0 ? previewLines.join('\n') : 'No details entered';

    return (
      <HybridItemPreviewCard
        key={bequest.id}
        title={title}
        subtitle={preview}
        primaryValue={bequest.amount || 'R 0'}
        variant={isActive ? 'active' : 'blue'}
        isClickable={true}
        isFirst={isFirst}
        isLast={isLast}
        onClick={() => setSelectedBequestId(bequest.id)}
      />
    );
  });

  // Get selected bequest for detail form
  const selectedBequest = selectedBequestId 
    ? bequests.find(bequest => bequest.id === selectedBequestId)
    : null;

  // Generate detail forms - only show selected item
  const detailForms = selectedBequest ? (
    <GroupedDetailForm>
      <div key={selectedBequest.id}>
        <DetailFormHeader
          title={selectedBequest.description}
          emptyTitle="Untitled Bequest"
          onDuplicate={() => handleDuplicate(selectedBequest)}
          onDelete={() => handleDelete(selectedBequest.id)}
          disabled={isUpdating}
        />

        {/* Group 1: Overview */}
        <FieldGroup title="Overview">
            <div className="flex gap-3">
              <FormField label="Description">
                <input
                  type="text"
                  defaultValue={formatTextValue(selectedBequest.description)}
                  className={`table-input ${getValueClass(selectedBequest.description, 'text')}`}
                  style={{ width: 'fit-content', minWidth: '120px' }}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleFieldUpdate(selectedBequest.id, 'description', e.target.value)}
                />
              </FormField>
              
              <FormField label="Entity">
                <input
                  type="text"
                  defaultValue={formatTextValue(selectedBequest.entity)}
                  className={`table-input ${getValueClass(selectedBequest.entity, 'text')}`}
                  style={{ width: 'fit-content', minWidth: '120px' }}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleFieldUpdate(selectedBequest.id, 'entity', e.target.value)}
                />
              </FormField>
              
              <FormField label="Start">
                <input
                  type="text"
                  defaultValue={formatTextValue(selectedBequest.start)}
                  className={`table-input ${getValueClass(selectedBequest.start, 'text')}`}
                  style={{ width: 'fit-content', minWidth: '80px' }}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleFieldUpdate(selectedBequest.id, 'start', e.target.value)}
                />
              </FormField>
            </div>
          </FieldGroup>

          {/* Group 2: Need Details */}
          <FieldGroup title="Need Details">
            <div className="flex gap-3">
              <FormField label="Amount">
                <input
                  type="text"
                  defaultValue={selectedBequest.amount}
                  className={`table-input ${getValueClass(selectedBequest.amount, 'currency')}`}
                  style={{ width: 'fit-content', minWidth: '100px' }}
                  onBlur={(e) => handleFieldUpdate(selectedBequest.id, 'amount', e.target.value)}
                />
              </FormField>
              
              <FormField label="Increase %">
                <input
                  type="text"
                  defaultValue={selectedBequest.increasePercentage}
                  className={`table-input ${getValueClass(selectedBequest.increasePercentage, 'percentage')}`}
                  style={{ width: 'fit-content', minWidth: '60px' }}
                  onBlur={(e) => handleFieldUpdate(selectedBequest.id, 'increasePercentage', e.target.value)}
                />
              </FormField>
              
              <FormField label="CPI Linked">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedBequest.cpi}
                    onChange={(e) => handleFieldUpdate(selectedBequest.id, 'cpi', e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    {selectedBequest.cpi ? 'Yes' : 'No'}
                  </label>
                </div>
              </FormField>
            </div>
          </FieldGroup>

          {/* Group 3: Calculation */}
          <FieldGroup title="Calculation">
            <div className="flex gap-3">
              <FormField label="Value at Death">
                <div className="calculated-field" style={{ minWidth: "100px" }}>
                  {selectedBequest.valueAtDeath}
                </div>
              </FormField>
            </div>
          </FieldGroup>
        </div>
    </GroupedDetailForm>
  ) : null;

  if (isLoading) {
    return <div className="text-center py-4">Loading bequests...</div>;
  }

  return (
    <HybridViewWrapper
      summaryCards={
        <div>
          {onAddBequest && (
            <div className="hybrid-add-button-container p-4 border-b border-neutral-200">
              <Button
                onClick={onAddBequest}
                className="bg-white text-gray-700 border border-neutral-200 hover:bg-gray-50 hover:text-gray-900 font-normal"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Bequest
              </Button>
            </div>
          )}
          <div className="hybrid-tabs-list">
            {summaryCards}
          </div>
        </div>
      }
      detailForms={detailForms}
      isEmpty={bequests.length === 0}
      emptyStateMessage="No bequests added yet. Click 'Add Bequest' to create your first bequest."
    />
  );
}