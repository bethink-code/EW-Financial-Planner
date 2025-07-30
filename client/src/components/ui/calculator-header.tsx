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
  showTableFlowsSwitcher?: boolean;
  tableMode?: "inputs" | "flows";
  onTableModeChange?: (mode: "inputs" | "flows") => void;
  additionalControls?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
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
  showTableFlowsSwitcher = false,
  tableMode = "inputs",
  onTableModeChange,
  additionalControls,
  className = "",
  children
}: CalculatorHeaderProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-neutral-200 ${className}`}>
      <div className="px-5 pt-5 pb-6">
        <div className="flex items-center justify-between w-full">
          {/* Left section: Title, count, and Add button */}
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
            {itemCount !== undefined && (
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                {itemCount} {itemLabel}
              </span>
            )}
            {onAddItem && (
              <Button
                onClick={onAddItem}
                disabled={isAddingItem}
                size="sm"
                className="h-9 px-4 text-white font-medium"
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
                <Plus className="h-4 w-4 mr-2" />
                {isAddingItem ? "Adding..." : addButtonText}
              </Button>
            )}
          </div>

          {/* Right section: View mode switcher and additional controls */}
          <div className="flex gap-3 items-center">
            {/* View Mode Buttons */}
            {onViewModeChange && (
              <div className="flex border border-neutral-200 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange("table")}
                  className="rounded-none border-0 h-9 px-4"
                >
                  <Table size={16} className="mr-2" />
                  Table
                </Button>

                <Button
                  variant={viewMode === "hybrid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange("hybrid")}
                  className="rounded-none border-0 border-l border-neutral-200 h-9 px-4"
                >
                  <List size={16} className="mr-2" />
                  Hybrid
                </Button>
              </div>
            )}

            {/* Table/Flows Switcher for retirement funds */}
            {showTableFlowsSwitcher && onTableModeChange && (
              <div className="flex border border-neutral-200 rounded-lg overflow-hidden">
                <Button
                  variant={tableMode === "inputs" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onTableModeChange("inputs")}
                  className="rounded-none border-0 h-9 px-4"
                >
                  Table
                </Button>
                <Button
                  variant={tableMode === "flows" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onTableModeChange("flows")}
                  className="rounded-none border-0 border-l border-neutral-200 h-9 px-4"
                >
                  Flows
                </Button>
              </div>
            )}

            {/* Additional controls */}
            {additionalControls}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}