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

  // Navigation is always present
  parts.push(isDockCollapsed ? "nav-collapsed" : "nav");

  // Determine content panels
  if (!selectedView) {
    // No view selected - show welcome
    parts.push("welcome-noview");
  } else if (!hasReports && !hasWidgets) {
    // View selected but no content - show welcome with add options
    parts.push("welcome-empty");
  } else {
    // View has content
    const showReports = hasReports && reportsVisible;
    const showWidgets = hasWidgets && widgetsVisible;

    if (showReports && showWidgets) {
      parts.push("reports", "widgets");
    } else if (showReports) {
      parts.push("reports");
    } else if (showWidgets) {
      parts.push("widgets");
    } else {
      // Both sections closed - show welcome
      parts.push("welcome-closed");
    }
  }

  // Add layout mode
  parts.push(layoutMode);

  return parts.join("+");
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
   */
  saveLayout: (
    userId: string,
    signature: LayoutSignature,
    layout: LayoutData
  ): void => {
    try {
      const userLayouts = layoutPersistenceService.loadUserLayouts(userId);

      userLayouts.layouts[signature] = {
        signature,
        layout,
        timestamp: Date.now(),
      };

      const storageKey = layoutPersistenceService.getStorageKey(userId);
      sessionStorage.setItem(storageKey, JSON.stringify(userLayouts));

      console.log(
        `💾 Layout saved for signature: ${signature}`,
        layout
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
};
