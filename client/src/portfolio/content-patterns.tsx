import { useState } from "react";
import { RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { PanelButton } from "./panel-shell";
import { TONE_COLOR } from "./primitives";
import { SegmentedControl } from "./view";

/**
 * Content-area patterns from the EW "Final Wireframe" page: the section
 * header (a "Total X" metric + a filter dropdown), the soft "Something
 * missing?" gap nudge, the valuation-currency re-fetch bar and the unmet-
 * intention callout. Shared so every concept's content area reads the same.
 */

export interface FilterConfig {
  label?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

export function ContentHeader({
  label,
  value,
  filter,
}: {
  label: string;
  value: string;
  filter?: FilterConfig;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <div className="text-[13px] text-gray-500">{label}</div>
        <div className="mt-0.5 text-3xl font-semibold tabular-nums text-neutral-900">
          {value}
        </div>
      </div>
      {filter && (
        <SegmentedControl
          label={filter.label}
          options={filter.options}
          value={filter.value}
          onChange={filter.onChange}
        />
      )}
    </div>
  );
}

/**
 * The "Something missing?" panel — EW's gentle, inform-never-block treatment
 * for gaps: a dashed amber box stating possible reasons and offering a
 * conversation rather than a hard error.
 */
export function SomethingMissing({
  title = "Something missing?",
  reasons,
  note,
  actions,
}: {
  title?: string;
  reasons: string[];
  note?: string;
  actions: { label: string; primary?: boolean; onClick?: () => void }[];
}) {
  return (
    <div
      className="mt-6 flex flex-wrap items-start gap-x-8 gap-y-4 rounded-lg border border-dashed px-5 py-4"
      style={{ backgroundColor: "#FBF6EF", borderColor: "#E7D4B5" }}
    >
      <div className="text-sm font-semibold" style={{ color: "#B26205" }}>
        {title}
      </div>
      <div className="min-w-[220px] flex-1 text-[13px] leading-relaxed text-neutral-700">
        <div>It could be because:</div>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
        {note && <p className="mt-3">{note}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <PanelButton
            key={action.label}
            ghost={!action.primary}
            onClick={action.onClick}
          >
            {action.label}
          </PanelButton>
        ))}
      </div>
    </div>
  );
}

/**
 * Valuation-currency bar — answers "is this up to date?" on every Layer 1
 * view and offers the immediate re-fetch action. The fetch is simulated
 * (mockup): it cycles fetching → done → idle without touching the fixtures.
 */
export function RefetchBar({
  asAt,
  staleNote,
}: {
  asAt: string;
  staleNote?: string;
}) {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");

  const refetch = () => {
    if (state === "busy") return;
    setState("busy");
    window.setTimeout(() => {
      setState("done");
      window.setTimeout(() => setState("idle"), 2500);
    }, 1200);
  };

  return (
    <div
      className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 rounded-md border px-4 py-2"
      style={{
        backgroundColor: "#F4F8FB",
        borderColor: "var(--ew-blue-tertiary-50)",
      }}
    >
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[13px]">
        <span className="text-gray-600">Investment values as at {asAt}</span>
        {staleNote && (
          <span className="font-medium" style={{ color: TONE_COLOR.warn }}>
            · {staleNote}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={refetch}
        disabled={state === "busy"}
        className="flex h-8 items-center gap-1.5 rounded-md border bg-white px-3 text-[13px] font-medium hover:bg-neutral-50 disabled:cursor-default"
        style={{ borderColor: "var(--ew-border)", color: "var(--ew-blue)" }}
      >
        <RotateCw
          className={cn("h-3.5 w-3.5", state === "busy" && "animate-spin")}
        />
        {state === "idle" && "Re-fetch latest values"}
        {state === "busy" && "Fetching latest values…"}
        {state === "done" && "Pulled latest values just now ✓"}
      </button>
    </div>
  );
}

/**
 * Unmet-intention callout — surfaces intentions in the plan that no product
 * covers yet (e.g. the emergency fund). Gives the product-grouped Concept A
 * the gap signal it can't otherwise show, linking to the goal's Level 2 panel.
 */
export function PlanGapCallout({
  items,
}: {
  items: { title: string; note: string; onClick: () => void }[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="mt-4">
      <div className="mb-2 text-[13px] font-medium text-gray-500">
        Plan intentions not yet covered
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.title}
            onClick={item.onClick}
            role="button"
            className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed px-3 py-2.5 transition-shadow hover:shadow-sm motion-reduce:transition-none"
            style={{ backgroundColor: "#FFF9F7", borderColor: "#F0B9AC" }}
          >
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: TONE_COLOR.bad }}
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-neutral-900">
                {item.title}
              </div>
              <div className="text-xs text-gray-500">{item.note}</div>
            </div>
            <span
              className="whitespace-nowrap text-sm font-medium"
              style={{ color: "var(--ew-blue)" }}
            >
              Review →
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
