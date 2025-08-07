import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ClientDetails } from '@shared/schema';

interface EntityLifeAssuredSelectorProps {
  policyId: number;
  lifeAssured: string[];
  deathBenefits: string[];
  onLifeAssuredChange: (policyId: number, lifeAssuredIndex: number, newLifeAssured: string) => void;
  onDeathBenefitChange: (policyId: number, deathBenefitIndex: number, newDeathBenefit: string) => void;
  rowIndex: number;
  disabled?: boolean;
}

/**
 * EntityLifeAssuredSelector - Dropdown for selecting life assured entities
 * Specifically for Assurance policies where Life Assured is paired with Owner
 */
export default function EntityLifeAssuredSelector({
  policyId,
  lifeAssured,
  deathBenefits,
  onLifeAssuredChange,
  onDeathBenefitChange,
  rowIndex,
  disabled = false
}: EntityLifeAssuredSelectorProps) {
  
  // Fetch client details for entity dropdown
  const { data: clientDetails = [] } = useQuery<ClientDetails[]>({
    queryKey: ["/api/client-details"]
  });

  const currentLifeAssured = lifeAssured[rowIndex] || "none";
  const currentDeathBenefit = deathBenefits[rowIndex] || "R 0";

  const handleLifeAssuredChange = (newLifeAssured: string) => {
    // Convert "none" back to empty string for storage
    const valueToStore = newLifeAssured === "none" ? "" : newLifeAssured;
    onLifeAssuredChange(policyId, rowIndex, valueToStore);
  };

  const handleDeathBenefitChange = (e: React.FocusEvent<HTMLInputElement>) => {
    let value = e.target.value.trim();
    // Clean the input to only numbers
    value = value.replace(/[^\d.-]/g, '');
    
    if (value === '' || value === '0') {
      onDeathBenefitChange(policyId, rowIndex, 'R 0');
      return;
    }
    
    if (!isNaN(parseFloat(value))) {
      const numValue = parseFloat(value);
      const formattedValue = `R ${numValue.toLocaleString()}`;
      onDeathBenefitChange(policyId, rowIndex, formattedValue);
    } else {
      onDeathBenefitChange(policyId, rowIndex, 'R 0');
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Life Assured Dropdown - wider to accommodate longer names */}
      <div className="flex-1 min-w-[200px]">
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
      
      {/* Death Benefit Amount */}
      <div className="w-32 relative">
        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R</span>
        <input
          type="text"
          defaultValue={currentDeathBenefit.replace('R ', '')}
          className="w-full table-input text-right pl-6"
          placeholder="0"
          onBlur={handleDeathBenefitChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}