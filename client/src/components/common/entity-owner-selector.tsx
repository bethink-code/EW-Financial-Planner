import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClientDetails } from "@shared/schema";
import { AddButton, DeleteButton } from "@/components/ui/action-buttons";
import { getFieldClass } from "@/lib/design-tokens";
import { getValueClass, handleDefaultValueFocus } from "@/lib/formatting";

interface EntityOwnerSelectorProps {
  policyId: number;
  owners: string[];
  ownershipPercentages: string[];
  onOwnerChange: (policyId: number, ownerIndex: number, newOwner: string) => void;
  onOwnershipPercentageChange: (policyId: number, ownerIndex: number, newPercentage: string) => void;
  onAddOwner: (policyId: number) => void;
  onRemoveOwner: (policyId: number, ownerIndex: number) => void;
  rowIndex: number;
  disabled?: boolean;
}

/**
 * Global reusable EntityOwnerSelector component for all calculation tables.
 * Provides entity dropdown + percentage input with validation for 100% total.
 * 
 * Usage pattern:
 * - Pass owners array and ownershipPercentages array (must be same length)
 * - Provide onChange handlers for both entity selection and percentage changes
 * - Component handles add/remove functionality with proper synchronization
 * - Validates that percentages total 100% for proper financial planning
 */
export default function EntityOwnerSelector({
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
  const [percentageTotal, setPercentageTotal] = useState(0);

  // Fetch client details for entity options
  const { data: entities = [] } = useQuery<ClientDetails[]>({
    queryKey: ["/api/client-details"]
  });

  // Calculate percentage total for validation
  useEffect(() => {
    const total = ownershipPercentages.reduce((sum, pct) => {
      const numValue = parseFloat(pct.replace('%', '')) || 0;
      return sum + numValue;
    }, 0);
    console.log('Owner percentage calculation:', { ownershipPercentages, total });
    setPercentageTotal(total);
  }, [ownershipPercentages]);

  const handleOwnerSelect = useCallback((newOwner: string, ownerIndex: number) => {
    onOwnerChange(policyId, ownerIndex, newOwner);
  }, [policyId, onOwnerChange]);

  // Only show content for the current row's owner
  const ownerIndex = rowIndex;

  const handlePercentageChange = useCallback((newPercentage: string) => {
    // Clean the value and format with % suffix
    let cleanValue = newPercentage.replace(/[^\d.]/g, '');
    if (!cleanValue) cleanValue = "0";
    
    const numValue = parseFloat(cleanValue);
    const formattedPercentage = isNaN(numValue) ? "0%" : `${numValue}%`;
    
    console.log('Owner percentage change handler:', { 
      input: newPercentage, 
      cleaned: cleanValue, 
      formatted: formattedPercentage, 
      ownerIndex, 
      policyId 
    });
    
    onOwnershipPercentageChange(policyId, ownerIndex, formattedPercentage);
  }, [policyId, ownerIndex, onOwnershipPercentageChange]);

  if (ownerIndex >= owners.length) {
    return <div className="p-2"></div>; // Empty cell for rows beyond owners count
  }

  const currentOwner = owners[ownerIndex];
  const currentPercentage = ownershipPercentages[ownerIndex] || "0%";
  const isInvalidTotal = Math.abs(percentageTotal - 100) > 0.01;

  // Action button comes FIRST in the code - using same styling as beneficiary component
  const actionButton = rowIndex === 0 ? (
    <AddButton
      onClick={() => onAddOwner(policyId)}
      disabled={disabled}
      size="sm"
    />
  ) : rowIndex > 0 && owners.length > 1 ? (
    <DeleteButton
      onClick={() => onRemoveOwner(policyId, ownerIndex)}
      disabled={disabled}
      size="sm"
    />
  ) : null;

  return (
    <>
      {/* Actions Column */}
      <td className="px-1 py-1 border-r border-neutral-200" style={{ width: '60px' }}>
        {actionButton}
      </td>
      
      {/* Owner Column */}
      <td className="px-1 py-1 border-r border-neutral-200" style={{ width: '180px' }}>
        <select
          value={currentOwner}
          onChange={(e) => handleOwnerSelect(e.target.value, ownerIndex)}
          disabled={disabled}
          className="table-input table-dropdown w-full"
        >
          <option value="">Select owner...</option>
          {entities.map((entity) => (
            <option key={entity.id} value={entity.entityName}>
              {entity.entityName} ({entity.entityType})
            </option>
          ))}
        </select>
      </td>

      {/* Ownership % Column */}
      <td className="px-1 py-1 border-r border-neutral-200" style={{ width: '80px' }}>
        <input
          type="text"
          defaultValue={currentPercentage}
          placeholder="0%"
          className={`table-input ${getFieldClass('percentage')} w-16 text-center ${getValueClass(currentPercentage, 'percentage')} ${
            isInvalidTotal ? 'border-red-500 bg-red-50' : ''
          }`}
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