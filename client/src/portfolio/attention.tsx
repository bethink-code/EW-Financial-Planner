import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PanelId } from "./data";
import type { AttentionItem, StripCopy } from "./data-attention";
import { TONE_COLOR, TONE_TINT } from "./primitives";

/**
 * The attention layer — a parallel layer woven into every concept, never a
 * standalone screen. Concepts A & B get the collapsible strip; Concept C
 * shows the full queue as a persistent rail (QueueItem reused there).
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

export function AttentionStrip({
  copy,
  readiness,
  expanded,
  onToggle,
  openPanel,
  resolved,
}: {
  copy: StripCopy;
  readiness: number;
  expanded: boolean;
  onToggle: () => void;
  openPanel: (id: PanelId) => void;
  resolved: Set<number>;
}) {
  const warn = TONE_TINT.warn;
  return (
    <div className="mt-4">
      <div
        className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 rounded-md border px-4 py-2.5"
        style={{ backgroundColor: warn.bg, borderColor: warn.border }}
        onClick={onToggle}
        role="button"
      >
        <span className="text-sm font-semibold" style={{ color: warn.text }}>
          {copy.lead}
        </span>
        <span className="min-w-0 flex-1 text-[13px] text-neutral-700">
          {copy.consequence}
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
        <div className="mt-2 space-y-2">
          {copy.items.map((item) => (
            <QueueItem
              key={item.queueId}
              item={item}
              done={resolved.has(item.queueId)}
              onClick={() => openPanel(item.panelId)}
            />
          ))}
          <button
            type="button"
            className="text-xs font-medium hover:underline"
            style={{ color: "var(--ew-blue)" }}
          >
            View all 6 items →
          </button>
        </div>
      )}
    </div>
  );
}
