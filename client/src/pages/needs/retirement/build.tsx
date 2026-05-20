import { RetirementCategoryTabs } from "@/components/retirement/retirement-category-tabs";

/**
 * Retirement Build page: a single page with all 7 categories accessible
 * as in-page tabs. Tab clicks swap the active category without leaving the
 * page; overflow handling on the tab strip is provided by CustomTabs.
 */
export default function RetirementBuild() {
  return (
    <RetirementCategoryTabs
      categories={[
        "retirement-funds",
        "defined-benefit-funds",
        "voluntary-investments",
        "future-inflows",
        "lump-sum-needs",
        "income-required",
        "income-provided",
      ]}
    />
  );
}
