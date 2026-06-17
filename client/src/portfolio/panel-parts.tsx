import { cn } from "@/lib/utils";

/**
 * Richer Level 2 panel building blocks from the Final Wireframe fly-ins:
 * in-panel tabs, a segmented total bar, per-row breakdown bars and a roles
 * grid. Colours follow the EW chart palette (blue → orange).
 */

/** Asset-class / segment palette — dark blue through to accent orange. */
export const SEGMENT_COLORS = [
  "var(--ew-blue)",
  "#4C8DB4",
  "#90C2DC",
  "#D0E5F0",
  "#C98A4B",
  "#A55A2A",
];

export function PanelTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}) {
  return (
    <div
      className="flex gap-5 border-b"
      style={{ borderColor: "var(--ew-border)" }}
    >
      {tabs.map((tab) => {
        const on = tab === active;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={cn(
              "relative -mb-px pb-2 text-sm",
              on ? "font-semibold" : "text-gray-500 hover:text-gray-700"
            )}
            style={on ? { color: "var(--ew-blue)" } : undefined}
          >
            {tab}
            {on && (
              <span
                className="absolute inset-x-0 -bottom-px h-0.5"
                style={{ backgroundColor: "var(--ew-blue)" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/** A single horizontal bar split into proportional coloured segments. */
export function SegmentBar({
  segments,
}: {
  segments: { pct: number; color: string }[];
}) {
  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full">
      {segments.map((segment, index) => (
        <div
          key={index}
          style={{ width: `${segment.pct}%`, backgroundColor: segment.color }}
        />
      ))}
    </div>
  );
}

/** A labelled breakdown row: label + value above a thin proportional bar. */
export function BreakdownBar({
  label,
  value,
  pct,
  color = "var(--ew-blue)",
}: {
  label: string;
  value: string;
  pct: number;
  color?: string;
}) {
  return (
    <div className="py-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-700">{label}</span>
        <span className="tabular-nums text-neutral-900">{value}</span>
      </div>
      <div
        className="mt-1 h-1.5 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: "var(--ew-blue-tertiary-50)" }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/** Three (or more) small role cards — Owner / Life assured / Premium payer. */
export function RolesGrid({
  roles,
}: {
  roles: { label: string; name: string }[];
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {roles.map((role) => (
        <div
          key={role.label}
          className="rounded-md border p-2.5"
          style={{ borderColor: "var(--ew-border)" }}
        >
          <div className="text-[11px] text-gray-500">{role.label}</div>
          <div
            className="mt-0.5 text-[13px] font-medium"
            style={{ color: "var(--ew-primary-navy)" }}
          >
            {role.name}
          </div>
        </div>
      ))}
    </div>
  );
}
