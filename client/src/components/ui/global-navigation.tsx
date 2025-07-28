import React from "react";
import { CustomTabs } from "./custom-tabs";

/**
 * Global navigation component for calculator modules
 * Simple and non-obtrusive navigation between calculators
 */
export function GlobalNavigation() {
  const allNavigationTabs = [
    { id: "assurance", label: "Assurance", href: "/assurance" },
    { id: "retirement-funds", label: "Retirement Funds", href: "/retirement-funds" },
    { id: "defined-benefit-funds", label: "Defined Benefit Funds", href: "/defined-benefit-funds" },
    { id: "voluntary-investments", label: "Voluntary Investments", href: "/voluntary-investments" },
    { id: "assets", label: "Assets and Liabilities", href: "/assets" },
    { id: "income-needs", label: "Income Needs", href: "/income-needs" },
    { id: "income-provisions", label: "Income Provisions", href: "/income-provisions" },
    { id: "residue", label: "Residue", href: "/residue" },
    { id: "lump-sum-bequests", label: "Lump Sum Needs and Cash Bequests", href: "/lump-sum-bequests" },
    { id: "additional-estate-duty-items", label: "Additional Estate Duty Items", href: "/additional-estate-duty-items" }
  ];

  return (
    <div className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <CustomTabs
        tabs={allNavigationTabs}
        activeTab=""
        useLinks={true}
        className="mb-0"
      />
    </div>
  );
}