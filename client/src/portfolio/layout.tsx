import React from "react";
import { Link } from "wouter";
import headerImage from "@assets/EW Header_1753945516780.png";

/**
 * Layout for the client-level Portfolio section.
 *
 * The client header PNG has the client-level menu strip baked into its bottom
 * band with "Financial planning" rendered as the active item. Here the image
 * is cropped to the identity card only and the strip is rebuilt in HTML so
 * the active state can sit on "Portfolio". Geometry and colours are sampled
 * from the PNG (strip band y 105-133, bg #D4E8F4, items #4C8DB4, active
 * #016991). Only "Financial planning" is a live link back; the other items
 * are inert, matching the static image.
 */

interface MenuItem {
  label: string;
  active?: boolean;
  href?: string;
}

const menuItems: MenuItem[] = [
  { label: "Home" },
  { label: "Activity dashboard" },
  { label: "Work portal" },
  { label: "Client info" },
  { label: "Portfolio", active: true },
  { label: "Assets and liabilities" },
  { label: "Budget" },
  { label: "Financial planning", href: "/financial-plans" },
  { label: "Bna" },
];

interface PortfolioLayoutProps {
  children: React.ReactNode;
}

export function PortfolioLayout({ children }: PortfolioLayoutProps) {
  return (
    <>
      {/* Client header: identity card from the PNG (strip band cropped off) */}
      <div className="w-full overflow-x-auto">
        <div className="pl-6">
          {/* Image pinned to natural size (max-w-none) so the 96px crop and
              the rebuilt strip below stay aligned; content cards are fixed
              width too, and the outer wrapper already scrolls horizontally. */}
          <div className="h-[96px] w-[1324px] overflow-hidden">
            <img
              src={headerImage}
              alt="Client Header - Donald Edward"
              className="block w-[1324px] max-w-none"
            />
          </div>

          {/* Client-level menu strip, rebuilt in HTML with Portfolio active */}
          <nav className="mt-[9px] flex h-[29px] w-[1322px] items-center gap-[17px] rounded bg-[#D4E8F4] pl-[31px] text-[13px]">
            {menuItems.map((item) =>
              item.active ? (
                <span key={item.label} className="font-semibold text-[#016991]">
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-[#4C8DB4] hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span key={item.label} className="text-[#4C8DB4]">
                  {item.label}
                </span>
              )
            )}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div style={{ paddingBottom: "80px" }}>{children}</div>
    </>
  );
}
