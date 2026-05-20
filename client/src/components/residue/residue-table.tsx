import { useQuery, useMutation } from '@tanstack/react-query';
import { Residue } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { FieldGroup, FormField, GroupedDetailForm } from '@/components/common/grouped-detail-form';
import { useDebouncedUpdate } from '@/hooks/use-debounced-update';
import { formatPercentageValue, getValueClass, handleDefaultValueFocus } from '@/lib/formatting';

const DEFAULT_RESIDUE: Pick<Residue, 'id' | 'entity' | 'percentage'> = {
  id: 1,
  entity: 'Residue to registered charities',
  percentage: '0',
};

/**
 * Residue editor. Single-record so there's no sidebar — just the card frame
 * with one FieldGroup. Matches the new white-card surface used by the other
 * DEL Setup tabs.
 */
function ResidueTable() {
  const { data: residueItems = [], isLoading, error } = useQuery<Residue[]>({
    queryKey: ['/api/residue'],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Residue> }) => {
      return apiRequest('PATCH', `/api/residue/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/residue'] });
    },
  });

  const debouncedUpdate = useDebouncedUpdate((id: number, field: keyof Residue, value: string) => {
    updateMutation.mutate({ id, updates: { [field]: value } });
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading residue...</div>;
  }
  if (error) {
    return <div className="text-center py-4 text-red-500">Error loading residue</div>;
  }

  const residueItem = residueItems[0] ?? DEFAULT_RESIDUE;

  return (
    <div className="rounded-lg shadow-sm border border-neutral-200 overflow-hidden bg-white">
      <GroupedDetailForm>
        <FieldGroup title="Residue">
          <FormField label={residueItem.entity}>
            <input
              type="text"
              defaultValue={formatPercentageValue(residueItem.percentage)}
              className={`table-input ${getValueClass(residueItem.percentage, 'percentage')}`}
              style={{ width: 'fit-content', minWidth: '120px' }}
              onFocus={handleDefaultValueFocus}
              onBlur={(e) => debouncedUpdate(
                residueItem.id,
                'percentage',
                formatPercentageValue(e.target.value),
              )}
            />
          </FormField>
        </FieldGroup>
      </GroupedDetailForm>
    </div>
  );
}

export default ResidueTable;
