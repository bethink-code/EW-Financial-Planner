import { RetirementCategoryTabs } from "@/components/retirement/retirement-category-tabs";

/** Variant B sub-page 3: lifestyle during retirement (income flows). */
export default function RetirementBuildVariantBLifestyle() {
  return (
    <RetirementCategoryTabs categories={["income-required", "income-provided"]} />
  );
}
