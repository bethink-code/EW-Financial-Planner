import { useState } from "react";
import { FileText } from "lucide-react";
import { HybridViewWrapper } from "@/components/common/hybrid-view-wrapper";
import { HybridHeaderBar } from "@/components/common/hybrid-header-bar";
import { SummaryBand, SummaryTile } from "@/components/common/summary-band";
import { SubcategoryNav, type SubcatItem } from "./subcategory-nav";
import { MiniCard } from "./primitives";
import { SHORT_TERM_ROWS, type CoverRow } from "./data-holdings";
import { productGoalLabels, type ProductId } from "./data-links";
import type { PanelId } from "./data";
import type { Dir, ManagedFilter } from "./tab-investments";

const SUBCATS: SubcatItem[] = [
  { id: "all",      label: "All cover",        summary: "1 policy" },
  { id: "home",     label: "Home insurance",   summary: "Santam" },
  { id: "contents", label: "Home contents",    summary: "No cover", empty: true },
  { id: "vehicle",  label: "Vehicle",          summary: "No cover", empty: true },
  { id: "other",    label: "Other",            summary: "No cover", empty: true },
];

const NEED_SUBCATS: SubcatItem[] = [
  { id: "all",        label: "All",              summary: "1 policy",    tone: "neutral" },
  { id: "short-term", label: "Short-term cover", summary: "In force",    tone: "good" },
];

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

interface TabRiskStProps {
  dir: Dir;
  managedFilter: ManagedFilter;
  openPanel: (id: PanelId) => void;
  viewActions?: React.ReactNode;
}

export function TabRiskSt({ dir, managedFilter, openPanel, viewActions }: TabRiskStProps) {
  const [selected, setSelected] = useState("all");

  const allNavItems = dir === "subcategory" ? SUBCATS : NEED_SUBCATS;
  const selectedLabel = allNavItems.find((s) => s.id === selected)?.label ?? "Short-term risk";

  const visibleRows = (() => {
    let rows = SHORT_TERM_ROWS;
    if (selected !== "all") {
      if (dir === "subcategory") rows = selected === "home" ? rows : [];
      else rows = selected === "short-term" ? rows : [];
    }
    if (managedFilter === "managed")     rows = rows.filter((r) => r.managed);
    if (managedFilter === "not-managed") rows = rows.filter((r) => !r.managed);
    return rows;
  })();

  return (
    <HybridViewWrapper
      summary={
        <SummaryBand>
          <SummaryTile label="Total premiums"   value="R 3 400 p.m." subValue="1 policy" />
          <SummaryTile label="Short-term cover" value="In force"      subValue="1 policy" />
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
