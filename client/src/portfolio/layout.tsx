import React, { createContext, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ClientHeader } from "@/components/navigation/client-header";
import { BEN_MEANDER } from "./data";

/**
 * Layout for the client-level Portfolio section — client header with
 * "Portfolio" active, then the section's content. The concept deck uses the
 * brief's demo client (Ben Meander) rather than the default Donald Edward.
 *
 * The presenter card (concept switcher + notes) is hidden by default so the
 * deck reads as the actual interface; an unobtrusive "Concepts" link at the
 * end of the menu strip toggles it.
 */

export const PresenterContext = createContext(false);

interface PortfolioLayoutProps {
  children: React.ReactNode;
}

export function PortfolioLayout({ children }: PortfolioLayoutProps) {
  const [presenterOpen, setPresenterOpen] = useState(false);

  return (
    <>
      <ClientHeader
        active="portfolio"
        client={BEN_MEANDER}
        navExtra={
          <button
            type="button"
            onClick={() => setPresenterOpen((open) => !open)}
            className="flex items-center gap-0.5 text-[13px] text-[#4C8DB4] hover:underline"
          >
            Concepts
            {presenterOpen ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        }
      />
      <PresenterContext.Provider value={presenterOpen}>
        <div style={{ paddingBottom: "80px" }}>{children}</div>
      </PresenterContext.Provider>
    </>
  );
}
