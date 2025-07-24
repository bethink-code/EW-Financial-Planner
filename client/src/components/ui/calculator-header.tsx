import { Table, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalculatorHeaderProps {
  title: string;
  itemCount?: number;
  itemLabel?: string;
  onAddItem?: () => void;
  addButtonText?: string;
  isAddingItem?: boolean;
  viewMode?: "table" | "hybrid";
  onViewModeChange?: (mode: "table" | "hybrid") => void;
  additionalControls?: React.ReactNode;
  className?: string;
}

export function CalculatorHeader({
  title,
  itemCount,
  itemLabel = "items",
  onAddItem,
  addButtonText = "Add Item",
  isAddingItem = false,
  viewMode = "table",
  onViewModeChange,
  additionalControls,
  className = ""
}: CalculatorHeaderProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-neutral-200 p-4 mb-4 ${className}`}>
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
        {/* Left section: Title, count, and Add button */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
          {itemCount !== undefined && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
              {itemCount} {itemLabel}
            </span>
          )}
          {onAddItem && (
            <Button
              onClick={onAddItem}
              disabled={isAddingItem}
              size="sm"
              className="h-8 px-3 text-white"
              style={{ 
                backgroundColor: '#016991', 
                borderColor: '#016991'
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.backgroundColor = '#014d6b'; 
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.backgroundColor = '#016991'; 
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              {isAddingItem ? "Adding..." : addButtonText}
            </Button>
          )}
        </div>

        {/* Right section: View mode switcher and additional controls */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* View Mode Buttons */}
          {onViewModeChange && (
            <div className="flex border border-neutral-200 rounded overflow-hidden">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("table")}
                className="rounded-none border-0 h-8 px-3"
              >
                <Table size={14} className="mr-1" />
                Table
              </Button>

              <Button
                variant={viewMode === "hybrid" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("hybrid")}
                className="rounded-none border-0 border-l border-neutral-200 h-8 px-3"
              >
                <List size={14} className="mr-1" />
                Hybrid
              </Button>
            </div>
          )}

          {/* Additional controls (like Inputs/Flows switcher for retirement funds) */}
          {additionalControls}
        </div>
      </div>
    </div>
  );
}