import { needs, Need, Step, NavigationItem } from "@shared/navigation-config";

export interface SequentialNavItem {
  id: string;
  label: string;
  path: string;
  hasContent: boolean;
  needId: string;
  needLabel: string;
  stepId?: string;
  stepLabel?: string;
  stepNumber?: number;
  sectionId?: string;
  sectionLabel?: string;
  breadcrumb: string;
}

/**
 * Flattens all navigational items from all needs into a sequential list
 * Only includes items that have content (hasContent: true)
 */
export function buildSequentialNavigation(): SequentialNavItem[] {
  const items: SequentialNavItem[] = [];

  needs.forEach(need => {
    if (!need.hasContent) return;

    // If need has steps, process them
    if (need.steps && need.steps.length > 0) {
      need.steps.forEach(step => {
        if (!step.hasContent) return;

        // If step has sections, process them
        if (step.sections && step.sections.length > 0) {
          step.sections.forEach(section => {
            // Process section children if they exist
            if (section.children && section.children.length > 0) {
              section.children.forEach(child => {
                if (child.hasContent) {
                  items.push({
                    id: child.id,
                    label: child.label,
                    path: child.path,
                    hasContent: child.hasContent,
                    needId: need.id,
                    needLabel: need.label,
                    stepId: step.id,
                    stepLabel: step.label,
                    stepNumber: step.number,
                    sectionId: section.id,
                    sectionLabel: section.label,
                    breadcrumb: `${need.label} > ${step.label} > ${section.label} > ${child.label}`
                  });
                }
              });
            } else if (section.hasContent) {
              // Section has content directly
              items.push({
                id: section.id,
                label: section.label,
                path: section.path,
                hasContent: section.hasContent,
                needId: need.id,
                needLabel: need.label,
                stepId: step.id,
                stepLabel: step.label,
                stepNumber: step.number,
                sectionId: section.id,
                sectionLabel: section.label,
                breadcrumb: `${need.label} > ${step.label} > ${section.label}`
              });
            }
          });
        } else {
          // Step has content directly (no sections)
          items.push({
            id: step.id,
            label: step.label,
            path: step.path,
            hasContent: step.hasContent,
            needId: need.id,
            needLabel: need.label,
            stepId: step.id,
            stepLabel: step.label,
            stepNumber: step.number,
            breadcrumb: `${need.label} > ${step.label}`
          });
        }
      });
    } else {
      // Need has content directly (no steps)
      items.push({
        id: need.id,
        label: need.label,
        path: need.path,
        hasContent: need.hasContent,
        needId: need.id,
        needLabel: need.label,
        breadcrumb: need.label
      });
    }
  });

  return items;
}

/**
 * Gets the current navigation item based on the current path
 */
export function getCurrentNavItem(currentPath: string): SequentialNavItem | null {
  const allItems = buildSequentialNavigation();
  
  // Find exact match first
  let currentItem = allItems.find(item => item.path === currentPath);
  
  // If no exact match, try to find a partial match
  if (!currentItem) {
    currentItem = allItems.find(item => 
      currentPath.includes(item.path) && item.path !== '/'
    );
  }
  
  // If still no match and we're on a calculator route, try reverse matching
  if (!currentItem) {
    currentItem = allItems.find(item => 
      item.path.includes(currentPath) && currentPath !== '/'
    );
  }
  
  return currentItem || null;
}

/**
 * Gets the previous navigation item
 */
export function getPreviousNavItem(currentPath: string): SequentialNavItem | null {
  const allItems = buildSequentialNavigation();
  const currentItem = getCurrentNavItem(currentPath);
  
  if (!currentItem) return null;
  
  const currentIndex = allItems.findIndex(item => item.id === currentItem.id);
  
  if (currentIndex <= 0) return null;
  
  return allItems[currentIndex - 1];
}

/**
 * Gets the next navigation item
 */
export function getNextNavItem(currentPath: string): SequentialNavItem | null {
  const allItems = buildSequentialNavigation();
  const currentItem = getCurrentNavItem(currentPath);
  
  if (!currentItem) return null;
  
  const currentIndex = allItems.findIndex(item => item.id === currentItem.id);
  
  if (currentIndex < 0 || currentIndex >= allItems.length - 1) return null;
  
  return allItems[currentIndex + 1];
}

/**
 * Gets the current position and total count
 */
export function getNavigationProgress(currentPath: string): { current: number; total: number } {
  const allItems = buildSequentialNavigation();
  const currentItem = getCurrentNavItem(currentPath);
  
  if (!currentItem) {
    return { current: 0, total: allItems.length };
  }
  
  const currentIndex = allItems.findIndex(item => item.id === currentItem.id);
  
  return {
    current: currentIndex + 1,
    total: allItems.length
  };
}