import { useState } from "react";
import { ArrowUp, ArrowDown, ArrowRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PanelId } from "./data";
import {
  INVESTMENT_ROWS,
  SUBCATEGORY_LABELS,
  type InvestmentRow,
  type InvestmentSubcategory,
} from "./data-holdings";
import { productGoalLabels, type ProductId } from "./data-links";
import { Chip, ChipRow, FreshnessDot, SectionHeading } from "./primitives";
import { cardSurface, ListingSection, SectionAdd } from "./listings";
import {
  SegmentButton,
  SegmentGroup,
  ViewModeToggle,
  parseAmount,
  type Accessors,
  type SortOption,
  type ViewMode,
} from "./view";

type ManagedFilter = "all" | "managed" | "recorded";

/** Direction arrow derived from current vs prior-period IRR. */
function DirectionIcon({ row }: { row: InvestmentRow }) {
  if (row.irr === "—" || row.irrPrior == null) {
    return <ArrowRight className="h-3.5 w-3.5 text-gray-400" />;
  }
  const current = parseFloat(row.irr);
  if (current > row.irrPrior)
    return <ArrowUp className="h-3.5 w-3.5 text-green-600" />;
  if (current < row.irrPrior)
    return <ArrowDown className="h-3.5 w-3.5 text-red-500" />;
  return <ArrowRight className="h-3.5 w-3.5 text-gray-400" />;
}

/** "Recorded" badge — only shown on adviser-recorded (not managed) products. */
function RecordedBadge() {
  return (
    <span
      className="inline-flex items-center rounded-md border bg-white px-2 py-0.5 text-[11px] font-medium text-gray-500"
      style={{ borderColor: "#BDBDBD" }}
    >
      Recorded
    </span>
  );
}

/** Local/offshore split bar — compact, inline. */
function SplitBar({
  localPct,
  offshorePct,
}: {
  localPct: number;
  offshorePct: number;
}) {
  return (
    <div className="mt-1.5 min-w-[80px]">
      <div className="flex justify-between text-[10px] text-gray-400">
        <span>{localPct}%</span>
        <span>{offshorePct}%</span>
      </div>
      <div className="mt-0.5 flex h-1.5 overflow-hidden rounded-full">
        <div
          style={{ width: `${localPct}%`, backgroundColor: "var(--ew-blue)" }}
        />
        <div
          style={{ width: `${offshorePct}%`, backgroundColor: "#F97415" }}
        />
      </div>
      <div className="mt-0.5 flex justify-between text-[10px] text-gray-400">
        <span>Local</span>
        <span>Offshore</span>
      </div>
    </div>
  );
}

/** Compute per-subcategory totals and direction for chip rendering. */
function subcategoryStats(
  rows: InvestmentRow[],
  sub: InvestmentSubcategory
): { total: number; irr: string; direction: "up" | "down" | "flat" } {
  const items = rows.filter((r) => r.subcategory === sub);
  const total = items.reduce((s, r) => s + r.valueNum, 0);
  const withIrr = items.filter((r) => r.irr !== "—" && r.irrPrior != null);
  let irr = "—";
  let direction: "up" | "down" | "flat" = "flat";
  if (withIrr.length > 0) {
    const r = withIrr[0];
    irr = r.irr;
    const current = parseFloat(r.irr);
    direction =
      current > r.irrPrior! ? "up" : current < r.irrPrior! ? "down" : "flat";
  }
  return { total, irr, direction };
}

function fmtRand(n: number) {
  if (n === 0) return "R 0";
  return "R " + Math.round(n).toLocaleString("en-US").replace(/,/g, " ");
}

const SUBCATEGORIES: InvestmentSubcategory[] = [
  "unit-trust",
  "pension",
  "offshore",
  "shares",
  "tax-free",
];

const INVESTMENT_TOTAL_NUM = INVESTMENT_ROWS.reduce(
  (s, r) => s + r.valueNum,
  0
);

const ACCESSORS: Accessors<InvestmentRow> = {
  name: (r) => r.name,
  value: (r) => r.valueNum,
  date: (r) => r.date,
};

const SORT_OPTIONS: SortOption[] = [
  { value: "name", label: "Name (A–Z)", dir: "asc" },
  { value: "value", label: "Value (high–low)", dir: "desc" },
  { value: "date", label: "Last valued (newest first)", dir: "desc" },
];

const TABLE_COLUMNS = [
  { label: "Product", sortKey: "name" },
  { label: "Supplier / Policy" },
  { label: "Market value", right: true, sortKey: "value" },
  { label: "Local / Offshore" },
  { label: "Goals" },
];

interface TabInvestmentsProps {
  openPanel: (id: PanelId) => void;
  managedFilter: ManagedFilter;
  onManagedFilterChange: (f: ManagedFilter) => void;
}

export function TabInvestments({
  openPanel,
  managedFilter,
  onManagedFilterChange,
}: TabInvestmentsProps) {
  const [activeSub, setActiveSub] = useState<InvestmentSubcategory | null>(
    null
  );
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  const tdClass = "px-3 py-3 align-middle";
  const rowClass =
    "cursor-pointer border-b hover:bg-[var(--ew-row-tint)] transition-colors";

  const filteredByManaged = INVESTMENT_ROWS.filter((r) => {
    if (managedFilter === "managed") return r.managed;
    if (managedFilter === "recorded") return !r.managed;
    return true;
  });

  const displayRows = activeSub
    ? filteredByManaged.filter((r) => r.subcategory === activeSub)
    : filteredByManaged;

  const renderRow = (row: InvestmentRow) => {
    const goals = productGoalLabels(row.productId as ProductId);
    return (
      <tr
        key={row.productId}
        className={rowClass}
        style={{ borderColor: "var(--ew-border)" }}
        onClick={() => openPanel(row.panelId)}
      >
        <td className={cn(tdClass, "min-w-[180px]")}>
          <div className="flex items-start gap-2">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div>
              <div
                className="text-sm font-medium"
                style={{ color: "var(--ew-blue)" }}
              >
                {row.name}
              </div>
              <div className="mt-0.5 text-xs text-gray-500">
                Started {row.started} · {row.owners}
              </div>
              {!row.managed && (
                <div className="mt-1">
                  <RecordedBadge />
                </div>
              )}
            </div>
          </div>
        </td>
        <td className={tdClass}>
          <div className="text-[13px] text-neutral-700">{row.supplier}</div>
          <div className="text-xs text-gray-400">{row.policyNo}</div>
        </td>
        <td className={cn(tdClass, "text-right")}>
          <div className="font-semibold tabular-nums text-neutral-900">
            {row.value}
          </div>
          <div className="flex items-center justify-end gap-1 text-xs text-gray-400">
            <FreshnessDot tone={row.freshness} />
            {row.date}
          </div>
          {row.irr !== "—" && (
            <div className="text-xs tabular-nums text-gray-500">
              IRR {row.irr}
            </div>
          )}
        </td>
        <td className={tdClass}>
          <SplitBar localPct={row.localPct} offshorePct={row.offshorePct} />
        </td>
        <td className={tdClass}>
          <ChipRow tags={goals} />
        </td>
      </tr>
    );
  };

  const renderCard = (row: InvestmentRow) => {
    const goals = productGoalLabels(row.productId as ProductId);
    return (
      <div
        key={row.productId}
        className="cursor-pointer rounded-lg border p-3.5 transition-shadow hover:shadow-sm"
        style={cardSurface}
        onClick={() => openPanel(row.panelId)}
        role="button"
      >
        <div className="flex items-start gap-2">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div
                className="text-sm font-medium"
                style={{ color: "var(--ew-blue)" }}
              >
                {row.name}
              </div>
              {!row.managed && <RecordedBadge />}
            </div>
            <div className="mt-0.5 text-xs text-gray-500">
              {row.supplier} · {row.policyNo}
            </div>
            <div className="mt-2 text-lg font-semibold tabular-nums text-neutral-900">
              {row.value}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <FreshnessDot tone={row.freshness} />
              {row.date}
              {row.irr !== "—" && (
                <span className="ml-1 text-gray-500">· IRR {row.irr}</span>
              )}
            </div>
            <SplitBar localPct={row.localPct} offshorePct={row.offshorePct} />
            {goals.length > 0 && (
              <div className="mt-2">
                <div className="mb-1 text-[11px] text-gray-400">Goals</div>
                <ChipRow tags={goals} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[13px] text-gray-500">Total investments</div>
          <div className="text-[28px] font-semibold tabular-nums text-neutral-900">
            {fmtRand(INVESTMENT_TOTAL_NUM)}
          </div>
          <div className="text-xs text-gray-400">Market value · 06/10/2025</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Show</span>
          <select
            className="h-8 rounded-md border border-[#E0E0E0] bg-white px-2.5 text-xs text-neutral-900 focus:border-[var(--ew-blue)] focus:outline-none"
            value={managedFilter}
            onChange={(e) =>
              onManagedFilterChange(e.target.value as ManagedFilter)
            }
          >
            <option value="all">All products</option>
            <option value="managed">Managed only</option>
            <option value="recorded">Recorded only</option>
          </select>
        </div>
      </div>

      {/* Subcategory chips */}
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveSub(null)}
          className={cn(
            "flex flex-col items-start rounded-lg border px-3.5 py-2.5 text-left text-[13px] transition-colors",
            activeSub === null
              ? "border-[var(--ew-blue)] bg-[var(--ew-blue-tertiary-50)]"
              : "border-[var(--ew-border)] bg-white hover:bg-[var(--ew-row-tint)]"
          )}
        >
          <span
            className="font-semibold"
            style={{
              color: activeSub === null ? "var(--ew-blue)" : "var(--ew-primary-navy)",
            }}
          >
            All categories
          </span>
          <span className="tabular-nums text-neutral-900">
            {fmtRand(INVESTMENT_TOTAL_NUM)}
          </span>
        </button>
        {SUBCATEGORIES.map((sub) => {
          const stats = subcategoryStats(INVESTMENT_ROWS, sub);
          const active = activeSub === sub;
          const DirIcon =
            stats.direction === "up"
              ? ArrowUp
              : stats.direction === "down"
              ? ArrowDown
              : ArrowRight;
          const dirColor =
            stats.direction === "up"
              ? "#1DB247"
              : stats.direction === "down"
              ? "#E4410D"
              : "#9CA3AF";
          return (
            <button
              key={sub}
              type="button"
              onClick={() => setActiveSub(active ? null : sub)}
              className={cn(
                "flex flex-col items-start rounded-lg border px-3.5 py-2.5 text-left text-[13px] transition-colors",
                active
                  ? "border-[var(--ew-blue)] bg-[var(--ew-blue-tertiary-50)]"
                  : "border-[var(--ew-border)] bg-white hover:bg-[var(--ew-row-tint)]"
              )}
            >
              <span className="flex items-center gap-1.5">
                <DirIcon
                  className="h-3.5 w-3.5"
                  style={{ color: dirColor }}
                />
                <span
                  className="font-semibold"
                  style={{
                    color: active ? "var(--ew-blue)" : "var(--ew-primary-navy)",
                  }}
                >
                  {SUBCATEGORY_LABELS[sub]}
                </span>
              </span>
              <span
                className={cn(
                  "tabular-nums",
                  stats.total === 0 ? "text-gray-400" : "text-neutral-900"
                )}
              >
                {fmtRand(stats.total)}
              </span>
              <span className="text-[11px] text-gray-400">
                {stats.irr !== "—" ? `IRR ${stats.irr}` : "IRR —"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Product list */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <SectionHeading>
            {activeSub ? SUBCATEGORY_LABELS[activeSub] : "All investments"}
            <span className="ml-2 text-base font-normal text-gray-400">
              ({displayRows.length})
            </span>
          </SectionHeading>
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
        </div>

        <ListingSection
          viewMode={viewMode}
          columns={TABLE_COLUMNS}
          rows={displayRows}
          accessors={ACCESSORS}
          sortOptions={SORT_OPTIONS}
          renderRow={renderRow}
          renderCard={renderCard}
          addLabel="Add an investment"
        />
      </div>
    </div>
  );
}

export type { ManagedFilter };
