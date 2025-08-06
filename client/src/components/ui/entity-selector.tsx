import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { ClientDetails } from "@shared/schema";
import { clientDetailsToEntityOptions, EntityOption } from "@/lib/entity-utils";

interface EntitySelectorProps {
  value?: number;
  onChange: (entityId: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowEmpty?: boolean;
}

export function EntitySelector({
  value,
  onChange,
  placeholder = "Select entity...",
  disabled = false,
  className = "table-input table-dropdown",
  allowEmpty = true
}: EntitySelectorProps) {
  const { data: clientDetails = [], isLoading } = useQuery<ClientDetails[]>({
    queryKey: ["/api/client-details"],
  });

  const entityOptions = clientDetailsToEntityOptions(clientDetails);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === "" || selectedValue === "0") {
      onChange(0); // Use 0 for "no selection"
    } else {
      onChange(parseInt(selectedValue, 10));
    }
  };

  if (isLoading) {
    return (
      <select className={className} disabled>
        <option>Loading entities...</option>
      </select>
    );
  }

  return (
    <select
      value={value || ""}
      onChange={handleChange}
      disabled={disabled}
      className={className}
    >
      {allowEmpty && <option value="">{placeholder}</option>}
      {entityOptions.map(option => (
        <option key={option.id} value={option.id}>
          {option.displayName}
        </option>
      ))}
    </select>
  );
}

interface EntityDisplayProps {
  entityId: number;
  fallbackText?: string;
}

export function EntityDisplay({ entityId, fallbackText = "Unknown Entity" }: EntityDisplayProps) {
  const { data: clientDetails = [] } = useQuery<ClientDetails[]>({
    queryKey: ["/api/client-details"],
  });

  const entity = clientDetails.find(c => c.id === entityId);
  
  if (!entity) {
    return <span className="text-gray-500 italic">{fallbackText}</span>;
  }

  return (
    <span className="flex items-center gap-1">
      <span>{entity.entityName}</span>
      <span className="text-xs bg-gray-100 px-1 py-0.5 rounded text-gray-600">
        {entity.entityType}
      </span>
    </span>
  );
}