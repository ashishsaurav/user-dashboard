import { useCallback } from "react";
import { LayoutData } from "rc-dock";
import { View } from "../../types";
import { DockTabFactory } from "./DockTabFactory";

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
    const children: any[] = [];

    // Navigation panel - adjust size based on dock collapsed state
    const navSize = isDockCollapsed ? 60 : 250;
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
      size: navSize,
      minSize: navSize,
      maxSize: navSize,
    });

    // Show welcome section when no view is selected
    if (!selectedView) {
      children.push({
        tabs: [DockTabFactory.createWelcomeTab(content.welcome)],
        size: 1300 - navSize,
      });
    } else {
      // Add reports section if view selected and visible
      if (reportsVisible) {
        children.push({
          tabs: [DockTabFactory.createReportsTab(actions, content.reports)],
          size: widgetsVisible ? 700 : (1300 - navSize),
          minSize: 250,
        });
      }

      // Add widgets section if view selected and visible
      if (widgetsVisible) {
        children.push({
          tabs: [DockTabFactory.createWidgetsTab(actions, content.widgets)],
          size: reportsVisible ? 350 : (1300 - navSize),
          minSize: 250,
        });
      }

      // Show welcome when both sections are closed
      if (!reportsVisible && !widgetsVisible) {
        children.push({
          tabs: [
            DockTabFactory.createWelcomeTab(
              content.welcome,
              selectedView.name
            ),
          ],
          size: 1300 - navSize,
        });
      }
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
    actions,
    content,
  ]);

  const getCurrentLayoutStructure = useCallback(() => {
    const panels = [];
    panels.push(`navigation-${isDockCollapsed ? 'collapsed' : 'expanded'}`);
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