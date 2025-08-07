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
    return <div className="p-2"></div>; // Empty cell for rows beyond beneficiaries count
  }

  const currentBeneficiary = beneficiaries[beneficiaryIndex];
  const currentPercentage = beneficiaryPercentages[beneficiaryIndex] || "0%";
  const isInvalidTotal = Math.abs(percentageTotal - 100) > 0.01;

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
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        {/* Action Button - Using plain button without any wrapper */}
        {actionButton}
        
        {/* Entity Selector - Using native HTML select to avoid CSS conflicts */}
        <select
          value={currentBeneficiary}
          onChange={(e) => handleBeneficiarySelect(e.target.value, beneficiaryIndex)}
          disabled={disabled}
          className="table-input table-dropdown"
          style={{minWidth: "200px", maxWidth: "250px", width: "auto"}}
        >
          <option value="">Select beneficiary...</option>
          {entities.map((entity) => (
            <option key={entity.id} value={entity.entityName}>
              {entity.entityName} ({entity.entityType})
            </option>
          ))}
        </select>

        {/* Percentage Input - matching owner component styling */}
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
      </div>

      {/* Validation Warning - show on last row only */}
      {rowIndex === beneficiaries.length - 1 && isInvalidTotal && (
        <div className="text-xs text-red-600 font-medium">
          Total: {percentageTotal.toFixed(1)}% (must equal 100%)
        </div>
      )}
    </div>
  );
}