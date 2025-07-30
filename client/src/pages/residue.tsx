import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import ResidueTable from "../components/residue/residue-table";
import { ResidueSummary } from "@/components/residue/residue-summary";
import { CalculatorHeader } from "@/components/ui/calculator-header";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertResidue } from "@shared/schema";

type ViewMode = "table" | "hybrid";

export default function Residue() {
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Fetch residue entries for count
  const { data: residues = [] } = useQuery({
    queryKey: ["/api/residue"],  
    queryFn: async () => {
      const response = await fetch("/api/residue");
      if (!response.ok) throw new Error('Failed to fetch residue entries');
      return response.json();
    }
  });

  // Add new residue mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      const newResidue: InsertResidue = {
        entity: "Donald Edwards",
        percentage: "0%",
        isCharityRow: false
      };
      return apiRequest("POST", "/api/residue", newResidue);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/residue"] });
    },
  });

  const handleViewModeChange = useCallback((newMode: ViewMode) => {
    setViewMode(newMode);
  }, []);

  const handleAddResidue = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  return (
    <div className="">
      <div className="w-full px-6 py-6">
        {/* Combined Header, Summary and Table */}
        <CalculatorHeader
          title="Residue"
          itemCount={residues.length}
          itemLabel="entries"
          onAddItem={handleAddResidue}
          addButtonText="Add Entry"
          isAddingItem={addMutation.isPending}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          className="mb-6"
        >
          {/* Summary with max width constraint */}
          <div className="max-w-6xl">
            <ResidueSummary />
          </div>
          
          {/* Table with full width and margin */}
          <div className="table-container-wrapper">
            <ResidueTable />
          </div>
        </CalculatorHeader>
      </div>
    </div>
  );
}