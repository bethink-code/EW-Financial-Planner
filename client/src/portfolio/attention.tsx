import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PanelId } from "./data";
import { QUEUE, STRIP_A, type AttentionItem } from "./data-attention";
import { TONE_COLOR, TONE_TINT } from "./primitives";
import { PlanGapCallout, ValuationCurrency } from "./content-patterns";

/**
 * The attention layer — a parallel layer woven into every concept, never a
 * standalone screen. Concept A consolidates everything into one
 * NeedsAttentionBlock; Concept C shows the queue as a persistent rail
 * (QueueItem reused there); Concept B weaves reliability into the goals.
 */

export function QueueItem({
  item,
  done,
  onClick,
}: {
  item: AttentionItem;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={cn(
        "flex cursor-pointer items-stretch gap-3 rounded-md border bg-white px-3 py-2.5 hover:bg-neutral-50",
        done && "opacity-50"
      )}
      style={{ borderColor: "var(--ew-border)" }}
      onClick={onClick}
      role="button"
    >
      <div
        className="w-1.5 shrink-0 self-stretch rounded-full"
        style={{
          backgroundColor:
            item.severity === "high" ? TONE_COLOR.bad : TONE_COLOR.warn,
        }}
      />
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "text-sm font-medium text-neutral-900",
            done && "line-through"
          )}
        >
          {item.title}
        </div>
        <div className="text-xs text-gray-500">{item.sub}</div>
      </div>
      <div
        className="self-center whitespace-nowrap text-sm font-medium"
        style={{ color: done ? TONE_COLOR.good : "var(--ew-blue)" }}
      >
        {done ? "Done ✓" : `${item.action} →`}
      </div>
    </div>
  );
}

/**
 * Concept A's consolidated to-do block: one container replacing the separate
 * re-fetch bar, attention strip and plan-gap callout. Tinted header (count +
 * consequence + readiness + show/hide) over a white body holding the
 * valuation-currency row, the full queue, and any uncovered plan intentions —
 * each item opening its Level 2 slide-out.
 */
export function NeedsAttentionBlock({
  readiness,
  resolved,
  expanded,
  onToggle,
  openPanel,
  planGaps,
}: {
  readiness: number;
  resolved: Set<number>;
  expanded: boolean;
  onToggle: () => void;
  openPanel: (id: PanelId) => void;
  planGaps: { title: string; note: string; onClick: () => void }[];
}) {
  const warn = TONE_TINT.warn;
  return (
    <div
      className="mt-4 overflow-hidden rounded-lg border"
      style={{ borderColor: warn.border }}
    >
      <div
        className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5"
        style={{ backgroundColor: warn.bg }}
        onClick={onToggle}
        role="button"
      >
        <span className="text-sm font-semibold" style={{ color: warn.text }}>
          {STRIP_A.lead}
        </span>
        <span className="min-w-0 flex-1 text-[13px] text-neutral-700">
          {STRIP_A.consequence}
        </span>
        <span
          className="whitespace-nowrap text-sm font-medium tabular-nums"
          style={{ color: warn.text }}
        >
          Review readiness {readiness}%
        </span>
        <span
          className="flex items-center gap-1 text-sm font-medium"
          style={{ color: "var(--ew-blue)" }}
        >
          {expanded ? "Hide" : "Show"}
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </span>
      </div>

      {expanded && (
        <div className="space-y-4 bg-white px-4 py-4">
          <ValuationCurrency
            asAt="06/10/2025"
            staleNote="3 of 4 valuations need updating"
          />
          <div className="space-y-2">
            {QUEUE.map((item) => (
              <QueueItem
                key={item.queueId}
                item={item}
                done={resolved.has(item.queueId)}
                onClick={() => openPanel(item.panelId)}
              />
            ))}
          </div>
          <PlanGapCallout items={planGaps} />
        </div>
      )}
    </div>
  );
}
