import { useState, useCallback } from "react";
import { Search } from "lucide-react";
import { AssuranceTable } from "@/components/assurance/working-assurance-table";
import { GraphTableSwitcher } from "@/components/ui/switcher";
import { AssuranceSummary } from "@/components/assurance/simple-assurance-summary";

type ViewMode = "table" | "hybrid";

export default function Assurance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleViewModeChange = useCallback((newMode: ViewMode) => {
    setViewMode(newMode);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Assurance</h1>
          <p className="text-neutral-600">Manage life assurance policies and death benefits</p>
        </div>

        {/* Controls Section */}
        <div className="mb-6 flex items-center justify-between">
          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search policies..."
                className="w-80 pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-700">View:</span>
            <GraphTableSwitcher
              value={viewMode === "table" ? "table" : "graph"}
              onChange={(value) => handleViewModeChange(value === "table" ? "table" : "hybrid")}
              size="md"
            />
          </div>
        </div>

        {/* Summary Section */}
        <div className="mb-8">
          <AssuranceSummary />
        </div>

        {/* Main Table */}
        <AssuranceTable searchTerm={searchTerm} />
      </div>
    </div>
  );
}