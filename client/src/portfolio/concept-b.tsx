import { useState } from "react";
import { cn } from "@/lib/utils";
import type { PanelId } from "./data";
import { GOALS, type GoalCard } from "./data-plan";
import {
  ProgressBar,
  SectionHeading,
  StatusCard,
  TONE_COLOR,
  TONE_TINT,
} from "./primitives";
import { PanelButton } from "./panel-shell";
import { ContentHeader, ValuationCurrency } from "./content-patterns";
import { GoalCardView } from "./goal-card";
import { ListingSection, type ColumnDef } from "./listings";
import {
  formatRand,
  parseAmount,
  type Accessors,
  type SortOption,
  type ViewMode,
} from "./view";

/**
 * Concept B — "Plan view". The portfolio organised around what the money is
 * for, using the existing Product purpose field. Gaps and unassigned value
 * are first-class; reliability flags live inside the affected goals. The
 * goal grid can flip to a table via the view toggle.
 */

interface ConceptBProps {
  openPanel: (id: PanelId) => void;
  viewMode: ViewMode;
  /** When set, the unassigned ABSA value (R 460k) joins the matching goal. */
  assignedPurpose: string | null;
}

/** ABSA Share portfolio — the unassigned value the user can pull into a goal. */
const ABSA_VALUE = 460_000;

/** Maps the assignable purposes to the goal card they feed. */
const PURPOSE_TO_GOAL: Record<string, string> = {
  Retirement: "Retirement",
  Emergency: "Emergency fund",
  "Saving for a goal: Education": "Education — Fudge",
};

/** Apply a purpose assignment: drop the unassigned card and fold ABSA's value
 *  into the chosen goal, recomputing its value, progress and status. */
function applyAssignment(
  goals: GoalCard[],
  assignedPurpose: string | null
): GoalCard[] {
  if (!assignedPurpose) return goals;
  const targetTitle = PURPOSE_TO_GOAL[assignedPurpose];
  return goals
    .filter((goal) => goal.variant !== "unassigned")
    .map((goal) => {
      if (
        goal.title !== targetTitle ||
        goal.currentNum == null ||
        goal.targetNum == null
      ) {
        return goal;
      }
      const current = goal.currentNum + ABSA_VALUE;
      const pct = Math.min(100, Math.round((current / goal.targetNum) * 100));
      const onTrack = pct >= 100;
      return {
        ...goal,
        value: formatRand(current),
        valueMuted: false,
        variant: undefined,
        barPct: pct,
        barTone: onTrack ? "good" : goal.barTone,
        pill: onTrack ? { label: "On track", tone: "good" } : goal.pill,
        foot: `${pct}% of ${formatRand(
          goal.targetNum
        )} target · includes R 460 000 from ABSA`,
        footTone: undefined,
      };
    });
}

/** Plan-status buckets the content-area filter offers. */
const GOAL_FILTERS = [
  { value: "all", label: "All goals" },
  { value: "attention", label: "Needs attention" },
  { value: "ontrack", label: "On track" },
];

function goalNeedsAttention(goal: GoalCard) {
  return (
    goal.pill.tone === "warn" ||
    goal.pill.tone === "bad" ||
    goal.variant === "gap" ||
    goal.variant === "unassigned"
  );
}

const GOAL_ACCESSORS: Accessors<GoalCard> = {
  name: (g) => g.title,
  value: (g) => parseAmount(g.value),
  progress: (g) => g.barPct ?? 0,
};

const GOAL_SORTS: SortOption[] = [
  { value: "name", label: "Name (A–Z)", dir: "asc" },
  { value: "value", label: "Value (high–low)", dir: "desc" },
  { value: "progress", label: "Progress (lowest first)", dir: "asc" },
];

const GOAL_COLUMNS: ColumnDef[] = [
  { label: "Goal", sortKey: "name" },
  { label: "Status" },
  { label: "Current value", right: true, sortKey: "value" },
  { label: "Progress", sortKey: "progress" },
  { label: "Note" },
];

export function ConceptB({
  openPanel,
  viewMode,
  assignedPurpose,
}: ConceptBProps) {
  const [filter, setFilter] = useState("all");

  const planGoals = applyAssignment(GOALS, assignedPurpose);
  const goals = planGoals.filter((goal) => {
    if (filter === "attention") return goalNeedsAttention(goal);
    if (filter === "ontrack") return goal.pill.tone === "good";
    return true;
  });

  const goalRow = (goal: GoalCard) => (
    <tr
      key={goal.title}
      className="cursor-pointer border-b hover:bg-[var(--ew-row-tint)]"
      style={{ borderColor: "var(--ew-border)" }}
      onClick={() => openPanel(goal.panelId)}
    >
      <td className="px-3 py-2.5 align-middle">
        <div
          className="text-sm font-semibold"
          style={{ color: "var(--ew-primary-navy)" }}
        >
          {goal.title}
        </div>
        <div className="text-xs text-gray-500">{goal.sub}</div>
      </td>
      <td className="px-3 py-2.5 align-middle">
        <StatusCard label={goal.pill.label} tone={goal.pill.tone} />
      </td>
      <td
        className={cn(
          "px-3 py-2.5 text-right align-middle font-semibold tabular-nums",
          goal.valueMuted ? "text-gray-400" : "text-neutral-900"
        )}
      >
        {goal.value}
        {goal.valueSuffix && (
          <span className="ml-1 text-xs font-normal text-gray-500">
            {goal.valueSuffix}
          </span>
        )}
      </td>
      <td className="px-3 py-2.5 align-middle">
        {goal.barPct !== undefined && goal.barTone ? (
          <span className="flex items-center gap-2">
            <ProgressBar
              pct={goal.barPct}
              tone={goal.barTone}
              className="w-24"
            />
            <span className="text-xs tabular-nums text-gray-500">
              {goal.barPct}%
            </span>
          </span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>
      <td className="px-3 py-2.5 align-middle text-xs">
        <span
          className={goal.footTone === "bad" ? undefined : "text-gray-500"}
          style={
            goal.footTone === "bad" ? { color: TONE_COLOR.bad } : undefined
          }
        >
          {goal.foot}
        </span>
        {goal.flag && (
          <div style={{ color: TONE_TINT.warn.text }}>{goal.flag}</div>
        )}
      </td>
    </tr>
  );

  return (
    <div>
      <ContentHeader
        label="Goals in Ben's plan"
        value={String(planGoals.length)}
        filter={{
          label: "Filter",
          options: GOAL_FILTERS,
          value: filter,
          onChange: setFilter,
        }}
      />

      <ValuationCurrency asAt="06/10/2025" className="mt-4" />

      <ListingSection
        viewMode={viewMode}
        addLabel="Add a product to the plan"
        columns={GOAL_COLUMNS}
        rows={goals}
        accessors={GOAL_ACCESSORS}
        sortOptions={GOAL_SORTS}
        renderRow={goalRow}
        renderCard={(goal) => (
          <GoalCardView
            key={goal.title}
            goal={goal}
            onClick={() => openPanel(goal.panelId)}
          />
        )}
      />

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
