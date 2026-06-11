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
} from "./data-holdings";
import {
  FreshnessDot,
  KpiTile,
  SectionHeading,
  StatusPill,
} from "./primitives";
import { AttentionStrip } from "./attention";

/**
 * Concept A — "At a glance". The familiar category-grouped product view,
 * elevated into a scannable snapshot: KPI band, attention strip, household
 * filters (decorative in the mockup), category tables.
 */

interface ConceptAProps {
  openPanel: (id: PanelId) => void;
  readiness: number;
  resolved: Set<number>;
  expanded: boolean;
  onToggle: () => void;
}

// !normal-case: the app-wide `table thead th` rule uppercases headers; the
// concept deck uses sentence case throughout.
const thClass =
  "px-3 py-2 text-left text-xs font-medium text-gray-600 !normal-case";
const tdClass = "px-3 py-2.5 align-middle";

function CategoryTable({
  headers,
  children,
}: {
  headers: { label: string; right?: boolean }[];
  children: React.ReactNode;
}) {
  return (
    <table className="mt-2 w-full text-sm">
      <thead>
        <tr style={{ backgroundColor: "var(--ew-blue-tertiary-50)" }}>
          {headers.map((h) => (
            <th key={h.label} className={cn(thClass, h.right && "text-right")}>
              {h.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

const rowClass = "cursor-pointer border-b hover:bg-[var(--ew-row-tint)]";
const rowStyle = { borderColor: "var(--ew-border)" } as const;

function CoverRows({
  rows,
  openPanel,
}: {
  rows: CoverRow[];
  openPanel: (id: PanelId) => void;
}) {
  return (
    <>
      {rows.map((row) => (
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
          <td className={cn(tdClass, "text-right tabular-nums")}>
            {row.premium}
          </td>
          <td className={tdClass}>
            <StatusPill label={row.pill.label} tone={row.pill.tone} />
          </td>
        </tr>
      ))}
    </>
  );
}

export function ConceptA({
  openPanel,
  readiness,
  resolved,
  expanded,
  onToggle,
}: ConceptAProps) {
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

      {/* Investments */}
      <SectionHeading className="mt-6">
        Investments — R 3 031 961
      </SectionHeading>
      <CategoryTable
        headers={[
          { label: "Instrument" },
          { label: "Category" },
          { label: "Supplier" },
          { label: "Premium / income", right: true },
          { label: "Current value", right: true },
          { label: "Valuation" },
        ]}
      >
        {INVESTMENT_ROWS.map((row) => (
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
            <td className={cn(tdClass, "text-right tabular-nums")}>
              {row.premium}
            </td>
            <td
              className={cn(tdClass, "text-right font-semibold tabular-nums")}
            >
              {row.value}
            </td>
            <td className={tdClass}>
              <span className="flex items-center gap-1.5 whitespace-nowrap tabular-nums">
                <FreshnessDot tone={row.freshness} />
                {row.date}
              </span>
            </td>
          </tr>
        ))}
      </CategoryTable>

      {/* Risk */}
      <SectionHeading className="mt-6">Risk — R 7 200 p.m.</SectionHeading>
      <CategoryTable
        headers={[
          { label: "Instrument" },
          { label: "Supplier" },
          { label: "Reference" },
          { label: "Premium", right: true },
          { label: "Status" },
        ]}
      >
        <CoverRows rows={RISK_ROWS} openPanel={openPanel} />
      </CategoryTable>

      {/* Medical aid & short term */}
      <SectionHeading className="mt-6">
        Medical aid & short term — R 10 100 p.m.
      </SectionHeading>
      <CategoryTable
        headers={[
          { label: "Instrument" },
          { label: "Category" },
          { label: "Supplier" },
          { label: "Premium", right: true },
          { label: "Status" },
        ]}
      >
        <CoverRows rows={MEDICAL_ROWS} openPanel={openPanel} />
      </CategoryTable>
    </div>
  );
}
