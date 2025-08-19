import React from 'react';
import { EntitySelector } from "@/components/ui/entity-selector";
import { AddButton, DeleteButton } from "@/components/ui/action-buttons";
import { useEntityConversion } from "@/lib/entity-conversion";
import { getFieldClass } from "@/lib/design-tokens";
import { getValueClass, handleDefaultValueFocus } from "@/lib/formatting";

interface EntityBeneficiarySelectorProps {
  policyId: number;
  beneficiaries: string[];
  beneficiaryPercentages: string[];
  onBeneficiaryChange: (policyId: number, index: number, value: string) => void;
  onBeneficiaryPercentageChange: (policyId: number, index: number, value: string) => void;
  onAddBeneficiary: (policyId: number) => void;
  onRemoveBeneficiary: (policyId: number, index: number) => void;
  rowIndex: number;
  disabled?: boolean;
}

export function EntityBeneficiarySelector({
  policyId,
  beneficiaries,
  beneficiaryPercentages,
  onBeneficiaryChange,
  onBeneficiaryPercentageChange,
  onAddBeneficiary,
  onRemoveBeneficiary,
  rowIndex,
  disabled = false
}: EntityBeneficiarySelectorProps) {
  const { namesToIds, idsToNames, isReady } = useEntityConversion();

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

  // Check if we're in the valid range for this beneficiary
  if (rowIndex >= beneficiaries.length) {
    return <div></div>; // Empty cell
  }

  const currentBeneficiaryName = beneficiaries[rowIndex] || "";
  
  // Convert current name to entity ID for selector
  const currentEntityIds = namesToIds([currentBeneficiaryName]);
  const currentEntityId = currentEntityIds[0] || 0;

  const handleEntityChange = (entityId: number) => {
    // Convert entity ID back to name for storage
    const entityNames = idsToNames([entityId]);
    const entityName = entityNames[0] || "";
    onBeneficiaryChange(policyId, rowIndex, entityName);
  };

  const currentPercentage = beneficiaryPercentages[rowIndex] || "0%";

  const handlePercentageChange = (value: string) => {
    // Ensure percentage format
    let cleanValue = value.replace(/[^\d.]/g, '');
    if (cleanValue && !isNaN(parseFloat(cleanValue))) {
      cleanValue = `${parseFloat(cleanValue)}%`;
    } else {
      cleanValue = "0%";
    }
    onBeneficiaryPercentageChange(policyId, rowIndex, cleanValue);
  };

  return (
    <div className="flex items-center gap-0.5">
      <EntitySelector
        value={currentEntityId}
        onChange={handleEntityChange}
        disabled={disabled}
        placeholder="Select beneficiary..."
        className="table-input entity-dropdown-input flex-1"
      />
      <input
        type="text"
        defaultValue={currentPercentage}
        placeholder="0%"
        className={`entity-percentage-input ${getFieldClass('percentage')} ${getValueClass(currentPercentage, 'percentage')}`}
        onFocus={handleDefaultValueFocus}
        onBlur={(e) => handlePercentageChange(e.target.value)}
        disabled={disabled}
      />
      {rowIndex === 0 ? (
        <AddButton
          onClick={() => onAddBeneficiary(policyId)}
          disabled={disabled}
          size="sm"
        />
      ) : (
        <DeleteButton
          onClick={() => onRemoveBeneficiary(policyId, rowIndex)}
          disabled={disabled}
          size="sm"
        />
      )}
    </div>
  );
}