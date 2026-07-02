import { useState } from "react";
import { HybridViewWrapper } from "@/components/common/hybrid-view-wrapper";
import { HybridHeaderBar } from "@/components/common/hybrid-header-bar";
import { SummaryBand, SummaryTile } from "@/components/common/summary-band";
import { SubcategoryNav, type SubcatItem } from "./subcategory-nav";
import { CoverPolicyCard } from "./listings";
import { RISK_ROWS } from "./data-holdings";
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
        <SummaryBand
          tileFit="hug"
          firstSlot={
            <SummaryTile
              variant="accent"
              label="Life cover"
              value="R 7 000 000"
              subValue="Cover not analysed"
            />
          }
        >
          <SummaryTile label="Total premiums" value="R 7 200 p.m." subValue="across 3 policies" />
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
              <CoverPolicyCard key={row.productId} row={row} openPanel={openPanel} />
            ))}
          </div>
        )
      }
    />
  );
}
