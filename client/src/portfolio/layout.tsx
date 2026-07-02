import React from "react";
import { ClientHeader } from "@/components/navigation/client-header";
import { BEN_MEANDER } from "./data";

interface PortfolioLayoutProps {
  children: React.ReactNode;
}

export function PortfolioLayout({ children }: PortfolioLayoutProps) {
  return (
    <>
      <ClientHeader active="portfolio" client={BEN_MEANDER} />
      {/* pt-10 separates our working interface (tab strip and below) from
          the platform chrome above. */}
      <div className="pt-10" style={{ paddingBottom: "80px" }}>{children}</div>
    </>
  );
}
