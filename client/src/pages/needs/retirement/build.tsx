import { useEffect } from "react";
import { useLocation } from "wouter";
import { retirementConfig } from "@/needs/retirement/config";
import { flattenNeed } from "@/needs/_framework/flatten";

/**
 * Bare /needs/retirement/build URL. Redirects to the first Build sub-section
 * so the framework's tab strip and the action bar work normally — Build is
 * a category-tab step, not a destination page in its own right.
 */
export default function RetirementBuild() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const buildStep = retirementConfig.steps.find(s => s.id === "build");
    if (!buildStep) return;
    const flat = flattenNeed(retirementConfig);
    const firstBuild = flat.find(i => i.step.id === "build");
    if (firstBuild) setLocation(firstBuild.path);
  }, [setLocation]);

  return (
    <div className="px-6 py-12 text-center text-neutral-500">Loading Build…</div>
  );
}
