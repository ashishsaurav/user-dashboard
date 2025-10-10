import { LayoutData } from "rc-dock";

/**
 * Utility functions for layout management
 */

/**
 * Deep clone a layout object to avoid mutations
 */
export const cloneLayout = (layout: LayoutData): LayoutData => {
  return JSON.parse(JSON.stringify(layout));
};

/**
 * Find a panel in a layout by ID
 */
export const findPanelById = (
  layout: LayoutData,
  panelId: string
): any | null => {
  const search = (obj: any): any => {
    if (obj?.id === panelId) return obj;
    if (obj?.children) {
      for (const child of obj.children) {
        const found = search(child);
        if (found) return found;
      }
    }
    if (obj?.tabs) {
      for (const tab of obj.tabs) {
        if (tab?.id === panelId) return tab;
      }
    }
    return null;
  };

  return search(layout.dockbox);
};

/**
 * Update panel content in a layout
 */
export const updatePanelContent = (
  layout: LayoutData,
  panelId: string,
  newContent: any
): LayoutData => {
  const cloned = cloneLayout(layout);
  const panel = findPanelById(cloned, panelId);
  
  if (panel) {
    panel.content = newContent;
  }
  
  return cloned;
};

/**
 * Get all panel IDs in a layout
 */
export const getAllPanelIds = (layout: LayoutData): string[] => {
  const ids: string[] = [];
  
  const collect = (obj: any) => {
    if (obj?.id) ids.push(obj.id);
    if (obj?.children) {
      obj.children.forEach(collect);
    }
    if (obj?.tabs) {
      obj.tabs.forEach((tab: any) => {
        if (tab?.id) ids.push(tab.id);
      });
    }
  };
  
  collect(layout.dockbox);
  return ids;
};

/**
 * Check if a layout has a specific panel
 */
export const hasPanel = (layout: LayoutData, panelId: string): boolean => {
  return findPanelById(layout, panelId) !== null;
};

/**
 * Get layout mode from layout structure
 */
export const getLayoutMode = (layout: LayoutData): "horizontal" | "vertical" => {
  return layout.dockbox?.mode === "vertical" ? "vertical" : "horizontal";
};

/**
 * Calculate total panel count
 */
export const getPanelCount = (layout: LayoutData): number => {
  return getAllPanelIds(layout).length;
};

/**
 * Validate layout structure
 */
export const isValidLayout = (layout: any): layout is LayoutData => {
  return (
    layout &&
    typeof layout === "object" &&
    "dockbox" in layout &&
    layout.dockbox &&
    typeof layout.dockbox === "object"
  );
};
