import { RetirementCategoryTabs } from "@/components/retirement/retirement-category-tabs";

/** Variant C sub-page 1: everything that supplies capital or income. */
export default function RetirementBuildVariantCSources() {
  return (
    <RetirementCategoryTabs
      categories={[
        "retirement-funds",
        "defined-benefit-funds",
        "voluntary-investments",
        "future-inflows",
        "income-provided",
      ]}
    />
  );
}
