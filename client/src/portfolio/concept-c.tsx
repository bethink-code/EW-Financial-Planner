import { cn } from "@/lib/utils";
import type { PanelId } from "./data";
import { QUEUE } from "./data-attention";
import { HOLDING_ROWS, REVIEW_ROWS, type HoldingRow } from "./data-holdings";
import { MINI_GOALS, type MiniGoal } from "./data-plan";
import {
  ChipRow,
  FreshnessDot,
  ProgressBar,
  ReadinessRing,
  SectionHeading,
  StatusCard,
} from "./primitives";
import { QueueItem } from "./attention";
import { RefetchBar } from "./content-patterns";
import { benefitTags } from "./data-risk";
import {
  cardSurface,
  ListingSection,
  ProductCard,
  type ColumnDef,
} from "./listings";
import {
  parseAmount,
  parseDmy,
  type Accessors,
  type SortOption,
  type ViewMode,
} from "./view";

/**
 * Concept C — "Command centre". Plan strip + holdings in the main column,
 * review readiness and the full attention queue as a persistent right rail.
 * Resolving a queue item (via its fix panel) lifts the readiness ring live.
 */

interface ConceptCProps {
  openPanel: (id: PanelId) => void;
  readiness: number;
  resolved: Set<number>;
  viewMode: ViewMode;
}

const HOLDING_ACCESSORS: Accessors<HoldingRow> = {
  name: (r) => r.name,
  value: (r) => parseAmount(r.value),
  date: (r) => parseDmy(r.date),
};

const HOLDING_SORTS: SortOption[] = [
  { value: "name", label: "Name (A–Z)", dir: "asc" },
  { value: "value", label: "Value (high–low)", dir: "desc" },
  { value: "date", label: "As at (oldest first)", dir: "asc" },
];

const HOLDING_COLUMNS: ColumnDef[] = [
  { label: "Instrument", sortKey: "name" },
  { label: "Purpose" },
  { label: "Value / premium", right: true, sortKey: "value" },
  { label: "Last valuation", sortKey: "date" },
];

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
        "cursor-pointer rounded-lg border p-3 transition-shadow hover:shadow-sm motion-reduce:transition-none",
        goal.gap && "border-dashed"
      )}
      style={
        goal.gap
          ? { backgroundColor: "#FFF9F7", borderColor: "#F0B9AC" }
          : cardSurface
      }
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

export function ConceptC({
  openPanel,
  readiness,
  resolved,
  viewMode,
}: ConceptCProps) {
  const asAt = (row: HoldingRow) =>
    row.date ? (
      <span className="flex items-center gap-1.5 whitespace-nowrap tabular-nums">
        <FreshnessDot tone={row.freshness!} />
        {row.date}
      </span>
    ) : (
      <span className="text-gray-400">—</span>
    );

  const holdingRow = (row: HoldingRow) => {
    const tags = benefitTags(row.panelId);
    return (
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
          {row.purpose ?? <StatusCard label="Not set" tone="neutral" />}
          {tags.length > 0 && (
            <div className="mt-1.5">
              <ChipRow tags={tags} />
            </div>
          )}
        </td>
        <td className="px-3 py-2.5 text-right tabular-nums">{row.value}</td>
        <td className="px-3 py-2.5">{asAt(row)}</td>
      </tr>
    );
  };

  const holdingCard = (row: HoldingRow) => {
    const monthly = row.value.endsWith(" p.m.");
    const tags = benefitTags(row.panelId);
    return (
      <ProductCard
        key={row.name}
        name={row.name}
        sub={row.purpose ? `Purpose · ${row.purpose}` : undefined}
        pill={row.purpose ? undefined : { label: "Not set", tone: "neutral" }}
        value={monthly ? row.value.replace(" p.m.", "") : row.value}
        valueSuffix={monthly ? "p.m." : undefined}
        foot={
          row.date ? (
            <span className="flex items-center gap-1.5 tabular-nums">
              <FreshnessDot tone={row.freshness!} />
              Last valued {row.date}
            </span>
          ) : tags.length > 0 ? (
            <ChipRow tags={tags} />
          ) : undefined
        }
        onClick={() => openPanel(row.panelId)}
      />
    );
  };

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

        <RefetchBar
          asAt="06/10/2025"
          staleNote="3 of 4 valuations need updating"
        />

        <ListingSection
          title="Holdings"
          viewMode={viewMode}
          columns={HOLDING_COLUMNS}
          rows={HOLDING_ROWS}
          accessors={HOLDING_ACCESSORS}
          sortOptions={HOLDING_SORTS}
          renderRow={holdingRow}
          renderCard={holdingCard}
          gridClass="sm:grid-cols-2 xl:grid-cols-3"
        />

        <SectionHeading className="mt-6">
          Since last review · 07 Oct 2025
        </SectionHeading>
        <div className="mt-2 rounded-md border border-neutral-200 bg-white px-4 py-2 shadow-sm">
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
          className="mt-2 flex items-center gap-4 rounded-lg border p-4"
          style={cardSurface}
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
