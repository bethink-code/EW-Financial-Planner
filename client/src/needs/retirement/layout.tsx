import { NeedLayout } from "@/needs/_framework";
import { retirementConfig } from "./config";

export function RetirementLayout({ children }: { children: React.ReactNode }) {
  return <NeedLayout config={retirementConfig}>{children}</NeedLayout>;
}
