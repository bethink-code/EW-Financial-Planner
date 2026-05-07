import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getRetirementLandingPath } from "@/needs/retirement/landing";
import type { RetirementProjection } from "@shared/retirement-calculations";

const PLAN_ID = 1;

/**
 * Bare /needs/retirement URL. Smart-lands the user on the right sub-step
 * based on readiness (first sub-step / last visited / project).
 */
export default function RetirementNeed() {
  const [, setLocation] = useLocation();

  const { data: projection } = useQuery<RetirementProjection & { ready: boolean }>({
    queryKey: [`/api/retirement-projection/${PLAN_ID}`],
    queryFn: () => fetch(`/api/retirement-projection/${PLAN_ID}`).then(r => r.json()),
  });

  useEffect(() => {
    if (projection === undefined) return;
    setLocation(getRetirementLandingPath(!!projection?.ready));
  }, [projection, setLocation]);

  return (
    <div className="px-6 py-12 text-center text-neutral-500">Loading retirement workspace…</div>
  );
}
