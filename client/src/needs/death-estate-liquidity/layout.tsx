import { NeedLayout } from "@/needs/_framework";
import { delConfig } from "./config";

export function DELLayout({ children }: { children: React.ReactNode }) {
  return <NeedLayout config={delConfig}>{children}</NeedLayout>;
}
