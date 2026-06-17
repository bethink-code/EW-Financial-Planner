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
} from "./data";
import { ConceptA } from "./concept-a";
import { ConceptB } from "./concept-b";
import { ConceptC } from "./concept-c";
import { PanelHost } from "./panel-host";
import { ViewModeToggle, type ViewMode } from "./view";

/**
 * Portfolio concept deck — three design directions for the portfolio landing
 * page, presented for the client to choose one before final prototyping.
 * Everything is a mockup on demo data (Ben Meander); state lives in memory.
 */
export default function PortfolioPage() {
  const [activeConcept, setActiveConcept] = useState<ConceptId>("a");
  const [openPanelId, setOpenPanelId] = useState<PanelId | null>(null);
  const [resolved, setResolved] = useState<Set<number>>(new Set());
  const [attnExpandedA, setAttnExpandedA] = useState(false);
  // Concept B: the purpose assigned to the unassigned ABSA value (null until set)
  const [assignedPurpose, setAssignedPurpose] = useState<string | null>(null);
  // Per-concept default presentation; the toggle is remembered per concept
  // so switching A/B/C lands on the intended view.
  const [viewModes, setViewModes] = useState<Record<ConceptId, ViewMode>>({
    a: "cards",
    b: "table",
    c: "cards",
  });

  const presenterOpen = useContext(PresenterContext);
  const readiness = READINESS_BASE + resolved.size * READINESS_PER_ITEM;
  const meta = CONCEPTS.find((c) => c.id === activeConcept)!;

  const switchConcept = (id: ConceptId) => {
    setActiveConcept(id);
    setOpenPanelId(null);
    window.scrollTo({ top: 0 });
  };

  const openPanel = (id: PanelId) => setOpenPanelId(id);
  const closePanel = () => setOpenPanelId(null);

  const resolveItem = (queueId: number) => {
    setResolved((prev) => new Set(prev).add(queueId));
    setOpenPanelId(null);
  };

  // Assigning ABSA's purpose folds it into a goal (Concept B) and clears the
  // "outside the plan" attention item.
  const assignPurpose = (purpose: string) => {
    setAssignedPurpose(purpose);
    resolveItem(5);
  };

  const sharedProps = { openPanel, readiness, resolved };

  return (
    <div className="w-full px-6 pt-6 pb-2">
      {/* Presenter band — concept-deck controls, hidden unless toggled via
          the "Concepts" link in the menu strip */}
      <div
        className={cn(
          "w-full rounded-lg border border-gray-200 bg-white px-6 py-4 shadow-sm",
          !presenterOpen && "hidden"
        )}
      >
        <div className="text-xs text-gray-500">
          Portfolio redesign · concept exploration
        </div>
        <h1 className="mt-0.5 text-2xl font-semibold text-primary">
          Portfolio landing — three concept directions
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
                  className={cn(
                    "text-xs",
                    active ? "text-white/80" : "text-gray-500"
                  )}
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

      {/* Concept stage */}
      <div
        className={cn(
          "w-full rounded-lg border border-gray-200 bg-white px-6 py-6 shadow-sm",
          presenterOpen && "mt-6"
        )}
      >
        <div className="mb-4 flex justify-end">
          <ViewModeToggle
            mode={viewModes[activeConcept]}
            onChange={(mode) =>
              setViewModes((prev) => ({ ...prev, [activeConcept]: mode }))
            }
          />
        </div>
        {activeConcept === "a" && (
          <ConceptA
            {...sharedProps}
            viewMode={viewModes.a}
            expanded={attnExpandedA}
            onToggle={() => setAttnExpandedA((prev) => !prev)}
          />
        )}
        {activeConcept === "b" && (
          <ConceptB
            openPanel={openPanel}
            viewMode={viewModes.b}
            assignedPurpose={assignedPurpose}
          />
        )}
        {activeConcept === "c" && (
          <ConceptC {...sharedProps} viewMode={viewModes.c} />
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
