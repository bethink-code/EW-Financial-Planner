import { cn } from "@/lib/utils";
import { TONE_COLOR } from "./primitives";
import type { Tone } from "./data";

/**
 * SubcategoryNav — the left vertical nav inside each portfolio tab.
 * Items are CATEGORY buckets (Life, Unit trusts, Retirement…), not individual
 * policies. Selected item gets the orange left-border treatment that mirrors
 * HybridItemPreviewCard; unselected items are simple compact rows.
 *
 * In portfolio the left nav is subcategory-level. Individual policies live in
 * the main card grid on the right — this is the key difference from the
 * retirement planning left panel (which is policy-level).
 */

export interface SubcatItem {
  id: string;
  label: string;
  /** Key metric shown below the label — total value, count, etc. */
  summary: string;
  /** Optional tone dot — shown on goal/need items to signal health. */
  tone?: Tone;
  /** True when this bucket has no policies — renders muted. */
  empty?: boolean;
}

export function SubcategoryNav({
  items,
  selected,
  onChange,
}: {
  items: SubcatItem[];
  selected: string;
  onChange: (id: string) => void;
}) {
  return (
    <div>
      {items.map((item) => {
        const active = item.id === selected;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              "w-full border-b border-neutral-200 py-3.5 text-left transition-colors",
              active
                ? "relative z-10 -mr-px bg-white"
                : item.empty
                ? "cursor-default opacity-40"
                : "hover:bg-neutral-100"
            )}
            style={
              active
                ? { borderLeft: "4px solid #F97415", paddingLeft: "16px", paddingRight: "20px" }
                : { borderLeft: "4px solid transparent", paddingLeft: "16px", paddingRight: "20px" }
            }
          >
            <div className="text-sm font-medium" style={{ color: "var(--ew-primary-navy)" }}>
              {item.label}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-500">
              {item.tone && item.tone !== "neutral" && (
                <span
                  className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: TONE_COLOR[item.tone] }}
                />
              )}
              {item.summary}
            </div>
          </button>
        );
      })}
    </div>
  );
}
