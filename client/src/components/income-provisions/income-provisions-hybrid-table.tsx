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
import { Plus } from 'lucide-react';

interface IncomeProvisionsHybridTableProps {
  onAddProvision?: () => void;
  searchTerm?: string;
}

export function IncomeProvisionsHybridTable({ onAddProvision, searchTerm = "" }: IncomeProvisionsHybridTableProps) {
  const { isLoading: globalLoading } = useLoading();

  const { data: provisions = [], isLoading } = useQuery<IncomeProvisions[]>({
    queryKey: ['/api/income-provisions'],
  });

  const debouncedUpdate = useDebouncedUpdate();

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

  const handleFieldUpdate = (id: number, field: keyof IncomeProvisions, value: string | boolean | number) => {
    debouncedUpdate('/api/income-provisions', ['/api/income-provisions'], id, { [field]: value });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleDuplicate = (provision: IncomeProvisions) => {
    addMutation.mutate();
  };

  const isUpdating = deleteMutation.isPending || addMutation.isPending;

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
        primaryValue={preview}
        isFirst={isFirst}
        isLast={isLast}
      />
    );
  });

  // Generate detail forms
  const detailForms = (
    <GroupedDetailForm>
      {filteredProvisions.map((provision) => (
        <div key={provision.id}>
          {/* Header with Actions */}
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-lg font-semibold text-neutral-800">
              {provision.description || 'Untitled Provision'}
            </h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDuplicate(provision)}
                disabled={isUpdating}
              >
                Duplicate
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDelete(provision.id)}
                disabled={isUpdating}
              >
                Delete
              </Button>
            </div>
          </div>

          {/* Group 1: Overview */}
          <FieldGroup title="Overview">
            <div className="flex gap-3">
              <FormField label="Description">
                <input
                  type="text"
                  defaultValue={formatTextValue(provision.description)}
                  className={`table-input ${getValueClass(provision.description, 'text')}`}
                  style={{ width: 'fit-content', minWidth: '120px' }}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleFieldUpdate(provision.id, 'description', e.target.value)}
                />
              </FormField>
              
              <FormField label="Entity">
                <input
                  type="text"
                  defaultValue={formatTextValue(provision.personName)}
                  className={`table-input ${getValueClass(provision.personName, 'text')}`}
                  style={{ width: 'fit-content', minWidth: '120px' }}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleFieldUpdate(provision.id, 'personName', e.target.value)}
                />
              </FormField>
            </div>
          </FieldGroup>

          {/* Group 2: Income Provision Details */}
          <FieldGroup title="Income Provision Details">
            <div className="flex gap-3 flex-wrap">
              <FormField label="Amount">
                <input
                  type="text"
                  defaultValue={provision.amount}
                  className={`table-input ${getValueClass(provision.amount, 'currency')}`}
                  style={{ width: 'fit-content', minWidth: '100px' }}
                  onBlur={(e) => handleFieldUpdate(provision.id, 'amount', e.target.value)}
                />
              </FormField>
              
              <FormField label="Start">
                <input
                  type="text"
                  defaultValue={formatTextValue(provision.startDate)}
                  className={`table-input ${getValueClass(provision.startDate, 'text')}`}
                  style={{ width: 'fit-content', minWidth: '80px' }}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleFieldUpdate(provision.id, 'startDate', e.target.value)}
                />
              </FormField>
              
              <FormField label="Term (years)">
                <input
                  type="text"
                  defaultValue={provision.termYears}
                  className={`table-input ${getValueClass(provision.termYears, 'years')}`}
                  style={{ width: 'fit-content', minWidth: '80px' }}
                  onBlur={(e) => handleFieldUpdate(provision.id, 'termYears', e.target.value)}
                />
              </FormField>
              
              <FormField label="Increase %">
                <input
                  type="text"
                  defaultValue={provision.increasePercentage}
                  className={`table-input ${getValueClass(provision.increasePercentage, 'percentage')}`}
                  style={{ width: 'fit-content', minWidth: '60px' }}
                  onBlur={(e) => handleFieldUpdate(provision.id, 'increasePercentage', e.target.value)}
                />
              </FormField>
              
              <FormField label="Frequency">
                <input
                  type="text"
                  defaultValue={formatTextValue(provision.frequency)}
                  className={`table-input ${getValueClass(provision.frequency, 'text')}`}
                  style={{ width: 'fit-content', minWidth: '80px' }}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleFieldUpdate(provision.id, 'frequency', e.target.value)}
                />
              </FormField>
              
              <FormField label="Tax %">
                <input
                  type="text"
                  defaultValue={provision.taxPercentage}
                  className={`table-input ${getValueClass(provision.taxPercentage, 'percentage')}`}
                  style={{ width: 'fit-content', minWidth: '60px' }}
                  onBlur={(e) => handleFieldUpdate(provision.id, 'taxPercentage', e.target.value)}
                />
              </FormField>
            </div>
          </FieldGroup>

          {/* Group 3: Additional Details */}
          <FieldGroup title="Additional Details">
            <div className="flex gap-3">
              <FormField label="CPI Linked">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={provision.cpi}
                    onChange={(e) => handleFieldUpdate(provision.id, 'cpi', e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    {provision.cpi ? 'Yes' : 'No'}
                  </label>
                </div>
              </FormField>
              
              <FormField label="Tax Rate">
                <input
                  type="text"
                  defaultValue={formatTextValue(provision.taxRate)}
                  className={`table-input ${getValueClass(provision.taxRate, 'text')}`}
                  style={{ width: 'fit-content', minWidth: '80px' }}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleFieldUpdate(provision.id, 'taxRate', e.target.value)}
                />
              </FormField>
              
              <FormField label="Capitalised Amount">
                <input
                  type="text"
                  defaultValue={calculateCapitalisedAmount(provision)}
                  className="calculated-field"
                  style={{ width: 'fit-content', minWidth: '100px' }}
                  readOnly
                  disabled
                />
              </FormField>
            </div>
          </FieldGroup>
        </div>
      ))}
    </GroupedDetailForm>
  );

  if (isLoading) {
    return <div className="text-center py-4">Loading provisions...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Add Button */}
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

      <HybridViewWrapper
        viewMode="hybrid"
        tableComponent={null}
        summaryCards={summaryCards}
        detailForms={detailForms}
        isEmpty={filteredProvisions.length === 0}
        emptyStateMessage="No provisions added yet. Click 'Add Provision' to create your first income provision."
      />
    </div>
  );
}