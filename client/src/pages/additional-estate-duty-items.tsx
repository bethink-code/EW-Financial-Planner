import { useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdditionalEstateDutyItemsTable from "../components/additional-estate-duty-items/additional-estate-duty-items-table";
import { AdditionalEstateDutyItemsSummary } from "@/components/additional-estate-duty-items/additional-estate-duty-items-summary";
import { CalculatorHeader } from "@/components/ui/calculator-header";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdditionalEstateDutyItems() {
  // Fetch items for count
  const { data: items = [] } = useQuery({
    queryKey: ["/api/additional-estate-duty-items"],
    queryFn: async () => {
      const response = await fetch("/api/additional-estate-duty-items");
      if (!response.ok) throw new Error('Failed to fetch additional estate duty items');
      return response.json();
    }
  });

  // Add new item mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      const newItem = {}; // Send empty object to use database defaults
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
        <CalculatorHeader>
          <AdditionalEstateDutyItemsSummary />
          <AdditionalEstateDutyItemsTable />
        </CalculatorHeader>
      </div>
    </div>
  );
}
