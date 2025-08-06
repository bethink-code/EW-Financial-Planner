// Utility functions for dynamic entity column management in assets and liabilities tables

export interface ClientEntity {
  id: number;
  entityName: string;
  entityType: string;
}

// Parse JSON string to entity ownership object
export function parseEntityOwnership(entityOwnership: string): Record<string, string> {
  try {
    return JSON.parse(entityOwnership || '{}');
  } catch (error) {
    return {};
  }
}

// Convert entity ownership object back to JSON string
export function stringifyEntityOwnership(ownership: Record<string, string>): string {
  return JSON.stringify(ownership);
}

// Get entity name with type suffix for display (e.g., "Beryl Shuttleworth (Spouse)")
export function getEntityDisplayName(entity: ClientEntity): string {
  if (entity.entityType === 'Primary entity') {
    return entity.entityName;
  }
  return `${entity.entityName} (${entity.entityType})`;
}

// Initialize entity ownership object with default 0% for all entities
export function initializeEntityOwnership(entities: ClientEntity[]): Record<string, string> {
  const ownership: Record<string, string> = {};
  entities.forEach(entity => {
    ownership[getEntityDisplayName(entity)] = '0%';
  });
  return ownership;
}

// Get ownership value for a specific entity, defaulting to '0%' if not found
export function getEntityOwnership(
  entityOwnership: string | Record<string, string>, 
  entityDisplayName: string
): string {
  const ownership = typeof entityOwnership === 'string' 
    ? parseEntityOwnership(entityOwnership) 
    : entityOwnership;
  return ownership[entityDisplayName] || '0%';
}

// Set ownership value for a specific entity
export function setEntityOwnership(
  currentOwnership: string | Record<string, string>,
  entityDisplayName: string,
  value: string
): string {
  const ownership = typeof currentOwnership === 'string' 
    ? parseEntityOwnership(currentOwnership) 
    : currentOwnership;
  ownership[entityDisplayName] = value;
  return stringifyEntityOwnership(ownership);
}

// Validate that entity ownership percentages are valid
export function validateEntityOwnership(ownership: Record<string, string>): {
  isValid: boolean;
  total: number;
  errors: string[];
} {
  const errors: string[] = [];
  let total = 0;
  
  Object.entries(ownership).forEach(([entity, percentage]) => {
    const numericValue = parseFloat(percentage.replace('%', ''));
    if (isNaN(numericValue)) {
      errors.push(`Invalid percentage for ${entity}: ${percentage}`);
    } else {
      total += numericValue;
    }
  });
  
  const isValid = errors.length === 0 && Math.abs(total - 100) < 0.01;
  
  if (errors.length === 0 && Math.abs(total - 100) >= 0.01) {
    errors.push(`Total ownership must equal 100%, currently ${total.toFixed(1)}%`);
  }
  
  return { isValid, total, errors };
}