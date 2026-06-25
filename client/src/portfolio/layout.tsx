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
      <div style={{ paddingBottom: "80px" }}>{children}</div>
    </>
  );
}
