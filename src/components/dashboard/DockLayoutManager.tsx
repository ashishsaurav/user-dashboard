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
  layoutMode?: 'horizontal' | 'vertical'; // NEW: Support for vertical layouts
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
  layoutMode = 'horizontal', // NEW: Default to horizontal
  actions,
  content,
}: DockLayoutManagerProps) {
  const generateDynamicLayout = useCallback((): LayoutData => {
    const children: any[] = [];

    // Navigation panel - adjust size based on dock collapsed state
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
          isDockCollapsed
        ),
      ],
      size: navSize,
      minSize: isDockCollapsed ? LAYOUT_SIZES.NAVIGATION_PANEL_COLLAPSED_WIDTH : LAYOUT_SIZES.NAVIGATION_PANEL_MIN_WIDTH,
      maxSize: LAYOUT_SIZES.NAVIGATION_PANEL_MAX_WIDTH,
      group: 'main', // Enable maximize/minimize
    });

    // Show welcome section when no view is selected
    if (!selectedView) {
      children.push({
        tabs: [DockTabFactory.createWelcomeTab(content.welcome)],
        size: 1300 - navSize,
        group: 'main', // Enable maximize/minimize
      });
    } else {
      // Add content panels based on layout mode
      if (layoutMode === 'horizontal') {
        // Horizontal layout: side-by-side
        if (reportsVisible) {
          children.push({
            tabs: [DockTabFactory.createReportsTab(actions, content.reports)],
            size: widgetsVisible ? 700 : 1300 - navSize,
            minSize: LAYOUT_SIZES.CONTENT_PANEL_MIN_WIDTH,
            group: 'main', // Enable maximize/minimize
          });
        }

        if (widgetsVisible) {
          children.push({
            tabs: [DockTabFactory.createWidgetsTab(actions, content.widgets)],
            size: reportsVisible ? 350 : 1300 - navSize,
            minSize: LAYOUT_SIZES.CONTENT_PANEL_MIN_WIDTH,
            group: 'main', // Enable maximize/minimize
          });
        }
      } else {
        // Vertical layout: stacked on top of each other
        const contentChildren: any[] = [];
        
        if (reportsVisible) {
          contentChildren.push({
            tabs: [DockTabFactory.createReportsTab(actions, content.reports)],
            size: widgetsVisible ? LAYOUT_SIZES.DEFAULT_PANEL_HEIGHT : 800,
            minSize: LAYOUT_SIZES.CONTENT_PANEL_MIN_HEIGHT,
            group: 'main', // Enable maximize/minimize
          });
        }

        if (widgetsVisible) {
          contentChildren.push({
            tabs: [DockTabFactory.createWidgetsTab(actions, content.widgets)],
            size: reportsVisible ? LAYOUT_SIZES.DEFAULT_PANEL_HEIGHT : 800,
            minSize: LAYOUT_SIZES.CONTENT_PANEL_MIN_HEIGHT,
            group: 'main', // Enable maximize/minimize
          });
        }

        // Add vertical content box
        if (contentChildren.length > 0) {
          children.push({
            mode: 'vertical' as const,
            children: contentChildren,
            size: 1300 - navSize,
            minSize: LAYOUT_SIZES.CONTENT_PANEL_MIN_WIDTH,
          });
        }
      }

      // Show welcome when both sections are closed
      if (!reportsVisible && !widgetsVisible) {
        children.push({
          tabs: [
            DockTabFactory.createWelcomeTab(content.welcome, selectedView.name),
          ],
          size: 1300 - navSize,
          group: 'main', // Enable maximize/minimize
        });
      }
    }

    return {
      dockbox: {
        mode: "horizontal", // Top-level is always horizontal (navigation + content)
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
    actions,
    content,
  ]);

  const getCurrentLayoutStructure = useCallback(() => {
    const panels = [];
    // Don't include navigation collapse state - it shouldn't trigger full layout reload
    panels.push(`layout-${layoutMode}`);
    if (!selectedView) {
      panels.push("welcome");
    } else {
      if (reportsVisible) panels.push("reports");
      if (widgetsVisible) panels.push("widgets");
      if (!reportsVisible && !widgetsVisible) panels.push("welcome-closed");
    }
    return panels.join(",");
  }, [selectedView, reportsVisible, widgetsVisible, layoutMode]);

  return {
    generateDynamicLayout,
    getCurrentLayoutStructure,
  };
}
