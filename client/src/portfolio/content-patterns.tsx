import { useState } from "react";
import { RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { TONE_COLOR } from "./primitives";
import { SegmentedControl } from "./view";

/**
 * Content-area patterns shared across the concepts: the section header
 * (a "Total X" metric + a filter), the valuation-currency line + re-fetch
 * action, and the unmet-intention callout.
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
 * Re-fetch action — pulls the latest values. The fetch is simulated (mockup):
 * it cycles fetching → done → idle without touching the fixtures.
 */
export function RefetchButton() {
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
    <button
      type="button"
      onClick={refetch}
      disabled={state === "busy"}
      className="flex h-8 shrink-0 items-center gap-1.5 rounded-md border bg-white px-3 text-[13px] font-medium hover:bg-neutral-50 disabled:cursor-default"
      style={{ borderColor: "var(--ew-border)", color: "var(--ew-blue)" }}
    >
      <RotateCw
        className={cn("h-3.5 w-3.5", state === "busy" && "animate-spin")}
      />
      {state === "idle" && "Re-fetch latest values"}
      {state === "busy" && "Fetching latest values…"}
      {state === "done" && "Pulled latest values just now ✓"}
    </button>
  );
}

/**
 * Valuation-currency line — answers "is this up to date?" inline (no banner)
 * with the re-fetch action. Used woven into each concept's own attention
 * treatment rather than as a standalone strip.
 */
export function ValuationCurrency({
  asAt,
  staleNote,
  className,
}: {
  asAt: string;
  staleNote?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 text-[13px]",
        className
      )}
    >
      <span className="text-gray-600">
        Investment values as at {asAt}
        {staleNote && (
          <span className="ml-1 font-medium" style={{ color: TONE_COLOR.warn }}>
            · {staleNote}
          </span>
        )}
      </span>
      <RefetchButton />
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
