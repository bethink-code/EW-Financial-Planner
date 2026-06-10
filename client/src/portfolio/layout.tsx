import React from "react";
import { ClientHeader } from "@/components/navigation/client-header";

/**
 * Layout for the client-level Portfolio section — client header with
 * "Portfolio" active, then the section's content.
 */

interface PortfolioLayoutProps {
  children: React.ReactNode;
}

export function PortfolioLayout({ children }: PortfolioLayoutProps) {
  return (
    <>
      <ClientHeader active="portfolio" />
      <div style={{ paddingBottom: "80px" }}>{children}</div>
    </>
  );
}
