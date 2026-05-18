import { RetirementCategoryTabs } from "@/components/retirement/retirement-category-tabs";

/** Variant B sub-page 1: capital building up before retirement. */
export default function RetirementBuildVariantBBuildUp() {
  return (
    <RetirementCategoryTabs
      categories={["retirement-funds", "defined-benefit-funds", "voluntary-investments"]}
    />
  );
}
