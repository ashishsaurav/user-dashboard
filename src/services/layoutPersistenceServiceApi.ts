/**
 * ============================================================================
 * LAYOUT PERSISTENCE SERVICE - API VERSION
 * ============================================================================
 * 
 * This service integrates with the backend API for layout persistence
 * instead of using sessionStorage. It maintains the same interface as
 * the original layoutPersistenceService for easy drop-in replacement.
 */

import { LayoutData } from "rc-dock";
import { layoutService } from './layoutService';

export type LayoutSignature = string;

/**
 * Generate a layout signature based on current state
 * (Same as original - keeping coarse-grained signature strategy)
 */
export const generateLayoutSignature = (params: {
  selectedView: boolean;
  hasReports: boolean;
  hasWidgets: boolean;
  reportsVisible: boolean;
  widgetsVisible: boolean;
  layoutMode: "horizontal" | "vertical";
  isDockCollapsed: boolean;
}): LayoutSignature => {
  const {
    selectedView,
    hasReports,
    hasWidgets,
    layoutMode,
    isDockCollapsed,
  } = params;

  const parts: string[] = [];

  parts.push(isDockCollapsed ? "nav-collapsed" : "nav");

  if (!selectedView) {
    parts.push("no-view");
  } else if (!hasReports && !hasWidgets) {
    parts.push("empty-view");
  } else {
    const contentType: string[] = [];
    if (hasReports) contentType.push("reports");
    if (hasWidgets) contentType.push("widgets");
    parts.push(`content-${contentType.join("-")}`);
  }

  parts.push(layoutMode);

  return parts.join("+");
};

/**
 * Layout Persistence Service - API Version
 */
export const layoutPersistenceService = {
  /**
   * Load layout customization for a specific signature
   */
  loadLayout: async (
    userId: string,
    signature: LayoutSignature
  ): Promise<LayoutData | null> => {
    try {
      const customization = await layoutService.getLayout(userId, signature);
      if (customization) {
        console.log(
          `📂 Layout loaded from API for signature: ${signature}`,
          customization.layout
        );
        return customization.layout;
      }

      console.log(
        `📭 No saved layout found in API for signature: ${signature}`
      );
      return null;
    } catch (error) {
      console.error("Error loading layout from API:", error);
      return null;
    }
  },

  /**
   * Save layout customization for a specific signature
   */
  saveLayout: async (
    userId: string,
    signature: LayoutSignature,
    layout: LayoutData
  ): Promise<void> => {
    try {
      await layoutService.saveLayout(userId, signature, layout);
      console.log(
        `💾 Layout saved to API for signature: ${signature}`
      );
    } catch (error) {
      console.error("Error saving layout to API:", error);
    }
  },

  /**
   * Check if a layout exists for a signature
   */
  hasLayout: async (userId: string, signature: LayoutSignature): Promise<boolean> => {
    try {
      const layout = await layoutService.getLayout(userId, signature);
      return layout !== null;
    } catch {
      return false;
    }
  },

  /**
   * Clear layout for a specific signature
   */
  clearLayout: async (userId: string, signature: LayoutSignature): Promise<void> => {
    try {
      await layoutService.deleteLayout(userId, signature);
      console.log(`🗑️ Layout cleared from API for signature: ${signature}`);
    } catch (error) {
      console.error("Error clearing layout from API:", error);
    }
  },

  /**
   * Clear all layouts for a user
   */
  clearAllLayouts: async (userId: string): Promise<void> => {
    try {
      await layoutService.deleteAllLayouts(userId);
      console.log(`🗑️ All layouts cleared from API for user: ${userId}`);
    } catch (error) {
      console.error("Error clearing all layouts from API:", error);
    }
  },

  /**
   * Get all saved signatures for a user
   */
  getSavedSignatures: async (userId: string): Promise<LayoutSignature[]> => {
    try {
      const layouts = await layoutService.getUserLayouts(userId);
      return layouts.map(l => l.signature);
    } catch (error) {
      console.error("Error getting saved signatures from API:", error);
      return [];
    }
  },

  /**
   * Extract navigation panel state from a layout
   */
  extractNavigationState: (layout: LayoutData): any => {
    if (!layout?.dockbox?.children) return null;

    const findNavPanel = (children: any[]): any => {
      for (const child of children) {
        if (child.tabs?.some((tab: any) => tab.id === "navigation")) {
          return {
            size: child.size,
            minSize: child.minSize,
            maxSize: child.maxSize,
          };
        }
        if (child.children) {
          const found = findNavPanel(child.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findNavPanel(layout.dockbox.children);
  },

  /**
   * Apply navigation panel state to a layout
   */
  applyNavigationState: (layout: LayoutData, navState: any): LayoutData => {
    if (!layout?.dockbox?.children || !navState) return layout;

    const applyToPanel = (children: any[]): boolean => {
      for (const child of children) {
        if (child.tabs?.some((tab: any) => tab.id === "navigation")) {
          if (navState.size !== undefined) child.size = navState.size;
          if (navState.minSize !== undefined) child.minSize = navState.minSize;
          if (navState.maxSize !== undefined) child.maxSize = navState.maxSize;
          return true;
        }
        if (child.children && applyToPanel(child.children)) {
          return true;
        }
      }
      return false;
    };

    applyToPanel(layout.dockbox.children);
    return layout;
  },
};
