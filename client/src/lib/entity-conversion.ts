import { useQuery } from "@tanstack/react-query";
import { ClientDetails } from "@shared/schema";
import { findEntityByName, entityIdsToNames as utilEntityIdsToNames } from "./entity-utils";

/**
 * React hook for entity conversion between IDs and names
 */
export function useEntityConversion() {
  const { data: clientDetails = [] } = useQuery<ClientDetails[]>({
    queryKey: ["/api/client-details"],
  });

  const namesToIds = (names: string[]): number[] => {
    return names.map(name => {
      const entity = findEntityByName(clientDetails, name);
      return entity ? entity.id : 0; // 0 for unresolved
    });
  };

  const idsToNames = (ids: number[]): string[] => {
    return utilEntityIdsToNames(clientDetails, ids);
  };

  const hasValidEntities = (names: string[]): boolean => {
    return names.some(name => {
      const trimmed = name.trim().toLowerCase();
      return trimmed && trimmed !== "" && trimmed !== "enter details ..." && 
             clientDetails.some(c => c.entityName.toLowerCase() === trimmed);
    });
  };

  return {
    clientDetails,
    namesToIds,
    idsToNames,
    hasValidEntities,
    isReady: clientDetails.length > 0
  };
}