import { RetirementCategoryTabs } from "@/components/retirement/retirement-category-tabs";

/**
 * Variant A — "Long" prototype: a single Build page with all 7 categories
 * accessible as in-page tabs. The user stays in the Hybrid view throughout;
 * tab clicks swap the active category without leaving the page.
 */
export default function RetirementBuildVariantA() {
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
