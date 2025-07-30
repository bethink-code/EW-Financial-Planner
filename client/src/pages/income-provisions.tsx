import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import IncomeProvisionsTable from "../components/income-provisions/income-provisions-table-new";
import { IncomeProvisionsSummary } from "@/components/income-provisions/income-provisions-summary";
import { CalculatorHeader } from "@/components/ui/calculator-header";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertIncomeProvisions } from "@shared/schema";

type ViewMode = "table" | "hybrid";

export default function IncomeProvisions() {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch provisions for count
  const { data: provisions = [] } = useQuery({
    queryKey: ["/api/income-provisions"],  
    queryFn: async () => {
      const response = await fetch("/api/income-provisions");
      if (!response.ok) throw new Error('Failed to fetch income provisions');
      return response.json();
    }
  });

  // Add new provision mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      const newProvision = {}; // Send empty object to use database defaults
      return apiRequest("POST", "/api/income-provisions", newProvision);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/income-provisions"] });
    },
  });

  const handleViewModeChange = useCallback((newMode: ViewMode) => {
    setViewMode(newMode);
  }, []);

  const handleAddProvision = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  return (
    <div className="">
      <div className="w-full px-6 py-6">
        {/* Combined Header, Summary and Table */}
        <CalculatorHeader
          title="Income Provisions"
          itemCount={provisions.length}
          itemLabel="provisions"
          onAddItem={handleAddProvision}
          addButtonText="Add Provision"
          isAddingItem={addMutation.isPending}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          className="mb-6"
        >
          {/* Summary with max width constraint */}
          <div className="max-w-6xl">
            <IncomeProvisionsSummary searchTerm={searchTerm} />
          </div>
          
          {/* Table with full width */}
          <div className="mt-6">
            <IncomeProvisionsTable viewMode={viewMode} searchTerm={searchTerm} />
          </div>
        </CalculatorHeader>
      </div>
    </div>
  );
}