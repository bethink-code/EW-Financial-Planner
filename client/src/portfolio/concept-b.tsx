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
import { cardSurface, ListingSection, type ColumnDef } from "./listings";
import {
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
  readiness: number;
  resolved: Set<number>;
  expanded: boolean;
  onToggle: () => void;
  viewMode: ViewMode;
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
  viewMode,
}: ConceptBProps) {
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
        <StatusPill label={goal.pill.label} tone={goal.pill.tone} />
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
      <SectionHeading>The plan — what Ben's money is for</SectionHeading>

      <AttentionStrip
        copy={STRIP_B}
        readiness={readiness}
        expanded={expanded}
        onToggle={onToggle}
        openPanel={openPanel}
        resolved={resolved}
      />

      <ListingSection
        viewMode={viewMode}
        columns={GOAL_COLUMNS}
        rows={GOALS}
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
