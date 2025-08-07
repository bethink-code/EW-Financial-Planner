import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ClientDetails } from '@shared/schema';

interface EntityLifeAssuredSelectorProps {
  policyId: number;
  lifeAssured: string[];
  onLifeAssuredChange: (policyId: number, lifeAssuredIndex: number, newLifeAssured: string) => void;
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
  onLifeAssuredChange,
  rowIndex,
  disabled = false
}: EntityLifeAssuredSelectorProps) {
  
  // Fetch client details for entity dropdown
  const { data: clientDetails = [] } = useQuery<ClientDetails[]>({
    queryKey: ["/api/client-details"]
  });

  const currentLifeAssured = lifeAssured[rowIndex] || "none";

  const handleLifeAssuredChange = (newLifeAssured: string) => {
    // Convert "none" back to empty string for storage
    const valueToStore = newLifeAssured === "none" ? "" : newLifeAssured;
    onLifeAssuredChange(policyId, rowIndex, valueToStore);
  };

  return (
    <div className="flex items-center gap-2">
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
  );
}