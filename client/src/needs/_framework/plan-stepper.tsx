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
import type { NeedConfig, NeedStep } from "./types";

const PLAN_ID = 1;

/** Where clicking a step chip lands the user. If the step has sub-pages we
 *  navigate to the first leaf (the first child of the first section, or the
 *  first flat section) so the body content is always something. */
function firstLeafPath(step: NeedStep): string {
  if (step.sections.length === 0) return step.path;
  const first = step.sections[0];
  if (first.children && first.children.length > 0) return first.children[0].path;
  return first.path;
}

interface PlanStepperProps {
  config: NeedConfig;
  currentStep: NeedStep;
  /** Optional content rendered beneath the FINANCIAL PLAN / NEED / STEPS row,
   *  inside the same white card. Used by Retirement to consolidate the live
   *  projection ribbon into the stepper card. */
  headerExtra?: React.ReactNode;
}

/**
 * The FINANCIAL PLAN / NEED / STEPS bar — chooses the current plan, the active
 * need, and the active step within that need.
 */
export function PlanStepper({ config, currentStep, headerExtra }: PlanStepperProps) {
  const [, setLocation] = useLocation();
  const [needDropdownOpen, setNeedDropdownOpen] = useState(false);

  const { data: plan } = useQuery<{ name: string }>({
    queryKey: [`/api/financial-plans/${PLAN_ID}`],
    queryFn: () => fetch(`/api/financial-plans/${PLAN_ID}`).then(r => r.json()),
  });
  const planName = plan?.name ?? "Financial Plan";

  // Plan-scoped need list — only the needs attached to this plan appear.
  const { data: planWithNeeds } = useQuery<{ needs: { key: string }[] }>({
    queryKey: [`/api/financial-plans/${PLAN_ID}/with-needs`],
    queryFn: () => fetch(`/api/financial-plans/${PLAN_ID}/with-needs`).then(r => r.json()),
  });
  const planNeedKeys = new Set((planWithNeeds?.needs ?? []).map(n => n.key));
  const dropdownNeeds = allNeeds.filter(n => planNeedKeys.has(n.id));

  return (
    <section className="w-full px-6 pt-8 pb-2" aria-label="Plan stepper">
      <div className="w-[1320px] max-w-full bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
        {/* Two rows: FINANCIAL PLAN identifies which plan you're in; NEED +
            STEPS together pick your navigation within it. Pairing NEED with
            STEPS means they always wrap as a unit, never split. */}
        <div className="space-y-3">
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium block mb-1">FINANCIAL PLAN</span>
            <div className="flex items-center gap-2 flex-wrap">
              <button className="inline-flex items-center px-4 text-sm font-medium h-10 rounded-[6px] bg-[#F5F1E8] text-gray-700 hover:bg-[#F0EBE0] whitespace-nowrap">
                {planName}
              </button>
              <Button variant="ghost" onClick={() => setLocation("/")} className="btn-ghost px-2 text-sm h-10">
                Back to all plans
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-x-6 gap-y-3 flex-wrap">
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
              <div className="flex items-center gap-2 flex-wrap">
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
        </div>
        {headerExtra && (
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--ew-border)" }}>
            {headerExtra}
          </div>
        )}
      </div>
    </section>
  );
}
