import { RetirementCategoryTabs } from "@/components/retirement/retirement-category-tabs";

/** Variant B sub-page 2: events on/after the retirement date. */
export default function RetirementBuildVariantBEvents() {
  return (
    <RetirementCategoryTabs categories={["future-inflows", "lump-sum-needs"]} />
  );
}
