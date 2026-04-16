import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Minus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ClientDetails } from '@shared/schema';

interface AssuranceOwnerSelectorProps {
  policyId: number;
  owners: string[];
  lifeAssured: string[];
  deathBenefits: string[];
  onOwnerChange: (policyId: number, ownerIndex: number, newOwner: string) => void;
  onLifeAssuredChange: (policyId: number, lifeAssuredIndex: number, newLifeAssured: string) => void;
  onDeathBenefitChange: (policyId: number, deathBenefitIndex: number, newDeathBenefit: string) => void;
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
  deathBenefits,
  onOwnerChange,
  onLifeAssuredChange,
  onDeathBenefitChange,
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

  const currentOwner = owners[rowIndex] || "none";
  const currentLifeAssured = lifeAssured[rowIndex] || "none";
  const currentDeathBenefit = deathBenefits[rowIndex] || "R 0";

  const handleOwnerChange = (newOwner: string) => {
    const valueToStore = newOwner === "none" ? "" : newOwner;
    onOwnerChange(policyId, rowIndex, valueToStore);
  };

  const handleLifeAssuredChange = (newLifeAssured: string) => {
    const valueToStore = newLifeAssured === "none" ? "" : newLifeAssured;
    onLifeAssuredChange(policyId, rowIndex, valueToStore);
  };

  const handleDeathBenefitChange = (e: React.FocusEvent<HTMLInputElement>) => {
    let value = e.target.value.trim();
    // Clean the input to only numbers
    value = value.replace(/[^\d.-]/g, '');
    
    if (value === '' || value === '0') {
      onDeathBenefitChange(policyId, rowIndex, 'R 0');
      e.target.value = 'R 0';
      return;
    }
    
    if (!isNaN(parseFloat(value))) {
      const numValue = parseFloat(value);
      const formattedValue = `R ${numValue.toLocaleString()}`;
      onDeathBenefitChange(policyId, rowIndex, formattedValue);
      e.target.value = formattedValue;
    } else {
      onDeathBenefitChange(policyId, rowIndex, 'R 0');
      e.target.value = 'R 0';
    }
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
    <div className="flex items-center gap-3">
      {/* Action Buttons - At front of row per design system */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {showAddButton && (
          <button
            type="button"
            onClick={handleAddOwner}
            className="w-6 h-6 flex items-center justify-center text-green-600 hover:text-green-800 hover:bg-green-50 rounded border border-green-300 hover:border-green-400"
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
            className="w-6 h-6 flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 rounded border border-red-300 hover:border-red-400"
            disabled={disabled}
            title="Remove owner"
          >
            <Minus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Owner Dropdown */}
      <div className="min-w-0">
        <Select
          value={currentOwner}
          onValueChange={handleOwnerChange}
          disabled={disabled}
        >
          <SelectTrigger className="table-input" style={{ width: 'fit-content', minWidth: '180px' }}>
            <SelectValue placeholder="Select owner..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Select owner...</SelectItem>
            {clientDetails.filter(client => client.entityName && client.entityName.trim() !== "").map((client) => (
              <SelectItem key={client.id} value={client.entityName}>
                {client.entityName}
                {client.entityType === "Primary entity" && " (Primary entity)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Life Assured Dropdown */}
      <div className="min-w-0">
        <Select
          value={currentLifeAssured}
          onValueChange={handleLifeAssuredChange}
          disabled={disabled}
        >
          <SelectTrigger className="table-input" style={{ width: 'fit-content', minWidth: '160px' }}>
            <SelectValue placeholder="Select life assured..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Select life assured...</SelectItem>
            {clientDetails.filter(client => client.entityName && client.entityName.trim() !== "").map((client) => (
              <SelectItem key={client.id} value={client.entityName}>
                {client.entityName}
                {client.entityType === "Primary entity" && " (Primary entity)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Death Benefit Amount */}
      <div className="min-w-0">
        <input
          type="text"
          defaultValue={currentDeathBenefit}
          className="table-input text-right"
          style={{ width: 'fit-content', minWidth: '120px' }}
          placeholder="R 0"
          onBlur={handleDeathBenefitChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}