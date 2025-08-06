import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClientDetails } from "@shared/schema";

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
    setPercentageTotal(total);
  }, [beneficiaryPercentages]);

  const handleBeneficiarySelect = useCallback((newBeneficiary: string, beneficiaryIndex: number) => {
    onBeneficiaryChange(policyId, beneficiaryIndex, newBeneficiary);
  }, [policyId, onBeneficiaryChange]);

  const handlePercentageChange = useCallback((newPercentage: string, beneficiaryIndex: number) => {
    // Format percentage with % suffix
    const formattedPercentage = newPercentage.endsWith('%') ? newPercentage : `${newPercentage}%`;
    onBeneficiaryPercentageChange(policyId, beneficiaryIndex, formattedPercentage);
  }, [policyId, onBeneficiaryPercentageChange]);

  // Only show content for the current row's beneficiary
  const beneficiaryIndex = rowIndex;
  if (beneficiaryIndex >= beneficiaries.length) {
    return <div className="p-2"></div>; // Empty cell for rows beyond beneficiaries count
  }

  const currentBeneficiary = beneficiaries[beneficiaryIndex];
  const currentPercentage = beneficiaryPercentages[beneficiaryIndex] || "0%";
  const isInvalidTotal = Math.abs(percentageTotal - 100) > 0.01;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 flex-row">
        {/* Action Buttons - FIRST in flex order */}
        {rowIndex === 0 && (
          <Button
            size="sm"
            variant="outline"
            className="h-6 w-6 p-0 order-1"
            onClick={() => onAddBeneficiary(policyId)}
            disabled={disabled}
            title="Add beneficiary"
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
        
        {rowIndex > 0 && beneficiaries.length > 1 && (
          <Button
            size="sm"
            variant="outline"
            className="h-6 w-6 p-0 text-red-600 hover:bg-red-50 order-1"
            onClick={() => onRemoveBeneficiary(policyId, beneficiaryIndex)}
            disabled={disabled}
            title="Remove beneficiary"
          >
            <X className="h-3 w-3" />
          </Button>
        )}

        {/* Entity Selector - SECOND in flex order */}
        <div className="flex-1 order-2">
          <Select
            value={currentBeneficiary}
            onValueChange={(value) => handleBeneficiarySelect(value, beneficiaryIndex)}
            disabled={disabled}
          >
            <SelectTrigger className="h-8 text-xs w-full">
              <SelectValue placeholder="Select beneficiary..." />
            </SelectTrigger>
            <SelectContent>
              {entities.map((entity) => (
                <SelectItem key={entity.id} value={entity.entityName}>
                  {entity.entityName} ({entity.entityType})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Percentage Input - THIRD in flex order */}
        <input
          type="text"
          value={currentPercentage}
          onChange={(e) => handlePercentageChange(e.target.value, beneficiaryIndex)}
          className={`w-16 h-8 text-xs border rounded px-1 text-center order-3 ${
            isInvalidTotal ? 'border-red-500 bg-red-50' : 'border-neutral-300'
          }`}
          placeholder="0%"
          disabled={disabled}
        />
      </div>

      {/* Validation Warning - only show on first row */}
      {rowIndex === 0 && isInvalidTotal && (
        <div className="text-xs text-red-600 font-medium">
          Total: {percentageTotal.toFixed(1)}% (must equal 100%)
        </div>
      )}
    </div>
  );
}