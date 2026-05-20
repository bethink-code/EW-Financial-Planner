import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import AdditionalEstateDutyItemsTable from "../components/additional-estate-duty-items/additional-estate-duty-items-table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertAdditionalEstateDutyItems } from "@shared/schema";

export default function AdditionalEstateDutyItems() {
  const addMutation = useMutation({
    mutationFn: async () => {
      const newItem: InsertAdditionalEstateDutyItems = {};
      return apiRequest("POST", "/api/additional-estate-duty-items", newItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/additional-estate-duty-items"] });
    },
  });

  const handleAddItem = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  return (
    <div className="w-full px-6 pb-6">
      <div className="w-[1320px] max-w-full">
        <AdditionalEstateDutyItemsTable onAddItem={handleAddItem} />
      </div>
    </div>
  );
}
