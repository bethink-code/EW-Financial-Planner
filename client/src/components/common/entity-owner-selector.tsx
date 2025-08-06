import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClientDetails } from "@shared/schema";

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
    setPercentageTotal(total);
  }, [ownershipPercentages]);

  const handleOwnerSelect = useCallback((newOwner: string, ownerIndex: number) => {
    onOwnerChange(policyId, ownerIndex, newOwner);
  }, [policyId, onOwnerChange]);

  const handlePercentageChange = useCallback((newPercentage: string, ownerIndex: number) => {
    // Format percentage with % suffix
    const formattedPercentage = newPercentage.endsWith('%') ? newPercentage : `${newPercentage}%`;
    onOwnershipPercentageChange(policyId, ownerIndex, formattedPercentage);
  }, [policyId, onOwnershipPercentageChange]);

  // Only show content for the current row's owner
  const ownerIndex = rowIndex;
  if (ownerIndex >= owners.length) {
    return <div className="p-2"></div>; // Empty cell for rows beyond owners count
  }

  const currentOwner = owners[ownerIndex];
  const currentPercentage = ownershipPercentages[ownerIndex] || "0%";
  const isInvalidTotal = Math.abs(percentageTotal - 100) > 0.01;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        {/* Add/Remove Buttons */}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-6 w-6 p-0"
            onClick={() => onAddOwner(policyId)}
            disabled={disabled}
            title="Add owner"
          >
            <Plus className="h-3 w-3" />
          </Button>
          
          {owners.length > 1 && ownerIndex > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
              onClick={() => onRemoveOwner(policyId, ownerIndex)}
              disabled={disabled}
              title="Remove owner"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Entity Selector */}
        <Select
          value={currentOwner}
          onValueChange={(value) => handleOwnerSelect(value, ownerIndex)}
          disabled={disabled}
        >
          <SelectTrigger className="h-8 text-xs flex-1">
            <SelectValue placeholder="Select owner..." />
          </SelectTrigger>
          <SelectContent>
            {entities.map((entity) => (
              <SelectItem key={entity.id} value={entity.entityName}>
                {entity.entityName} ({entity.entityType})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Percentage Input */}
        <input
          type="text"
          value={currentPercentage}
          onChange={(e) => handlePercentageChange(e.target.value, ownerIndex)}
          className={`w-16 h-8 text-xs border rounded px-1 text-center ${
            isInvalidTotal ? 'border-red-500 bg-red-50' : 'border-neutral-300'
          }`}
          placeholder="0%"
          disabled={disabled}
        />
      </div>

      {/* Validation Warning */}
      {rowIndex === 0 && isInvalidTotal && (
        <div className="text-xs text-red-600 font-medium">
          Total: {percentageTotal.toFixed(1)}% (must equal 100%)
        </div>
      )}
    </div>
  );
}