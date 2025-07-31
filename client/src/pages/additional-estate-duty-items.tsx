import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdditionalEstateDutyItemsTable from "../components/additional-estate-duty-items/additional-estate-duty-items-table";
import { AdditionalEstateDutyItemsSummary } from "@/components/additional-estate-duty-items/additional-estate-duty-items-summary";
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
      const newItem = {}; // Send empty object to use database defaults
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
    <div className="">
      <div className="w-full px-6 py-6">
        {/* Combined Header, Summary and Table */}
        <CalculatorHeader
          title="Additional Estate Duty Items"
          onAddItem={handleAddItem}
          addButtonText="Add Item"
          isAddingItem={addMutation.isPending}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          className="mb-6"
        >
          {/* Summary with max width constraint */}
          <div className="max-w-6xl">
            <AdditionalEstateDutyItemsSummary />
          </div>
          
          {/* Table with full width and margin */}
          <div className="table-container-wrapper">
            <AdditionalEstateDutyItemsTable />
          </div>
        </CalculatorHeader>
      </div>
    </div>
  );
}