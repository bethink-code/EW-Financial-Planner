import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdditionalEstateDutyItemsTable from "../components/additional-estate-duty-items/additional-estate-duty-items-table";
import { CalculatorHeader } from "@/components/ui/calculator-header";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertAdditionalEstateDutyItem } from "@shared/schema";

type ViewMode = "table" | "hybrid";

export default function AdditionalEstateDutyItems() {
  const [viewMode, setViewMode] = useState<ViewMode>("table");

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
      const newItem: InsertAdditionalEstateDutyItem = {
        description: "Enter here ...",
        amount: "0",
        deduction: false,
        jointEstate: false
      };
      return apiRequest("POST", "/api/additional-estate-duty-items", newItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/additional-estate-duty-items"] });
    },
  });

  const handleViewModeChange = useCallback((newMode: ViewMode) => {
    setViewMode(newMode);
  }, []);

  const handleAddItem = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Standardized Calculator Header */}
        <CalculatorHeader
          title="Additional Estate Duty Items"
          itemCount={items.length}
          itemLabel="items"
          onAddItem={handleAddItem}
          addButtonText="Add Item"
          isAddingItem={addMutation.isPending}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />
        
        <AdditionalEstateDutyItemsTable />
      </div>
    </div>
  );
}