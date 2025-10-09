import { useCallback } from "react";
import { LayoutData } from "rc-dock";
import { View } from "../../types";
import { DockTabFactory } from "./DockTabFactory";
import { LAYOUT_SIZES } from "../../constants/layout";

interface DockLayoutManagerProps {
  selectedView: View | null;
  reportsVisible: boolean;
  widgetsVisible: boolean;
  isAdmin: boolean;
  isDockCollapsed?: boolean;
  layoutMode?: "horizontal" | "vertical"; // NEW: Support for vertical layouts
  navPanelOrientation?: "vertical" | "horizontal"; // Navigation panel orientation
  actions: {
    onToggleCollapse: () => void;
    onNavigationManage: () => void;
    onSystemSettings: () => void;
    onReopenReports: () => void;
    onReopenWidgets: () => void;
    onAddReport: () => void;
    onAddWidget: () => void;
    onCloseReports: () => void;
    onCloseWidgets: () => void;
  };
  content: {
    navigation: React.ReactNode;
    reports: React.ReactNode;
    widgets: React.ReactNode;
    welcome: React.ReactNode;
  };
}

export function useDockLayoutManager({
  selectedView,
  reportsVisible,
  widgetsVisible,
  isAdmin,
  isDockCollapsed = false,
  layoutMode = "horizontal", // NEW: Default to horizontal
  navPanelOrientation = "vertical", // Default to vertical
  actions,
  content,
}: DockLayoutManagerProps) {
  const generateDynamicLayout = useCallback((): LayoutData => {
    const children: any[] = [];

    // Navigation panel - adjust size based on collapsed state
    const navSize = isDockCollapsed
      ? LAYOUT_SIZES.NAVIGATION_PANEL_COLLAPSED_WIDTH
      : LAYOUT_SIZES.NAVIGATION_PANEL_WIDTH;

    children.push({
      tabs: [
        DockTabFactory.createNavigationTab(
          actions,
          selectedView,
          reportsVisible,
          widgetsVisible,
          isAdmin,
          content.navigation,
          isDockCollapsed,
          navPanelOrientation
        ),
      ],
      size: navSize,
      minSize: isDockCollapsed
        ? LAYOUT_SIZES.NAVIGATION_PANEL_COLLAPSED_WIDTH
        : LAYOUT_SIZES.NAVIGATION_PANEL_MIN_WIDTH,
      maxSize: LAYOUT_SIZES.NAVIGATION_PANEL_MAX_WIDTH,
      group: "main",
    });

    // If no view is selected, show default welcome
    if (!selectedView) {
      children.push({
        tabs: [
          DockTabFactory.createWelcomeTab(content.welcome, undefined, {
            showReportsButton: false,
            showWidgetsButton: false,
          }),
        ],
        size: 1300 - navSize,
        group: "main",
      });

      return {
        dockbox: {
          mode: "horizontal",
          children,
        },
      };
    }

    // Check if view has reports or widgets
    const hasReports =
      selectedView.reportIds && selectedView.reportIds.length > 0;
    const hasWidgets =
      selectedView.widgetIds && selectedView.widgetIds.length > 0;

    // Add content panels based on layout mode
    if (layoutMode === "horizontal") {
      // Horizontal layout: side-by-side

      // Only create reports tab if view has reports AND reportsVisible is true
      if (reportsVisible && hasReports) {
        children.push({
          tabs: [DockTabFactory.createReportsTab(actions, content.reports)],
          size: widgetsVisible && hasWidgets ? 700 : 1300 - navSize,
          minSize: LAYOUT_SIZES.CONTENT_PANEL_MIN_WIDTH,
          group: "main",
        });
      }

      // Only create widgets tab if view has widgets AND widgetsVisible is true
      if (widgetsVisible && hasWidgets) {
        children.push({
          tabs: [DockTabFactory.createWidgetsTab(actions, content.widgets)],
          size: reportsVisible && hasReports ? 350 : 1300 - navSize,
          minSize: LAYOUT_SIZES.CONTENT_PANEL_MIN_WIDTH,
          group: "main",
        });
      }
    } else {
      // Vertical layout: stacked
      const contentChildren: any[] = [];

      // Only create reports tab if view has reports AND reportsVisible is true
      if (reportsVisible && hasReports) {
        contentChildren.push({
          tabs: [DockTabFactory.createReportsTab(actions, content.reports)],
          size:
            widgetsVisible && hasWidgets
              ? LAYOUT_SIZES.DEFAULT_PANEL_HEIGHT
              : 800,
          minSize: LAYOUT_SIZES.CONTENT_PANEL_MIN_HEIGHT,
          group: "main",
        });
      }

      // Only create widgets tab if view has widgets AND widgetsVisible is true
      if (widgetsVisible && hasWidgets) {
        contentChildren.push({
          tabs: [DockTabFactory.createWidgetsTab(actions, content.widgets)],
          size:
            reportsVisible && hasReports
              ? LAYOUT_SIZES.DEFAULT_PANEL_HEIGHT
              : 800,
          minSize: LAYOUT_SIZES.CONTENT_PANEL_MIN_HEIGHT,
          group: "main",
        });
      }

      // Add vertical content box only if we have content
      if (contentChildren.length > 0) {
        children.push({
          mode: "vertical" as const,
          children: contentChildren,
          size: 1300 - navSize,
          minSize: LAYOUT_SIZES.CONTENT_PANEL_MIN_WIDTH,
        });
      }
    }

    // Determine if any content panels were actually added
    const reportsPanelAdded = reportsVisible && hasReports;
    const widgetsPanelAdded = widgetsVisible && hasWidgets;
    const hasAnyVisibleContent = reportsPanelAdded || widgetsPanelAdded;

    // Show welcome when NO visible content panels exist
    if (!hasAnyVisibleContent) {
      // Determine which buttons to show based on what the view has
      const welcomeOptions = {
        showReportsButton: hasReports, // Show reports button if view has reports (but closed)
        showWidgetsButton: hasWidgets, // Show widgets button if view has widgets (but closed)
      };

      children.push({
        tabs: [
          DockTabFactory.createWelcomeTab(
            content.welcome,
            selectedView.name,
            welcomeOptions
          ),
        ],
        size: 1300 - navSize,
        group: "main",
      });
    }

    return {
      dockbox: {
        mode: "horizontal",
        children,
      },
    };
  }, [
    selectedView,
    reportsVisible,
    widgetsVisible,
    isAdmin,
    isDockCollapsed,
    layoutMode,
    navPanelOrientation,
    actions,
    content,
  ]);

  // In DockLayoutManager.tsx, update the getCurrentLayoutStructure function:

  const getCurrentLayoutStructure = useCallback((): string => {
    const hasReports =
      selectedView?.reportIds && selectedView.reportIds.length > 0;
    const hasWidgets =
      selectedView?.widgetIds && selectedView.widgetIds.length > 0;

    return [
      selectedView ? selectedView.id : "no-view",
      selectedView ? selectedView.reportIds?.length || 0 : 0, // ✅ ADD report count
      selectedView ? selectedView.widgetIds?.length || 0 : 0, // ✅ ADD widget count
      reportsVisible && hasReports,
      widgetsVisible && hasWidgets,
      layoutMode,
    ].join("-");
  }, [selectedView, reportsVisible, widgetsVisible, layoutMode]);

  return {
    generateDynamicLayout,
    getCurrentLayoutStructure,
  };
}
