import { getNeedLandingPath } from "@/needs/_framework";
import { retirementConfig } from "./config";

export function getRetirementLandingPath(ready: boolean): string {
  return getNeedLandingPath(retirementConfig, ready);
}
