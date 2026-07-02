import { useState } from "react";
import { CustomTabs } from "@/components/ui/custom-tabs";
import { SegmentButton, SegmentGroup, ViewModeToggle, type ViewMode } from "./view";
import { TabOverview } from "./tab-overview";
import { TabInvestments, type Dir } from "./tab-investments";
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
  const [activeTab, setActiveTab]     = useState<PortfolioTab>("overview");
  const [dir, setDir]                 = useState<Dir>("subcategory");
  const [viewMode, setViewMode]       = useState<ViewMode>("cards");
  const [openPanelId, setOpenPanelId] = useState<PanelId | null>(null);

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
      <ViewModeToggle mode={viewMode} onChange={setViewMode} />
    </div>
  );

  return (
    <div className="w-full px-6 pb-2">

      {/* Category tabs */}
      <CustomTabs
        tabs={PORTFOLIO_TABS}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as PortfolioTab)}
        className="mb-0"
      />

      {/* Tab content */}
      {activeTab === "overview" ? (
        <TabOverview openTab={setActiveTab} />
      ) : activeTab === "investments" ? (
        <TabInvestments dir={dir} managedFilter="all" viewMode={viewMode} openPanel={openPanel} viewActions={viewActions} />
      ) : activeTab === "risk-lt" ? (
        <TabRiskLt dir={dir} managedFilter="all" viewMode={viewMode} openPanel={openPanel} viewActions={viewActions} />
      ) : activeTab === "risk-st" ? (
        <TabRiskSt dir={dir} managedFilter="all" viewMode={viewMode} openPanel={openPanel} viewActions={viewActions} />
      ) : (
        <TabMedical dir={dir} managedFilter="all" viewMode={viewMode} openPanel={openPanel} viewActions={viewActions} />
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
