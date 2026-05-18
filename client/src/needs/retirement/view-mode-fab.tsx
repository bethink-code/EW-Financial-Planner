import { useEffect, useRef, useState } from "react";
import { Table2, X, Layers } from "lucide-react";
import { useViewMode } from "@/contexts/view-mode-context";

/**
 * Floating action button for the Table / Hybrid view toggle. Stacks below the
 * prototype-layout FAB on Retirement Build routes. Hybrid is the chosen
 * direction; Table is preserved as a safety net during the design phase but
 * no longer occupies the page header.
 */
export function ViewModeFab() {
  const { viewMode, setViewMode } = useViewMode();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("pointerdown", onPointer);
    return () => window.removeEventListener("pointerdown", onPointer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const pick = (mode: "table" | "hybrid") => {
    setViewMode(mode);
    setOpen(false);
  };

  const Icon = viewMode === "hybrid" ? Layers : Table2;
  const activeLabel = viewMode === "hybrid" ? "Hybrid" : "Table";

  return (
    <div
      ref={containerRef}
      className="fixed right-6 z-50 flex flex-col items-end gap-3"
      style={{ top: "10rem" }}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-label={`View mode: ${activeLabel}`}
        className="rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
        style={{
          width: 52,
          height: 52,
          backgroundColor: "var(--ew-blue)",
          color: "white",
        }}
      >
        <Icon className="w-5 h-5" />
      </button>
      {open && (
        <div
          className="rounded-lg shadow-xl bg-white border min-w-[180px] overflow-hidden"
          style={{ borderColor: "var(--ew-border)" }}
          role="menu"
          aria-label="View mode"
        >
          <div
            className="flex items-center justify-between px-3 py-2"
            style={{
              backgroundColor: "var(--ew-blue-tertiary-50)",
              borderBottom: "1px solid var(--ew-blue-tertiary-100)",
            }}
          >
            <span
              className="text-xs font-medium uppercase tracking-wide"
              style={{ color: "var(--ew-blue)" }}
            >
              View
            </span>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="p-0.5 rounded hover:bg-white"
              style={{ color: "var(--ew-blue)" }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-1.5 space-y-1">
            {(["hybrid", "table"] as const).map(mode => {
              const isActive = viewMode === mode;
              const ModeIcon = mode === "hybrid" ? Layers : Table2;
              const label = mode === "hybrid" ? "Hybrid" : "Table";
              return (
                <button
                  key={mode}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isActive}
                  onClick={() => pick(mode)}
                  className="w-full text-left px-3 py-2 text-sm rounded transition-colors flex items-center gap-2"
                  style={{
                    backgroundColor: isActive ? "var(--ew-blue)" : "transparent",
                    color: isActive ? "white" : "var(--ew-primary-navy)",
                    fontWeight: isActive ? 600 : 500,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--ew-blue-tertiary-50)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <ModeIcon className="w-4 h-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
