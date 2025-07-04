import { Search, Filter, Plus, Table, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface ColumnVisibility {
  overview: boolean;
  unapprovedLifeCover: boolean;
  monthlyDeathBenefit: boolean;
  fundValue: boolean;
  fundValueBeneficiaries: boolean;
}

interface TableControlsProps {
  viewMode: "grouped" | "detailed";
  onViewModeChange: (mode: "grouped" | "detailed") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  columnVisibility: ColumnVisibility;
  onToggleColumnGroup: (group: keyof ColumnVisibility) => void;
  fundsCount: number;
}

export function TableControls({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  columnVisibility,
  onToggleColumnGroup,
  fundsCount,
}: TableControlsProps) {
  const viewModes = [
    { id: "grouped", label: "Grouped", icon: Table },
    { id: "detailed", label: "Detailed", icon: List },
  ] as const;

  return (
    <div className="mb-3 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-neutral-900">Fund Overview</h2>
          <Badge variant="secondary" className="bg-neutral-100 text-neutral-700 px-2 py-0.5 text-xs">
            {fundsCount} records
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-neutral-400" size={14} />
            <Input
              placeholder="Search funds..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 pr-3 py-1.5 w-48 h-8 text-sm"
            />
          </div>
          <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
            <Filter className="mr-1" size={14} />
            Filter
          </Button>
          <Button size="sm" className="h-8 px-3 text-xs bg-orange-primary hover:bg-orange-secondary">
            <Plus className="mr-1" size={14} />
            Add Fund
          </Button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-white rounded border border-neutral-200">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-medium text-neutral-700">View:</span>
          <div className="inline-flex bg-neutral-100 rounded p-0.5" role="group">
            {viewModes.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onViewModeChange(id)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center ${
                  viewMode === id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                }`}
              >
                <Icon className="mr-1.5" size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs font-medium text-neutral-700">Show:</span>
          <div className="flex items-center space-x-2">
            <label className="flex items-center">
              <Checkbox
                checked={columnVisibility.basicInfo}
                onCheckedChange={() => onToggleColumnGroup("basicInfo")}
                className="rounded border-neutral-300 text-primary w-3 h-3"
              />
              <span className="ml-1.5 text-xs text-neutral-600">Basic</span>
            </label>
            <label className="flex items-center">
              <Checkbox
                checked={columnVisibility.deathBenefits}
                onCheckedChange={() => onToggleColumnGroup("deathBenefits")}
                className="rounded border-neutral-300 text-primary w-3 h-3"
              />
              <span className="ml-1.5 text-xs text-neutral-600">Benefits</span>
            </label>
            <label className="flex items-center">
              <Checkbox
                checked={columnVisibility.financialDetails}
                onCheckedChange={() => onToggleColumnGroup("financialDetails")}
                className="rounded border-neutral-300 text-primary w-3 h-3"
              />
              <span className="ml-1.5 text-xs text-neutral-600">Financial</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
