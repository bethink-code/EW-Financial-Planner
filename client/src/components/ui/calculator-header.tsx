import { Plus, RefreshCw } from"lucide-react";
import { Button } from"@/components/ui/button";
import { GraphTableSwitcher, InputFlowSwitcher } from"@/components/ui/switcher";

interface CalculatorHeaderProps {
  title: string;
  itemCount?: number;
  itemLabel?: string;
  onAddItem?: () => void;
  addButtonText?: string;
  isAddingItem?: boolean;
  viewMode?:"table" |"hybrid";
  onViewModeChange?: (mode:"table" |"hybrid") => void;
  showTableFlowsSwitcher?: boolean;
  tableMode?:"inputs" |"flows";
  onTableModeChange?: (mode:"inputs" |"flows") => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  additionalControls?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function CalculatorHeader({
  title,
  itemCount,
  itemLabel ="items",
  onAddItem,
  addButtonText ="Add Item",
  isAddingItem = false,
  viewMode ="table",
  onViewModeChange,
  showTableFlowsSwitcher = false,
  tableMode ="inputs",
  onTableModeChange,
  onRefresh,
  isRefreshing = false,
  additionalControls,
  className ="",
  children
}: CalculatorHeaderProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-neutral-200 ${className}`}>
      <div className="px-5 pt-5 pb-6">
        <div className="flex items-center justify-between w-full max-w-6xl">
          {/* Left section: Title, count, Add button, and switchers */}
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-primary">{title}</h1>

            {onAddItem && (
              <Button
                onClick={onAddItem}
                disabled={isAddingItem}
                size="sm"
                className="h-10 px-4 bg-white text-gray-700 border border-neutral-200 hover:bg-gray-50 hover:text-gray-900 font-normal"
              >
                {isAddingItem ?"Adding..." : addButtonText}
              </Button>
            )}
            
            {/* View Mode Buttons */}
            {onViewModeChange && (
              <GraphTableSwitcher
                value={viewMode}
                onChange={(value) => onViewModeChange(value as"table" |"hybrid")}
                size="sm"
              />
            )}

            {/* Table/Flows Switcher for retirement funds */}
            {showTableFlowsSwitcher && onTableModeChange && (
              <InputFlowSwitcher
                value={tableMode ==="inputs" ?"input" :"flow"}
                onChange={(value) => onTableModeChange(value ==="input" ?"inputs" :"flows")}
                size="sm"
              />
            )}

            {/* Refresh Button */}
            {onRefresh && (
              <Button
                onClick={onRefresh}
                disabled={isRefreshing}
                size="sm"
                variant="outline"
                className="h-10 w-10 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>

          {/* Right section: Additional controls only */}
          <div className="flex gap-3 items-center">
            {/* Additional controls */}
            {additionalControls}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}