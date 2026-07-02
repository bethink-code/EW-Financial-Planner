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

  // View-level controls — rendered in each data tab's header-bar action slot
  // (zone 4), where DEL puts Duplicate/Delete. State stays here so the choice
  // persists across tabs; the node is handed down to each tab.
  const viewActions = (
    <div className="flex items-center gap-5">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">View by</span>
        <SegmentGroup>
          <SegmentButton active={dir === "subcategory"} onClick={() => setDir("subcategory")}>Product</SegmentButton>
          <SegmentButton active={dir === "need"}        onClick={() => setDir("need")}>Need</SegmentButton>
        </SegmentGroup>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Show</span>
        <SegmentGroup>
          <SegmentButton active={managedFilter === "all"}         onClick={() => setManagedFilter("all")}>All</SegmentButton>
          <SegmentButton active={managedFilter === "managed"}     onClick={() => setManagedFilter("managed")}>Managed</SegmentButton>
          <SegmentButton active={managedFilter === "not-managed"} onClick={() => setManagedFilter("not-managed")}>Not managed</SegmentButton>
        </SegmentGroup>
      </div>
    </div>
  );

  return (
    <div className="w-full px-6 pt-6 pb-2">

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
        <TabInvestments dir={dir} managedFilter={managedFilter} openPanel={openPanel} viewActions={viewActions} />
      ) : activeTab === "risk-lt" ? (
        <TabRiskLt dir={dir} managedFilter={managedFilter} openPanel={openPanel} viewActions={viewActions} />
      ) : activeTab === "risk-st" ? (
        <TabRiskSt dir={dir} managedFilter={managedFilter} openPanel={openPanel} viewActions={viewActions} />
      ) : (
        <TabMedical dir={dir} managedFilter={managedFilter} openPanel={openPanel} viewActions={viewActions} />
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
