import { useContext, useState } from "react";
import { cn } from "@/lib/utils";
import { PresenterContext } from "./layout";
import {
  CONCEPTS,
  FOOTNOTE,
  READINESS_BASE,
  READINESS_PER_ITEM,
  type ConceptId,
  type PanelId,
  type PortfolioTab,
} from "./data";
import { CustomTabs } from "@/components/ui/custom-tabs";
import { TabOverview } from "./tab-overview";
import { TabInvestments, type ManagedFilter } from "./tab-investments";
import { TabRiskLt } from "./tab-risk-lt";
import { TabRiskSt } from "./tab-risk-st";
import { TabMedical } from "./tab-medical";
import { ConceptB } from "./concept-b";
import { PanelHost } from "./panel-host";

const PORTFOLIO_TABS = [
  { id: "overview", label: "Overview" },
  { id: "investments", label: "Investments" },
  { id: "risk-lt", label: "Long-term risk" },
  { id: "risk-st", label: "Short-term risk" },
  { id: "medical", label: "Medical aid" },
];

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState<PortfolioTab>("investments");
  const [activeConcept, setActiveConcept] = useState<ConceptId>("a");
  const [managedFilter, setManagedFilter] = useState<ManagedFilter>("all");
  const [openPanelId, setOpenPanelId] = useState<PanelId | null>(null);
  const [resolved, setResolved] = useState<Set<number>>(new Set());
  const [assignedPurpose, setAssignedPurpose] = useState<string | null>(null);

  const { open: presenterOpen, setOpen: setPresenterOpen } =
    useContext(PresenterContext);

  const readiness = READINESS_BASE + resolved.size * READINESS_PER_ITEM;
  const meta = CONCEPTS.find((c) => c.id === activeConcept)!;

  const switchConcept = (id: ConceptId) => {
    setActiveConcept(id);
    setOpenPanelId(null);
    setPresenterOpen(false);
    window.scrollTo({ top: 0 });
  };

  const openPanel = (id: PanelId) => setOpenPanelId(id);
  const closePanel = () => setOpenPanelId(null);

  const resolveItem = (queueId: number) => {
    setResolved((prev) => new Set(prev).add(queueId));
    setOpenPanelId(null);
  };

  const assignPurpose = (purpose: string) => {
    setAssignedPurpose(purpose);
    resolveItem(5);
  };

  return (
    <div className="w-full px-6 pt-6 pb-2">
      {/* Presenter band — view switcher, hidden unless toggled via "Concepts" in the menu strip */}
      <div
        className={cn(
          "w-full rounded-lg border border-gray-200 bg-white px-6 py-4 shadow-sm",
          !presenterOpen && "hidden"
        )}
      >
        <div className="text-xs text-gray-500">Portfolio · view direction</div>
        <h1
          className="mt-0.5 text-2xl font-semibold"
          style={{ color: "var(--ew-primary-navy)" }}
        >
          Switch view
        </h1>

        <div className="mt-4 flex flex-wrap gap-2">
          {CONCEPTS.map((concept) => {
            const active = concept.id === activeConcept;
            return (
              <button
                key={concept.id}
                type="button"
                onClick={() => switchConcept(concept.id)}
                className={cn(
                  "flex flex-col items-start rounded-[6px] px-4 py-2 text-left",
                  active
                    ? "bg-[#F97415] text-white"
                    : "bg-[#F5F1E8] text-gray-700 hover:bg-[#F0EBE0]"
                )}
              >
                <span className="text-sm font-semibold">{concept.name}</span>
                <span
                  className={cn("text-xs", active ? "text-white/80" : "text-gray-500")}
                >
                  {concept.subtitle}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-3 max-w-4xl text-sm leading-relaxed text-gray-600">
          <span
            className="font-semibold"
            style={{ color: "var(--ew-primary-navy)" }}
          >
            {meta.noteLead}
          </span>{" "}
          {meta.note}
        </p>
      </div>

      {/* Main content */}
      <div
        className={cn(
          "w-full rounded-lg border border-gray-200 bg-white px-6 py-6 shadow-sm",
          presenterOpen && "mt-6"
        )}
      >
        {activeConcept === "a" ? (
          <>
            <CustomTabs
              tabs={PORTFOLIO_TABS}
              activeTab={activeTab}
              onTabChange={(id) => setActiveTab(id as PortfolioTab)}
              className="mb-6"
            />

            {activeTab === "overview" && <TabOverview />}

            {activeTab === "investments" && (
              <TabInvestments
                openPanel={openPanel}
                managedFilter={managedFilter}
                onManagedFilterChange={setManagedFilter}
              />
            )}

            {activeTab === "risk-lt" && (
              <TabRiskLt
                openPanel={openPanel}
                managedFilter={managedFilter}
              />
            )}

            {activeTab === "risk-st" && (
              <TabRiskSt
                openPanel={openPanel}
                managedFilter={managedFilter}
              />
            )}

            {activeTab === "medical" && (
              <TabMedical
                openPanel={openPanel}
                managedFilter={managedFilter}
              />
            )}
          </>
        ) : (
          /* View B — Goals → Products (full build is a separate session) */
          <ConceptB
            openPanel={openPanel}
            viewMode="cards"
            assignedPurpose={assignedPurpose}
          />
        )}
      </div>

      {presenterOpen && (
        <p className="mt-4 pb-6 text-xs leading-relaxed text-gray-500">
          {FOOTNOTE}
        </p>
      )}

      <PanelHost
        openPanelId={openPanelId}
        onClose={closePanel}
        onResolve={resolveItem}
        onAssign={assignPurpose}
      />
    </div>
  );
}
