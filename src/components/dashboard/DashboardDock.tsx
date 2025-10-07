import React, { useState, useEffect, useCallback, useRef } from "react";
import DockLayout, { LayoutData } from "rc-dock";
import "rc-dock/dist/rc-dock.css";
import "rc-dock/dist/rc-dock-dark.css";
import {
  User,
  View,
  ViewGroup,
  UserNavigationSettings,
  Report,
  Widget,
} from "../../types";
import {
  testReports,
  testWidgets,
  getUserNavigationData,
  initializeUserNavigationData,
} from "../../data/testData";
import { useTheme } from "../../contexts/ThemeContext";
import ManageModal from "../modals/ManageModal";
import NavigationManageModal from "../modals/NavigationManageModal";
import NavigationPanel from "../navigation/NavigationPanel";
import CollapsedNavigationPanel from "../navigation/CollapsedNavigationPanel";
import ViewContentPanel from "../panels/ViewContentPanel";
import AddReportModal from "../modals/AddReportModal";
import AddWidgetModal from "../modals/AddWidgetModal";
import WelcomeContent from "./WelcomeContent";
import ThemeToggle from "./ThemeToggle";
import { useDockLayoutManager } from "./DockLayoutManager";
import { LAYOUT_SIZES } from "../../constants/layout";
import "./styles/DashboardDock.css";
import "./styles/GmailDockIntegration.css";

interface DashboardDockProps {
  user: User;
  onLogout: () => void;
}

const DashboardDock: React.FC<DashboardDockProps> = ({ user, onLogout }) => {
  // Modal states
  const [showManageModal, setShowManageModal] = useState(false);
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [showAddReportModal, setShowAddReportModal] = useState(false);
  const [showAddWidgetModal, setShowAddWidgetModal] = useState(false);
  
  const { theme, toggleTheme } = useTheme();

  // Selected view state for dynamic content
  const [selectedView, setSelectedView] = useState<View | null>(null);

  // Section visibility states
  const [reportsVisible, setReportsVisible] = useState(true);
  const [widgetsVisible, setWidgetsVisible] = useState(true);

  // Navigation state - dock level collapse
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  
  // Layout mode state - horizontal or vertical
  const [layoutMode, setLayoutMode] = useState<'horizontal' | 'vertical'>('horizontal');

  // Force re-render trigger for NavigationPanel
  const [navigationUpdateTrigger, setNavigationUpdateTrigger] = useState(0);

  // Track layout structure to detect when we need full reload
  const [layoutStructure, setLayoutStructure] = useState<string>("");

  // RC-DOCK REF for updates
  const dockLayoutRef = useRef<DockLayout>(null);
  
  // Resize observer ref for navigation panel width detection
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const isManualToggleRef = useRef<boolean>(false);
  const isLayoutChangingRef = useRef<boolean>(false);

  // State management for views, viewGroups, and navigation settings
  const [views, setViews] = useState<View[]>(() => {
    const savedViews = sessionStorage.getItem(`navigationViews_${user.name}`);
    if (savedViews) {
      return JSON.parse(savedViews);
    }
    const defaultData = getUserNavigationData(user.name);
    if (defaultData) {
      const defaultViews = defaultData.views;
      sessionStorage.setItem(
        `navigationViews_${user.name}`,
        JSON.stringify(defaultViews)
      );
      return defaultViews;
    }
    const newUserData = initializeUserNavigationData(user.name);
    sessionStorage.setItem(
      `navigationViews_${user.name}`,
      JSON.stringify(newUserData.views)
    );
    return newUserData.views;
  });

  const [viewGroups, setViewGroups] = useState<ViewGroup[]>(() => {
    const savedGroups = sessionStorage.getItem(
      `navigationViewGroups_${user.name}`
    );
    if (savedGroups) {
      return JSON.parse(savedGroups);
    }
    const defaultData = getUserNavigationData(user.name);
    if (defaultData) {
      const defaultViewGroups = defaultData.viewGroups;
      sessionStorage.setItem(
        `navigationViewGroups_${user.name}`,
        JSON.stringify(defaultViewGroups)
      );
      return defaultViewGroups;
    }
    const newUserData = initializeUserNavigationData(user.name);
    sessionStorage.setItem(
      `navigationViewGroups_${user.name}`,
      JSON.stringify(newUserData.viewGroups)
    );
    return newUserData.viewGroups;
  });

  const [navSettings, setNavSettings] = useState<UserNavigationSettings>(() => {
    const savedSettings = sessionStorage.getItem(
      `navigationSettings_${user.name}`
    );
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    const defaultData = getUserNavigationData(user.name);
    if (defaultData) {
      const defaultSettings = defaultData.navigationSettings;
      sessionStorage.setItem(
        `navigationSettings_${user.name}`,
        JSON.stringify(defaultSettings)
      );
      return defaultSettings;
    }
    const newUserData = initializeUserNavigationData(user.name);
    sessionStorage.setItem(
      `navigationSettings_${user.name}`,
      JSON.stringify(newUserData.navigationSettings)
    );
    return newUserData.navigationSettings;
  });

  // Enhanced state handlers
  const handleUpdateViews = (updatedViews: View[]) => {
    const sortedViews = [...updatedViews].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );
    setViews(sortedViews);
    sessionStorage.setItem(
      `navigationViews_${user.name}`,
      JSON.stringify(sortedViews)
    );
    setNavigationUpdateTrigger((prev) => prev + 1);

    if (selectedView) {
      const updatedSelectedView = sortedViews.find(
        (v) => v.id === selectedView.id
      );
      if (updatedSelectedView) {
        setSelectedView(updatedSelectedView);
      }
    }
  };

  const handleUpdateViewGroups = (updatedViewGroups: ViewGroup[]) => {
    const sortedGroups = [...updatedViewGroups].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );
    setViewGroups(sortedGroups);
    sessionStorage.setItem(
      `navigationViewGroups_${user.name}`,
      JSON.stringify(sortedGroups)
    );
    setNavigationUpdateTrigger((prev) => prev + 1);
  };

  const handleUpdateNavSettings = (settings: UserNavigationSettings) => {
    setNavSettings(settings);
    sessionStorage.setItem(
      `navigationSettings_${user.name}`,
      JSON.stringify(settings)
    );
    setNavigationUpdateTrigger((prev) => prev + 1);
  };

  // Enhanced view selection handler - auto-show sections when view selected
  const handleViewSelect = (view: View) => {
    console.log("View selected:", view.name);
    
    // Mark as layout changing to prevent auto-collapse
    isLayoutChangingRef.current = true;
    
    setSelectedView(view);

    // Auto-show both sections when a view is selected
    setReportsVisible(true);
    setWidgetsVisible(true);
    
    // Reset layout changing flag after animation completes
    setTimeout(() => {
      isLayoutChangingRef.current = false;
    }, 500);
  };

  // Section handlers
  const handleCloseReports = () => {
    isLayoutChangingRef.current = true;
    setReportsVisible(false);
    setTimeout(() => { isLayoutChangingRef.current = false; }, 500);
  };
  
  const handleCloseWidgets = () => {
    isLayoutChangingRef.current = true;
    setWidgetsVisible(false);
    setTimeout(() => { isLayoutChangingRef.current = false; }, 500);
  };
  
  const handleReopenReports = () => {
    if (!selectedView) return;
    isLayoutChangingRef.current = true;
    setReportsVisible(true);
    setTimeout(() => { isLayoutChangingRef.current = false; }, 500);
  };
  
  const handleReopenWidgets = () => {
    if (!selectedView) return;
    isLayoutChangingRef.current = true;
    setWidgetsVisible(true);
    setTimeout(() => { isLayoutChangingRef.current = false; }, 500);
  };

  // Content management handlers
  const handleAddReportsToView = (reports: Report[]) => {
    if (!selectedView || reports.length === 0) return;
    const newReportIds = reports.map((r) => r.id);
    const updatedView = {
      ...selectedView,
      reportIds: [...selectedView.reportIds, ...newReportIds],
    };
    const updatedViews = views.map((v) =>
      v.id === selectedView.id ? updatedView : v
    );
    handleUpdateViews(updatedViews);
    setSelectedView(updatedView);
    setShowAddReportModal(false);
  };

  const handleAddWidgetsToView = (widgets: Widget[]) => {
    if (!selectedView || widgets.length === 0) return;
    const newWidgetIds = widgets.map((w) => w.id);
    const updatedView = {
      ...selectedView,
      widgetIds: [...selectedView.widgetIds, ...newWidgetIds],
    };
    const updatedViews = views.map((v) =>
      v.id === selectedView.id ? updatedView : v
    );
    handleUpdateViews(updatedViews);
    setSelectedView(updatedView);
    setShowAddWidgetModal(false);
  };

  const handleRemoveReportFromView = (reportId: string) => {
    if (!selectedView) return;
    const updatedView = {
      ...selectedView,
      reportIds: selectedView.reportIds.filter((id) => id !== reportId),
    };
    const updatedViews = views.map((v) =>
      v.id === selectedView.id ? updatedView : v
    );
    handleUpdateViews(updatedViews);
    setSelectedView(updatedView);
  };

  const handleRemoveWidgetFromView = (widgetId: string) => {
    if (!selectedView) return;
    const updatedView = {
      ...selectedView,
      widgetIds: selectedView.widgetIds.filter((id) => id !== widgetId),
    };
    const updatedViews = views.map((v) =>
      v.id === selectedView.id ? updatedView : v
    );
    handleUpdateViews(updatedViews);
    setSelectedView(updatedView);
  };

  const handleReorderReports = (newReportOrder: string[]) => {
    if (!selectedView) return;
    const updatedView = { ...selectedView, reportIds: newReportOrder };
    const updatedViews = views.map((v) =>
      v.id === selectedView.id ? updatedView : v
    );
    handleUpdateViews(updatedViews);
    setSelectedView(updatedView);
  };

  const handleReorderWidgets = (newWidgetOrder: string[]) => {
    if (!selectedView) return;
    const updatedView = { ...selectedView, widgetIds: newWidgetOrder };
    const updatedViews = views.map((v) =>
      v.id === selectedView.id ? updatedView : v
    );
    handleUpdateViews(updatedViews);
    setSelectedView(updatedView);
  };

  // Get accessible reports and widgets
  const getUserAccessibleReports = (): Report[] => {
    const savedReports = sessionStorage.getItem("reports");
    const systemReports: Report[] = savedReports
      ? JSON.parse(savedReports)
      : testReports;
    return user.role === "admin"
      ? systemReports
      : systemReports.filter((report: Report) =>
          report.userRoles.includes(user.role)
        );
  };

  const getUserAccessibleWidgets = (): Widget[] => {
    const savedWidgets = sessionStorage.getItem("widgets");
    const systemWidgets: Widget[] = savedWidgets
      ? JSON.parse(savedWidgets)
      : testWidgets;
    return user.role === "admin"
      ? systemWidgets
      : systemWidgets.filter((widget: Widget) =>
          widget.userRoles.includes(user.role)
        );
  };

  // Content creators
  const createNavigationContent = useCallback(() => {
    if (isDockCollapsed) {
      return (
        <CollapsedNavigationPanel
          user={user}
          views={views}
          viewGroups={viewGroups}
          userNavSettings={navSettings}
          onViewSelect={handleViewSelect}
          selectedView={selectedView}
          onUpdateViews={handleUpdateViews}
          onUpdateViewGroups={handleUpdateViewGroups}
          onUpdateNavSettings={handleUpdateNavSettings}
          reports={getUserAccessibleReports()}
          widgets={getUserAccessibleWidgets()}
        />
      );
    }

    // Always use the original NavigationPanel when expanded (with full drag/drop, edit, delete functionality)
    return (
      <NavigationPanel
        user={user}
        views={views}
        viewGroups={viewGroups}
        userNavSettings={navSettings}
        reports={getUserAccessibleReports()}
        widgets={getUserAccessibleWidgets()}
        onUpdateViews={handleUpdateViews}
        onUpdateViewGroups={handleUpdateViewGroups}
        onUpdateNavSettings={handleUpdateNavSettings}
        onViewSelect={handleViewSelect}
        selectedView={selectedView}
      />
    );
  }, [
    isDockCollapsed,
    user,
    views,
    viewGroups,
    navSettings,
    selectedView,
    navigationUpdateTrigger,
    layoutMode,
  ]);

  const createReportsContent = () => (
    <ViewContentPanel
      type="reports"
      selectedView={selectedView}
      reports={getUserAccessibleReports()}
      widgets={[]}
      onRemoveReport={handleRemoveReportFromView}
      onRemoveWidget={() => {}}
      onReorderReports={handleReorderReports}
    />
  );

  const createWidgetsContent = () => (
    <ViewContentPanel
      type="widgets"
      selectedView={selectedView}
      reports={[]}
      widgets={getUserAccessibleWidgets()}
      onRemoveReport={() => {}}
      onRemoveWidget={handleRemoveWidgetFromView}
      onReorderWidgets={handleReorderWidgets}
    />
  );

  const createWelcomeContent = () => (
    <WelcomeContent
      selectedView={selectedView}
      onReopenReports={handleReopenReports}
      onReopenWidgets={handleReopenWidgets}
    />
  );

  // Handle manual toggle (button click)
  const handleToggleCollapse = useCallback(() => {
    isManualToggleRef.current = true;
    setIsDockCollapsed(prev => !prev);
  }, []);
  
  // Handle layout mode toggle
  const handleToggleLayout = useCallback(() => {
    setLayoutMode(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
  }, []);

  // Dock layout manager
  const { generateDynamicLayout, getCurrentLayoutStructure } = useDockLayoutManager({
    selectedView,
    reportsVisible,
    widgetsVisible,
    isAdmin: user.role === "admin",
    isDockCollapsed: isDockCollapsed,
    layoutMode: layoutMode,
    actions: {
      onToggleCollapse: handleToggleCollapse,
      onNavigationManage: () => setShowNavigationModal(true),
      onSystemSettings: () => setShowManageModal(true),
      onReopenReports: handleReopenReports,
      onReopenWidgets: handleReopenWidgets,
      onAddReport: () => setShowAddReportModal(true),
      onAddWidget: () => setShowAddWidgetModal(true),
      onCloseReports: handleCloseReports,
      onCloseWidgets: handleCloseWidgets,
    },
    content: {
      navigation: createNavigationContent(),
      reports: createReportsContent(),
      widgets: createWidgetsContent(),
      welcome: createWelcomeContent(),
    },
  });

  // Smart update that preserves RC-Dock internal state
  const updateLayoutContent = useCallback(() => {
    if (!dockLayoutRef.current) return;

    try {
      const currentLayout = dockLayoutRef.current.getLayout();

      if (currentLayout?.dockbox?.children) {
        const updatePanelContent = (panels: any[]) => {
          panels.forEach((panel: any) => {
            if (panel.tabs && panel.tabs[0]) {
              const tabId = panel.tabs[0].id;

              if (tabId === "navigation") {
                panel.tabs[0].content = createNavigationContent();
              } else if (tabId === "reports") {
                panel.tabs[0].content = createReportsContent();
              } else if (tabId === "widgets") {
                panel.tabs[0].content = createWidgetsContent();
              } else if (tabId.startsWith("welcome")) {
                panel.tabs[0].content = createWelcomeContent();
              }
            }
            // Recursively update nested panels (for vertical layouts)
            if (panel.children) {
              updatePanelContent(panel.children);
            }
          });
        };
        
        updatePanelContent(currentLayout.dockbox.children);

        dockLayoutRef.current.loadLayout(currentLayout);
      }
    } catch (error) {
      console.warn("Error updating content, falling back to full reload:", error);
      const newLayout = generateDynamicLayout();
      dockLayoutRef.current.loadLayout(newLayout);
    }
  }, [
    createNavigationContent,
    createReportsContent,
    createWidgetsContent,
    createWelcomeContent,
    generateDynamicLayout,
  ]);

  // Apply theme changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);

    const dockContainer = document.querySelector(".dock-container");
    const dockLayoutElement = document.querySelector(".dock-layout");

    if (dockContainer) {
      dockContainer.classList.remove("dock-layout-dark", "dock-layout-light");
      if (theme === "dark") {
        dockContainer.classList.add("dock-layout-dark");
      } else {
        dockContainer.classList.add("dock-layout-light");
      }
    }

    if (dockLayoutElement) {
      dockLayoutElement.classList.remove("dock-layout-dark", "dock-layout-light");
      if (theme === "dark") {
        dockLayoutElement.classList.add("dock-layout-dark");
      } else {
        dockLayoutElement.classList.add("dock-layout-light");
      }
    }
  }, [theme]);

  // Helper function to find navigation panel by tab ID (works regardless of position)
  const findNavigationPanel = useCallback(() => {
    // Find panel that contains a tab with id="navigation"
    const allPanels = document.querySelectorAll('.dock-panel');
    for (const panel of allPanels) {
      const navTab = panel.querySelector('.dock-tab[data-dockid="navigation"]');
      if (navTab) {
        return panel as HTMLElement;
      }
    }
    // Fallback: check if panel contains navigation content
    const panelWithNavContent = document.querySelector('[data-dock-id*="navigation"]')?.closest('.dock-panel');
    return panelWithNavContent as HTMLElement | null;
  }, []);

  // Setup ResizeObserver for auto expand/collapse based on width
  useEffect(() => {
    const setupResizeObserver = () => {
      const navigationPanel = findNavigationPanel();
      
      if (!navigationPanel) {
        console.log('Navigation panel not found, retrying...');
        return;
      }

      console.log('Found navigation panel, setting up resize observer');

      // Clean up existing observer
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }

      // Create new resize observer
      resizeObserverRef.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const width = entry.contentRect.width;
          
          console.log(`Navigation panel width: ${width}px, collapsed: ${isDockCollapsed}`);
          
          // Only auto-toggle if this isn't from a manual button toggle or layout change
          if (!isManualToggleRef.current && !isLayoutChangingRef.current) {
            // Only trigger auto-collapse/expand if width is stable
            // Ignore transient width changes during layout updates
            const isStableWidth = width > 50; // Ignore very small transient widths
            
            if (isStableWidth) {
              // Auto-collapse if width is below collapse threshold
              if (width < LAYOUT_SIZES.NAVIGATION_COLLAPSE_THRESHOLD && !isDockCollapsed) {
                console.log(`🔽 Auto-collapsing: width ${width}px < ${LAYOUT_SIZES.NAVIGATION_COLLAPSE_THRESHOLD}px`);
                setIsDockCollapsed(true);
              }
              // Auto-expand if width is above expand threshold
              else if (width > LAYOUT_SIZES.NAVIGATION_EXPAND_THRESHOLD && isDockCollapsed) {
                console.log(`🔼 Auto-expanding: width ${width}px > ${LAYOUT_SIZES.NAVIGATION_EXPAND_THRESHOLD}px`);
                setIsDockCollapsed(false);
              }
            }
          } else {
            console.log('Manual toggle or layout change active, skipping auto-toggle');
          }
          
          // Reset manual toggle flag after a short delay
          if (isManualToggleRef.current) {
            setTimeout(() => {
              isManualToggleRef.current = false;
              console.log('Manual toggle flag reset');
            }, 300);
          }
        }
      });

      resizeObserverRef.current.observe(navigationPanel);
      console.log('ResizeObserver attached successfully');
    };

    // Setup observer with retries to ensure DOM is ready
    const timer = setTimeout(setupResizeObserver, 200);
    const retryTimer = setTimeout(setupResizeObserver, 600);
    const finalRetry = setTimeout(setupResizeObserver, 1000);

    return () => {
      clearTimeout(timer);
      clearTimeout(retryTimer);
      clearTimeout(finalRetry);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [isDockCollapsed, findNavigationPanel]);

  // Apply collapsed state to navigation panel
  useEffect(() => {
    const navigationPanel = findNavigationPanel();
    if (navigationPanel) {
      if (isDockCollapsed) {
        navigationPanel.setAttribute('data-collapsed', 'true');
      } else {
        navigationPanel.removeAttribute('data-collapsed');
      }
    }
  }, [isDockCollapsed, findNavigationPanel]);

  // Handle navigation panel maximize - auto expand
  const handleLayoutChange = useCallback((newLayout: LayoutData) => {
    // Check if navigation panel is maximized
    const maxboxChild = newLayout?.maxbox?.children?.[0];
    const isNavigationMaximized = 
      maxboxChild && 
      'tabs' in maxboxChild && 
      maxboxChild.tabs?.[0]?.id === 'navigation';
    
    if (isNavigationMaximized && isDockCollapsed) {
      console.log('🔼 Navigation maximized - auto-expanding');
      setIsDockCollapsed(false);
    }
  }, [isDockCollapsed]);

  // Helper function to find navigation panel in layout data
  const findNavigationPanelInLayout = useCallback((layout: LayoutData) => {
    if (!layout?.dockbox?.children) return null;
    
    const findInChildren = (children: any[]): any => {
      for (const child of children) {
        // Check if this is a panel with navigation tab
        if (child.tabs && child.tabs.some((tab: any) => tab.id === 'navigation')) {
          return child;
        }
        // Recursively check nested children (for complex layouts)
        if (child.children) {
          const found = findInChildren(child.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findInChildren(layout.dockbox.children);
  }, []);

  // Handle navigation panel collapse/expand without full layout reload
  useEffect(() => {
    if (!dockLayoutRef.current) return;

    const currentLayout = dockLayoutRef.current.getLayout();
    if (!currentLayout?.dockbox) return;

    const navPanel = findNavigationPanelInLayout(currentLayout);
    if (!navPanel) return;

    const newSize = isDockCollapsed 
      ? LAYOUT_SIZES.NAVIGATION_PANEL_COLLAPSED_WIDTH 
      : LAYOUT_SIZES.NAVIGATION_PANEL_WIDTH;

    // Only update size if it's different
    if (navPanel.size !== newSize) {
      navPanel.size = newSize;
      dockLayoutRef.current.loadLayout(currentLayout);
      
      // Apply collapsed state attribute
      setTimeout(() => {
        const navigationPanel = findNavigationPanel();
        if (navigationPanel) {
          if (isDockCollapsed) {
            navigationPanel.setAttribute('data-collapsed', 'true');
          } else {
            navigationPanel.removeAttribute('data-collapsed');
          }
        }
      }, 0);
    }
  }, [isDockCollapsed, findNavigationPanel, findNavigationPanelInLayout]);

  // Smart layout management - only reload on structural changes
  useEffect(() => {
    if (!dockLayoutRef.current) return;

    const newStructure = getCurrentLayoutStructure();

    if (newStructure !== layoutStructure) {
      console.log("Layout structure changed:", layoutStructure, "->", newStructure);
      const newLayout = generateDynamicLayout();
      dockLayoutRef.current.loadLayout(newLayout);
      setLayoutStructure(newStructure);
      
      // Apply collapsed state after layout loads
      setTimeout(() => {
        const navigationPanel = findNavigationPanel();
        if (navigationPanel) {
          if (isDockCollapsed) {
            navigationPanel.setAttribute('data-collapsed', 'true');
          } else {
            navigationPanel.removeAttribute('data-collapsed');
          }
        }
      }, 0);
    } else {
      console.log("Only content changed, updating content");
      updateLayoutContent();
    }
  }, [selectedView, reportsVisible, widgetsVisible, layoutMode, navigationUpdateTrigger, findNavigationPanel]);

  return (
    <div className="dashboard-dock modern" data-theme={theme}>
      <div className="dock-container full-height">
        <DockLayout
          ref={dockLayoutRef}
          defaultLayout={generateDynamicLayout()}
          onLayoutChange={handleLayoutChange}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
          }}
        />
      </div>

      <ThemeToggle theme={theme} onToggle={toggleTheme} />

      {/* Modals */}
      {showManageModal && (
        <ManageModal onClose={() => setShowManageModal(false)} />
      )}

      {showNavigationModal && (
        <NavigationManageModal
          user={user}
          onClose={() => setShowNavigationModal(false)}
          onUpdateViews={handleUpdateViews}
          onUpdateViewGroups={handleUpdateViewGroups}
          onUpdateNavSettings={handleUpdateNavSettings}
          onAddView={(newView, viewGroupIds) => {
            const updatedViews = [...views, newView];
            handleUpdateViews(updatedViews);
            if (viewGroupIds && viewGroupIds.length > 0) {
              const updatedViewGroups = viewGroups.map((vg) => {
                if (viewGroupIds.includes(vg.id)) {
                  return { ...vg, viewIds: [...vg.viewIds, newView.id] };
                }
                return vg;
              });
              handleUpdateViewGroups(updatedViewGroups);
            }
          }}
          onAddViewGroup={(newViewGroup) => {
            const updatedViewGroups = [...viewGroups, newViewGroup];
            handleUpdateViewGroups(updatedViewGroups);
          }}
          views={views}
          viewGroups={viewGroups}
          userNavSettings={navSettings ? [navSettings] : []}
        />
      )}

      {showAddReportModal && selectedView && (
        <AddReportModal
          onAddReports={handleAddReportsToView}
          onClose={() => setShowAddReportModal(false)}
          availableReports={getUserAccessibleReports().filter(
            (report) => !selectedView.reportIds.includes(report.id)
          )}
        />
      )}

      {showAddWidgetModal && selectedView && (
        <AddWidgetModal
          onAddWidgets={handleAddWidgetsToView}
          onClose={() => setShowAddWidgetModal(false)}
          availableWidgets={getUserAccessibleWidgets().filter(
            (widget) => !selectedView.widgetIds.includes(widget.id)
          )}
        />
      )}
    </div>
  );
};

export default DashboardDock;