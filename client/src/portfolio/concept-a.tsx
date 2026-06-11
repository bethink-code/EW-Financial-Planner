import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PanelId } from "./data";
import { STRIP_A } from "./data-attention";
import {
  HOUSEHOLD_CHIPS,
  INVESTMENT_ROWS,
  KPIS,
  MEDICAL_ROWS,
  RISK_ROWS,
  type CoverRow,
  type InvestmentRow,
} from "./data-holdings";
import { FreshnessDot, KpiTile, StatusPill } from "./primitives";
import { AttentionStrip } from "./attention";
import { ListingSection, ProductCard, type ColumnDef } from "./listings";
import {
  parseAmount,
  parseDmy,
  type Accessors,
  type SortOption,
  type ViewMode,
} from "./view";

/**
 * Concept A — "At a glance". The familiar category-grouped product view,
 * elevated into a scannable snapshot: KPI band, attention strip, household
 * filters (decorative in the mockup), category listings (table or cards).
 */

interface ConceptAProps {
  openPanel: (id: PanelId) => void;
  readiness: number;
  resolved: Set<number>;
  expanded: boolean;
  onToggle: () => void;
  viewMode: ViewMode;
}

const tdClass = "px-3 py-2.5 align-middle";
const rowClass = "cursor-pointer border-b hover:bg-[var(--ew-row-tint)]";
const rowStyle = { borderColor: "var(--ew-border)" } as const;

const INVESTMENT_ACCESSORS: Accessors<InvestmentRow> = {
  name: (r) => r.name,
  value: (r) => parseAmount(r.value),
  premium: (r) => parseAmount(r.premium),
  date: (r) => parseDmy(r.date),
};

const INVESTMENT_SORTS: SortOption[] = [
  { value: "name", label: "Name (A–Z)", dir: "asc" },
  { value: "value", label: "Value (high–low)", dir: "desc" },
  { value: "date", label: "Valuation (oldest first)", dir: "asc" },
];

const COVER_ACCESSORS: Accessors<CoverRow> = {
  name: (r) => r.name,
  premium: (r) => parseAmount(r.premium),
};

const COVER_SORTS: SortOption[] = [
  { value: "name", label: "Name (A–Z)", dir: "asc" },
  { value: "premium", label: "Premium (high–low)", dir: "desc" },
];

const INVESTMENT_COLUMNS: ColumnDef[] = [
  { label: "Instrument", sortKey: "name" },
  { label: "Category" },
  { label: "Supplier" },
  { label: "Premium / income", right: true, sortKey: "premium" },
  { label: "Current value", right: true, sortKey: "value" },
  { label: "Valuation", sortKey: "date" },
];

const coverColumns = (meta1: string, meta2: string): ColumnDef[] => [
  { label: "Instrument", sortKey: "name" },
  { label: meta1 },
  { label: meta2 },
  { label: "Premium", right: true, sortKey: "premium" },
  { label: "Status" },
];

export function ConceptA({
  openPanel,
  readiness,
  resolved,
  expanded,
  onToggle,
  viewMode,
}: ConceptAProps) {
  const investmentRow = (row: InvestmentRow) => (
    <tr
      key={row.name}
      className={rowClass}
      style={rowStyle}
      onClick={() => openPanel(row.panelId)}
    >
      <td
        className={cn(tdClass, "font-medium")}
        style={{ color: "var(--ew-blue)" }}
      >
        {row.name}
      </td>
      <td className={tdClass}>{row.category}</td>
      <td className={tdClass}>{row.supplier}</td>
      <td className={cn(tdClass, "text-right tabular-nums")}>{row.premium}</td>
      <td className={cn(tdClass, "text-right font-semibold tabular-nums")}>
        {row.value}
      </td>
      <td className={tdClass}>
        <span className="flex items-center gap-1.5 whitespace-nowrap tabular-nums">
          <FreshnessDot tone={row.freshness} />
          {row.date}
        </span>
      </td>
    </tr>
  );

  const investmentCard = (row: InvestmentRow) => (
    <ProductCard
      key={row.name}
      name={row.name}
      sub={`${row.category} · ${row.supplier}`}
      value={row.value}
      foot={
        <>
          <span className="flex items-center gap-1.5 tabular-nums">
            <FreshnessDot tone={row.freshness} />
            {row.date}
          </span>
          {row.premium !== "—" && (
            <span className="tabular-nums">Contributing {row.premium}</span>
          )}
        </>
      }
      onClick={() => openPanel(row.panelId)}
    />
  );

  const coverRow = (row: CoverRow) => (
    <tr
      key={row.name}
      className={rowClass}
      style={rowStyle}
      onClick={() => openPanel(row.panelId)}
    >
      <td
        className={cn(tdClass, "font-medium")}
        style={{ color: "var(--ew-blue)" }}
      >
        {row.name}
      </td>
      <td className={tdClass}>{row.meta1}</td>
      <td className={tdClass}>{row.meta2}</td>
      <td className={cn(tdClass, "text-right tabular-nums")}>{row.premium}</td>
      <td className={tdClass}>
        <StatusPill label={row.pill.label} tone={row.pill.tone} />
      </td>
    </tr>
  );

  const coverCard = (row: CoverRow) => (
    <ProductCard
      key={row.name}
      name={row.name}
      sub={`${row.meta1} · ${row.meta2}`}
      pill={row.pill}
      value={row.premium.replace(" p.m.", "")}
      valueSuffix="p.m."
      onClick={() => openPanel(row.panelId)}
    />
  );

  return (
    <div>
      {/* KPI band */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((kpi) => (
          <KpiTile key={kpi.label} {...kpi} />
        ))}
      </div>

      <AttentionStrip
        copy={STRIP_A}
        readiness={readiness}
        expanded={expanded}
        onToggle={onToggle}
        openPanel={openPanel}
        resolved={resolved}
      />

      {/* Household filters (decorative in the mockup) */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {HOUSEHOLD_CHIPS.map((chip) => (
          <button
            key={chip.label}
            type="button"
            className={cn(
              "h-8 rounded-full border px-3 text-[13px]",
              chip.on
                ? "border-transparent text-white"
                : "border-[#E0E0E0] bg-white text-gray-600"
            )}
            style={chip.on ? { backgroundColor: "var(--ew-blue)" } : undefined}
          >
            {chip.label}
          </button>
        ))}
        <button
          type="button"
          className="ml-auto h-8 rounded-full border border-[#E0E0E0] bg-white px-3 text-[13px] text-gray-600"
        >
          In force only ✓
        </button>
        <button
          type="button"
          className="flex h-8 items-center gap-1 rounded-full border border-[#E0E0E0] bg-white px-3 text-[13px] text-gray-600"
        >
          ZAR <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      <ListingSection
        title="Investments — R 3 031 961"
        viewMode={viewMode}
        columns={INVESTMENT_COLUMNS}
        rows={INVESTMENT_ROWS}
        accessors={INVESTMENT_ACCESSORS}
        sortOptions={INVESTMENT_SORTS}
        renderRow={investmentRow}
        renderCard={investmentCard}
      />

      <ListingSection
        title="Risk — R 7 200 p.m."
        viewMode={viewMode}
        columns={coverColumns("Supplier", "Reference")}
        rows={RISK_ROWS}
        accessors={COVER_ACCESSORS}
        sortOptions={COVER_SORTS}
        renderRow={coverRow}
        renderCard={coverCard}
      />

      <ListingSection
        title="Medical aid & short term — R 10 100 p.m."
        viewMode={viewMode}
        columns={coverColumns("Category", "Supplier")}
        rows={MEDICAL_ROWS}
        accessors={COVER_ACCESSORS}
        sortOptions={COVER_SORTS}
        renderRow={coverRow}
        renderCard={coverCard}
      />
    </div>
  );
}
