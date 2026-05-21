import { useLocation } from "wouter";
import { NeedLayout } from "@/needs/_framework";
import { retirementConfig } from "./config";
import { RetirementProjectionRibbon } from "@/components/retirement/retirement-projection-ribbon";

export function RetirementLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  // Show the projection ribbon on Build *and* Project — same need-summary
  // KPIs carry across both, per the client's reference.
  const showRibbon =
    location.startsWith("/needs/retirement/build") ||
    location.startsWith("/needs/retirement/project");

  return (
    <NeedLayout
      config={retirementConfig}
      headerExtra={showRibbon ? <RetirementProjectionRibbon /> : undefined}
    >
      {children}
    </NeedLayout>
  );
}
