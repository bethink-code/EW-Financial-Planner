import { useState } from "react";
import { FileText } from "lucide-react";
import { HybridViewWrapper } from "@/components/common/hybrid-view-wrapper";
import { HybridHeaderBar } from "@/components/common/hybrid-header-bar";
import { SummaryBand, SummaryTile } from "@/components/common/summary-band";
import { SubcategoryNav, type SubcatItem } from "./subcategory-nav";
import { MiniCard } from "./primitives";
import { RISK_ROWS, type CoverRow } from "./data-holdings";
import { productGoalLabels, type ProductId } from "./data-links";
import type { PanelId } from "./data";
import type { Dir, ManagedFilter } from "./tab-investments";

const SUBCATS: SubcatItem[] = [
  { id: "all",               label: "All cover",           summary: "3 policies" },
  { id: "life",              label: "Life",                summary: "R 7 000 000 cover" },
  { id: "dread-disease",     label: "Dread disease",       summary: "No cover", empty: true },
  { id: "disability",        label: "Disability",          summary: "No cover", empty: true },
  { id: "income-disability", label: "Income disability",   summary: "No cover", empty: true },
  { id: "temp-disability",   label: "Temp disability",     summary: "No cover", empty: true },
];

const NEED_SUBCATS: SubcatItem[] = [
  { id: "all",        label: "All",        summary: "3 policies",         tone: "neutral" },
  { id: "life-cover", label: "Life cover", summary: "Cover not analysed", tone: "warn" },
];

const NEED_PRODUCT_IDS: Record<string, string[]> = {
  all:          ["liberty", "myriad", "oldmutual"],
  "life-cover": ["liberty", "myriad", "oldmutual"],
};

function PolicyCard({ row, openPanel }: { row: CoverRow; openPanel: (id: PanelId) => void }) {
  const goals = productGoalLabels(row.productId as ProductId);

  return (
    <div
      className="cursor-pointer rounded-lg border bg-white p-4 transition-shadow hover:shadow-sm"
      style={{ borderColor: "var(--ew-border)" }}
      onClick={() => openPanel(row.panelId)}
      role="button"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <div>
            <div className="text-[14px] font-semibold leading-tight" style={{ color: "var(--ew-primary-navy)" }}>
              {row.name}
            </div>
            <div className="mt-0.5 text-[11px] text-gray-500">{row.meta1} · {row.meta2}</div>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="text-[22px] font-bold tabular-nums text-neutral-900">{row.premium}</div>
        <div className="text-[11px] text-gray-400">Monthly premium</div>
      </div>

      <div className="mt-3">
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          Goals this covers
        </div>
        <div className="flex flex-wrap gap-2">
          {goals.length === 0
            ? <MiniCard label="Goal" value="Not yet assigned" tone="warn" />
            : goals.map((g) => (
                <MiniCard key={g} label={g} value={row.pill.label} tone={row.pill.tone} />
              ))
          }
        </div>
      </div>
    </div>
  );
}

interface TabRiskLtProps {
  dir: Dir;
  managedFilter: ManagedFilter;
  openPanel: (id: PanelId) => void;
  viewActions?: React.ReactNode;
}

export function TabRiskLt({ dir, managedFilter, openPanel, viewActions }: TabRiskLtProps) {
  const [selected, setSelected] = useState("all");

  const allNavItems = dir === "subcategory" ? SUBCATS : NEED_SUBCATS;
  const selectedLabel = allNavItems.find((s) => s.id === selected)?.label ?? "Long-term risk";

  const visibleRows = (() => {
    let rows = RISK_ROWS;
    if (selected !== "all") {
      if (dir === "subcategory") rows = selected === "life" ? rows : [];
      else {
        const ids = NEED_PRODUCT_IDS[selected] ?? [];
        rows = rows.filter((r) => ids.includes(r.productId));
      }
    }
    if (managedFilter === "managed")     rows = rows.filter((r) => r.managed);
    if (managedFilter === "not-managed") rows = rows.filter((r) => !r.managed);
    return rows;
  })();

  return (
    <HybridViewWrapper
      summary={
        <SummaryBand>
          <SummaryTile label="Total premiums" value="R 7 200 p.m."  subValue="across 3 policies" />
          <SummaryTile label="Life cover"     value="R 7 000 000"   subValue="Cover not analysed" />
        </SummaryBand>
      }
      header={
        <HybridHeaderBar
          add={{ label: "Add policy", onClick: () => {} }}
          title={selectedLabel}
          actions={viewActions}
        />
      }
      summaryCards={
        <SubcategoryNav
          items={allNavItems}
          selected={selected}
          onChange={setSelected}
        />
      }
      detailForms={
        visibleRows.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-gray-400">No policies in this selection</div>
        ) : (
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            {visibleRows.map((row) => (
              <PolicyCard key={row.productId} row={row} openPanel={openPanel} />
            ))}
          </div>
        )
      }
    />
  );
}
