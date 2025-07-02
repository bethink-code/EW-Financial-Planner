import { Search, Table, Layout, List, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ColumnVisibility {
  overview: boolean;
  unapprovedLifeCover: boolean;
  monthlyDeathBenefit: boolean;
  fundValueBeneficiaries: boolean;
}

interface NewTableControlsProps {
  viewMode: "grouped" | "cards" | "detailed";
  onViewModeChange: (mode: "grouped" | "cards" | "detailed") => void;
  tableMode: "inputs" | "flows";
  onTableModeChange: (mode: "inputs" | "flows") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  columnVisibility: ColumnVisibility;
  onToggleColumnGroup: (group: keyof ColumnVisibility) => void;
  fundsCount: number;
}

export function NewTableControls({
  viewMode,
  onViewModeChange,
  tableMode,
  onTableModeChange,
  searchQuery,
  onSearchChange,
  columnVisibility,
  onToggleColumnGroup,
  fundsCount,
}: NewTableControlsProps) {
  return (
    <div className="bg-white rounded shadow-sm border border-neutral-200 p-3 mb-4">
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
        {/* Left section: Title and count */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-neutral-900">Retirement Funds</h1>
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
            {fundsCount} funds
          </span>
        </div>

        {/* Middle section: Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
            <Input
              type="text"
              placeholder="Search funds..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-8 text-sm"
            />
          </div>
        </div>

        {/* Right section: View modes and column toggles */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* View Mode Buttons */}
          <div className="flex border border-neutral-200 rounded overflow-hidden">
            <Button
              variant={viewMode === "grouped" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grouped")}
              className="rounded-none border-0 h-8 px-3"
            >
              <Table size={14} className="mr-1" />
              Table
            </Button>
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("cards")}
              className="rounded-none border-0 border-l border-neutral-200 h-8 px-3"
            >
              <Layout size={14} className="mr-1" />
              Cards
            </Button>
            <Button
              variant={viewMode === "detailed" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("detailed")}
              className="rounded-none border-0 border-l border-neutral-200 h-8 px-3"
            >
              <List size={14} className="mr-1" />
              Hybrid
            </Button>
          </div>

          {/* Table Mode Toggle - only show for grouped view */}
          {viewMode === "grouped" && (
            <div className="flex border border-neutral-200 rounded overflow-hidden">
              <Button
                variant={tableMode === "inputs" ? "default" : "ghost"}
                size="sm"
                onClick={() => onTableModeChange("inputs")}
                className="rounded-none border-0 h-8 px-3 text-xs"
              >
                Inputs
              </Button>
              <Button
                variant={tableMode === "flows" ? "default" : "ghost"}
                size="sm"
                onClick={() => onTableModeChange("flows")}
                className="rounded-none border-0 border-l border-neutral-200 h-8 px-3 text-xs"
              >
                Flows
              </Button>
            </div>
          )}

          {/* Column Visibility Toggles - only show for grouped view */}
          {viewMode === "grouped" && (
            <div className="flex gap-1 border-l border-neutral-200 pl-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleColumnGroup("overview")}
                className={`h-8 px-2 text-xs ${
                  columnVisibility.overview
                    ? "text-teal-700 bg-teal-50"
                    : "text-neutral-500"
                }`}
              >
                {columnVisibility.overview ? <Eye size={12} /> : <EyeOff size={12} />}
                Overview
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleColumnGroup("unapprovedLifeCover")}
                className={`h-8 px-2 text-xs ${
                  columnVisibility.unapprovedLifeCover
                    ? "text-teal-600 bg-teal-100"
                    : "text-neutral-500"
                }`}
              >
                {columnVisibility.unapprovedLifeCover ? <Eye size={12} /> : <EyeOff size={12} />}
                Life Cover
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleColumnGroup("monthlyDeathBenefit")}
                className={`h-8 px-2 text-xs ${
                  columnVisibility.monthlyDeathBenefit
                    ? "text-teal-800 bg-teal-200"
                    : "text-neutral-500"
                }`}
              >
                {columnVisibility.monthlyDeathBenefit ? <Eye size={12} /> : <EyeOff size={12} />}
                Monthly Benefit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleColumnGroup("fundValueBeneficiaries")}
                className={`h-8 px-2 text-xs ${
                  columnVisibility.fundValueBeneficiaries
                    ? "bg-white border border-neutral-300"
                    : "text-neutral-500"
                }`}
                style={columnVisibility.fundValueBeneficiaries ? { color: '#EA8A2E' } : {}}
              >
                {columnVisibility.fundValueBeneficiaries ? <Eye size={12} /> : <EyeOff size={12} />}
                Beneficiaries
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}