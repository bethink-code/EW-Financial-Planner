import { getNeedLandingPath } from "@/needs/_framework";
import { delConfig } from "./config";

export function getDELLandingPath(ready: boolean): string {
  return getNeedLandingPath(delConfig, ready);
}
