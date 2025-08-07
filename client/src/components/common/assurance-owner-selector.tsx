import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Minus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ClientDetails } from '@shared/schema';

interface AssuranceOwnerSelectorProps {
  policyId: number;
  owners: string[];
  lifeAssured: string[];
  ownershipPercentages: string[];
  onOwnerChange: (policyId: number, ownerIndex: number, newOwner: string) => void;
  onLifeAssuredChange: (policyId: number, lifeAssuredIndex: number, newLifeAssured: string) => void;
  onOwnershipPercentageChange: (policyId: number, ownerIndex: number, newPercentage: string) => void;
  onAddOwner: (policyId: number) => void;
  onRemoveOwner: (policyId: number, ownerIndex: number) => void;
  rowIndex: number;
  disabled?: boolean;
}

/**
 * AssuranceOwnerSelector - Special owner selector for Assurance that includes Life Assured
 * Each owner row includes: Owner + Life Assured + Ownership Percentage + Actions
 */
export default function AssuranceOwnerSelector({
  policyId,
  owners,
  lifeAssured,
  ownershipPercentages,
  onOwnerChange,
  onLifeAssuredChange,
  onOwnershipPercentageChange,
  onAddOwner,
  onRemoveOwner,
  rowIndex,
  disabled = false
}: AssuranceOwnerSelectorProps) {
  
  // Fetch client details for entity dropdowns
  const { data: clientDetails = [] } = useQuery<ClientDetails[]>({
    queryKey: ["/api/client-details"]
  });

  const currentOwner = owners[rowIndex] || "";
  const currentLifeAssured = lifeAssured[rowIndex] || "";
  const currentPercentage = ownershipPercentages[rowIndex] || "0%";

  const handleOwnerChange = (newOwner: string) => {
    onOwnerChange(policyId, rowIndex, newOwner);
  };

  const handleLifeAssuredChange = (newLifeAssured: string) => {
    onLifeAssuredChange(policyId, rowIndex, newLifeAssured);
  };

  const handlePercentageChange = (e: React.FocusEvent<HTMLInputElement>) => {
    let value = e.target.value.trim();
    if (value && !value.includes('%')) {
      value = value + '%';
    }
    onOwnershipPercentageChange(policyId, rowIndex, value);
  };

  const handleAddOwner = () => {
    onAddOwner(policyId);
  };

  const handleRemoveOwner = () => {
    if (owners.length > 1 && rowIndex > 0) { // Protect first owner
      onRemoveOwner(policyId, rowIndex);
    }
  };

  const showAddButton = rowIndex === owners.length - 1; // Only show on last row
  const showRemoveButton = owners.length > 1 && rowIndex > 0; // Don't show on first row

  return (
    <div className="flex items-center gap-2">
      {/* Owner Dropdown */}
      <div className="flex-1">
        <Select
          value={currentOwner}
          onValueChange={handleOwnerChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-full table-input">
            <SelectValue placeholder="Select owner..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Select owner...</SelectItem>
            {clientDetails.map((client) => (
              <SelectItem key={client.id} value={client.entityName}>
                {client.entityName}
                {client.entityType === "Primary entity" && " (Primary entity)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Life Assured Dropdown */}
      <div className="flex-1">
        <Select
          value={currentLifeAssured}
          onValueChange={handleLifeAssuredChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-full table-input">
            <SelectValue placeholder="Select life assured..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Select life assured...</SelectItem>
            {clientDetails.map((client) => (
              <SelectItem key={client.id} value={client.entityName}>
                {client.entityName}
                {client.entityType === "Primary entity" && " (Primary entity)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Ownership Percentage */}
      <div className="w-20">
        <input
          type="text"
          defaultValue={currentPercentage}
          className="w-full table-input text-right"
          placeholder="0%"
          onBlur={handlePercentageChange}
          disabled={disabled}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        {showAddButton && (
          <button
            type="button"
            onClick={handleAddOwner}
            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
            disabled={disabled}
            title="Add owner"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
        {showRemoveButton && (
          <button
            type="button"
            onClick={handleRemoveOwner}
            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
            disabled={disabled}
            title="Remove owner"
          >
            <Minus className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}