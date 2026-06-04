import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Right-side slide-in panel for the Project step — holds the Adjust controls
 * and Breakdown (passed as children). EW card styling: white surface, soft
 * shadow, cream header rule, dimmed backdrop.
 */
export function AdjustDrawer({
  open,
  onClose,
  title = "Adjust",
  width = "w-[440px]",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Tailwind width class for the panel. Breakdown passes a wider value. */
  width?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed top-0 right-0 z-50 flex h-full max-w-full flex-col bg-white shadow-xl transition-transform duration-300",
          width,
          open ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-label={title}
        aria-hidden={!open}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--ew-border)" }}
        >
          <h3 className="text-sm font-bold" style={{ color: "var(--ew-blue)" }}>
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost p-1"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </aside>
    </>
  );
}
