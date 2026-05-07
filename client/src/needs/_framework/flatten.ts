import type { FlatNeedItem, NeedConfig } from "./types";

/**
 * Flatten a NeedConfig into a single linear sequence for the action bar.
 *
 * Walks: step → step.sections → section.children. A step with no sections
 * contributes itself; a section with no children contributes itself; a section
 * with children expands to its children (the parent acts as a group label,
 * not a destination).
 */
export function flattenNeed(config: NeedConfig): FlatNeedItem[] {
  const items: FlatNeedItem[] = [];

  for (const step of config.steps) {
    if (step.sections.length === 0) {
      items.push({
        step,
        path: step.path,
        breadcrumb: `${config.label} > ${step.label}`,
      });
      continue;
    }

    for (const section of step.sections) {
      if (section.children && section.children.length > 0) {
        for (const child of section.children) {
          items.push({
            step,
            section,
            child,
            path: child.path,
            breadcrumb: `${config.label} > ${step.label} > ${section.label} > ${child.label}`,
          });
        }
      } else {
        items.push({
          step,
          section,
          path: section.path,
          breadcrumb: `${config.label} > ${step.label} > ${section.label}`,
        });
      }
    }
  }

  return items;
}

export function findItemByPath(config: NeedConfig, path: string): { index: number; item: FlatNeedItem | null } {
  const flat = flattenNeed(config);
  const idx = flat.findIndex(i => i.path === path);
  return { index: idx, item: idx >= 0 ? flat[idx] : null };
}

/**
 * Find the step the user is currently on, given the URL.
 * Falls back to the first step if no match.
 */
export function findCurrentStep(config: NeedConfig, path: string) {
  for (const step of config.steps) {
    if (path === step.path || path.startsWith(step.path + "/")) return step;
    if (step.sections.some(s => path === s.path || s.children?.some(c => path === c.path))) return step;
  }
  return config.steps[0];
}
