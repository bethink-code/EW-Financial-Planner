import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { LumpSumBequest, InsertLumpSumBequest } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { HybridViewWrapper } from '@/components/common/hybrid-view-wrapper';
import { HybridItemPreviewCard } from '@/components/common/hybrid-item-preview-card';
import { FieldGroup, FormField } from '@/components/common/grouped-detail-form';
import { useDebouncedUpdate } from '@/hooks/use-debounced-update';
import { formatTextValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';
import { useLoading } from '@/contexts/loading-context';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface LumpSumHybridTableProps {
  onAddBequest?: () => void;
}

export function LumpSumHybridTable({ onAddBequest }: LumpSumHybridTableProps) {
  const { isLoading: globalLoading } = useLoading();

  const { data: bequests = [], isLoading } = useQuery<LumpSumBequest[]>({
    queryKey: ['/api/lump-sum-bequests'],
  });

  const debouncedUpdate = useDebouncedUpdate();

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
    debouncedUpdate('/api/lump-sum-bequests', ['/api/lump-sum-bequests'], id, { [field]: value });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleDuplicate = () => {
    addMutation.mutate();
  };



  // Generate preview cards
  const summaryCards = bequests.map((bequest, index) => {
    const isFirst = index === 0;
    const isLast = index === bequests.length - 1;

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
        primaryValue={preview}
        isFirst={isFirst}
        isLast={isLast}
      />
    );
  });

  // Generate detail forms
  const detailForms = bequests.map((bequest) => (
    <div key={bequest.id} className="space-y-6">
      {/* Group 1: Overview */}
      <FieldGroup title="Overview">
        <div className="grid grid-cols-2 gap-x-3 w-fit">
          <FormField label="Description">
            <input
              type="text"
              defaultValue={formatTextValue(bequest.description)}
              className={`table-input w-fit ${getValueClass(bequest.description, 'text')}`}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleFieldUpdate(bequest.id, 'description', e.target.value)}
            />
          </FormField>
          
          <FormField label="Entity">
            <input
              type="text"
              defaultValue={formatTextValue(bequest.entity)}
              className={`table-input w-fit ${getValueClass(bequest.entity, 'text')}`}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleFieldUpdate(bequest.id, 'entity', e.target.value)}
            />
          </FormField>
          
          <FormField label="Start" className="col-span-1">
            <input
              type="text"
              defaultValue={formatTextValue(bequest.start)}
              className={`table-input w-fit ${getValueClass(bequest.start, 'text')}`}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleFieldUpdate(bequest.id, 'start', e.target.value)}
            />
          </FormField>
        </div>
      </FieldGroup>

      {/* Group 2: Need Details */}
      <FieldGroup title="Need Details">
        <div className="grid grid-cols-2 gap-x-3 w-fit">
          <FormField label="Amount">
            <input
              type="text"
              defaultValue={bequest.amount}
              className={`table-input w-fit ${getValueClass(bequest.amount, 'currency')}`}
              onBlur={(e) => handleFieldUpdate(bequest.id, 'amount', e.target.value)}
            />
          </FormField>
          
          <FormField label="Increase %">
            <input
              type="text"
              defaultValue={bequest.increasePercentage}
              className={`table-input w-fit ${getValueClass(bequest.increasePercentage, 'percentage')}`}
              onBlur={(e) => handleFieldUpdate(bequest.id, 'increasePercentage', e.target.value)}
            />
          </FormField>
          
          <FormField label="CPI Linked" className="col-span-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={bequest.cpi}
                onChange={(e) => handleFieldUpdate(bequest.id, 'cpi', e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                {bequest.cpi ? 'Yes' : 'No'}
              </label>
            </div>
          </FormField>
        </div>
      </FieldGroup>

      {/* Group 3: Calculation */}
      <FieldGroup title="Calculation">
        <div className="grid grid-cols-1 gap-x-3 w-fit">
          <FormField label="Value at Death">
            <input
              type="text"
              defaultValue={bequest.valueAtDeath}
              className="calculated-field w-fit"
              readOnly
              disabled
            />
          </FormField>
        </div>
      </FieldGroup>
    </div>
  ));

  if (isLoading) {
    return <div className="text-center py-4">Loading bequests...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Add Button */}
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

      <HybridViewWrapper
        viewMode="hybrid"
        tableComponent={null}
        summaryCards={summaryCards}
        detailForms={detailForms}
        isEmpty={bequests.length === 0}
        emptyStateMessage="No bequests added yet. Click 'Add Bequest' to create your first bequest."
      />
    </div>
  );
}