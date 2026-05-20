import { useLocation } from "wouter";
import { CommentsPanel } from "@/components/comments/comments-panel";
import type { NeedConfig } from "./types";
import { findCurrentStep } from "./flatten";
import { NeedActionBar } from "./action-bar";
import { ClientCard } from "./client-card";
import { PlanStepper } from "./plan-stepper";
import { NeedNavigation } from "./need-navigation";
import { NeedForm } from "./need-form";

interface NeedLayoutProps {
  config: NeedConfig;
  children: React.ReactNode;
  /** Optional content rendered inside the stepper card beneath the FINANCIAL
   *  PLAN / NEED / STEPS row. Retirement uses this for its live projection
   *  ribbon; DEL passes nothing. */
  headerExtra?: React.ReactNode;
}

/**
 * Generic chrome for a need workspace. Five top-level sections, each its own
 * named component so the DOM reads as the user-facing structure:
 *
 *   <ClientCard />        — client header band
 *   <PlanStepper />       — FINANCIAL PLAN / NEED / STEPS bar
 *   <NeedNavigation />    — section tab strip (only when current step has sub-pages)
 *   <NeedForm>{children}</NeedForm>
 *   <NeedActionBar />     — pinned Previous / Next strip
 */
export function NeedLayout({ config, children, headerExtra }: NeedLayoutProps) {
  const [location] = useLocation();
  const currentStep = findCurrentStep(config, location);

  return (
    <>
      <ClientCard />
      <PlanStepper config={config} currentStep={currentStep} headerExtra={headerExtra} />
      <NeedNavigation step={currentStep} />
      <NeedForm>{children}</NeedForm>
      <NeedActionBar config={config} />
      <CommentsPanel />
    </>
  );
}
