import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { ClientDetailsTable } from "@/components/client-details/client-details-table";
import { CalculatorHeader } from "@/components/ui/calculator-header";
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

  return (
    <div className="">
      <div className="w-full px-6 py-6">
        <div className="w-[1320px]">
          <CalculatorHeader
            title="Client Details"
            onAddItem={handleAddEntity}
            addButtonText="Add Entity"
            isAddingItem={addMutation.isPending}
            className="mb-6"
          >
            <div className="table-container-wrapper">
              <ClientDetailsTable onAddEntity={handleAddEntity} />
            </div>
          </CalculatorHeader>
        </div>
      </div>
    </div>
  );
}
