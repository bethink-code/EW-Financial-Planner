/**
 * Smart-landing helper: given a need's readiness state, returns where to land the user.
 *
 * Flow:
 *   - Brand new (no inputs)            → first sub-step (Setup parameters / Client details).
 *   - In progress (some inputs, not ready) → last visited sub-step (localStorage), else first.
 *   - Ready to project                 → /needs/<need>/project.
 */

import { needs } from "@shared/navigation-config";

const LAST_VISITED_PREFIX = "lastVisited";

export function getLandingPath(needKey: string, ready: boolean, planId: number): string {
  const need = needs.find(n => n.id === needKey);
  if (!need) return `/needs/${needKey}`;

  if (ready) {
    return `/needs/${needKey}/project`;
  }

  const lastVisited = readLastVisited(planId, needKey);
  if (lastVisited) return lastVisited;

  // First sub-step of first step.
  const firstStep = need.steps?.[0];
  const firstSection = firstStep?.sections?.[0];
  return firstSection?.path ?? firstStep?.path ?? need.path;
}

export function recordLastVisited(planId: number, needKey: string, path: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${LAST_VISITED_PREFIX}:${planId}:${needKey}`, path);
  } catch {
    // localStorage unavailable — silently no-op.
  }
}

function readLastVisited(planId: number, needKey: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(`${LAST_VISITED_PREFIX}:${planId}:${needKey}`);
  } catch {
    return null;
  }
}
