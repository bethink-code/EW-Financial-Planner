import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { ClientDetailsTable } from "@/components/client-details/client-details-table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertClientDetails } from "@shared/schema";

export default function ClientDetailsPage() {
  const addMutation = useMutation({
    mutationFn: async () => {
      const newEntity: InsertClientDetails = {};
      return apiRequest("POST", "/api/client-details", newEntity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client-details"] });
    },
  });

  const handleAddEntity = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  // No CalculatorHeader wrapper — ClientDetailsTable's HybridViewWrapper
  // (card=true) is itself the white form card.
  return (
    <div className="w-full px-6 pb-6">
      <div className="w-[1320px] max-w-full">
        <ClientDetailsTable onAddEntity={handleAddEntity} />
      </div>
    </div>
  );
}
