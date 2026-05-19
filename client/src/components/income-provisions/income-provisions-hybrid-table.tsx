import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { IncomeProvisions } from '@shared/schema';
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

interface IncomeProvisionsHybridTableProps {
  onAddProvision?: () => void;
  searchTerm?: string;
}

export function IncomeProvisionsHybridTable({ onAddProvision, searchTerm = "" }: IncomeProvisionsHybridTableProps) {
  const { isLoading: globalLoading } = useLoading();
  const [selectedProvisionId, setSelectedProvisionId] = React.useState<number | null>(null);

  const { data: provisions = [], isLoading } = useQuery<IncomeProvisions[]>({
    queryKey: ['/api/income-provisions'],
  });

  // Filter provisions based on search term
  const filteredProvisions = provisions.filter(provision => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      provision.description?.toLowerCase().includes(search) ||
      provision.personName?.toLowerCase().includes(search) ||
      provision.amount?.toLowerCase().includes(search) ||
      provision.frequency?.toLowerCase().includes(search)
    );
  });

  // Auto-select first item when data loads
  React.useEffect(() => {
    if (filteredProvisions.length > 0 && selectedProvisionId === null) {
      setSelectedProvisionId(filteredProvisions[0].id);
    }
  }, [filteredProvisions, selectedProvisionId]);

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<IncomeProvisions> }) => {
      return apiRequest('PATCH', `/api/income-provisions/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-provisions'] });
    },
  });

  const debouncedUpdate = useDebouncedUpdate((id: number, field: keyof IncomeProvisions, value: string | boolean | number) => {
    updateMutation.mutate({ id, updates: { [field]: value } });
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/income-provisions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-provisions'] });
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const newProvision = {}; // Send empty object to use database defaults
      return apiRequest('POST', '/api/income-provisions', newProvision);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-provisions'] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (provision: IncomeProvisions) => {
      const { id, ...provisionWithoutId } = provision;
      const duplicatedProvision = {
        ...provisionWithoutId,
        description: `${provision.description || 'Provision'} (Copy)`,
      };
      const res = await apiRequest('POST', '/api/income-provisions', duplicatedProvision);
      return await res.json();
    },
    onSuccess: (newProvision: IncomeProvisions) => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-provisions'] });
      setSelectedProvisionId(newProvision.id);
    },
  });

  const handleFieldUpdate = (id: number, field: keyof IncomeProvisions, value: string | boolean | number) => {
    debouncedUpdate(id, field, value);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleDuplicate = (provision: IncomeProvisions) => {
    duplicateMutation.mutate(provision);
  };

  const isUpdating = deleteMutation.isPending || addMutation.isPending || duplicateMutation.isPending;

  // Calculate capitalised amount (simplified version)
  const calculateCapitalisedAmount = (provision: IncomeProvisions): string => {
    // This would contain the actual calculation logic
    // For now, return a placeholder
    return "R 0";
  };

  // Generate preview cards
  const summaryCards = filteredProvisions.map((provision, index) => {
    const isFirst = index === 0;
    const isLast = index === filteredProvisions.length - 1;
    const isActive = provision.id === selectedProvisionId;

    // Generate preview content
    const title = provision.description && provision.description.trim() !== '' && provision.description !== 'Enter details ...' 
      ? provision.description 
      : `Provision ${index + 1}`;

    const previewLines = [];
    
    if (provision.personName && provision.personName.trim() !== '' && provision.personName !== 'Enter details ...') {
      previewLines.push(`Entity: ${provision.personName}`);
    }
    
    if (provision.amount && provision.amount !== 'R 0') {
      previewLines.push(`Amount: ${provision.amount}`);
    }
    
    if (provision.startDate && provision.startDate.trim() !== '' && provision.startDate !== 'Enter details ...') {
      previewLines.push(`Start: ${provision.startDate}`);
    }
    
    if (provision.termYears && provision.termYears !== '0 years') {
      previewLines.push(`Term: ${provision.termYears}`);
    }
    
    if (provision.frequency && provision.frequency.trim() !== '' && provision.frequency !== 'Enter details ...') {
      previewLines.push(`Frequency: ${provision.frequency}`);
    }

    const preview = previewLines.length > 0 ? previewLines.join('\n') : 'No details entered';

    return (
      <HybridItemPreviewCard
        key={provision.id}
        title={title}
        subtitle={preview}
        primaryValue={provision.amount || 'R 0'}
        variant={isActive ? 'active' : 'blue'}
        isClickable={true}
        isFirst={isFirst}
        isLast={isLast}
        onClick={() => setSelectedProvisionId(provision.id)}
      />
    );
  });

  // Get selected provision for detail form
  const selectedProvision = selectedProvisionId 
    ? filteredProvisions.find(provision => provision.id === selectedProvisionId)
    : null;

  // Generate detail forms - only show selected item
  const detailForms = selectedProvision ? (
    <GroupedDetailForm>
      <div key={selectedProvision.id}>
        <DetailFormHeader
          title={selectedProvision.description}
          emptyTitle="Untitled Provision"
          onDuplicate={() => handleDuplicate(selectedProvision)}
          onDelete={() => handleDelete(selectedProvision.id)}
          disabled={isUpdating}
        />

        {/* Group 1: Overview */}
        <FieldGroup title="Overview">
            <div className="flex gap-3">
              <FormField label="Description">
                <input
                  type="text"
                  defaultValue={formatTextValue(selectedProvision.description)}
                  className={`table-input ${getValueClass(selectedProvision.description, 'text')}`}
                  style={{ width: 'fit-content', minWidth: '120px' }}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleFieldUpdate(selectedProvision.id, 'description', e.target.value)}
                />
              </FormField>
              
              <FormField label="Entity">
                <input
                  type="text"
                  defaultValue={formatTextValue(selectedProvision.personName)}
                  className={`table-input ${getValueClass(selectedProvision.personName, 'text')}`}
                  style={{ width: 'fit-content', minWidth: '120px' }}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleFieldUpdate(selectedProvision.id, 'personName', e.target.value)}
                />
              </FormField>
            </div>
          </FieldGroup>

        {/* Group 2: Income Provision Details */}
        <FieldGroup title="Income Provision Details" className="mt-8">
            <div className="flex gap-3 flex-wrap">
              <FormField label="Amount">
                <input
                  type="text"
                  defaultValue={selectedProvision.amount}
                  className={`table-input ${getValueClass(selectedProvision.amount, 'currency')}`}
                  style={{ width: 'fit-content', minWidth: '100px' }}
                  onBlur={(e) => handleFieldUpdate(selectedProvision.id, 'amount', e.target.value)}
                />
              </FormField>
              
              <FormField label="Start">
                <input
                  type="text"
                  defaultValue={formatTextValue(selectedProvision.startDate)}
                  className={`table-input ${getValueClass(selectedProvision.startDate, 'text')}`}
                  style={{ width: 'fit-content', minWidth: '80px' }}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleFieldUpdate(selectedProvision.id, 'startDate', e.target.value)}
                />
              </FormField>
              
              <FormField label="Term (years)">
                <input
                  type="text"
                  defaultValue={selectedProvision.termYears}
                  className={`table-input ${getValueClass(selectedProvision.termYears, 'years')}`}
                  style={{ width: 'fit-content', minWidth: '80px' }}
                  onBlur={(e) => handleFieldUpdate(selectedProvision.id, 'termYears', e.target.value)}
                />
              </FormField>
              
              <FormField label="Increase %">
                <input
                  type="text"
                  defaultValue={selectedProvision.increasePercentage}
                  className={`table-input ${getValueClass(selectedProvision.increasePercentage, 'percentage')}`}
                  style={{ width: 'fit-content', minWidth: '60px' }}
                  onBlur={(e) => handleFieldUpdate(selectedProvision.id, 'increasePercentage', e.target.value)}
                />
              </FormField>
              
              <FormField label="Frequency">
                <input
                  type="text"
                  defaultValue={formatTextValue(selectedProvision.frequency)}
                  className={`table-input ${getValueClass(selectedProvision.frequency, 'text')}`}
                  style={{ width: 'fit-content', minWidth: '80px' }}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleFieldUpdate(selectedProvision.id, 'frequency', e.target.value)}
                />
              </FormField>
              
              <FormField label="Tax %">
                <input
                  type="text"
                  defaultValue={selectedProvision.taxPercentage}
                  className={`table-input ${getValueClass(selectedProvision.taxPercentage, 'percentage')}`}
                  style={{ width: 'fit-content', minWidth: '60px' }}
                  onBlur={(e) => handleFieldUpdate(selectedProvision.id, 'taxPercentage', e.target.value)}
                />
              </FormField>
            </div>
          </FieldGroup>

          {/* Group 3: Additional Details */}
          <FieldGroup title="Additional Details" className="mt-8">
            <div className="flex gap-3">
              <FormField label="CPI Linked">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedProvision.cpi}
                    onChange={(e) => handleFieldUpdate(selectedProvision.id, 'cpi', e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    {selectedProvision.cpi ? 'Yes' : 'No'}
                  </label>
                </div>
              </FormField>
              
              <FormField label="Tax Rate">
                <input
                  type="text"
                  defaultValue={formatTextValue(selectedProvision.taxRate)}
                  className={`table-input ${getValueClass(selectedProvision.taxRate, 'text')}`}
                  style={{ width: 'fit-content', minWidth: '80px' }}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleFieldUpdate(selectedProvision.id, 'taxRate', e.target.value)}
                />
              </FormField>
              
              <FormField label="Capitalised Amount">
                <input
                  type="text"
                  defaultValue={calculateCapitalisedAmount(selectedProvision)}
                  className="calculated-field"
                  style={{ width: 'fit-content', minWidth: '100px' }}
                  readOnly
                  disabled
                />
              </FormField>
            </div>
          </FieldGroup>
        </div>
    </GroupedDetailForm>
  ) : null;

  if (isLoading) {
    return <div className="text-center py-4">Loading provisions...</div>;
  }

  return (
    <HybridViewWrapper
      summaryCards={
        <div>
          {onAddProvision && (
            <div className="hybrid-add-button-container p-4 border-b border-neutral-200">
              <Button
                onClick={onAddProvision}
                className="bg-white text-gray-700 border border-neutral-200 hover:bg-gray-50 hover:text-gray-900 font-normal"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Provision
              </Button>
            </div>
          )}
          <div className="hybrid-tabs-list">
            {summaryCards}
          </div>
        </div>
      }
      detailForms={detailForms}
      isEmpty={filteredProvisions.length === 0}
      emptyStateMessage="No provisions added yet. Click 'Add Provision' to create your first income provision."
    />
  );
}