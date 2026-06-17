import { cn } from "@/lib/utils";
import type { GoalCard } from "./data-plan";
import { ProgressBar, StatusCard, TONE_COLOR, TONE_TINT } from "./primitives";
import { cardSurface } from "./listings";

/**
 * Concept B goal card — hero value + status pill + progress, with the gap and
 * unassigned variants carrying their dashed treatment and any reliability flag.
 */
export function GoalCardView({
  goal,
  onClick,
}: {
  goal: GoalCard;
  onClick: () => void;
}) {
  const warn = TONE_TINT.warn;
  return (
    <div
      className={cn(
        "cursor-pointer rounded-lg border p-4 transition-shadow hover:shadow-sm motion-reduce:transition-none",
        goal.variant === "gap" && "border-dashed",
        goal.variant === "unassigned" &&
          "border-dashed border-[#BDBDBD] bg-white"
      )}
      style={
        goal.variant === "gap"
          ? { backgroundColor: "#FFF9F7", borderColor: "#F0B9AC" }
          : goal.variant === "unassigned"
          ? undefined
          : cardSurface
      }
      onClick={onClick}
      role="button"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div
            className="text-sm font-semibold"
            style={{ color: "var(--ew-primary-navy)" }}
          >
            {goal.title}
          </div>
          <div className="text-xs text-gray-500">{goal.sub}</div>
        </div>
        <StatusCard label={goal.pill.label} tone={goal.pill.tone} />
      </div>

      <div
        className={cn(
          "mt-2 text-xl font-semibold tabular-nums",
          goal.valueMuted ? "text-gray-400" : "text-neutral-900"
        )}
      >
        {goal.value}
        {goal.valueSuffix && (
          <span className="ml-1 text-xs font-normal text-gray-500">
            {goal.valueSuffix}
          </span>
        )}
      </div>

      {goal.barPct !== undefined && goal.barTone && (
        <ProgressBar pct={goal.barPct} tone={goal.barTone} className="mt-2" />
      )}

      <div
        className="mt-2 text-xs"
        style={{
          color: goal.footTone === "bad" ? TONE_COLOR.bad : undefined,
        }}
      >
        <span className={goal.footTone ? undefined : "text-gray-500"}>
          {goal.foot}
        </span>
      </div>

      {goal.flag && (
        <div
          className="mt-2 rounded border px-2 py-1.5 text-xs"
          style={{
            backgroundColor: warn.bg,
            borderColor: warn.border,
            color: warn.text,
          }}
        >
          {goal.flag}
        </div>
      )}
    </div>
  );
}
