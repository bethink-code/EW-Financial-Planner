import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { ClientDetails } from "@shared/schema";
import { AddButton, DeleteButton } from "@/components/ui/action-buttons";
import { EntitySelector, EntityDisplay } from "@/components/ui/entity-selector";

interface EntityMultiSelectorProps {
  entityIds: number[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, entityId: number) => void;
  disabled?: boolean;
  showDisplayMode?: boolean; // Toggle between selector and display mode
}

export function EntityMultiSelector({
  entityIds,
  onAdd,
  onRemove,
  onChange,
  disabled = false,
  showDisplayMode = false
}: EntityMultiSelectorProps) {
  const { data: clientDetails = [] } = useQuery<ClientDetails[]>({
    queryKey: ["/api/client-details"],
  });

  if (showDisplayMode) {
    // Display mode - show entity names with type badges
    return (
      <div className="space-y-2">
        {entityIds.map((entityId, index) => (
          <div key={`display-${index}`} className="flex items-center justify-between">
            <EntityDisplay entityId={entityId} />
            {index > 0 && (
              <DeleteButton
                onClick={() => onRemove(index)}
                disabled={disabled}
                size="sm"
              />
            )}
          </div>
        ))}
        <AddButton
          onClick={onAdd}
          disabled={disabled}
          size="sm"
        />
      </div>
    );
  }

  // Selector mode - show dropdowns for editing
  return (
    <div className="space-y-1">
      {entityIds.map((entityId, index) => (
        <div key={`selector-${index}`} className="flex items-center gap-1">
          <EntitySelector
            value={entityId}
            onChange={(newEntityId) => onChange(index, newEntityId)}
            disabled={disabled}
            placeholder="Select entity..."
            className="table-input table-dropdown flex-1"
          />
          {index === 0 ? (
            <AddButton
              onClick={onAdd}
              disabled={disabled}
              size="sm"
            />
          ) : (
            <DeleteButton
              onClick={() => onRemove(index)}
              disabled={disabled}
              size="sm"
            />
          )}
        </div>
      ))}
    </div>
  );
}