import { useCallback } from "react";
import * as FlexLayout from "flexlayout-react";
import { View } from "../../types";

interface FlexLayoutManagerProps {
  selectedView: View | null;
  reportsVisible: boolean;
  widgetsVisible: boolean;
  isAdmin: boolean;
  isDockCollapsed?: boolean;
}

export function useFlexLayoutManager({
  selectedView,
  reportsVisible,
  widgetsVisible,
  isAdmin,
  isDockCollapsed = false,
}: FlexLayoutManagerProps) {
  const generateLayout = useCallback(() => {
    const navHeight = isDockCollapsed ? 60 : 200;
    
    const children: any[] = [];

    // Navigation panel
    children.push({
      type: "tab",
      id: "navigation",
      name: "Navigation",
      component: "navigation",
      config: {
        isDockCollapsed,
        isAdmin,
        selectedView,
        reportsVisible,
        widgetsVisible,
      },
    });

    // Add content panels based on what's visible
    if (!selectedView) {
      children.push({
        type: "tab",
        id: "welcome",
        name: "Dashboard",
        component: "welcome",
      });
    } else {
      if (reportsVisible) {
        children.push({
          type: "tab",
          id: "reports",
          name: "Reports",
          component: "reports",
        });
      }

      if (widgetsVisible) {
        children.push({
          type: "tab",
          id: "widgets",
          name: "Widgets",
          component: "widgets",
        });
      }

      if (!reportsVisible && !widgetsVisible) {
        children.push({
          type: "tab",
          id: "welcome-closed",
          name: `View: ${selectedView.name}`,
          component: "welcome",
          config: { viewName: selectedView.name },
        });
      }
    }

    const json: FlexLayout.IJsonModel = {
      global: {
        tabEnableClose: false,
        tabEnableRename: false,
        tabSetEnableTabStrip: true,
        tabSetEnableMaximize: false, // Disable default maximize to avoid conflicts
        tabSetEnableDivide: true,
        tabSetEnableDrag: true,
        tabSetEnableDrop: true,
        tabEnableDrag: true,
        tabEnablePopout: true, // Enable popout windows (floating)
        splitterSize: 8,
        tabSetEnableClose: false, // Disable default close button
      },
      borders: [],
      layout: {
        type: "row",
        weight: 100,
        children: [
          {
            type: "tabset",
            id: "nav-tabset",
            weight: navHeight,
            children: [children[0]], // Navigation
            active: true,
          },
          {
            type: "tabset",
            id: "content-tabset",
            weight: 100 - navHeight,
            children: children.slice(1), // All other panels
            active: children.length > 1,
          },
        ],
      },
    };

    return FlexLayout.Model.fromJson(json);
  }, [selectedView, reportsVisible, widgetsVisible, isAdmin, isDockCollapsed]);

  const getCurrentLayoutStructure = useCallback(() => {
    const panels = [];
    panels.push(`vertical-layout`);
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
    generateLayout,
    getCurrentLayoutStructure,
  };
}
