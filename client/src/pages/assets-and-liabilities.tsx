import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AssetsAndLiabilitiesTable from "../components/assets-and-liabilities/assets-and-liabilities-table";
import { AssetsAndLiabilitiesSummary } from "@/components/assets-and-liabilities/assets-and-liabilities-summary";
import { CalculatorHeader } from "@/components/ui/calculator-header";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertAssetAndLiability } from "@shared/schema";

type ViewMode = "table" | "hybrid";

export default function AssetsAndLiabilities() {
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Fetch items for count
  const { data: items = [] } = useQuery({
    queryKey: ["/api/assets-and-liabilities"],  
    queryFn: async () => {
      const response = await fetch("/api/assets-and-liabilities");
      if (!response.ok) throw new Error('Failed to fetch assets and liabilities');
      return response.json();
    }
  });

  // Add new item mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      const newItem: InsertAssetAndLiability = {
        categoryAndDescription: "Enter here ...",
        marketValue: "0",
        baseCost: "0",
        include: true,
        excludedFromEstateDuty: false
      };
      return apiRequest("POST", "/api/assets-and-liabilities", newItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets-and-liabilities"] });
    },
  });

  const handleViewModeChange = useCallback((newMode: ViewMode) => {
    setViewMode(newMode);
  }, []);

  const handleAddItem = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  return (
    <div className="bg-neutral-50">
      <div className="w-full px-6 py-6">
        {/* Combined Header and Summary */}
        <div className="mb-6">
          <CalculatorHeader
            title="Assets and Liabilities"
            itemCount={items.length}
            itemLabel="items"
            onAddItem={handleAddItem}
            addButtonText="Add Item"
            isAddingItem={addMutation.isPending}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          >
            <AssetsAndLiabilitiesSummary />
          </CalculatorHeader>
        </div>
        
        <AssetsAndLiabilitiesTable />
      </div>
    </div>
  );
}