import React from 'react';
import { EntitySelector } from "@/components/ui/entity-selector";
import { AddButton, DeleteButton } from "@/components/ui/action-buttons";
import { useEntityConversion } from "@/lib/entity-conversion";

interface EntityOwnerSelectorProps {
  policyId: number;
  owners: string[];
  onOwnerChange: (policyId: number, index: number, value: string) => void;
  onAddOwner: (policyId: number) => void;
  onRemoveOwner: (policyId: number, index: number) => void;
  rowIndex: number;
  disabled?: boolean;
}

export function EntityOwnerSelector({
  policyId,
  owners,
  onOwnerChange,
  onAddOwner,
  onRemoveOwner,
  rowIndex,
  disabled = false
}: EntityOwnerSelectorProps) {
  const { namesToIds, idsToNames, clientDetails, isReady } = useEntityConversion();

  if (!isReady) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="text"
          value="Loading entities..."
          disabled
          className="table-input flex-1"
        />
      </div>
    );
  }

  // Check if we're in the valid range for this owner
  if (rowIndex >= owners.length) {
    return <div></div>; // Empty cell
  }

  const currentOwnerName = owners[rowIndex] || "";
  
  // Convert current name to entity ID for selector
  const currentEntityIds = namesToIds([currentOwnerName]);
  const currentEntityId = currentEntityIds[0] || 0;

  const handleEntityChange = (entityId: number) => {
    // Convert entity ID back to name for storage
    const entityNames = idsToNames([entityId]);
    const entityName = entityNames[0] || "";
    onOwnerChange(policyId, rowIndex, entityName);
  };

  return (
    <div className="flex items-center gap-1">
      <EntitySelector
        value={currentEntityId}
        onChange={handleEntityChange}
        disabled={disabled}
        placeholder="Select owner..."
        className="table-input table-dropdown flex-1"
      />
      {rowIndex === 0 ? (
        <AddButton
          onClick={() => onAddOwner(policyId)}
          disabled={disabled}
          size="sm"
        />
      ) : (
        <DeleteButton
          onClick={() => onRemoveOwner(policyId, rowIndex)}
          disabled={disabled}
          size="sm"
        />
      )}
    </div>
  );
}