import { useState } from "react";
import { HybridViewWrapper } from "@/components/common/hybrid-view-wrapper";
import { HybridHeaderBar } from "@/components/common/hybrid-header-bar";
import { SubcategoryNav, type SubcatItem } from "./subcategory-nav";
import { CoverPolicyCard, CoverPolicyTable } from "./listings";
import { MEDICAL_ROWS } from "./data-holdings";
import type { ViewMode } from "./view";
import type { PanelId } from "./data";
import type { Dir, ManagedFilter } from "./tab-investments";

const SUBCATS: SubcatItem[] = [
  { id: "all",       label: "All cover",      summary: "1 policy" },
  { id: "medical",   label: "Medical aid",    summary: "Discovery" },
  { id: "gap-cover", label: "Gap cover",      summary: "No cover", empty: true },
  { id: "hospital",  label: "Hospital plan",  summary: "No cover", empty: true },
];

const NEED_SUBCATS: SubcatItem[] = [
  { id: "all",     label: "All",         summary: "1 policy",  tone: "neutral" },
  { id: "medical", label: "Medical aid", summary: "In force",  tone: "good" },
];

interface TabMedicalProps {
  dir: Dir;
  managedFilter: ManagedFilter;
  viewMode: ViewMode;
  openPanel: (id: PanelId) => void;
  viewActions?: React.ReactNode;
}

export function TabMedical({ dir, managedFilter, viewMode, openPanel, viewActions }: TabMedicalProps) {
  const [selected, setSelected] = useState("all");

  const allNavItems = dir === "subcategory" ? SUBCATS : NEED_SUBCATS;
  const selectedLabel = allNavItems.find((s) => s.id === selected)?.label ?? "Medical aid";

  const visibleRows = (() => {
    let rows = MEDICAL_ROWS;
    if (selected !== "all") {
      rows = selected === "medical" ? rows : [];
    }
    if (managedFilter === "managed")     rows = rows.filter((r) => r.managed);
    if (managedFilter === "not-managed") rows = rows.filter((r) => !r.managed);
    return rows;
  })();

  return (
    <HybridViewWrapper
      header={
        <HybridHeaderBar
          add={{ label: "Add policy", onClick: () => {} }}
          title={selectedLabel}
          meta="R 6 700 p.m. · 1 policy"
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
        ) : viewMode === "table" ? (
          <CoverPolicyTable rows={visibleRows} openPanel={openPanel} />
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
