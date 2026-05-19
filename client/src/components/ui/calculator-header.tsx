import { RefreshCw } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

interface CalculatorHeaderProps {
  title: string;
  itemCount?: number;
  itemLabel?: string;
  onAddItem?: () => void;
  addButtonText?: string;
  isAddingItem?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  additionalControls?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function CalculatorHeader({
  title,
  onAddItem,
  addButtonText = "Add Item",
  isAddingItem = false,
  onRefresh,
  isRefreshing = false,
  additionalControls,
  className = "",
  children
}: CalculatorHeaderProps) {
  const [location] = useLocation();
  // On Retirement Build routes the page-level header band is redundant — the
  // category tab announces the section, the sidebar already exposes its own
  // Add button. Skip rendering the header band so the body content sits flush
  // under the tab strip. DEL is untouched.
  const isRetirementBuild = location.startsWith("/needs/retirement/build");

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-neutral-200 ${isRetirementBuild ? "pt-[30px] px-6 pb-6" : ""} ${className}`}>
      {!isRetirementBuild && (
        <div className="px-5 pt-5 pb-6">
          <div className="flex items-center justify-between w-full max-w-6xl">
            {/* Left section: Title, Add button */}
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold text-primary">{title}</h1>

              {onAddItem && (
                <Button
                  onClick={onAddItem}
                  disabled={isAddingItem}
                  size="sm"
                  className="h-10 px-4 font-semibold text-white border-0 transition-colors disabled:opacity-60"
                  style={{ backgroundColor: "var(--ew-blue)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--ew-blue-pressed)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--ew-blue)"; }}
                >
                  {isAddingItem ? "Adding..." : addButtonText}
                </Button>
              )}

              {/* Refresh Button */}
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="btn-icon-white"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>

            {/* Right section: Additional controls only */}
            <div className="flex gap-3 items-center">
              {additionalControls}
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
