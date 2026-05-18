import { RetirementCategoryTabs } from "@/components/retirement/retirement-category-tabs";

/** Variant C sub-page 2: everything that consumes capital or income. */
export default function RetirementBuildVariantCUses() {
  return (
    <RetirementCategoryTabs categories={["lump-sum-needs", "income-required"]} />
  );
}
