import { useState, useCallback } from "react";
import { Search } from "lucide-react";
import { AssuranceTable } from "@/components/assurance/enhanced-assurance-table";
import { AssuranceSummary } from "@/components/assurance/enhanced-assurance-summary";

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
                className="w-80 pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-700">View:</span>
            <div className="flex items-center bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => handleViewModeChange("table")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === "table"
                    ? "bg-white text-[#016991] shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Table
              </button>
              <button
                onClick={() => handleViewModeChange("hybrid")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === "hybrid"
                    ? "bg-white text-[#016991] shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Hybrid
              </button>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <AssuranceSummary searchTerm={searchTerm} />

        {/* Main Table */}
        <AssuranceTable searchTerm={searchTerm} />
      </div>
    </div>
  );
}