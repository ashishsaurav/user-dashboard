import { useCallback } from "react";
import { LayoutData, PanelData, BoxData } from "rc-dock";
import { DockTabFactory } from "../components/dashboard/DockTabFactory";
import { LAYOUT_SIZES } from "../constants/layout";

interface LayoutUpdateActions {
  onToggleCollapse: () => void;
  onNavigationManage: () => void;
  onSystemSettings: () => void;
  onReopenReports: () => void;
  onReopenWidgets: () => void;
  onAddReport: () => void;
  onAddWidget: () => void;
  onCloseReports: () => void;
  onCloseWidgets: () => void;
}

interface LayoutUpdateOptions {
  addReports?: boolean;
  removeReports?: boolean;
  addWidgets?: boolean;
  removeWidgets?: boolean;
  updateNavigation?: boolean;
  updateReportsContent?: boolean;
  updateWidgetsContent?: boolean;
}

export function useIncrementalLayout() {
  /**
   * Creates a deep clone of the layout structure, excluding React elements and handling circular refs
   */
  const cloneLayoutStructure = (layout: LayoutData): LayoutData => {
    const seen = new WeakSet(); // Track visited objects to prevent infinite loops

    const clone = (obj: any): any => {
      // Handle primitives
      if (obj === null || obj === undefined) return obj;
      if (typeof obj !== "object") return obj;

      // Don't clone React elements - skip them
      if (obj.$$typeof) {
        return null; // React element marker
      }

      // Check for circular reference
      if (seen.has(obj)) {
        return undefined; // Skip circular references
      }

      // Mark this object as seen
      seen.add(obj);

      // Handle arrays
      if (Array.isArray(obj)) {
        return obj.map((item) => clone(item));
      }

      // Handle plain objects
      const cloned: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          // Skip 'content' property as it contains React elements
          if (key === "content") {
            cloned[key] = null; // Will be replaced later
          } else {
            cloned[key] = clone(obj[key]);
          }
        }
      }

      return cloned;
    };

    return clone(layout);
  };

  /**
   * Type guard to check if a child is a PanelData
   */
  const isPanelData = (child: BoxData | PanelData): child is PanelData => {
    return (child as PanelData).tabs !== undefined;
  };

  /**
   * Type guard to check if a child is a BoxData
   */
  const isBoxData = (child: BoxData | PanelData): child is BoxData => {
    return (child as BoxData).children !== undefined;
  };

  /**
   * Updates layout incrementally without full reload
   * Only adds/removes/updates panels that actually changed
   */
  const updateLayoutIncrementally = useCallback(
    (
      currentLayout: LayoutData,
      options: LayoutUpdateOptions,
      content: {
        navigation?: React.ReactNode;
        reports?: React.ReactNode;
        widgets?: React.ReactNode;
        welcome?: React.ReactNode;
      },
      actions: LayoutUpdateActions,
      config: {
        isDockCollapsed: boolean;
        navPanelOrientation: "vertical" | "horizontal";
        isAdmin: boolean;
        selectedView: any;
        reportsVisible: boolean;
        widgetsVisible: boolean;
      }
    ): LayoutData => {
      console.log("🔧 Incremental layout update:", options);

      // Deep clone to avoid mutations (excluding React elements)
      const newLayout = cloneLayoutStructure(currentLayout);

      if (!newLayout.dockbox?.children) {
        console.warn("⚠️ No dockbox children, returning current layout");
        return currentLayout;
      }

      const children = newLayout.dockbox.children;

      // Find existing panel indices
      const navIndex = children.findIndex(
        (child: any) => child.tabs?.[0]?.id === "navigation"
      );
      const reportsIndex = children.findIndex(
        (child: any) => child.tabs?.[0]?.id === "reports"
      );
      const widgetsIndex = children.findIndex((child: any) => {
        // Handle both flat and nested (vertical layout) structures
        if (child.tabs?.[0]?.id === "widgets") return true;
        if (child.children) {
          return child.children.some(
            (nested: any) => nested.tabs?.[0]?.id === "widgets"
          );
        }
        return false;
      });
      const welcomeIndex = children.findIndex((child: any) =>
        child.tabs?.[0]?.id?.startsWith("welcome")
      );

      console.log("📍 Current panel indices:", {
        nav: navIndex,
        reports: reportsIndex,
        widgets: widgetsIndex,
        welcome: welcomeIndex,
      });

      // ========================================================================
      // NAVIGATION PANEL UPDATES
      // ========================================================================
      if (options.updateNavigation && navIndex !== -1) {
        console.log("  ↻ Updating navigation content");
        const navPanel = children[navIndex];

        if (isPanelData(navPanel)) {
          navPanel.tabs[0] = DockTabFactory.createNavigationTab(
            actions,
            config.selectedView,
            config.reportsVisible,
            config.widgetsVisible,
            config.isAdmin,
            content.navigation!,
            config.isDockCollapsed,
            config.navPanelOrientation
          ) as any;

          // Update navigation panel size based on collapsed state
          const navSize = config.isDockCollapsed
            ? LAYOUT_SIZES.NAVIGATION_PANEL_COLLAPSED_WIDTH
            : LAYOUT_SIZES.NAVIGATION_PANEL_WIDTH;
          navPanel.size = navSize;
        }
      }

      // ========================================================================
      // REPORTS PANEL OPERATIONS
      // ========================================================================
      if (options.removeReports && reportsIndex !== -1) {
        console.log("  ✂️ Removing reports panel");
        children.splice(reportsIndex, 1);
      }

      if (options.addReports && reportsIndex === -1) {
        console.log("  ➕ Adding reports panel");
        const navSize = config.isDockCollapsed
          ? LAYOUT_SIZES.NAVIGATION_PANEL_COLLAPSED_WIDTH
          : LAYOUT_SIZES.NAVIGATION_PANEL_WIDTH;
        children.splice(1, 0, {
          tabs: [
            DockTabFactory.createReportsTab(actions, content.reports!) as any,
          ],
          size: config.widgetsVisible ? 700 : 1300 - navSize,
          minSize: LAYOUT_SIZES.CONTENT_PANEL_MIN_WIDTH,
          group: "main",
        } as PanelData);
      }

      if (options.updateReportsContent && reportsIndex !== -1) {
        console.log("  ↻ Updating reports content (in-place)");
        const reportsPanel = children[reportsIndex];

        if (isPanelData(reportsPanel)) {
          reportsPanel.tabs[0].content = content.reports as any;
        }
      }

      // ========================================================================
      // WIDGETS PANEL OPERATIONS
      // ========================================================================
      if (options.removeWidgets && widgetsIndex !== -1) {
        console.log("  ✂️ Removing widgets panel");
        children.splice(widgetsIndex, 1);
      }

      if (options.addWidgets && widgetsIndex === -1) {
        console.log("  ➕ Adding widgets panel");
        const navSize = config.isDockCollapsed
          ? LAYOUT_SIZES.NAVIGATION_PANEL_COLLAPSED_WIDTH
          : LAYOUT_SIZES.NAVIGATION_PANEL_WIDTH;
        const insertIndex = reportsIndex !== -1 ? 2 : 1;
        children.splice(insertIndex, 0, {
          tabs: [
            DockTabFactory.createWidgetsTab(actions, content.widgets!) as any,
          ],
          size: config.reportsVisible ? 350 : 1300 - navSize,
          minSize: LAYOUT_SIZES.CONTENT_PANEL_MIN_WIDTH,
          group: "main",
        } as PanelData);
      }

      if (options.updateWidgetsContent && widgetsIndex !== -1) {
        console.log("  ↻ Updating widgets content (in-place)");
        const widgetsPanel = children[widgetsIndex];

        // Handle nested structure (vertical layout)
        if (
          isPanelData(widgetsPanel) &&
          widgetsPanel.tabs?.[0]?.id === "widgets"
        ) {
          widgetsPanel.tabs[0].content = content.widgets as any;
        } else if (isBoxData(widgetsPanel) && widgetsPanel.children) {
          const nestedWidgetsIndex = widgetsPanel.children.findIndex(
            (nested: any) => nested.tabs?.[0]?.id === "widgets"
          );
          if (nestedWidgetsIndex !== -1) {
            const nestedPanel = widgetsPanel.children[nestedWidgetsIndex];
            if (isPanelData(nestedPanel)) {
              nestedPanel.tabs[0].content = content.widgets as any;
            }
          }
        }
      }

      // ========================================================================
      // WELCOME PANEL OPERATIONS
      // ========================================================================
      // Remove welcome if content panels exist
      if (welcomeIndex !== -1 && (options.addReports || options.addWidgets)) {
        console.log("  ✂️ Removing welcome panel");
        children.splice(welcomeIndex, 1);
      }

      // Add welcome if no content panels
      if (
        welcomeIndex === -1 &&
        !options.addReports &&
        !options.addWidgets &&
        reportsIndex === -1 &&
        widgetsIndex === -1
      ) {
        console.log("  ➕ Adding welcome panel");
        const navSize = config.isDockCollapsed
          ? LAYOUT_SIZES.NAVIGATION_PANEL_COLLAPSED_WIDTH
          : LAYOUT_SIZES.NAVIGATION_PANEL_WIDTH;
        children.push({
          tabs: [
            DockTabFactory.createWelcomeTab(
              content.welcome!,
              config.selectedView?.name,
              {
                showReportsButton: config.selectedView?.reportIds?.length > 0,
                showWidgetsButton: config.selectedView?.widgetIds?.length > 0,
              }
            ) as any,
          ],
          size: 1300 - navSize,
          group: "main",
        } as PanelData);
      }

      console.log("✅ Incremental update complete");
      return newLayout;
    },
    []
  );

  return { updateLayoutIncrementally };
}
