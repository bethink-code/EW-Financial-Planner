import { CustomTabs } from "@/components/ui/custom-tabs";
import type { NeedStep } from "./types";

/** Flatten a step's sections into a tab list. Sections with children render
 *  each child as a top-level tab using just the child's label — the parent
 *  grouping exists for config-organisation only, not for display. (If we
 *  ever need ambiguous-label disambiguation, this is the place to re-add
 *  the "Parent — Child" prefix.) */
function buildSectionTabs(step: NeedStep): { id: string; label: string; href: string }[] {
  return step.sections.flatMap(section =>
    section.children && section.children.length > 0
      ? section.children.map(child => ({
          id: child.id,
          label: child.label,
          href: child.path,
        }))
      : [{ id: section.id, label: section.label, href: section.path }],
  );
}

interface NeedNavigationProps {
  step: NeedStep;
}

/**
 * Section tab strip for the current step. Renders nothing when the step has
 * no sub-pages. Overflow → "More ▼" handling lives in CustomTabs.
 */
export function NeedNavigation({ step }: NeedNavigationProps) {
  const tabs = buildSectionTabs(step);
  if (tabs.length === 0) return null;

  return (
    <section className="w-full px-6 pt-4" aria-label="Need navigation">
      <div className="w-[1320px] max-w-full">
        <CustomTabs tabs={tabs} activeTab="" useLinks className="mb-0" />
      </div>
    </section>
  );
}
