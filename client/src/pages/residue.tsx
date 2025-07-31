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

  // Fetch residue items for count (though we only have 1)
  const { data: residueItems = [] } = useQuery({
    queryKey: ["/api/residue"],  
    queryFn: async () => {
      const response = await fetch("/api/residue");
      if (!response.ok) throw new Error('Failed to fetch residue');
      return response.json();
    }
  });

  const handleViewModeChange = useCallback((newMode: ViewMode) => {
    setViewMode(newMode);
  }, []);

  return (
    <div className="">
      <div className="w-full px-6 py-6">
        {/* Combined Header, Summary and Table */}
        <CalculatorHeader
          title="Residue"
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
            <ResidueTable viewMode={viewMode} />
          </div>
        </CalculatorHeader>
      </div>
    </div>
  );
}