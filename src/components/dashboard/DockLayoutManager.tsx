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
  actions,
  content,
}: DockLayoutManagerProps) {
  const generateDynamicLayout = useCallback((): LayoutData => {
    const navSize = isDockCollapsed 
      ? LAYOUT_SIZES.NAVIGATION_PANEL_COLLAPSED_WIDTH 
      : LAYOUT_SIZES.NAVIGATION_PANEL_WIDTH;
    
    // Navigation panel (left side)
    const navigationPanel = {
      tabs: [
        DockTabFactory.createNavigationTab(
          actions,
          selectedView,
          reportsVisible,
          widgetsVisible,
          isAdmin,
          content.navigation,
          isDockCollapsed
        ),
      ],
      size: navSize,
      minSize: LAYOUT_SIZES.NAVIGATION_PANEL_MIN_WIDTH,
      maxSize: LAYOUT_SIZES.NAVIGATION_PANEL_MAX_WIDTH,
    };

    // Build content area (right side) - can be vertical or single panel
    let contentArea: any;

    if (!selectedView) {
      // No view selected - show welcome
      contentArea = {
        tabs: [DockTabFactory.createWelcomeTab(content.welcome)],
        size: 1300 - navSize,
      };
    } else if (reportsVisible && widgetsVisible) {
      // Both visible - create vertical layout for stacking
      contentArea = {
        mode: "vertical",
        children: [
          {
            tabs: [DockTabFactory.createReportsTab(actions, content.reports)],
            size: 400,
            minSize: 200,
          },
          {
            tabs: [DockTabFactory.createWidgetsTab(actions, content.widgets)],
            size: 300,
            minSize: 200,
          },
        ],
        size: 1300 - navSize,
      };
    } else if (reportsVisible) {
      // Only reports visible
      contentArea = {
        tabs: [DockTabFactory.createReportsTab(actions, content.reports)],
        size: 1300 - navSize,
      };
    } else if (widgetsVisible) {
      // Only widgets visible
      contentArea = {
        tabs: [DockTabFactory.createWidgetsTab(actions, content.widgets)],
        size: 1300 - navSize,
      };
    } else {
      // View selected but both sections closed
      contentArea = {
        tabs: [
          DockTabFactory.createWelcomeTab(content.welcome, selectedView.name),
        ],
        size: 1300 - navSize,
      };
    }

    return {
      dockbox: {
        mode: "horizontal",
        children: [navigationPanel, contentArea],
      },
    };
  }, [
    selectedView,
    reportsVisible,
    widgetsVisible,
    isAdmin,
    isDockCollapsed,
    actions,
    content,
  ]);

  const getCurrentLayoutStructure = useCallback(() => {
    const panels = [];
    panels.push(`navigation-${isDockCollapsed ? "collapsed" : "expanded"}`);
    if (!selectedView) {
      panels.push("welcome");
    } else {
      if (reportsVisible) panels.push("reports");
      if (widgetsVisible) panels.push("widgets");
      if (!reportsVisible && !widgetsVisible) panels.push("welcome-closed");
    }
    return panels.join(",");
  }, [selectedView, reportsVisible, widgetsVisible, isDockCollapsed]);

  return {
    generateDynamicLayout,
    getCurrentLayoutStructure,
  };
}
