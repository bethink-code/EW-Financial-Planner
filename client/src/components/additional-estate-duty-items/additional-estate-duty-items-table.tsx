import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AdditionalEstateDutyItems, InsertAdditionalEstateDutyItems } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { HybridViewWrapper } from '@/components/common/hybrid-view-wrapper';
import { HybridHeaderBar } from '@/components/common/hybrid-header-bar';
import { HybridSidebar } from '@/components/common/hybrid-sidebar';
import { FieldGroup, FormField, GroupedDetailForm } from '@/components/common/grouped-detail-form';
import { AdditionalEstateDutyItemsSummary } from '@/components/additional-estate-duty-items/additional-estate-duty-items-summary';
import { useDebouncedUpdate } from '@/hooks/use-debounced-update';
import { formatCurrencyValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';

interface AdditionalEstateDutyItemsTableProps {
  onAddItem?: () => void;
}

/**
 * Hybrid editor for Additional Estate Duty Items. Mirrors the Client Details
 * shape: top action strip + active-expanded sidebar item + detail form.
 */
function AdditionalEstateDutyItemsTable({ onAddItem }: AdditionalEstateDutyItemsTableProps) {
  const [selectedItemId, setSelectedItemId] = React.useState<number | null>(null);

  const { data: items = [], isLoading } = useQuery<AdditionalEstateDutyItems[]>({
    queryKey: ['/api/additional-estate-duty-items'],
  });

  React.useEffect(() => {
    if (items.length > 0 && selectedItemId === null) {
      setSelectedItemId(items[0].id);
    }
  }, [items, selectedItemId]);

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<AdditionalEstateDutyItems> }) => {
      return apiRequest('PATCH', `/api/additional-estate-duty-items/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/additional-estate-duty-items'] });
    },
  });

  const debouncedUpdate = useDebouncedUpdate((id: number, field: keyof AdditionalEstateDutyItems, value: string) => {
    updateMutation.mutate({ id, updates: { [field]: value } });
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/additional-estate-duty-items/${id}`);
    },
    onSuccess: (_, id) => {
      if (id === selectedItemId) setSelectedItemId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/additional-estate-duty-items'] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (source: AdditionalEstateDutyItems) => {
      const copy: InsertAdditionalEstateDutyItems = {
        description: source.description ? `${source.description} (Copy)` : '',
        amount: source.amount,
        deduction: source.deduction,
        excludeFromJointEstate: source.excludeFromJointEstate,
      };
      return apiRequest('POST', '/api/additional-estate-duty-items', copy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/additional-estate-duty-items'] });
    },
  });

  const handleTextBlur = (id: number, field: 'description' | 'amount', value: string) => {
    const formatted = field === 'amount' ? formatCurrencyValue(value) : value;
    debouncedUpdate(id, field, formatted);
  };

  const handleCheckbox = (id: number, field: 'deduction' | 'excludeFromJointEstate', checked: boolean) => {
    updateMutation.mutate({ id, updates: { [field]: checked } });
  };

  const handleImmediateUpdate = (id: number, field: keyof AdditionalEstateDutyItems, value: string) => {
    updateMutation.mutate({ id, updates: { [field]: value } });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this item? This cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDuplicate = (item: AdditionalEstateDutyItems) => {
    duplicateMutation.mutate(item);
  };

  const isUpdating = deleteMutation.isPending || duplicateMutation.isPending;

  const selectedItem = selectedItemId
    ? items.find(i => i.id === selectedItemId) ?? null
    : null;

  const itemIndex = (item: AdditionalEstateDutyItems) => items.findIndex(i => i.id === item.id);
  const titleFor = (item: AdditionalEstateDutyItems) =>
    item.description?.trim() || `Item ${itemIndex(item) + 1}`;

  const summaryCards = (
    <HybridSidebar
      items={items}
      selectedId={selectedItemId}
      onSelect={setSelectedItemId}
      getId={(i) => i.id}
      getTitle={titleFor}
      renderActive={(item) => {
        const lines = [
          `Deduction: ${item.deduction ? 'Yes' : 'No'}`,
          `Exclude from joint estate: ${item.excludeFromJointEstate ? 'Yes' : 'No'}`,
        ];
        return {
          subtitle: lines.join('\n'),
          primaryValue: item.amount || 'R 0',
        };
      }}
    />
  );

  const detailForms = selectedItem ? (
    <GroupedDetailForm>
      <div key={selectedItem.id} className="space-y-10">
        <FieldGroup title="Item">
          <FormField label="Description">
            <input
              type="text"
              defaultValue={selectedItem.description}
              className={`table-input ${getValueClass(selectedItem.description, 'text')}`}
              style={{ width: '100%', maxWidth: '420px' }}
              onBlur={(e) => handleTextBlur(selectedItem.id, 'description', e.target.value)}
            />
          </FormField>
          <FormField label="Amount">
            <input
              type="text"
              defaultValue={selectedItem.amount || 'R 0'}
              className={`table-input ${getValueClass(selectedItem.amount, 'currency')}`}
              style={{ width: 'fit-content', minWidth: '160px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => handleTextBlur(selectedItem.id, 'amount', e.target.value)}
            />
          </FormField>
          <FormField label="Deduction">
            <label className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--ew-primary-navy)' }}>
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={selectedItem.deduction}
                onChange={(e) => handleCheckbox(selectedItem.id, 'deduction', e.target.checked)}
              />
              Treat this item as a deduction
            </label>
          </FormField>
          <FormField label="Exclude from joint estate">
            <label className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--ew-primary-navy)' }}>
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={selectedItem.excludeFromJointEstate}
                onChange={(e) => handleCheckbox(selectedItem.id, 'excludeFromJointEstate', e.target.checked)}
              />
              Exclude when marital regime is 'In community'
            </label>
          </FormField>
        </FieldGroup>
      </div>
    </GroupedDetailForm>
  ) : null;

  if (isLoading) {
    return <div className="text-center py-4">Loading items...</div>;
  }

  return (
    <HybridViewWrapper
      card
      summary={<AdditionalEstateDutyItemsSummary />}
      header={
        <HybridHeaderBar
          add={onAddItem ? { label: 'Add Item', onClick: onAddItem } : undefined}
          title={selectedItem?.description}
          emptyTitle={selectedItem ? 'Unnamed Item' : undefined}
          onTitleChange={selectedItem
            ? (value) => handleImmediateUpdate(selectedItem.id, 'description', value)
            : undefined}
          onDuplicate={selectedItem ? () => handleDuplicate(selectedItem) : undefined}
          onDelete={selectedItem ? () => handleDelete(selectedItem.id) : undefined}
          disabled={isUpdating}
        />
      }
      summaryCards={summaryCards}
      detailForms={detailForms}
      isEmpty={items.length === 0}
      emptyStateMessage="No items added yet. Click 'Add Item' to create your first item."
    />
  );
}

export default AdditionalEstateDutyItemsTable;
