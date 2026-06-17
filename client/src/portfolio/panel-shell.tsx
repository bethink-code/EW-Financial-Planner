import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LEVEL3_TABS, type Tone } from "./data";
import { FreshnessDot, TONE_COLOR } from "./primitives";

/**
 * Level 2 slide-in panel shell and its content building blocks. Modelled on
 * the financial-planning slide-out pattern: white surface, dimmed backdrop,
 * blue bold title with a sentence-case kicker, right-hand slide transition.
 */

export function PanelShell({
  open,
  subtitle,
  title,
  onClose,
  children,
}: {
  open: boolean;
  subtitle: string;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 motion-reduce:transition-none",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed top-0 right-0 z-50 flex h-full w-[min(520px,94vw)] max-w-full flex-col bg-white shadow-xl transition-transform duration-300 motion-reduce:transition-none",
          open ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-label={title}
        aria-hidden={!open}
      >
        <div
          className="flex items-start justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--ew-border)" }}
        >
          <div>
            <h3
              className="text-lg font-bold leading-tight"
              style={{ color: "var(--ew-primary-navy)" }}
            >
              {title}
            </h3>
            {subtitle && (
              <div className="mt-1 text-xs text-gray-500">{subtitle}</div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost p-1"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {children}
        </div>
      </aside>
    </>
  );
}

export function PanelSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4
        className="mb-2 text-[13px] font-semibold"
        style={{ color: "var(--ew-blue)" }}
      >
        {title}
      </h4>
      {children}
    </div>
  );
}

export interface KvRow {
  k: string;
  v: string;
  tone?: Tone;
  num?: boolean;
}

export function KvGrid({ rows }: { rows: KvRow[] }) {
  return (
    <div className="grid grid-cols-[150px_1fr] gap-y-1.5 text-sm">
      {rows.map((row) => (
        <div key={row.k} className="contents">
          <span className="text-gray-500">{row.k}</span>
          <span
            className={cn("font-medium", row.num && "tabular-nums")}
            style={{
              color: row.tone ? TONE_COLOR[row.tone] : "var(--ew-primary-navy)",
            }}
          >
            {row.v}
          </span>
        </div>
      ))}
    </div>
  );
}

export function FundList({
  items,
}: {
  items: { label: string; value: string; dotTone?: Tone }[];
}) {
  return (
    <ul>
      {items.map((item) => (
        <li
          key={item.label}
          className="flex items-center justify-between gap-3 border-b py-2 text-sm last:border-b-0"
          style={{ borderColor: "var(--ew-blue-tertiary-50)" }}
        >
          <span className="font-medium" style={{ color: "var(--ew-blue)" }}>
            {item.label}
          </span>
          <span className="flex items-center gap-1.5 tabular-nums text-neutral-900">
            {item.value}
            {item.dotTone && <FreshnessDot tone={item.dotTone} title="Stale" />}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function NoteBlock({
  tone,
  children,
}: {
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-start gap-2 rounded-md border px-3 py-2.5 text-[13px] leading-snug text-neutral-700"
      style={{
        backgroundColor: "#F4F8FB",
        borderColor: "var(--ew-blue-tertiary-50)",
      }}
    >
      {tone && (
        <span className="mt-1">
          <FreshnessDot tone={tone} />
        </span>
      )}
      <span>{children}</span>
    </div>
  );
}

export function PanelField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label
        className="block text-sm font-medium"
        style={{ color: "var(--ew-primary-navy)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export const panelInputClass =
  "h-9 w-full rounded-md border border-[#E0E0E0] bg-white px-3 text-sm text-neutral-900 focus:border-[var(--ew-blue)] focus:outline-none";

export function PanelButton({
  ghost,
  onClick,
  children,
}: {
  ghost?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 rounded-md px-4 text-sm font-medium",
        ghost
          ? "border border-[#E0E0E0] bg-white text-gray-700 hover:bg-neutral-50"
          : "text-white hover:opacity-90"
      )}
      style={ghost ? undefined : { backgroundColor: "var(--ew-blue)" }}
    >
      {children}
    </button>
  );
}

/** Dashed placeholder for the unchanged Level 3 product detail tab set. */
export function Level3Block() {
  return (
    <div className="rounded-md border border-dashed border-[#BDBDBD] p-3">
      <div className="text-xs text-neutral-700">
        <span className="font-semibold">Level 3 — full product detail</span>{" "}
        (existing screens, unchanged)
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {LEVEL3_TABS.map((tab) => (
          <span
            key={tab}
            className="rounded px-2 py-0.5 text-xs"
            style={{
              backgroundColor: "#E6F0F5",
              color: "var(--ew-blue)",
            }}
          >
            {tab}
          </span>
        ))}
      </div>
    </div>
  );
}
