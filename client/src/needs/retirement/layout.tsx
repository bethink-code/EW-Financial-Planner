import { useLocation } from "wouter";
import { NeedLayout } from "@/needs/_framework";
import { buildRetirementConfig } from "./config";
import { useBuildVariant } from "./build-variant";
import { BuildVariantFab } from "./build-variant-fab";
import { ViewModeFab } from "./view-mode-fab";
import { RetirementProjectionRibbon } from "@/components/retirement/retirement-projection-ribbon";

export function RetirementLayout({ children }: { children: React.ReactNode }) {
  const [variant] = useBuildVariant();
  const [location] = useLocation();
  const config = buildRetirementConfig(variant);
  const onBuildRoute = location.startsWith("/needs/retirement/build");

  return (
    <NeedLayout
      config={config}
      headerExtra={onBuildRoute ? <RetirementProjectionRibbon /> : undefined}
    >
      {children}
      {onBuildRoute && (
        <>
          <BuildVariantFab />
          <ViewModeFab />
        </>
      )}
    </NeedLayout>
  );
}
