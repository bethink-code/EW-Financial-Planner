import React from 'react';
import { EntitySelector } from "@/components/ui/entity-selector";
import { AddButton, DeleteButton } from "@/components/ui/action-buttons";
import { useEntityConversion } from "@/lib/entity-conversion";
import { getFieldClass } from "@/lib/design-tokens";
import { getValueClass, handleDefaultValueFocus } from "@/lib/formatting";
import { useQuery } from "@tanstack/react-query";
import { ClientDetails } from "@shared/schema";

interface EntityOwnerSelectorProps {
  policyId: number;
  owners: string[];
  ownershipPercentages: string[];
  onOwnerChange: (policyId: number, index: number, value: string) => void;
  onOwnershipPercentageChange: (policyId: number, index: number, value: string) => void;
  onAddOwner: (policyId: number) => void;
  onRemoveOwner: (policyId: number, index: number) => void;
  rowIndex: number;
  disabled?: boolean;
}

export function EntityOwnerSelector({
  policyId,
  owners,
  ownershipPercentages,
  onOwnerChange,
  onOwnershipPercentageChange,
  onAddOwner,
  onRemoveOwner,
  rowIndex,
  disabled = false
}: EntityOwnerSelectorProps) {
  const { namesToIds, idsToNames, clientDetails, isReady } = useEntityConversion();

  // Fetch client details for entity options
  const { data: entities = [] } = useQuery<ClientDetails[]>({
    queryKey: ["/api/client-details"]
  });

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
  
  // Find the entity to get full display name
  const currentEntity = entities.find(entity => entity.entityName === currentOwnerName);
  const currentDisplayValue = currentEntity ? `${currentEntity.entityName} (${currentEntity.entityType})` : currentOwnerName;

  const handleEntityChange = (entityId: number) => {
    // Convert entity ID back to name for storage
    const entityNames = idsToNames([entityId]);
    const entityName = entityNames[0] || "";
    onOwnerChange(policyId, rowIndex, entityName);
  };

  const currentPercentage = ownershipPercentages[rowIndex] || "0%";

  const handlePercentageChange = (value: string) => {
    // Ensure percentage format
    let cleanValue = value.replace(/[^\d.]/g, '');
    if (cleanValue && !isNaN(parseFloat(cleanValue))) {
      cleanValue = `${parseFloat(cleanValue)}%`;
    } else {
      cleanValue = "0%";
    }
    onOwnershipPercentageChange(policyId, rowIndex, cleanValue);
  };

  return (
    <>
      {/* Actions Column */}
      <td className="border border-neutral-300 p-1 align-top">
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
      </td>
      
      {/* Owner Name Column */}
      <td className="border border-neutral-300 p-1">
        <div className="w-full min-w-[250px]">
          <select
            value={currentDisplayValue}
            onChange={(e) => {
              // Extract entity name from the full display value
              const selectedValue = e.target.value;
              if (selectedValue === "" || selectedValue === "Select owner...") {
                onOwnerChange(policyId, rowIndex, "");
              } else {
                // Extract just the entity name from "EntityName (EntityType)"
                const entityName = selectedValue.replace(/\s*\([^)]*\)\s*$/, '');
                onOwnerChange(policyId, rowIndex, entityName);
              }
            }}
            disabled={disabled}
            className="table-input table-dropdown w-full min-w-[250px]"
          >
            <option value="">Select owner...</option>
            {entities.map((entity) => {
              const displayValue = `${entity.entityName} (${entity.entityType})`;
              return (
                <option key={entity.id} value={displayValue}>
                  {displayValue}
                </option>
              );
            })}
          </select>
        </div>
      </td>
      
      {/* Ownership Percentage Column */}
      <td className="border border-neutral-300 p-1">
        <input
          type="text"
          defaultValue={currentPercentage}
          placeholder="0%"
          className={`table-input ${getFieldClass('percentage')} w-16 text-center ${getValueClass(currentPercentage, 'percentage')}`}
          onFocus={(e) => {
            handleDefaultValueFocus(e);
            // Remove % sign for editing but keep the number
            const valueWithoutPercent = e.target.value.replace('%', '');
            e.target.value = valueWithoutPercent;
          }}
          onBlur={(e) => {
            handlePercentageChange(e.target.value);
            // Restore the formatted value with % sign
            const cleanValue = e.target.value.replace(/[^\d.]/g, '');
            const numValue = parseFloat(cleanValue);
            e.target.value = isNaN(numValue) ? "0%" : `${numValue}%`;
          }}
          disabled={disabled}
        />
      </td>
    </>
  );
}