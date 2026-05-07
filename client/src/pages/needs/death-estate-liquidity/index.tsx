import { useEffect } from "react";
import { useLocation } from "wouter";
import { getDELLandingPath } from "@/needs/death-estate-liquidity/landing";

/**
 * Bare /needs/death-estate-liquidity URL. Smart-lands on the right sub-step.
 * For DEL the data is currently mock-loaded so we treat it as ready by default
 * and land on Project. Replace with a real readiness check when the projection
 * engine is wired up for DEL.
 */
export default function DeathEstateLiquidityNeed() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation(getDELLandingPath(true));
  }, [setLocation]);

  return (
    <div className="px-6 py-12 text-center text-neutral-500">Loading workspace…</div>
  );
}
