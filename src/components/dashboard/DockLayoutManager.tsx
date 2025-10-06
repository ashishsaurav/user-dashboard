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
    
    const children: any[] = [];

    // Always add navigation panel
    children.push({
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
      size: 250,
      minSize: LAYOUT_SIZES.NAVIGATION_PANEL_MIN_WIDTH,
      maxSize: LAYOUT_SIZES.NAVIGATION_PANEL_MAX_WIDTH,
    });

    // Add content panels based on what's visible
    if (!selectedView) {
      // No view selected - show welcome
      children.push({
        tabs: [DockTabFactory.createWelcomeTab(content.welcome)],
        size: 400,
        minSize: 200,
      });
    } else {
      // Add reports if visible
      if (reportsVisible) {
        children.push({
          tabs: [DockTabFactory.createReportsTab(actions, content.reports)],
          size: 350,
          minSize: 200,
        });
      }

      // Add widgets if visible
      if (widgetsVisible) {
        children.push({
          tabs: [DockTabFactory.createWidgetsTab(actions, content.widgets)],
          size: 350,
          minSize: 200,
        });
      }

      // Show welcome when both sections are closed
      if (!reportsVisible && !widgetsVisible) {
        children.push({
          tabs: [
            DockTabFactory.createWelcomeTab(content.welcome, selectedView.name),
          ],
          size: 400,
          minSize: 200,
        });
      }
    }

    return {
      dockbox: {
        mode: "vertical", // Default vertical stacking
        children,
      },
      floatbox: {
        mode: "float",
        children: [], // Panels can be dragged here to float
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
    panels.push(`vertical-layout`); // Indicate vertical layout mode
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
