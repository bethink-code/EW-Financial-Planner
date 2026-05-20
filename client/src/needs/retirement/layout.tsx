import { useLocation } from "wouter";
import { NeedLayout } from "@/needs/_framework";
import { retirementConfig } from "./config";
import { RetirementProjectionRibbon } from "@/components/retirement/retirement-projection-ribbon";

export function RetirementLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const onBuildRoute = location.startsWith("/needs/retirement/build");

  return (
    <NeedLayout
      config={retirementConfig}
      headerExtra={onBuildRoute ? <RetirementProjectionRibbon /> : undefined}
    >
      {children}
    </NeedLayout>
  );
}
