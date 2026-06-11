import { cn } from "@/lib/utils";
import type { PanelId } from "./data";
import { QUEUE } from "./data-attention";
import { HOLDING_ROWS, REVIEW_ROWS } from "./data-holdings";
import { MINI_GOALS, type MiniGoal } from "./data-plan";
import {
  FreshnessDot,
  ProgressBar,
  ReadinessRing,
  SectionHeading,
  StatusPill,
} from "./primitives";
import { QueueItem } from "./attention";

/**
 * Concept C — "Command centre". Plan strip + holdings in the main column,
 * review readiness and the full attention queue as a persistent right rail.
 * Resolving a queue item (via its fix panel) lifts the readiness ring live.
 */

interface ConceptCProps {
  openPanel: (id: PanelId) => void;
  readiness: number;
  resolved: Set<number>;
}

function MiniGoalCard({
  goal,
  onClick,
}: {
  goal: MiniGoal;
  onClick: () => void;
}) {
  return (
    <div
      className={cn(
        "cursor-pointer rounded-lg border bg-white p-3 transition-shadow hover:shadow-sm motion-reduce:transition-none",
        goal.gap && "border-dashed"
      )}
      style={{ borderColor: goal.gap ? "#F0B9AC" : "var(--ew-border)" }}
      onClick={onClick}
      role="button"
    >
      <div
        className="flex items-center gap-1.5 text-[13px] font-medium"
        style={{ color: "var(--ew-primary-navy)" }}
      >
        {goal.name}
        <FreshnessDot tone={goal.dotTone} title={goal.dotTitle} />
      </div>
      <div
        className={cn(
          "mt-1 text-base font-semibold tabular-nums",
          goal.valueMuted ? "text-gray-400" : "text-neutral-900"
        )}
      >
        {goal.value}
        {goal.suffix && (
          <span className="ml-1 text-[11px] font-normal text-gray-500">
            {goal.suffix}
          </span>
        )}
      </div>
      <ProgressBar
        pct={goal.barPct}
        tone={goal.barTone}
        className="mt-2 h-1.5"
      />
    </div>
  );
}

export function ConceptC({ openPanel, readiness, resolved }: ConceptCProps) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(420px,8fr)_minmax(300px,4fr)]">
      {/* Main column */}
      <div>
        <SectionHeading>The plan</SectionHeading>
        <div className="mt-2 grid grid-cols-2 gap-3 xl:grid-cols-4">
          {MINI_GOALS.map((goal) => (
            <MiniGoalCard
              key={goal.name}
              goal={goal}
              onClick={() => openPanel(goal.panelId)}
            />
          ))}
        </div>

        <SectionHeading className="mt-6">Holdings</SectionHeading>
        <table className="mt-2 w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "var(--ew-blue-tertiary-50)" }}>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 !normal-case">
                Instrument
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 !normal-case">
                Purpose
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 !normal-case">
                Value / premium
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 !normal-case">
                As at
              </th>
            </tr>
          </thead>
          <tbody>
            {HOLDING_ROWS.map((row) => (
              <tr
                key={row.name}
                className="cursor-pointer border-b hover:bg-[var(--ew-row-tint)]"
                style={{ borderColor: "var(--ew-border)" }}
                onClick={() => openPanel(row.panelId)}
              >
                <td
                  className="px-3 py-2.5 font-medium"
                  style={{ color: "var(--ew-blue)" }}
                >
                  {row.name}
                </td>
                <td className="px-3 py-2.5">
                  {row.purpose ?? <StatusPill label="Not set" tone="neutral" />}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">
                  {row.value}
                </td>
                <td className="px-3 py-2.5">
                  {row.date ? (
                    <span className="flex items-center gap-1.5 whitespace-nowrap tabular-nums">
                      <FreshnessDot tone={row.freshness!} />
                      {row.date}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <SectionHeading className="mt-6">
          Since last review · 07 Oct 2025
        </SectionHeading>
        <div
          className="mt-2 rounded-lg border bg-white px-4 py-2"
          style={{ borderColor: "var(--ew-border)" }}
        >
          {REVIEW_ROWS.map((row, index) => (
            <div
              key={row.label}
              className={cn(
                "flex items-center justify-between gap-3 py-2 text-sm",
                index < REVIEW_ROWS.length - 1 && "border-b"
              )}
              style={{ borderColor: "var(--ew-blue-tertiary-50)" }}
            >
              <span className="text-neutral-700">{row.label}</span>
              <span
                className={cn(
                  "whitespace-nowrap tabular-nums",
                  row.strong
                    ? "font-semibold text-neutral-900"
                    : "text-gray-500"
                )}
              >
                {row.right}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Attention rail */}
      <div>
        <SectionHeading>Review readiness</SectionHeading>
        <div
          className="mt-2 flex items-center gap-4 rounded-lg border bg-white p-4"
          style={{ borderColor: "var(--ew-border)" }}
        >
          <ReadinessRing pct={readiness} />
          <div>
            <div
              className="text-sm font-semibold"
              style={{ color: "var(--ew-primary-navy)" }}
            >
              Review due 07 Oct 2026
            </div>
            <div className="mt-0.5 text-xs text-gray-500">
              5 of 11 checks passing.
            </div>
          </div>
        </div>

        <SectionHeading className="mt-6">
          Needs attention <span className="font-normal text-gray-500">· 6</span>
        </SectionHeading>
        <div className="mt-2 space-y-2">
          {QUEUE.map((item) => (
            <QueueItem
              key={item.queueId}
              item={item}
              done={resolved.has(item.queueId)}
              onClick={() => openPanel(item.panelId)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
