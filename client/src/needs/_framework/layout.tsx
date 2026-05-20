import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomTabs } from "@/components/ui/custom-tabs";
import { cn } from "@/lib/utils";
import { needs as allNeeds } from "@shared/navigation-config";
import { CommentsPanel } from "@/components/comments/comments-panel";
import headerImage from "@assets/EW Header_1753945516780.png";
import type { NeedConfig, NeedStep } from "./types";
import { findCurrentStep } from "./flatten";
import { NeedActionBar } from "./action-bar";

const PLAN_ID = 1;

interface NeedLayoutProps {
  config: NeedConfig;
  children: React.ReactNode;
  /** Optional content rendered inside the stepper card, beneath the
   *  FINANCIAL PLAN / NEED / STEPS row. Used by Retirement to consolidate the
   *  live projection ribbon into the same white block as the stepper. DEL
   *  passes nothing, so its layout is unchanged. */
  headerExtra?: React.ReactNode;
}

/** Where clicking a step chip lands the user. If the step has sub-pages we
 *  navigate to the first leaf (the first child of the first section, or the
 *  first flat section), so the body content is always something. */
function firstLeafPath(step: NeedStep): string {
  if (step.sections.length === 0) return step.path;
  const first = step.sections[0];
  if (first.children && first.children.length > 0) return first.children[0].path;
  return first.path;
}

/** Flatten a step's sections into a tab list. For sections that contain
 *  children, each child becomes a tab labelled `"<Section> — <Child>"` so the
 *  grouping context is preserved (the user picked "combined labels" over
 *  flattening to leaf-only). Sections without children render as a single tab
 *  with the section's own label. */
function buildSectionTabs(step: NeedStep): { id: string; label: string; href: string }[] {
  return step.sections.flatMap(section =>
    section.children && section.children.length > 0
      ? section.children.map(child => ({
          id: child.id,
          label: `${section.label} — ${child.label}`,
          href: child.path,
        }))
      : [{ id: section.id, label: section.label, href: section.path }],
  );
}

/**
 * Generic chrome for a need workspace: client header, FINANCIAL PLAN pill,
 * NEED dropdown (lists all needs from shared config), STEPS bar, the auto
 * section-tab strip when the current step has sub-pages, and the
 * Previous / Next action bar at the bottom. Driven entirely by the supplied
 * NeedConfig — every need plugs into the same component.
 */
export function NeedLayout({ config, children, headerExtra }: NeedLayoutProps) {
  const [location, setLocation] = useLocation();
  const [needDropdownOpen, setNeedDropdownOpen] = useState(false);

  const { data: plan } = useQuery<{ name: string }>({
    queryKey: [`/api/financial-plans/${PLAN_ID}`],
    queryFn: () => fetch(`/api/financial-plans/${PLAN_ID}`).then(r => r.json()),
  });
  const planName = plan?.name ?? "Financial Plan";

  // Plan-scoped need list — only the needs actually attached to this plan appear in the dropdown.
  const { data: planWithNeeds } = useQuery<{ needs: { key: string }[] }>({
    queryKey: [`/api/financial-plans/${PLAN_ID}/with-needs`],
    queryFn: () => fetch(`/api/financial-plans/${PLAN_ID}/with-needs`).then(r => r.json()),
  });
  const planNeedKeys = new Set((planWithNeeds?.needs ?? []).map(n => n.key));
  const dropdownNeeds = allNeeds.filter(n => planNeedKeys.has(n.id));

  const currentStep = findCurrentStep(config, location);
  const sectionTabs = buildSectionTabs(currentStep);

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="pl-6">
          <img src={headerImage} alt="Client Header" className="block" style={{ width: "auto", height: "auto" }} />
        </div>
      </div>

      <div className="w-full px-6 pt-8 pb-2">
        <div className="w-[1320px] bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
          <div className="flex items-start gap-6">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium block mb-1">FINANCIAL PLAN</span>
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center px-4 text-sm font-medium h-10 rounded-[6px] bg-[#F5F1E8] text-gray-700 hover:bg-[#F0EBE0] whitespace-nowrap">
                  {planName}
                </button>
                <Button variant="ghost" onClick={() => setLocation("/")} className="btn-ghost px-2 text-sm h-10">
                  Back to all plans
                </Button>
              </div>
            </div>

            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium block mb-1">NEED</span>
              <DropdownMenu open={needDropdownOpen} onOpenChange={setNeedDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button className="btn-need px-4 flex items-center gap-2 text-sm rounded-md h-10">
                    {config.label}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="dropdown-menu-content w-72">
                  {dropdownNeeds.length === 0 ? (
                    <DropdownMenuItem disabled className="dropdown-menu-item">
                      <span className="text-gray-400">No needs in this plan</span>
                    </DropdownMenuItem>
                  ) : (
                    dropdownNeeds.map(need => (
                      <DropdownMenuItem key={need.id} className="dropdown-menu-item" asChild>
                        <Link href={need.path} onClick={() => setNeedDropdownOpen(false)}>
                          <span
                            className={cn(
                              need.hasContent ? "" : "text-gray-400",
                              need.id === config.id && "text-[#F97415] font-medium",
                            )}
                          >
                            {need.label}
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium block mb-1">STEPS</span>
              <div className="flex items-center gap-2">
                {config.steps.map(step => {
                  const isActive = step.id === currentStep.id;
                  return (
                    <button
                      key={step.id}
                      onClick={() => setLocation(firstLeafPath(step))}
                      className={cn(
                        "flex items-center gap-2 pl-1 pr-2 text-sm font-medium h-10 rounded-[6px]",
                        isActive ? "bg-[#F97415] text-white" : "bg-[#F5F1E8] text-gray-700 hover:bg-[#F0EBE0]",
                      )}
                    >
                      <span
                        className={cn(
                          "flex items-center justify-center h-8 w-8 rounded text-sm font-semibold",
                          isActive ? "bg-white/20 text-white" : "bg-white text-[#F97415]",
                        )}
                      >
                        {step.number}
                      </span>
                      <span>{step.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {headerExtra && (
            <div
              className="mt-4 pt-4"
              style={{ borderTop: "1px solid var(--ew-border)" }}
            >
              {headerExtra}
            </div>
          )}
        </div>
      </div>

      {/* Auto section-tab strip — appears whenever the current step has
          sub-pages. Replaces the old per-step dropdowns; tabs that don't fit
          the viewport collapse into a "More ▼" dropdown via CustomTabs. */}
      {sectionTabs.length > 0 && (
        <div className="w-full px-6 pt-4">
          <div className="w-[1320px]">
            <CustomTabs
              tabs={sectionTabs}
              activeTab=""
              useLinks
              className="mb-0"
            />
          </div>
        </div>
      )}

      <div style={{ paddingBottom: "80px" }}>{children}</div>

      <NeedActionBar config={config} />
      <CommentsPanel />
    </>
  );
}
