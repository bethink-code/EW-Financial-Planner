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
import { cn } from "@/lib/utils";
import { needs as allNeeds } from "@shared/navigation-config";
import { CommentsPanel } from "@/components/comments/comments-panel";
import headerImage from "@assets/EW Header_1753945516780.png";
import type { NeedConfig } from "./types";
import { findCurrentStep } from "./flatten";
import { NeedActionBar } from "./action-bar";

const PLAN_ID = 1;

interface NeedLayoutProps {
  config: NeedConfig;
  children: React.ReactNode;
}

/**
 * Generic chrome for a need workspace: client header, FINANCIAL PLAN pill,
 * NEED dropdown (lists all needs from shared config), STEPS bar, and the
 * Previous / Next action bar at the bottom. Driven entirely by the supplied
 * NeedConfig — every need plugs into the same component.
 */
export function NeedLayout({ config, children }: NeedLayoutProps) {
  const [location, setLocation] = useLocation();
  const [needDropdownOpen, setNeedDropdownOpen] = useState(false);
  const [openStepDropdown, setOpenStepDropdown] = useState<string | null>(null);

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
                  if (step.sections.length === 0) {
                    return (
                      <button
                        key={step.id}
                        onClick={() => setLocation(step.path)}
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
                  }
                  return (
                    <DropdownMenu
                      key={step.id}
                      open={openStepDropdown === step.id}
                      onOpenChange={open => setOpenStepDropdown(open ? step.id : null)}
                    >
                      <DropdownMenuTrigger asChild>
                        <button
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
                          <ChevronDown className="h-3.5 w-3.5 ml-1" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="dropdown-menu-content w-72">
                        {step.sections.flatMap(section =>
                          section.children && section.children.length > 0
                            ? section.children.map(child => (
                                <DropdownMenuItem key={child.id} className="dropdown-menu-item" asChild>
                                  <Link href={child.path} onClick={() => setOpenStepDropdown(null)}>
                                    <span className={cn(location === child.path && "text-[#F97415] font-medium")}>
                                      {section.label} — {child.label}
                                    </span>
                                  </Link>
                                </DropdownMenuItem>
                              ))
                            : [
                                <DropdownMenuItem key={section.id} className="dropdown-menu-item" asChild>
                                  <Link href={section.path} onClick={() => setOpenStepDropdown(null)}>
                                    <span className={cn(location === section.path && "text-[#F97415] font-medium")}>
                                      {section.label}
                                    </span>
                                  </Link>
                                </DropdownMenuItem>,
                              ],
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ paddingBottom: "80px" }}>{children}</div>

      <NeedActionBar config={config} />
      <CommentsPanel />
    </>
  );
}
