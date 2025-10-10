import { LayoutData } from "rc-dock";

/**
 * ============================================================================
 * LAYOUT PERSISTENCE SERVICE
 * ============================================================================
 * 
 * This service provides a robust system for persisting user layout customizations
 * while automatically resetting to defaults when the layout structure changes.
 * 
 * HOW IT WORKS:
 * -------------
 * 1. Layout Signature: A unique string representing which panels are visible
 *    Examples:
 *    - "nav+welcome-noview+horizontal" (no view selected)
 *    - "nav+reports+widgets+horizontal" (view with both reports and widgets)
 *    - "nav+reports+horizontal" (view with only reports)
 *    - "nav-collapsed+widgets+vertical" (collapsed nav, only widgets, vertical layout)
 * 
 * 2. When user makes changes (resize, reorder panels):
 *    - The layout is saved with its current signature
 *    - Next time the same signature appears, saved layout is restored
 * 
 * 3. When layout structure changes (different view, panels added/removed):
 *    - A new signature is generated
 *    - If no saved layout exists for new signature → default layout is used
 *    - If saved layout exists for new signature → it's restored
 * 
 * BENEFITS:
 * ---------
 * - User customizations persist across sessions
 * - Layout automatically resets when structure changes
 * - Each layout configuration has its own customizations
 * - User-specific (different users have different layouts)
 * 
 * STORAGE:
 * --------
 * - Uses sessionStorage for temporary persistence
 * - Stored per user: `layoutCustomizations_${userId}`
 * - Can be exported/imported for backup/migration
 * 
 * ============================================================================
 */

/**
 * Layout Signature - represents which panels are visible
 * Examples:
 * - "nav+welcome-noview+horizontal" (no view selected)
 * - "nav+reports+widgets+horizontal" (view with both reports and widgets)
 * - "nav+reports+horizontal" (view with only reports)
 * - "nav+widgets+vertical" (view with only widgets)
 * - "nav+welcome-empty+horizontal" (view selected but no content, can add)
 */
export type LayoutSignature = string;

/**
 * Stored layout data for a specific signature
 */
interface StoredLayoutData {
  signature: LayoutSignature;
  layout: LayoutData;
  timestamp: number;
}

/**
 * User-specific layout customizations
 */
interface UserLayoutCustomizations {
  userId: string;
  layouts: Record<LayoutSignature, StoredLayoutData>;
}

/**
 * Generate a layout signature based on current state
 * 
 * STRATEGY: Use a coarse-grained signature that focuses on major structural changes
 * rather than panel visibility. This allows navigation customizations to persist
 * when only content panels change.
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
    reportsVisible,
    widgetsVisible,
    layoutMode,
    isDockCollapsed,
  } = params;

  const parts: string[] = [];

  // Navigation collapse state (kept separate to preserve across content changes)
  parts.push(isDockCollapsed ? "nav-collapsed" : "nav");

  // Determine POTENTIAL content (not just visible)
  // This makes signature more stable when panels are toggled
  if (!selectedView) {
    // No view selected
    parts.push("no-view");
  } else if (!hasReports && !hasWidgets) {
    // View selected but no content available
    parts.push("empty-view");
  } else {
    // View has content - signature based on what's AVAILABLE, not just visible
    // This way, toggling visibility doesn't change signature
    const contentType: string[] = [];
    if (hasReports) contentType.push("reports");
    if (hasWidgets) contentType.push("widgets");
    parts.push(`content-${contentType.join("-")}`);
  }

  // Add layout mode
  parts.push(layoutMode);

  return parts.join("+");
};

/**
 * Helper function to sanitize layout for storage
 * Removes React component content which can't be serialized
 */
const sanitizeLayoutForStorage = (layout: LayoutData): LayoutData => {
  if (!layout) return layout;

  const sanitizePanel = (panel: any): any => {
    const sanitized = { ...panel };
    
    // Remove React component content from tabs
    if (sanitized.tabs) {
      sanitized.tabs = sanitized.tabs.map((tab: any) => ({
        ...tab,
        content: undefined, // Remove React components
      }));
    }
    
    // Recursively sanitize children
    if (sanitized.children) {
      sanitized.children = sanitized.children.map(sanitizePanel);
    }
    
    return sanitized;
  };

  const sanitized = { ...layout };
  if (sanitized.dockbox?.children) {
    sanitized.dockbox = {
      ...sanitized.dockbox,
      children: sanitized.dockbox.children.map(sanitizePanel),
    };
  }
  
  return sanitized;
};

/**
 * Layout Persistence Service
 */
export const layoutPersistenceService = {
  /**
   * Get storage key for user layouts
   */
  getStorageKey: (userId: string): string => {
    return `layoutCustomizations_${userId}`;
  },

  /**
   * Load all layout customizations for a user
   */
  loadUserLayouts: (userId: string): UserLayoutCustomizations => {
    try {
      const storageKey = layoutPersistenceService.getStorageKey(userId);
      const stored = sessionStorage.getItem(storageKey);

      if (stored) {
        const parsed = JSON.parse(stored) as UserLayoutCustomizations;
        return parsed;
      }

      return {
        userId,
        layouts: {},
      };
    } catch (error) {
      console.error("Error loading user layouts:", error);
      return {
        userId,
        layouts: {},
      };
    }
  },

  /**
   * Save layout customization for a specific signature
   * 
   * NOTE: We sanitize the layout to remove React components before saving
   * to avoid circular reference errors during JSON serialization
   */
  saveLayout: (
    userId: string,
    signature: LayoutSignature,
    layout: LayoutData
  ): void => {
    try {
      const userLayouts = layoutPersistenceService.loadUserLayouts(userId);

      // Sanitize layout to remove React components that can't be serialized
      const sanitizedLayout = sanitizeLayoutForStorage(layout);

      userLayouts.layouts[signature] = {
        signature,
        layout: sanitizedLayout,
        timestamp: Date.now(),
      };

      const storageKey = layoutPersistenceService.getStorageKey(userId);
      sessionStorage.setItem(storageKey, JSON.stringify(userLayouts));

      console.log(
        `💾 Layout saved for signature: ${signature}`,
        sanitizedLayout
      );
    } catch (error) {
      console.error("Error saving layout:", error);
    }
  },

  /**
   * Load layout customization for a specific signature
   */
  loadLayout: (
    userId: string,
    signature: LayoutSignature
  ): LayoutData | null => {
    try {
      const userLayouts = layoutPersistenceService.loadUserLayouts(userId);
      const stored = userLayouts.layouts[signature];

      if (stored) {
        console.log(
          `📂 Layout loaded for signature: ${signature}`,
          stored.layout
        );
        return stored.layout;
      }

      console.log(
        `📭 No saved layout found for signature: ${signature}`
      );
      return null;
    } catch (error) {
      console.error("Error loading layout:", error);
      return null;
    }
  },

  /**
   * Check if a layout exists for a signature
   */
  hasLayout: (userId: string, signature: LayoutSignature): boolean => {
    const userLayouts = layoutPersistenceService.loadUserLayouts(userId);
    return signature in userLayouts.layouts;
  },

  /**
   * Clear layout for a specific signature
   */
  clearLayout: (userId: string, signature: LayoutSignature): void => {
    try {
      const userLayouts = layoutPersistenceService.loadUserLayouts(userId);
      delete userLayouts.layouts[signature];

      const storageKey = layoutPersistenceService.getStorageKey(userId);
      sessionStorage.setItem(storageKey, JSON.stringify(userLayouts));

      console.log(`🗑️ Layout cleared for signature: ${signature}`);
    } catch (error) {
      console.error("Error clearing layout:", error);
    }
  },

  /**
   * Clear all layouts for a user
   */
  clearAllLayouts: (userId: string): void => {
    try {
      const storageKey = layoutPersistenceService.getStorageKey(userId);
      sessionStorage.removeItem(storageKey);
      console.log(`🗑️ All layouts cleared for user: ${userId}`);
    } catch (error) {
      console.error("Error clearing all layouts:", error);
    }
  },

  /**
   * Get all saved signatures for a user
   */
  getSavedSignatures: (userId: string): LayoutSignature[] => {
    const userLayouts = layoutPersistenceService.loadUserLayouts(userId);
    return Object.keys(userLayouts.layouts);
  },

  /**
   * Clean up old layouts (older than 30 days)
   */
  cleanupOldLayouts: (userId: string, daysToKeep: number = 30): void => {
    try {
      const userLayouts = layoutPersistenceService.loadUserLayouts(userId);
      const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;

      let cleaned = 0;
      Object.entries(userLayouts.layouts).forEach(([signature, data]) => {
        if (data.timestamp < cutoffTime) {
          delete userLayouts.layouts[signature];
          cleaned++;
        }
      });

      if (cleaned > 0) {
        const storageKey = layoutPersistenceService.getStorageKey(userId);
        sessionStorage.setItem(storageKey, JSON.stringify(userLayouts));
        console.log(`🧹 Cleaned up ${cleaned} old layouts`);
      }
    } catch (error) {
      console.error("Error cleaning up old layouts:", error);
    }
  },

  /**
   * Export user layouts (for backup/migration)
   */
  exportLayouts: (userId: string): string => {
    const userLayouts = layoutPersistenceService.loadUserLayouts(userId);
    return JSON.stringify(userLayouts, null, 2);
  },

  /**
   * Import user layouts (from backup/migration)
   */
  importLayouts: (userId: string, layoutsJson: string): boolean => {
    try {
      const imported = JSON.parse(layoutsJson) as UserLayoutCustomizations;

      if (imported.userId !== userId) {
        console.warn(
          `User ID mismatch: expected ${userId}, got ${imported.userId}`
        );
        // Update user ID to match
        imported.userId = userId;
      }

      const storageKey = layoutPersistenceService.getStorageKey(userId);
      sessionStorage.setItem(storageKey, JSON.stringify(imported));

      console.log(`📥 Imported ${Object.keys(imported.layouts).length} layouts`);
      return true;
    } catch (error) {
      console.error("Error importing layouts:", error);
      return false;
    }
  },

  /**
   * Extract navigation panel state from a layout
   * This allows preserving navigation customizations across layout changes
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
   * This preserves navigation customizations when updating layout
   * 
   * NOTE: We modify the layout in place because React components in the layout
   * contain circular references that can't be JSON-serialized for deep cloning.
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

    // Modify layout in place (no deep clone needed since we only update size properties)
    applyToPanel(layout.dockbox.children);
    return layout;
  },
};
