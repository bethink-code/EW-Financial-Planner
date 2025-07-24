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
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Combined Header and Summary */}
        <div className="mb-6">
          <CalculatorHeader
            title="Residue"
            itemCount={residues.length}
            itemLabel="entries"
            onAddItem={handleAddResidue}
            addButtonText="Add Entry"
            isAddingItem={addMutation.isPending}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          >
            <ResidueSummary />
          </CalculatorHeader>
        </div>
        
        <ResidueTable />
      </div>
    </div>
  );
}