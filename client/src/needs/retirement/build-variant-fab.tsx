import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { LayoutGrid, X } from "lucide-react";
import { BUILD_VARIANTS, useBuildVariant, type BuildVariant } from "./build-variant";

/**
 * Floating action button + popover for switching the Retirement Build
 * prototype layout (Long / Lifecycle / Sources & Uses). Replaces the inline
 * pill bar that used to sit above the page content; lives on Retirement Build
 * routes only.
 */
export function BuildVariantFab() {
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useBuildVariant();
  const [, navigate] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click.
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

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const pick = (v: BuildVariant) => {
    setVariant(v);
    const entry = BUILD_VARIANTS.find(b => b.id === v)?.entry ?? "/needs/retirement/build";
    navigate(entry);
    setOpen(false);
  };

  const activeLabel = BUILD_VARIANTS.find(b => b.id === variant)?.label ?? "Layout";

  return (
    <div
      ref={containerRef}
      className="fixed right-6 z-50 flex flex-col items-end gap-3"
      style={{ top: "5rem" }}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-label={`Prototype layout: ${activeLabel}`}
        className="rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
        style={{
          width: 52,
          height: 52,
          backgroundColor: "var(--ew-blue)",
          color: "white",
        }}
      >
        <LayoutGrid className="w-5 h-5" />
      </button>
      {open && (
        <div
          className="rounded-lg shadow-xl bg-white border min-w-[220px] overflow-hidden"
          style={{ borderColor: "var(--ew-border)" }}
          role="menu"
          aria-label="Prototype layout"
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
              Prototype layout
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
            {BUILD_VARIANTS.map(b => {
              const isActive = variant === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isActive}
                  onClick={() => pick(b.id)}
                  className="w-full text-left px-3 py-2 text-sm rounded transition-colors"
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
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
