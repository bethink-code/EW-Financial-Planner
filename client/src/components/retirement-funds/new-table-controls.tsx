import { Table, Layout, List, Eye, EyeOff, ChevronDown, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddButton } from "@/components/ui/action-buttons";
import { InputFlowSwitcher } from "@/components/ui/switcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ColumnVisibility {
  overview: boolean;
  unapprovedLifeCover: boolean;
  monthlyDeathBenefit: boolean;
  fundValue: boolean;
  fundValueBeneficiaries: boolean;
}

interface NewTableControlsProps {
  viewMode: "grouped" | "detailed";
  onViewModeChange: (mode: "grouped" | "detailed") => void;
  tableMode: "inputs" | "flows";
  onTableModeChange: (mode: "inputs" | "flows") => void;

  columnVisibility: ColumnVisibility;
  onToggleColumnGroup: (group: keyof ColumnVisibility) => void;
  fundsCount: number;
  onAddFund: () => void;
  isAddingFund?: boolean;
}

export function NewTableControls({
  viewMode,
  onViewModeChange,
  tableMode,
  onTableModeChange,

  columnVisibility,
  onToggleColumnGroup,
  fundsCount,
  onAddFund,
  isAddingFund = false,
}: NewTableControlsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 mb-4">
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
        {/* Left section: Title, count, and Add Fund button */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-neutral-900">Retirement Funds</h1>
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
            {fundsCount} funds
          </span>
          <AddButton
            onClick={onAddFund}
            disabled={isAddingFund}
            size="sm"
            className="h-8 px-3"
          >
            {isAddingFund ? "Adding..." : "Add Fund"}
          </AddButton>
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
            <InputFlowSwitcher
              value={tableMode === "inputs" ? "input" : "flow"}
              onChange={(value) => onTableModeChange(value === "input" ? "inputs" : "flows")}
              size="sm"
            />
          )}

          {/* Section Visibility Dropdown - compact design - HIDDEN */}
          {false && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs border-l border-neutral-200 ml-2"
              >
                <Eye size={12} className="mr-1" />
                Visibility
                <ChevronDown size={12} className="ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuCheckboxItem
                checked={columnVisibility.overview}
                onCheckedChange={() => onToggleColumnGroup("overview")}
                className="text-xs"
              >
                Overview
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.unapprovedLifeCover}
                onCheckedChange={() => onToggleColumnGroup("unapprovedLifeCover")}
                className="text-xs"
              >
                Life Cover
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.monthlyDeathBenefit}
                onCheckedChange={() => onToggleColumnGroup("monthlyDeathBenefit")}
                className="text-xs"
              >
                Monthly Benefit
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.fundValue}
                onCheckedChange={() => onToggleColumnGroup("fundValue")}
                className="text-xs"
              >
                Fund Value
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.fundValueBeneficiaries}
                onCheckedChange={() => onToggleColumnGroup("fundValueBeneficiaries")}
                className="text-xs"
              >
                Beneficiaries
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}