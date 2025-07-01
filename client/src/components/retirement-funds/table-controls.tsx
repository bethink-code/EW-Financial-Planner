import { Search, Filter, Plus, Table, Grid3x3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface ColumnVisibility {
  basicInfo: boolean;
  deathBenefits: boolean;
  financialDetails: boolean;
}

interface TableControlsProps {
  viewMode: "grouped" | "cards" | "detailed";
  onViewModeChange: (mode: "grouped" | "cards" | "detailed") => void;
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
    { id: "cards", label: "Cards", icon: Grid3x3 },
    { id: "detailed", label: "Detailed", icon: List },
  ] as const;

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-semibold text-neutral-900">Fund Overview</h2>
          <Badge variant="secondary" className="bg-neutral-100 text-neutral-800">
            {fundsCount} records
          </Badge>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
            <Input
              placeholder="Search funds..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2" size={16} />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="mr-2" size={16} />
            Add Fund
          </Button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white rounded-lg border border-neutral-200">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-neutral-700">View Mode:</span>
          <div className="inline-flex bg-neutral-100 rounded-lg p-1" role="group">
            {viewModes.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onViewModeChange(id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center ${
                  viewMode === id
                    ? "bg-primary text-primary-foreground"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <Icon className="mr-2" size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-neutral-700">Show Columns:</span>
          <div className="flex items-center space-x-3">
            <label className="flex items-center">
              <Checkbox
                checked={columnVisibility.basicInfo}
                onCheckedChange={() => onToggleColumnGroup("basicInfo")}
                className="rounded border-neutral-300 text-primary"
              />
              <span className="ml-2 text-sm text-neutral-600">Basic Info</span>
            </label>
            <label className="flex items-center">
              <Checkbox
                checked={columnVisibility.deathBenefits}
                onCheckedChange={() => onToggleColumnGroup("deathBenefits")}
                className="rounded border-neutral-300 text-primary"
              />
              <span className="ml-2 text-sm text-neutral-600">Death Benefits</span>
            </label>
            <label className="flex items-center">
              <Checkbox
                checked={columnVisibility.financialDetails}
                onCheckedChange={() => onToggleColumnGroup("financialDetails")}
                className="rounded border-neutral-300 text-primary"
              />
              <span className="ml-2 text-sm text-neutral-600">Financial Details</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
