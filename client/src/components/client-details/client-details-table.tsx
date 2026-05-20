import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ClientDetails, InsertClientDetails } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { HybridViewWrapper } from '@/components/common/hybrid-view-wrapper';
import { HybridHeaderBar } from '@/components/common/hybrid-header-bar';
import { HybridItemPreviewCard } from '@/components/common/hybrid-item-preview-card';
import { HybridItemPreviewRow } from '@/components/common/hybrid-item-preview-row';
import { FieldGroup, FormField, GroupedDetailForm } from '@/components/common/grouped-detail-form';
import { useDebouncedUpdate } from '@/hooks/use-debounced-update';
import { formatPercentageValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';

interface ClientDetailsTableProps {
  onAddEntity?: () => void;
}

/**
 * Hybrid editor for client entities. New pattern:
 *
 *   [ Add Entity ]        Garth Shoebridge ✎     [ Duplicate ] [ Delete ]
 *   ───────────────────────────────────────────────────────────────────
 *   Active card (full)    │   Detail form (FieldGroups)
 *   Inactive row     (i)  │
 *   Inactive row     (i)  │
 *
 * Top action strip (Add | Title | Duplicate/Delete) lives in HybridViewWrapper's
 * `header` slot. Left sidebar shows the selected entity as a full preview card
 * with the remaining entities as compact rows. Detail form on the right has no
 * header of its own — title + actions live in the strip above.
 */
export function ClientDetailsTable({ onAddEntity }: ClientDetailsTableProps) {
  const [selectedEntityId, setSelectedEntityId] = React.useState<number | null>(null);

  const { data: entities = [], isLoading } = useQuery<ClientDetails[]>({
    queryKey: ['/api/client-details'],
  });

  // Auto-select first item when data loads
  React.useEffect(() => {
    if (entities.length > 0 && selectedEntityId === null) {
      setSelectedEntityId(entities[0].id);
    }
  }, [entities, selectedEntityId]);

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<ClientDetails> }) => {
      return apiRequest('PATCH', `/api/client-details/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/client-details'] });
    },
  });

  // Text-field updates flow through debouncedUpdate; selects/dates commit
  // immediately so the dropdown menu closes cleanly.
  const debouncedUpdate = useDebouncedUpdate((id: number, field: keyof ClientDetails, value: string) => {
    updateMutation.mutate({ id, updates: { [field]: value } });
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/client-details/${id}`);
    },
    onSuccess: (_, id) => {
      if (id === selectedEntityId) setSelectedEntityId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/client-details'] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (source: ClientDetails) => {
      const copy: InsertClientDetails = {
        entityName: source.entityName ? `${source.entityName} (Copy)` : '',
        entityType: source.entityType,
        dateOfBirth: source.dateOfBirth,
        age: source.age,
        taxRate: source.taxRate,
        marginalTaxRate: source.marginalTaxRate,
        maritalStatus: source.maritalStatus,
        maritalRegime: source.maritalRegime,
        maritalDate: source.maritalDate,
        accrualInception: source.accrualInception,
      };
      return apiRequest('POST', '/api/client-details', copy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/client-details'] });
    },
  });

  const handleFieldUpdate = (id: number, field: keyof ClientDetails, value: string) => {
    debouncedUpdate(id, field, value);
  };

  const handleImmediateUpdate = (id: number, field: keyof ClientDetails, value: string) => {
    updateMutation.mutate({ id, updates: { [field]: value } });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this entity? This cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDuplicate = (entity: ClientDetails) => {
    duplicateMutation.mutate(entity);
  };

  const isUpdating = deleteMutation.isPending || duplicateMutation.isPending;

  const selectedEntity = selectedEntityId
    ? entities.find(e => e.id === selectedEntityId) ?? null
    : null;
  const otherEntities = entities.filter(e => e.id !== selectedEntityId);

  const entityIndex = (entity: ClientDetails) => entities.findIndex(e => e.id === entity.id);
  const titleFor = (entity: ClientDetails) =>
    entity.entityName?.trim() || `Entity ${entityIndex(entity) + 1}`;

  // Sidebar — active card expanded at top, inactive items as compact rows.
  const summaryCards = (
    <div>
      {selectedEntity && (() => {
        const previewLines: string[] = [];
        if (selectedEntity.entityType) previewLines.push(selectedEntity.entityType);
        if (selectedEntity.maritalStatus) previewLines.push(selectedEntity.maritalStatus);
        const subtitle = previewLines.join('\n') || 'No details entered';
        const primaryValue = selectedEntity.age && selectedEntity.age !== '0'
          ? `${selectedEntity.age} yrs`
          : '';

        return (
          <HybridItemPreviewCard
            title={titleFor(selectedEntity)}
            subtitle={subtitle}
            primaryValue={primaryValue}
            variant="active"
            isClickable={false}
            isFirst={true}
            isLast={otherEntities.length === 0}
          />
        );
      })()}

      {otherEntities.map((entity, index) => (
        <HybridItemPreviewRow
          key={entity.id}
          title={titleFor(entity)}
          onClick={() => setSelectedEntityId(entity.id)}
          isLast={index === otherEntities.length - 1}
        />
      ))}
    </div>
  );

  const detailForms = selectedEntity ? (
    <GroupedDetailForm>
      {/* space-y-10 on this inner wrapper matches GroupedDetailForm's own
          spacing — without it the FieldGroups would butt up against each
          other (space-y-10 on the parent only sees a single child). */}
      <div key={selectedEntity.id} className="space-y-10">
        <FieldGroup title="Entity">
          <div className="flex gap-3">
            <FormField label="Entity Type">
              <select
                className="table-input table-dropdown"
                defaultValue={selectedEntity.entityType || 'Primary entity'}
                onChange={(e) => handleImmediateUpdate(selectedEntity.id, 'entityType', e.target.value)}
                style={{ minWidth: '160px' }}
              >
                <option value="Primary entity">Primary entity</option>
                <option value="Spouse">Spouse</option>
                <option value="Dependant">Dependant</option>
                <option value="Other">Other</option>
              </select>
            </FormField>
          </div>
        </FieldGroup>

        <FieldGroup title="Personal">
          <div className="flex gap-3">
            <FormField label="Date of Birth">
              <input
                type="date"
                defaultValue={selectedEntity.dateOfBirth}
                className="table-input"
                style={{ width: 'fit-content', minWidth: '160px' }}
                onBlur={(e) => handleFieldUpdate(selectedEntity.id, 'dateOfBirth', e.target.value)}
              />
            </FormField>
            <FormField label="Age">
              <input
                type="text"
                defaultValue={selectedEntity.age}
                className={`table-input ${getValueClass(selectedEntity.age, 'number')}`}
                style={{ width: 'fit-content', minWidth: '80px' }}
                onBlur={(e) => handleFieldUpdate(selectedEntity.id, 'age', e.target.value)}
              />
            </FormField>
          </div>
        </FieldGroup>

        <FieldGroup title="Tax">
          <div className="flex gap-3">
            <FormField label="Tax Rate">
              <select
                className="table-input table-dropdown"
                defaultValue={selectedEntity.taxRate || 'South Africa'}
                onChange={(e) => handleImmediateUpdate(selectedEntity.id, 'taxRate', e.target.value)}
                style={{ minWidth: '160px' }}
              >
                <option value="South Africa">South Africa</option>
                <option value="International">International</option>
                <option value="Other">Other</option>
              </select>
            </FormField>
            <FormField label="Marginal Tax Rate">
              <input
                type="text"
                defaultValue={formatPercentageValue(selectedEntity.marginalTaxRate)}
                className={`table-input ${getValueClass(selectedEntity.marginalTaxRate, 'percentage')}`}
                style={{ width: 'fit-content', minWidth: '80px' }}
                onFocus={handleDefaultValueFocus}
                onBlur={(e) => handleFieldUpdate(selectedEntity.id, 'marginalTaxRate', e.target.value)}
              />
            </FormField>
          </div>
        </FieldGroup>

        <FieldGroup title="Marital">
          <div className="flex gap-3 flex-wrap">
            <FormField label="Marital Status">
              <select
                className="table-input table-dropdown"
                defaultValue={selectedEntity.maritalStatus || ''}
                onChange={(e) => handleImmediateUpdate(selectedEntity.id, 'maritalStatus', e.target.value)}
                style={{ minWidth: '140px' }}
              >
                <option value="">Select status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </FormField>
            <FormField label="Marital Regime">
              <select
                className="table-input table-dropdown"
                defaultValue={selectedEntity.maritalRegime || ''}
                onChange={(e) => handleImmediateUpdate(selectedEntity.id, 'maritalRegime', e.target.value)}
                style={{ minWidth: '220px' }}
              >
                <option value="">Select regime</option>
                <option value="In Community of Property">In Community of Property</option>
                <option value="Out of Community of Property">Out of Community of Property</option>
                <option value="Accrual System">Accrual System</option>
              </select>
            </FormField>
            <FormField label="Marital Date">
              <input
                type="date"
                defaultValue={selectedEntity.maritalDate}
                className="table-input"
                style={{ width: 'fit-content', minWidth: '160px' }}
                onBlur={(e) => handleFieldUpdate(selectedEntity.id, 'maritalDate', e.target.value)}
              />
            </FormField>
            <FormField label="Accrual Inception">
              <input
                type="text"
                defaultValue={selectedEntity.accrualInception}
                className={`table-input ${getValueClass(selectedEntity.accrualInception, 'number')}`}
                style={{ width: 'fit-content', minWidth: '80px' }}
                onBlur={(e) => handleFieldUpdate(selectedEntity.id, 'accrualInception', e.target.value)}
              />
            </FormField>
          </div>
        </FieldGroup>
      </div>
    </GroupedDetailForm>
  ) : null;

  if (isLoading) {
    return <div className="text-center py-4">Loading entities...</div>;
  }

  return (
    <HybridViewWrapper
      header={
        <HybridHeaderBar
          add={onAddEntity ? { label: 'Add Entity', onClick: onAddEntity } : undefined}
          title={selectedEntity?.entityName}
          emptyTitle={selectedEntity ? 'Unnamed Entity' : undefined}
          onTitleChange={selectedEntity
            ? (value) => handleImmediateUpdate(selectedEntity.id, 'entityName', value)
            : undefined}
          onDuplicate={selectedEntity ? () => handleDuplicate(selectedEntity) : undefined}
          onDelete={selectedEntity ? () => handleDelete(selectedEntity.id) : undefined}
          disabled={isUpdating}
        />
      }
      summaryCards={summaryCards}
      detailForms={detailForms}
      isEmpty={entities.length === 0}
      emptyStateMessage="No entities added yet. Click 'Add Entity' to create your first entity."
    />
  );
}
