import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NeedConfig } from "./types";
import { findItemByPath, flattenNeed } from "./flatten";

interface NeedActionBarProps {
  config: NeedConfig;
}

/**
 * Generic Previous / Next + step counter bar. Walks ONLY the supplied need's
 * flattened sub-steps; never crosses into other needs.
 */
export function NeedActionBar({ config }: NeedActionBarProps) {
  const [location, setLocation] = useLocation();
  const flat = flattenNeed(config);
  const { index, item } = findItemByPath(config, location);

  if (!item) return null;

  const previous = index > 0 ? flat[index - 1] : null;
  const next = index < flat.length - 1 ? flat[index + 1] : null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 border-t border-gray-200 z-50 shadow-[0_-8px_25px_-8px_rgba(0,0,0,0.25)]"
      style={{ backgroundColor: "#EDF4F9" }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <button
          onClick={() => previous && setLocation(previous.path)}
          disabled={!previous}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md font-medium text-sm transition-colors",
            previous ? "text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed",
          )}
          style={previous ? { backgroundColor: "#016991" } : {}}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex-1 mx-2 min-w-0 flex flex-col items-center gap-1">
          <div className="text-sm font-semibold" style={{ color: "#016991" }}>
            Step {index + 1} / {flat.length}
          </div>
          <div className="text-xs font-medium text-gray-400 text-center w-full">{item.breadcrumb}</div>
        </div>

        <button
          onClick={() => next && setLocation(next.path)}
          disabled={!next}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md font-medium text-sm transition-colors",
            next ? "text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed",
          )}
          style={next ? { backgroundColor: "#016991" } : {}}
          title={next ? `Next: ${next.child?.label ?? next.section?.label ?? next.step.label}` : undefined}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
