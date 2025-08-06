import { ClientDetails } from "@shared/schema";

/**
 * Entity resolution utilities for backend
 */

export interface EntityResolution {
  entityIds: number[];
  entityNames: string[];
}

/**
 * Resolve mixed entity data (IDs or names) to both IDs and names
 * Supports backward compatibility during migration
 */
export async function resolveEntities(
  entities: (string | number)[],
  clientDetails: ClientDetails[]
): Promise<EntityResolution> {
  const entityIds: number[] = [];
  const entityNames: string[] = [];

  for (const entity of entities) {
    if (typeof entity === 'number') {
      // It's an entity ID - resolve to name
      const clientDetail = clientDetails.find(c => c.id === entity);
      if (clientDetail) {
        entityIds.push(entity);
        entityNames.push(clientDetail.entityName);
      } else {
        // Invalid entity ID - skip or handle as needed
        console.warn(`Invalid entity ID: ${entity}`);
      }
    } else if (typeof entity === 'string') {
      // It's a name - try to resolve to ID
      const trimmedName = entity.trim();
      if (trimmedName && trimmedName !== "" && trimmedName !== "enter details ...") {
        const clientDetail = clientDetails.find(c => 
          c.entityName.toLowerCase() === trimmedName.toLowerCase()
        );
        
        if (clientDetail) {
          // Found matching entity
          entityIds.push(clientDetail.id);
          entityNames.push(clientDetail.entityName);
        } else {
          // No matching entity found - keep as text for now
          entityIds.push(-1); // Use -1 for unresolved names
          entityNames.push(trimmedName);
        }
      } else {
        // Empty or placeholder string
        entityIds.push(0);
        entityNames.push("");
      }
    }
  }

  return { entityIds, entityNames };
}

/**
 * Convert entity IDs back to names for API responses
 */
export function entityIdsToNames(entityIds: number[], clientDetails: ClientDetails[]): string[] {
  return entityIds.map(id => {
    if (id === 0 || id === -1) return "";
    const entity = clientDetails.find(c => c.id === id);
    return entity ? entity.entityName : `Entity #${id}`;
  });
}

/**
 * Convert entity names to IDs for storage
 */
export function entityNamesToIds(names: string[], clientDetails: ClientDetails[]): number[] {
  return names.map(name => {
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName === "" || trimmedName === "enter details ...") {
      return 0;
    }
    
    const entity = clientDetails.find(c => 
      c.entityName.toLowerCase() === trimmedName.toLowerCase()
    );
    return entity ? entity.id : -1; // -1 for unresolved
  });
}