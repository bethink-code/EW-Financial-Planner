import { useState } from "react";
import { CustomTabs } from "@/components/ui/custom-tabs";
import NewRetirementFunds from "@/pages/new-retirement-funds";
import DefinedBenefitFunds from "@/pages/defined-benefit-funds";
import VoluntaryInvestments from "@/pages/voluntary-investments";
import FutureInflowsPage from "@/pages/future-inflows";
import RetirementLumpSumNeedsPage from "@/pages/retirement-lump-sum-needs";
import IncomeNeeds from "@/pages/income-needs";
import IncomeProvisions from "@/pages/income-provisions";

export type RetirementCategoryId =
  | "retirement-funds"
  | "defined-benefit-funds"
  | "voluntary-investments"
  | "future-inflows"
  | "lump-sum-needs"
  | "income-required"
  | "income-provided";

const CATEGORY_LABELS: Record<RetirementCategoryId, string> = {
  "retirement-funds": "Retirement funds",
  "defined-benefit-funds": "Defined benefit / GEPF",
  "voluntary-investments": "Voluntary investments",
  "future-inflows": "Future inflows",
  "lump-sum-needs": "Lump sum needs",
  "income-required": "Regular income required",
  "income-provided": "Regular income provided",
};

const CATEGORY_COMPONENTS: Record<RetirementCategoryId, React.ComponentType> = {
  "retirement-funds": NewRetirementFunds,
  "defined-benefit-funds": DefinedBenefitFunds,
  "voluntary-investments": VoluntaryInvestments,
  "future-inflows": FutureInflowsPage,
  "lump-sum-needs": RetirementLumpSumNeedsPage,
  "income-required": IncomeNeeds,
  "income-provided": IncomeProvisions,
};

interface Props {
  categories: RetirementCategoryId[];
  initial?: RetirementCategoryId;
}

/**
 * In-page category tabs across the relevant subset of Retirement Build categories.
 * Each tab body is the existing per-category page (Hybrid view + Table-view toggle
 * inside). Switching tabs swaps the body without leaving the parent variant page.
 */
export function RetirementCategoryTabs({ categories, initial }: Props) {
  const [active, setActive] = useState<RetirementCategoryId>(initial ?? categories[0]);
  const Body = CATEGORY_COMPONENTS[active];

  const tabs = categories.map(id => ({ id, label: CATEGORY_LABELS[id] }));

  return (
    <div className="pt-4">
      {/* Cross-category ribbon is rendered by RetirementLayout inside the
          stepper card (above this component). Tabs sit directly below.
          Match the body's horizontal padding + inner-width so the tab strip
          spans the same column as the table container below. The active-
          label / focus-outline / hover treatments now live in CustomTabs by
          default; only the flush-left nav override is specific to this
          layout (this wrapper already has its own px-6). */}
      <div className="w-full px-6">
        <div className="w-[1320px] max-w-full px-6">
          <CustomTabs
            tabs={tabs}
            activeTab={active}
            onTabChange={(id) => setActive(id as RetirementCategoryId)}
            className="mb-0 [&_nav]:!mx-0"
          />
        </div>
      </div>
      {/* Pull the body wrapper up so its inner card sits flush against the
          tab bar's bottom border — tabs + body read as one tabbed element. */}
      <div className="-mt-6">
        <Body />
      </div>
    </div>
  );
}
