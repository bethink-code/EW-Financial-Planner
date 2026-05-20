import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ClientDetails, InsertClientDetails } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { HybridViewWrapper } from '@/components/common/hybrid-view-wrapper';
import { HybridItemPreviewCard } from '@/components/common/hybrid-item-preview-card';
import { FieldGroup, FormField, GroupedDetailForm } from '@/components/common/grouped-detail-form';
import { useDebouncedUpdate } from '@/hooks/use-debounced-update';
import { formatTextValue, formatPercentageValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';
import { Button } from '@/components/ui/button';
import { DetailFormHeader } from '@/components/common/detail-form-header';
import { Plus } from 'lucide-react';

interface ClientDetailsTableProps {
  onAddEntity?: () => void;
}

/**
 * Hybrid editor for client entities. Mirrors the lump-sum / asset / liability
 * pattern: a left-side preview-card list (one card per entity) + a right-side
 * grouped detail form for the selected entity. Replaces the previous flat
 * row-per-entity editable table so capture interfaces stay consistent.
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

  // Preview cards
  const summaryCards = entities.map((entity, index) => {
    const isFirst = index === 0;
    const isLast = index === entities.length - 1;
    const isActive = entity.id === selectedEntityId;

    const title = entity.entityName?.trim() || `Entity ${index + 1}`;

    const previewLines: string[] = [];
    if (entity.entityType) previewLines.push(entity.entityType);
    if (entity.maritalStatus) previewLines.push(entity.maritalStatus);
    const subtitle = previewLines.join('\n') || 'No details entered';

    const primaryValue = entity.age && entity.age !== '0' ? `${entity.age} yrs` : '';

    return (
      <HybridItemPreviewCard
        key={entity.id}
        title={title}
        subtitle={subtitle}
        primaryValue={primaryValue}
        variant={isActive ? 'active' : 'blue'}
        isClickable={true}
        isFirst={isFirst}
        isLast={isLast}
        onClick={() => setSelectedEntityId(entity.id)}
      />
    );
  });

  const selectedEntity = selectedEntityId
    ? entities.find(e => e.id === selectedEntityId)
    : null;

  const detailForms = selectedEntity ? (
    <GroupedDetailForm>
      <div key={selectedEntity.id}>
        <DetailFormHeader
          title={selectedEntity.entityName}
          emptyTitle="Unnamed Entity"
          onDuplicate={() => handleDuplicate(selectedEntity)}
          onDelete={() => handleDelete(selectedEntity.id)}
          disabled={isUpdating}
        />

        <FieldGroup title="Entity">
          <div className="flex gap-3">
            <FormField label="Entity Name">
              <input
                type="text"
                defaultValue={formatTextValue(selectedEntity.entityName)}
                className={`table-input ${getValueClass(selectedEntity.entityName, 'text')}`}
                style={{ width: 'fit-content', minWidth: '180px' }}
                onFocus={handleDefaultValueFocus}
                onBlur={(e) => handleFieldUpdate(selectedEntity.id, 'entityName', e.target.value)}
              />
            </FormField>
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
      summaryCards={
        <div>
          {onAddEntity && (
            <div className="hybrid-add-button-container p-4 border-b border-neutral-200">
              <Button
                onClick={onAddEntity}
                className="bg-white text-gray-700 border border-neutral-200 hover:bg-gray-50 hover:text-gray-900 font-normal"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Entity
              </Button>
            </div>
          )}
          <div className="hybrid-tabs-list">
            {summaryCards}
          </div>
        </div>
      }
      detailForms={detailForms}
      isEmpty={entities.length === 0}
      emptyStateMessage="No entities added yet. Click 'Add Entity' to create your first entity."
    />
  );
}
