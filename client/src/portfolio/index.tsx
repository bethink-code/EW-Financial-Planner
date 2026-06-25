import { useState } from "react";
import { CustomTabs } from "@/components/ui/custom-tabs";
import { SegmentButton, SegmentGroup } from "./view";
import { TabOverview } from "./tab-overview";
import { TabInvestments, type Dir, type ManagedFilter } from "./tab-investments";
import { TabRiskLt } from "./tab-risk-lt";
import { TabRiskSt } from "./tab-risk-st";
import { TabMedical } from "./tab-medical";
import { PanelHost } from "./panel-host";
import type { PanelId, PortfolioTab } from "./data";

const PORTFOLIO_TABS = [
  { id: "overview",    label: "Overview" },
  { id: "investments", label: "Investments" },
  { id: "risk-lt",     label: "Long-term risk" },
  { id: "risk-st",     label: "Short-term risk" },
  { id: "medical",     label: "Medical aid" },
];

export default function PortfolioPage() {
  const [activeTab, setActiveTab]         = useState<PortfolioTab>("overview");
  const [dir, setDir]                     = useState<Dir>("subcategory");
  const [managedFilter, setManagedFilter] = useState<ManagedFilter>("all");
  const [openPanelId, setOpenPanelId]     = useState<PanelId | null>(null);

  const openPanel  = (id: PanelId) => setOpenPanelId(id);
  const closePanel = () => setOpenPanelId(null);

  return (
    <div className="w-full px-6 pt-6 pb-2">

      {/* Summary card */}
      <div
        className="mb-5 rounded-lg border bg-white px-5 py-4"
        style={{ borderColor: "var(--ew-border)", boxShadow: "1px 4px 9px 0 rgba(98,124,149,0.1)" }}
      >
        {/* Headline */}
        <div className="text-[12px] text-gray-500">Total portfolio value</div>
        <div className="mt-0.5 flex items-baseline gap-3">
          <span className="text-[28px] font-bold tabular-nums text-neutral-900">R 3 031 961</span>
          <span className="text-[13px] text-gray-400">Market value · 06/10/2025</span>
          <span className="text-[13px] font-semibold" style={{ color: "#F97415" }}>· IRR 9.2%</span>
        </div>

        {/* Cream band — toggles sit here, mirroring retirement planning's Values controls */}
        <div
          className="mt-3 flex items-center justify-end gap-6 rounded-lg px-4 py-3"
          style={{ backgroundColor: "#FAF5EA", border: "1px solid #ECE5D3" }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-[12px]" style={{ color: "#A55A2A" }}>View by</span>
            <SegmentGroup>
              <SegmentButton active={dir === "subcategory"} onClick={() => setDir("subcategory")}>Product</SegmentButton>
              <SegmentButton active={dir === "need"}        onClick={() => setDir("need")}>Need</SegmentButton>
            </SegmentGroup>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[12px]" style={{ color: "#A55A2A" }}>Show</span>
            <SegmentGroup>
              <SegmentButton active={managedFilter === "all"}         onClick={() => setManagedFilter("all")}>All</SegmentButton>
              <SegmentButton active={managedFilter === "managed"}     onClick={() => setManagedFilter("managed")}>Managed</SegmentButton>
              <SegmentButton active={managedFilter === "not-managed"} onClick={() => setManagedFilter("not-managed")}>Not managed</SegmentButton>
            </SegmentGroup>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <CustomTabs
        tabs={PORTFOLIO_TABS}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as PortfolioTab)}
        className="mb-0"
      />

      {/* Tab content */}
      {activeTab === "overview" ? (
        <div className="mt-6"><TabOverview managedFilter={managedFilter} /></div>
      ) : activeTab === "investments" ? (
        <TabInvestments dir={dir} managedFilter={managedFilter} openPanel={openPanel} />
      ) : activeTab === "risk-lt" ? (
        <TabRiskLt dir={dir} managedFilter={managedFilter} openPanel={openPanel} />
      ) : activeTab === "risk-st" ? (
        <TabRiskSt dir={dir} managedFilter={managedFilter} openPanel={openPanel} />
      ) : (
        <TabMedical dir={dir} managedFilter={managedFilter} openPanel={openPanel} />
      )}

      <PanelHost
        openPanelId={openPanelId}
        onClose={closePanel}
        onResolve={closePanel}
        onAssign={() => closePanel()}
      />
    </div>
  );
}
