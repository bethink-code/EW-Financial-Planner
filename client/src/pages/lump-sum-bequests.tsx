import { useState, useCallback } from "react";
import { Search } from "lucide-react";
import { LumpSumTable } from "@/components/lump-sum-bequests/lump-sum-table";
import { LumpSumSummary } from "@/components/lump-sum-bequests/lump-sum-summary";

export default function LumpSumBequests() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Lump Sum Needs and Cash Bequests</h1>
          <p className="text-neutral-600">Manage and track lump sum bequests and cash distributions</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search bequests..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Summary Section */}
        <LumpSumSummary searchTerm={searchTerm} />

        {/* Main Table */}
        <LumpSumTable searchTerm={searchTerm} />
      </div>
    </div>
  );
}