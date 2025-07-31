import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import ResidueTable from "../components/residue/residue-table";
import { CalculatorHeader } from "@/components/ui/calculator-header";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertResidue } from "@shared/schema";

type ViewMode = "table" | "hybrid";

export default function Residue() {
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const handleViewModeChange = useCallback((newMode: ViewMode) => {
    setViewMode(newMode);
  }, []);

  return (
    <div className="">
      <div className="w-full px-6 py-6">
        {/* Header and Table without Summary */}
        <CalculatorHeader
          title="Residue"
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          className="mb-6"
        >          
          {/* Table with content-fitted width */}
          <div className="w-fit">
            <ResidueTable viewMode={viewMode} />
          </div>
        </CalculatorHeader>
      </div>
    </div>
  );
}