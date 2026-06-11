import { cn } from "@/lib/utils";
import type { PanelId } from "./data";
import { STRIP_B } from "./data-attention";
import { GOALS, type GoalCard } from "./data-plan";
import {
  ProgressBar,
  SectionHeading,
  StatusPill,
  TONE_COLOR,
  TONE_TINT,
} from "./primitives";
import { AttentionStrip } from "./attention";
import { PanelButton } from "./panel-shell";

/**
 * Concept B — "Plan view". The portfolio organised around what the money is
 * for, using the existing Product purpose field. Gaps and unassigned value
 * are first-class cards; reliability flags live inside the affected goals.
 */

interface ConceptBProps {
  openPanel: (id: PanelId) => void;
  readiness: number;
  resolved: Set<number>;
  expanded: boolean;
  onToggle: () => void;
}

function GoalCardView({
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
        "cursor-pointer rounded-lg border bg-white p-4 transition-shadow hover:shadow-sm motion-reduce:transition-none",
        goal.variant === "gap" && "border-dashed",
        goal.variant === "unassigned" && "border-dashed border-[#BDBDBD]"
      )}
      style={
        goal.variant === "gap"
          ? { backgroundColor: "#FFF9F7", borderColor: "#F0B9AC" }
          : goal.variant === "unassigned"
          ? undefined
          : { borderColor: "var(--ew-border)" }
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
        <StatusPill label={goal.pill.label} tone={goal.pill.tone} />
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

export function ConceptB({
  openPanel,
  readiness,
  resolved,
  expanded,
  onToggle,
}: ConceptBProps) {
  return (
    <div>
      <SectionHeading>The plan — what Ben's money is for</SectionHeading>

      <AttentionStrip
        copy={STRIP_B}
        readiness={readiness}
        expanded={expanded}
        onToggle={onToggle}
        openPanel={openPanel}
        resolved={resolved}
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {GOALS.map((goal) => (
          <GoalCardView
            key={goal.title}
            goal={goal}
            onClick={() => openPanel(goal.panelId)}
          />
        ))}
      </div>

      <SectionHeading className="mt-8">All products</SectionHeading>
      <p className="mt-1 text-[13px] text-gray-500">
        The full category view stays one click away — same data, plan lens
        removed.
      </p>
      <div className="mt-2">
        <PanelButton ghost>View by product category →</PanelButton>
      </div>
    </div>
  );
}
