import { ClientDetails } from "@shared/schema";

export interface EntityOption {
  id: number;
  name: string;
  type: string;
  displayName: string;
}

/**
 * Convert ClientDetails to EntityOption for selectors
 */
export function clientDetailsToEntityOptions(clientDetails: ClientDetails[]): EntityOption[] {
  return clientDetails.map(client => ({
    id: client.id,
    name: client.entityName,
    type: client.entityType,
    displayName: `${client.entityName} (${client.entityType})`
  }));
}

/**
 * Find entity by name (for migration from text to IDs)
 */
export function findEntityByName(clientDetails: ClientDetails[], name: string): ClientDetails | null {
  const trimmedName = name.trim().toLowerCase();
  if (!trimmedName || trimmedName === "" || trimmedName === "enter details ...") {
    return null;
  }
  
  return clientDetails.find(client => 
    client.entityName.toLowerCase() === trimmedName
  ) || null;
}

/**
 * Convert entity IDs to display names
 */
export function entityIdsToNames(clientDetails: ClientDetails[], entityIds: number[]): string[] {
  return entityIds.map(id => {
    const entity = clientDetails.find(c => c.id === id);
    return entity ? entity.entityName : `Entity #${id}`;
  });
}

/**
 * Convert entity names to IDs (for migration)
 */
export function entityNamesToIds(clientDetails: ClientDetails[], names: string[]): number[] {
  return names.map(name => {
    const entity = findEntityByName(clientDetails, name);
    return entity ? entity.id : -1; // -1 indicates unmatched
  }).filter(id => id !== -1); // Remove unmatched for now
}

/**
 * Get entity display name with type badge
 */
export function getEntityDisplayName(clientDetails: ClientDetails[], entityId: number): string {
  const entity = clientDetails.find(c => c.id === entityId);
  return entity ? `${entity.entityName} (${entity.entityType})` : `Entity #${entityId}`;
}

/**
 * Validate entity exists
 */
export function validateEntityExists(clientDetails: ClientDetails[], entityId: number): boolean {
  return clientDetails.some(c => c.id === entityId);
}

/**
 * Get the Primary entity for use as default owner/beneficiary
 */
export function getPrimaryEntity(clientDetails: ClientDetails[]): ClientDetails | null {
  return clientDetails.find(c => c.entityType === "Primary entity") || null;
}

/**
 * Get default owner array with Primary entity
 */
export function getDefaultOwners(clientDetails: ClientDetails[]): string[] {
  const primary = getPrimaryEntity(clientDetails);
  return primary ? [primary.entityName] : [""];
}

/**
 * Get default beneficiary array with Primary entity
 */
export function getDefaultBeneficiaries(clientDetails: ClientDetails[]): string[] {
  const primary = getPrimaryEntity(clientDetails);
  return primary ? [primary.entityName] : [""];
}

/**
 * Get default ownership percentages (100% for single owner)
 */
export function getDefaultOwnershipPercentages(): string[] {
  return ["100%"];
}

/**
 * Get default beneficiary percentages (100% for single beneficiary)
 */
export function getDefaultBeneficiaryPercentages(): string[] {
  return ["100%"];
}