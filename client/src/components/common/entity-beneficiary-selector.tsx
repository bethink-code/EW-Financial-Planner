import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClientDetails } from "@shared/schema";
import { AddButton, DeleteButton } from "@/components/ui/action-buttons";
import { getFieldClass } from "@/lib/design-tokens";
import { getValueClass, handleDefaultValueFocus } from "@/lib/formatting";

interface EntityBeneficiarySelectorProps {
  policyId: number;
  beneficiaries: string[];
  beneficiaryPercentages: string[];
  onBeneficiaryChange: (policyId: number, beneficiaryIndex: number, newBeneficiary: string) => void;
  onBeneficiaryPercentageChange: (policyId: number, beneficiaryIndex: number, newPercentage: string) => void;
  onAddBeneficiary: (policyId: number) => void;
  onRemoveBeneficiary: (policyId: number, beneficiaryIndex: number) => void;
  rowIndex: number;
  disabled?: boolean;
}

/**
 * Global reusable EntityBeneficiarySelector component for all calculation tables.
 * Provides entity dropdown + percentage input with validation for 100% total.
 * 
 * Usage pattern:
 * - Pass beneficiaries array and beneficiaryPercentages array (must be same length)
 * - Provide onChange handlers for both entity selection and percentage changes
 * - Component handles add/remove functionality with proper synchronization
 * - Validates that percentages total 100% for proper financial planning
 */
export default function EntityBeneficiarySelector({
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
  const [percentageTotal, setPercentageTotal] = useState(0);

  // Fetch client details for entity options
  const { data: entities = [] } = useQuery<ClientDetails[]>({
    queryKey: ["/api/client-details"]
  });

  // Calculate percentage total for validation
  useEffect(() => {
    const total = beneficiaryPercentages.reduce((sum, pct) => {
      const numValue = parseFloat(pct.replace('%', '')) || 0;
      return sum + numValue;
    }, 0);
    console.log('Percentage calculation:', { beneficiaryPercentages, total });
    setPercentageTotal(total);
  }, [beneficiaryPercentages]);

  const handleBeneficiarySelect = useCallback((newBeneficiary: string, beneficiaryIndex: number) => {
    onBeneficiaryChange(policyId, beneficiaryIndex, newBeneficiary);
  }, [policyId, onBeneficiaryChange]);

  // Only show content for the current row's beneficiary
  const beneficiaryIndex = rowIndex;

  const handlePercentageChange = useCallback((newPercentage: string) => {
    // Clean the value and format with % suffix
    let cleanValue = newPercentage.replace(/[^\d.]/g, '');
    if (!cleanValue) cleanValue = "0";
    
    const numValue = parseFloat(cleanValue);
    const formattedPercentage = isNaN(numValue) ? "0%" : `${numValue}%`;
    
    console.log('Percentage change handler:', { 
      input: newPercentage, 
      cleaned: cleanValue, 
      formatted: formattedPercentage, 
      beneficiaryIndex, 
      policyId 
    });
    
    onBeneficiaryPercentageChange(policyId, beneficiaryIndex, formattedPercentage);
  }, [policyId, beneficiaryIndex, onBeneficiaryPercentageChange]);
  if (beneficiaryIndex >= beneficiaries.length) {
    // Return empty table cells for rows beyond beneficiaries count
    return (
      <>
        <td className="px-0.25 py-0.5 align-top border-r border-neutral-200" style={{ width: '60px' }}></td>
        <td className="px-0.25 py-0.5 align-top border-r border-neutral-200" style={{ width: '300px' }}></td>
        <td className="px-0.25 py-0.5 align-top border-r border-neutral-200" style={{ width: '80px' }}></td>
      </>
    );
  }

  const currentBeneficiary = beneficiaries[beneficiaryIndex];
  const currentPercentage = beneficiaryPercentages[beneficiaryIndex] || "0%";
  const isInvalidTotal = Math.abs(percentageTotal - 100) > 0.01;
  
  // Find the entity to get full display name
  const currentEntity = entities.find(entity => entity.entityName === currentBeneficiary);
  const currentDisplayValue = currentEntity ? `${currentEntity.entityName} (${currentEntity.entityType})` : currentBeneficiary;

  // Action button comes FIRST in the code - using same styling as owner component
  const actionButton = rowIndex === 0 ? (
    <AddButton
      onClick={() => onAddBeneficiary(policyId)}
      disabled={disabled}
      size="sm"
    />
  ) : rowIndex > 0 && beneficiaries.length > 1 ? (
    <DeleteButton
      onClick={() => onRemoveBeneficiary(policyId, beneficiaryIndex)}
      disabled={disabled}
      size="sm"
    />
  ) : null;

  return (
    <>
      {/* Actions Column */}
      <td className="pr-0.25 pl-0.25 py-0.5 align-top border-r border-neutral-200" style={{ width: '60px' }}>
        <div className="pt-0.5">
          {actionButton}
        </div>
      </td>
      
      {/* Beneficiary Column */}
      <td className="px-0.25 py-0.5 align-top border-r border-neutral-200" style={{ width: '300px' }}>
        <select
          value={currentDisplayValue}
          onChange={(e) => {
            // Extract entity name from the full display value
            const selectedValue = e.target.value;
            if (selectedValue === "" || selectedValue === "Select beneficiary...") {
              handleBeneficiarySelect("", beneficiaryIndex);
            } else {
              // Extract just the entity name from "EntityName (EntityType)"
              const entityName = selectedValue.replace(/\s*\([^)]*\)\s*$/, '');
              handleBeneficiarySelect(entityName, beneficiaryIndex);
            }
          }}
          disabled={disabled}
          className="table-input table-dropdown w-full min-w-[250px]"
        >
          <option value="">Select beneficiary...</option>
          {entities.map((entity) => {
            const displayValue = `${entity.entityName} (${entity.entityType})`;
            return (
              <option key={entity.id} value={displayValue}>
                {displayValue}
              </option>
            );
          })}
        </select>
      </td>

      {/* Benefit % Column */}
      <td className="pl-0.25 pr-0.25 py-0.5 align-top border-r border-neutral-200" style={{ width: '80px' }}>
        <input
          type="text"
          defaultValue={currentPercentage}
          placeholder="0%"
          className={`table-input ${getFieldClass('percentage')} text-center ${getValueClass(currentPercentage, 'percentage')} ${
            isInvalidTotal ? 'border-red-500 bg-red-50' : ''
          }`}
          style={{minWidth: "50px", maxWidth: "65px"}}
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