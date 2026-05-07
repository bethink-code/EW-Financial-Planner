import type { NeedConfig } from "./types";
import { flattenNeed } from "./flatten";

/**
 * Smart-landing for any need. If `ready` (the need declares it has enough
 * input data to project), land on the project step. Otherwise land on the
 * first sub-step in the flattened sequence.
 *
 * Each need decides its own readiness rule — typically by inspecting the
 * server-side projection endpoint's response. The framework just wires the
 * boolean into a path.
 */
export function getNeedLandingPath(config: NeedConfig, ready: boolean): string {
  if (ready) {
    const projectStep = config.steps.find(s => s.id === "project") ?? config.steps[2];
    if (projectStep) return projectStep.path;
  }
  const flat = flattenNeed(config);
  return flat[0]?.path ?? config.basePath;
}
