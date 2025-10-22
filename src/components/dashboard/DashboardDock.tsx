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
import { viewsService } from "../../services/viewsService";
import { viewGroupsService } from "../../services/viewGroupsService";
import { useNotification } from "../common/NotificationProvider";
import { useApiData } from "../../hooks/useApiData";
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
import {
  layoutPersistenceService,
  generateLayoutSignature,
  LayoutSignature,
} from "../../services/layoutPersistenceService";
import "./styles/DashboardDock.css";
import "./styles/GmailDockIntegration.css";

interface DashboardDockProps {
  user: User;
  onLogout: () => void;
}

const DashboardDock: React.FC<DashboardDockProps> = ({ user, onLogout }) => {
  // Load data from API
  const {
    reports,
    widgets,
    views: apiViews,
    viewGroups: apiViewGroups,
    navSettings: apiNavSettings,
    loading: apiLoading,
    error: apiError,
    refetchViews,
    refetchViewGroups,
    refetchNavSettings,
  } = useApiData(user);

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
  const [layoutMode, setLayoutMode] = useState<"horizontal" | "vertical">(
    "horizontal"
  );

  // Navigation panel position state (for popup positioning)
  const [navPanelPosition, setNavPanelPosition] = useState<"left" | "right">(
    "left"
  );

  // Navigation panel orientation state (for collapse/expand logic)
  const [navPanelOrientation, setNavPanelOrientation] = useState<
    "vertical" | "horizontal"
  >("vertical");

  // Force re-render trigger for NavigationPanel
  const [navigationUpdateTrigger, setNavigationUpdateTrigger] = useState(0);

  // Track layout structure to detect when we need full reload
  const [layoutStructure, setLayoutStructure] = useState<string>("");

  // Track current layout signature for persistence
  const [currentSignature, setCurrentSignature] = useState<LayoutSignature>("");
  const previousSignatureRef = useRef<LayoutSignature>("");

  // RC-DOCK REF for updates
  const dockLayoutRef = useRef<DockLayout>(null);

  // Resize observer ref for navigation panel width detection
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const isManualToggleRef = useRef<boolean>(false);
  const isLayoutChangingRef = useRef<boolean>(false);

  // State management for views, viewGroups, and navigation settings from API
  const [views, setViews] = useState<View[]>(apiViews);
  const [viewGroups, setViewGroups] = useState<ViewGroup[]>(apiViewGroups);
  const [navSettings, setNavSettings] = useState<UserNavigationSettings>(
    apiNavSettings || {
      userId: user.name,
      viewGroupOrder: [],
      viewOrders: {},
      hiddenViewGroups: [],
      hiddenViews: [],
    }
  );

  // Update local state when API data changes (FIXED: removed length check)
  useEffect(() => {
    console.log('📊 API Views updated:', apiViews.length);
    setViews(apiViews);
    setNavigationUpdateTrigger((prev) => prev + 1); // Force navigation re-render
  }, [apiViews]);

  useEffect(() => {
    console.log('📊 API ViewGroups updated:', apiViewGroups.length);
    setViewGroups(apiViewGroups);
    setNavigationUpdateTrigger((prev) => prev + 1); // Force navigation re-render
  }, [apiViewGroups]);

  useEffect(() => {
    if (apiNavSettings) {
      console.log('📊 API NavSettings updated');
      setNavSettings(apiNavSettings);
      setNavigationUpdateTrigger((prev) => prev + 1); // Force navigation re-render
    }
  }, [apiNavSettings]);

  // Enhanced state handlers
  const handleUpdateViews = useCallback((updatedViews: View[]) => {
    const sortedViews = [...updatedViews].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );
    setViews(sortedViews);
    setNavigationUpdateTrigger((prev) => prev + 1);

    if (selectedView) {
      const updatedSelectedView = sortedViews.find(
        (v) => v.id === selectedView.id
      );
      if (updatedSelectedView) {
        setSelectedView(updatedSelectedView);
      }
    }
  }, [selectedView]);

  const handleUpdateViewGroups = useCallback((updatedViewGroups: ViewGroup[]) => {
    const sortedGroups = [...updatedViewGroups].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );
    setViewGroups(sortedGroups);
    setNavigationUpdateTrigger((prev) => prev + 1);
  }, []);

  const handleUpdateNavSettings = useCallback((settings: UserNavigationSettings) => {
    setNavSettings(settings);
    setNavigationUpdateTrigger((prev) => prev + 1);
  }, []);

  // Compute current layout signature based on state
  const computeCurrentSignature = useCallback((): LayoutSignature => {
    const hasReports =
      selectedView?.reportIds && selectedView.reportIds.length > 0;
    const hasWidgets =
      selectedView?.widgetIds && selectedView.widgetIds.length > 0;

    return generateLayoutSignature({
      selectedView: !!selectedView,
      hasReports: !!hasReports,
      hasWidgets: !!hasWidgets,
      reportsVisible,
      widgetsVisible,
      layoutMode,
      isDockCollapsed,
    });
  }, [
    selectedView,
    reportsVisible,
    widgetsVisible,
    layoutMode,
    isDockCollapsed,
  ]);

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
    setTimeout(() => {
      isLayoutChangingRef.current = false;
    }, 500);
  };

  const handleCloseWidgets = () => {
    isLayoutChangingRef.current = true;
    setWidgetsVisible(false);
    setTimeout(() => {
      isLayoutChangingRef.current = false;
    }, 500);
  };

  const handleReopenReports = () => {
    if (!selectedView) return;
    isLayoutChangingRef.current = true;
    setReportsVisible(true);
    setTimeout(() => {
      isLayoutChangingRef.current = false;
    }, 500);
  };

  const handleReopenWidgets = () => {
    if (!selectedView) return;
    isLayoutChangingRef.current = true;
    setWidgetsVisible(true);
    setTimeout(() => {
      isLayoutChangingRef.current = false;
    }, 500);
  };

  // Content management handlers
  const handleAddReportsToView = async (reports: Report[]) => {
    if (!selectedView || reports.length === 0) return;
    
    try {
      const newReportIds = reports.map((r) => r.id);
      
      // Call backend API to add reports to view
      await viewsService.addReportsToView(selectedView.id, user.name, newReportIds);
      
      console.log(`✅ Added ${newReportIds.length} reports to view "${selectedView.name}"`);
      
      // Show success notification
      showSuccess(
        "Reports Added",
        `${reports.length} report(s) added to "${selectedView.name}"`
      );
      
      // Refresh views data from backend
      await refetchViews();
      
      setShowAddReportModal(false);
    } catch (error: any) {
      console.error("Failed to add reports to view:", error);
      const errorMessage = error?.data?.message || error?.message || "Please try again";
      showError("Failed to add reports", errorMessage);
    }
  };

  const handleAddWidgetsToView = async (widgets: Widget[]) => {
    if (!selectedView || widgets.length === 0) return;
    
    try {
      const newWidgetIds = widgets.map((w) => w.id);
      
      // Call backend API to add widgets to view
      await viewsService.addWidgetsToView(selectedView.id, user.name, newWidgetIds);
      
      console.log(`✅ Added ${newWidgetIds.length} widgets to view "${selectedView.name}"`);
      
      // Show success notification
      showSuccess(
        "Widgets Added",
        `${widgets.length} widget(s) added to "${selectedView.name}"`
      );
      
      // Refresh views data from backend
      await refetchViews();
      
      setShowAddWidgetModal(false);
    } catch (error: any) {
      console.error("Failed to add widgets to view:", error);
      const errorMessage = error?.data?.message || error?.message || "Please try again";
      showError("Failed to add widgets", errorMessage);
    }
  };

  const handleRemoveReportFromView = async (reportId: string) => {
    if (!selectedView) return;
    
    try {
      // Call backend API to remove report from view
      await viewsService.removeReportFromView(selectedView.id, reportId, user.name);
      
      console.log(`✅ Removed report ${reportId} from view "${selectedView.name}"`);
      
      // Show success notification
      const report = reports.find(r => r.id === reportId);
      showSuccess(
        "Report Removed",
        `"${report?.name || 'Report'}" removed from "${selectedView.name}"`
      );
      
      // Refresh views data from backend
      await refetchViews();
    } catch (error: any) {
      console.error("Failed to remove report from view:", error);
      const errorMessage = error?.data?.message || error?.message || "Please try again";
      showError("Failed to remove report", errorMessage);
    }
  };

  const handleRemoveWidgetFromView = async (widgetId: string) => {
    if (!selectedView) return;
    
    try {
      // Call backend API to remove widget from view
      await viewsService.removeWidgetFromView(selectedView.id, widgetId, user.name);
      
      console.log(`✅ Removed widget ${widgetId} from view "${selectedView.name}"`);
      
      // Show success notification
      const widget = widgets.find(w => w.id === widgetId);
      showSuccess(
        "Widget Removed",
        `"${widget?.name || 'Widget'}" removed from "${selectedView.name}"`
      );
      
      // Refresh views data from backend
      await refetchViews();
    } catch (error: any) {
      console.error("Failed to remove widget from view:", error);
      const errorMessage = error?.data?.message || error?.message || "Please try again";
      showError("Failed to remove widget", errorMessage);
    }
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

  // Get accessible reports and widgets from API
  const getUserAccessibleReports = (): Report[] => {
    return reports; // Already filtered by role from API
  };

  const getUserAccessibleWidgets = (): Widget[] => {
    return widgets; // Already filtered by role from API
  };

  // Content creators - NOT memoized so it always returns fresh content
  const createNavigationContent = () => {
    
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
          popupPosition={navPanelPosition}
          onRefreshData={async () => {
            console.log('🔄 Refreshing navigation data...');
            await Promise.all([
              refetchViews(),
              refetchViewGroups(),
              refetchNavSettings(),
            ]);
            console.log('✅ Navigation data refreshed');
          }}
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
        onRefreshData={async () => {
          console.log('🔄 Refreshing navigation data...');
          await Promise.all([
            refetchViews(),
            refetchViewGroups(),
            refetchNavSettings(),
          ]);
          console.log('✅ Navigation data refreshed');
        }}
      />
    );
  };

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
      onAddReport={() => setShowAddReportModal(true)} // ✅ NEW
      onAddWidget={() => setShowAddWidgetModal(true)} // ✅ NEW
      hasReports={selectedView?.reportIds && selectedView.reportIds.length > 0}
      hasWidgets={selectedView?.widgetIds && selectedView.widgetIds.length > 0}
    />
  );

  // Handle manual toggle (button click) - only allow when vertically oriented
  const handleToggleCollapse = useCallback(() => {
    // Only allow manual collapse/expand when navigation is vertically oriented (docked left/right)
    if (navPanelOrientation !== "vertical") {
      console.log(
        "⚠️ Collapse/expand only works when navigation is docked left/right (vertical orientation)"
      );
      return;
    }

    isManualToggleRef.current = true;
    setIsDockCollapsed((prev) => !prev);
  }, [navPanelOrientation]);

  // Handle layout mode toggle
  const handleToggleLayout = useCallback(() => {
    setLayoutMode((prev) =>
      prev === "horizontal" ? "vertical" : "horizontal"
    );
  }, []);

  // Dock layout manager
  const { generateDynamicLayout, getCurrentLayoutStructure } =
    useDockLayoutManager({
      selectedView,
      reportsVisible,
      widgetsVisible,
      isAdmin: user.role === "admin",
      isDockCollapsed: isDockCollapsed,
      layoutMode: layoutMode,
      navPanelOrientation: navPanelOrientation,
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
      console.warn(
        "Error updating content, falling back to full reload:",
        error
      );
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
      dockLayoutElement.classList.remove(
        "dock-layout-dark",
        "dock-layout-light"
      );
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
    const allPanels = Array.from(document.querySelectorAll(".dock-panel"));
    for (let i = 0; i < allPanels.length; i++) {
      const panel = allPanels[i];
      const navTab = panel.querySelector(
        '.dock-tab[data-node-key="navigation"]'
      );
      if (navTab) {
        return panel as HTMLElement;
      }
    }
    // Fallback: check if panel contains navigation content
    const panelWithNavContent = document
      .querySelector('[data-node-key*="navigation"]')
      ?.closest(".dock-panel");
    return panelWithNavContent as HTMLElement | null;
  }, []);

  // Helper function to detect navigation panel position and orientation
  const detectNavigationPositionAndOrientation = useCallback(() => {
    const navPanel = findNavigationPanel();
    if (!navPanel) return;

    const rect = navPanel.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const panelCenterX = rect.left + rect.width / 2;

    // Detect position (left or right) for popup positioning
    const position = panelCenterX < viewportWidth / 2 ? "left" : "right";
    setNavPanelPosition(position);

    // Detect orientation based on panel dimensions
    // If height > width, panel is vertically oriented (docked left/right)
    // If width > height, panel is horizontally oriented (docked top/bottom)
    const orientation = rect.height > rect.width ? "vertical" : "horizontal";
    setNavPanelOrientation(orientation);

    console.log(
      `📍 Navigation panel - Position: ${position}, Orientation: ${orientation}, Dimensions: ${rect.width}x${rect.height}`
    );
  }, [findNavigationPanel]);

  // Add this useEffect in DashboardDock.tsx to hide/show hamburger button based on orientation
  useEffect(() => {
    const timer = setTimeout(() => {
      const collapseButton = document.querySelector(".collapse-toggle-btn");
      if (collapseButton) {
        if (navPanelOrientation === "horizontal") {
          // Hide button when docked top/bottom
          (collapseButton as HTMLElement).style.display = "none";
          console.log(
            "🙈 Hiding collapse button - horizontal orientation (top/bottom dock)"
          );
        } else {
          // Show button when docked left/right
          (collapseButton as HTMLElement).style.display = "";
          console.log(
            "👁️ Showing collapse button - vertical orientation (left/right dock)"
          );
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [navPanelOrientation]);

  // Setup ResizeObserver for auto expand/collapse based on width
  useEffect(() => {
    const setupResizeObserver = () => {
      const navigationPanel = findNavigationPanel();

      if (!navigationPanel) {
        console.log("Navigation panel not found, retrying...");
        return;
      }

      console.log("Found navigation panel, setting up resize observer");

      // Clean up existing observer
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }

      // Create new resize observer
      resizeObserverRef.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const width = entry.contentRect.width;

          console.log(
            `Navigation panel width: ${width}px, collapsed: ${isDockCollapsed}, orientation: ${navPanelOrientation}`
          );

          // Detect panel position and orientation
          detectNavigationPositionAndOrientation();

          // Force expand if width is above threshold (regardless of mode)
          if (
            width >= LAYOUT_SIZES.NAVIGATION_FORCE_EXPAND_WIDTH &&
            isDockCollapsed
          ) {
            console.log(
              `🔼 Force expanding: width ${width}px >= ${LAYOUT_SIZES.NAVIGATION_FORCE_EXPAND_WIDTH}px`
            );
            setIsDockCollapsed(false);
            return;
          }

          // Only auto-toggle if this isn't from a manual button toggle or layout change
          if (!isManualToggleRef.current && !isLayoutChangingRef.current) {
            // Only trigger auto-collapse/expand if width is stable
            // Ignore transient width changes during layout updates
            const isStableWidth = width > 50; // Ignore very small transient widths

            if (isStableWidth) {
              // Only allow collapse/expand when navigation is vertically oriented (docked left/right)
              if (navPanelOrientation === "vertical") {
                // Auto-collapse if width is below collapse threshold
                if (
                  width < LAYOUT_SIZES.NAVIGATION_COLLAPSE_THRESHOLD &&
                  !isDockCollapsed
                ) {
                  console.log(
                    `🔽 Auto-collapsing (vertical orientation): width ${width}px < ${LAYOUT_SIZES.NAVIGATION_COLLAPSE_THRESHOLD}px`
                  );
                  setIsDockCollapsed(true);
                }
                // Auto-expand if width is above expand threshold
                else if (
                  width > LAYOUT_SIZES.NAVIGATION_EXPAND_THRESHOLD &&
                  isDockCollapsed
                ) {
                  console.log(
                    `🔼 Auto-expanding (vertical orientation): width ${width}px > ${LAYOUT_SIZES.NAVIGATION_EXPAND_THRESHOLD}px`
                  );
                  setIsDockCollapsed(false);
                }
              } else {
                // In horizontal orientation (docked top/bottom), always show expanded
                if (isDockCollapsed) {
                  console.log(
                    `🔼 Forcing expand - horizontal orientation (docked top/bottom)`
                  );
                  setIsDockCollapsed(false);
                }
              }
            }
          } else {
            console.log(
              "Manual toggle or layout change active, skipping auto-toggle"
            );
          }

          // Reset manual toggle flag after a short delay
          if (isManualToggleRef.current) {
            setTimeout(() => {
              isManualToggleRef.current = false;
              console.log("Manual toggle flag reset");
            }, 300);
          }
        }
      });

      resizeObserverRef.current.observe(navigationPanel);
      console.log("ResizeObserver attached successfully");
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
  }, [
    isDockCollapsed,
    navPanelOrientation,
    findNavigationPanel,
    detectNavigationPositionAndOrientation,
  ]);

  // Detect navigation position and orientation on mount and when layout changes
  useEffect(() => {
    const detectWithRetry = () => {
      detectNavigationPositionAndOrientation();
    };

    // Run detection with retries
    const timer1 = setTimeout(detectWithRetry, 100);
    const timer2 = setTimeout(detectWithRetry, 500);
    const timer3 = setTimeout(detectWithRetry, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [
    selectedView,
    reportsVisible,
    widgetsVisible,
    detectNavigationPositionAndOrientation,
  ]);

  // Apply collapsed state to navigation panel
  useEffect(() => {
    const navigationPanel = findNavigationPanel();
    if (navigationPanel) {
      if (isDockCollapsed) {
        navigationPanel.setAttribute("data-collapsed", "true");
      } else {
        navigationPanel.removeAttribute("data-collapsed");
      }
    }
  }, [isDockCollapsed, findNavigationPanel]);

  // Debounce timer ref for saving layouts
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingLayoutRef = useRef<boolean>(false);
  const userInteractingRef = useRef<boolean>(false);
  const lastUserInteractionRef = useRef<number>(0);

  // Cleanup save timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Handle navigation panel maximize - auto expand
  const handleLayoutChange = useCallback(
    (newLayout: LayoutData) => {
      // Mark user interaction timestamp
      lastUserInteractionRef.current = Date.now();
      userInteractingRef.current = true;
      
      // Detect navigation position and orientation on layout change
      setTimeout(() => {
        detectNavigationPositionAndOrientation();
      }, 100);

      // Check if navigation panel is maximized
      const maxboxChild = newLayout?.maxbox?.children?.[0];
      const isNavigationMaximized =
        maxboxChild &&
        "tabs" in maxboxChild &&
        maxboxChild.tabs?.[0]?.id === "navigation";

      if (isNavigationMaximized && isDockCollapsed) {
        console.log("🔼 Navigation maximized - auto-expanding");
        setIsDockCollapsed(false);
      }

      // Save layout customization when user makes changes
      if (currentSignature && newLayout) {
        // Clear both automatic and previous user-triggered timeouts
        if (autoSaveTimeoutRef.current) {
          console.log("🚫 Canceling automatic save - user is interacting");
          clearTimeout(autoSaveTimeoutRef.current);
          autoSaveTimeoutRef.current = null;
        }
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        
        // Debounced save to avoid saving during rapid changes
        saveTimeoutRef.current = setTimeout(() => {
          console.log("💾 Saving layout after user interaction (debounced)");
          layoutPersistenceService.saveLayout(
            user.name,
            currentSignature,
            newLayout
          );
          // Reset user interaction flag after save completes
          userInteractingRef.current = false;
        }, 1000);
      }
    },
    [isDockCollapsed, detectNavigationPositionAndOrientation, currentSignature, user.name]
  );

  // Helper function to find navigation panel in layout data
  const findNavigationPanelInLayout = useCallback((layout: LayoutData) => {
    if (!layout?.dockbox?.children) return null;

    const findInChildren = (children: any[]): any => {
      for (const child of children) {
        // Check if this is a panel with navigation tab
        if (
          child.tabs &&
          child.tabs.some((tab: any) => tab.id === "navigation")
        ) {
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
            navigationPanel.setAttribute("data-collapsed", "true");
          } else {
            navigationPanel.removeAttribute("data-collapsed");
          }
        }
      }, 0);
    }
  }, [isDockCollapsed, findNavigationPanel, findNavigationPanelInLayout]);

  // Smart layout management with persistence - reload on structural changes
  useEffect(() => {
    if (!dockLayoutRef.current) return;

    // Compute current layout signature
    const newSignature = computeCurrentSignature();
    const signatureChanged = newSignature !== previousSignatureRef.current;

    console.log(
      `🔍 Layout Check - Current: "${newSignature}", Previous: "${previousSignatureRef.current}", Changed: ${signatureChanged}`
    );

    if (signatureChanged) {
      console.log(
        `🔄 Layout signature changed: "${previousSignatureRef.current}" → "${newSignature}"`
      );

      // Extract current navigation state before changing layout
      const currentLayout = dockLayoutRef.current.getLayout();
      const navState = layoutPersistenceService.extractNavigationState(currentLayout);
      console.log("📍 Extracted navigation state:", navState);

      // Try to load saved layout for this signature
      const savedLayout = layoutPersistenceService.loadLayout(
        user.name,
        newSignature
      );

      let layoutToLoad: LayoutData;

      if (savedLayout) {
        console.log(
          `✅ Restoring saved layout for signature: "${newSignature}"`
        );
        layoutToLoad = savedLayout;

        // Update content in the saved layout to reflect current state
        // This ensures the content is fresh even though structure is preserved
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
            // Recursively update nested panels
            if (panel.children) {
              updatePanelContent(panel.children);
            }
          });
        };

        if (layoutToLoad?.dockbox?.children) {
          updatePanelContent(layoutToLoad.dockbox.children);
        }
      } else {
        console.log(
          `🆕 No saved layout found, generating default for signature: "${newSignature}"`
        );
        layoutToLoad = generateDynamicLayout();
        
        // Apply previous navigation state to new layout
        if (navState) {
          console.log("🔧 Applying previous navigation state to new layout");
          layoutToLoad = layoutPersistenceService.applyNavigationState(
            layoutToLoad,
            navState
          );
        }
        
        // Save this new layout after a brief delay to avoid interfering with layout loading
        // Use autoSaveTimeoutRef so it can be canceled if user interacts
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        autoSaveTimeoutRef.current = setTimeout(() => {
          console.log("💾 Auto-saving new layout with preserved navigation state");
          layoutPersistenceService.saveLayout(user.name, newSignature, layoutToLoad);
          autoSaveTimeoutRef.current = null;
        }, 500);
      }

      // Set loading flag to prevent structure updates during load
      isLoadingLayoutRef.current = true;
      
      // Load the layout
      dockLayoutRef.current.loadLayout(layoutToLoad);

      // Update state
      setCurrentSignature(newSignature);
      previousSignatureRef.current = newSignature;

      // Apply collapsed state after layout loads
      setTimeout(() => {
        const navigationPanel = findNavigationPanel();
        if (navigationPanel) {
          if (isDockCollapsed) {
            navigationPanel.setAttribute("data-collapsed", "true");
          } else {
            navigationPanel.removeAttribute("data-collapsed");
          }
        }
        
        // Reset loading flag after layout has settled
        setTimeout(() => {
          isLoadingLayoutRef.current = false;
          console.log("✅ Layout load complete, structure updates enabled");
        }, 200);
      }, 0);
    } else {
      // Signature hasn't changed - check if we need to update layout structure for panel visibility
      const currentLayout = dockLayoutRef.current.getLayout();
      
      // Helper to recursively search for panels in layout
      const findPanelInLayout = (children: any[], panelId: string): boolean => {
        if (!children) return false;
        return children.some((child: any) => {
          if (child.tabs?.some((tab: any) => tab.id === panelId)) {
            return true;
          }
          if (child.children) {
            return findPanelInLayout(child.children, panelId);
          }
          return false;
        });
      };
      
      const hasReportsPanel = currentLayout?.dockbox?.children 
        ? findPanelInLayout(currentLayout.dockbox.children, "reports")
        : false;
      const hasWidgetsPanel = currentLayout?.dockbox?.children
        ? findPanelInLayout(currentLayout.dockbox.children, "widgets")
        : false;

      const needsStructureUpdate =
        (reportsVisible && !hasReportsPanel) ||
        (!reportsVisible && hasReportsPanel) ||
        (widgetsVisible && !hasWidgetsPanel) ||
        (!widgetsVisible && hasWidgetsPanel);

      // Check if user has interacted recently (within 2 seconds)
      const timeSinceInteraction = Date.now() - lastUserInteractionRef.current;
      const recentlyInteracted = timeSinceInteraction < 2000;
      
      // Don't trigger structure updates if:
      // 1. Currently loading a layout
      // 2. User is actively interacting
      // 3. User interacted within last 2 seconds (drag/dock operations)
      const shouldSkipUpdate = isLoadingLayoutRef.current || userInteractingRef.current || recentlyInteracted;
      
      if (needsStructureUpdate && !shouldSkipUpdate) {
        console.log("🔧 Panel visibility changed - updating layout structure while preserving navigation");
        
        // Set loading flag
        isLoadingLayoutRef.current = true;
        
        // Extract current navigation state
        const navState = layoutPersistenceService.extractNavigationState(currentLayout);
        
        // Generate new layout with correct panel visibility
        let newLayout = generateDynamicLayout();
        
        // Apply navigation state to preserve customizations
        if (navState) {
          newLayout = layoutPersistenceService.applyNavigationState(newLayout, navState);
        }
        
        // Load the updated layout
        dockLayoutRef.current.loadLayout(newLayout);
        
        // Save the updated layout after a delay to avoid interfering with user interaction
        // Use autoSaveTimeoutRef so it can be canceled if user interacts
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        autoSaveTimeoutRef.current = setTimeout(() => {
          console.log("💾 Auto-saving layout after panel visibility change");
          layoutPersistenceService.saveLayout(user.name, currentSignature, newLayout);
          autoSaveTimeoutRef.current = null;
        }, 500);
        
        // Apply collapsed state and reset loading flag
        setTimeout(() => {
          const navigationPanel = findNavigationPanel();
          if (navigationPanel) {
            if (isDockCollapsed) {
              navigationPanel.setAttribute("data-collapsed", "true");
            } else {
              navigationPanel.removeAttribute("data-collapsed");
            }
          }
          
          // Reset loading flag after layout has settled
          setTimeout(() => {
            isLoadingLayoutRef.current = false;
            console.log("✅ Structure update complete");
          }, 200);
        }, 0);
      } else if (needsStructureUpdate && shouldSkipUpdate) {
        if (isLoadingLayoutRef.current) {
          console.log("⏸️ Skipping structure update - layout is loading");
        } else if (userInteractingRef.current) {
          console.log("⏸️ Skipping structure update - user is actively interacting");
        } else if (recentlyInteracted) {
          console.log(`⏸️ Skipping structure update - user interacted ${timeSinceInteraction}ms ago`);
        }
      } else {
        // Only content changed, no structure update needed
        console.log("📝 Only content changed, updating content in-place");
        updateLayoutContent();
      }
    }
  }, [
    selectedView,
    reportsVisible,
    widgetsVisible,
    layoutMode,
    isDockCollapsed,
    navigationUpdateTrigger,
    computeCurrentSignature,
    findNavigationPanel,
    createNavigationContent,
    createReportsContent,
    createWidgetsContent,
    createWelcomeContent,
    generateDynamicLayout,
    updateLayoutContent,
    user.name,
  ]);

  // Force update navigation content when data changes
  useEffect(() => {
    console.log('🔄 Data changed - updating navigation content');
    console.log('  Views:', views.length);
    console.log('  View Groups:', viewGroups.length);
    console.log('  Navigation trigger:', navigationUpdateTrigger);
    
    // Force update the layout content
    if (dockLayoutRef.current) {
      updateLayoutContent();
    }
  }, [views, viewGroups, navSettings, navigationUpdateTrigger, updateLayoutContent]);

  // Show loading state
  if (apiLoading) {
    return (
      <div className="dashboard-dock modern" data-theme={theme}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ fontSize: '18px', color: '#666' }}>Loading dashboard...</div>
          <div style={{ fontSize: '14px', color: '#999' }}>Fetching your data from server</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (apiError) {
    return (
      <div className="dashboard-dock modern" data-theme={theme}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ fontSize: '18px', color: '#f44336' }}>Error loading dashboard</div>
          <div style={{ fontSize: '14px', color: '#999' }}>{apiError}</div>
          <button onClick={() => window.location.reload()} style={{
            padding: '10px 20px',
            fontSize: '14px',
            cursor: 'pointer',
            borderRadius: '4px',
            border: '1px solid #ccc',
            background: '#fff'
          }}>
            Reload
          </button>
        </div>
      </div>
    );
  }

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
        <ManageModal 
          user={user} 
          onClose={() => setShowManageModal(false)} 
          onRefreshData={() => {
            // Refresh views and viewgroups data after changes
            refetchViews();
            refetchViewGroups();
            refetchNavSettings();
          }}
        />
      )}

      {showNavigationModal && (
        <NavigationManageModal
          user={user}
          onClose={() => setShowNavigationModal(false)}
          onUpdateViews={handleUpdateViews}
          onUpdateViewGroups={handleUpdateViewGroups}
          onUpdateNavSettings={handleUpdateNavSettings}
          onRefreshData={async () => {
            await Promise.all([refetchViews(), refetchViewGroups(), refetchNavSettings()]);
          }}
          onAddView={async (newView, viewGroupIds) => {
            try {
              console.log('🆕 Creating new view:', newView.name, 'for groups:', viewGroupIds);
              
              // ✅ Step 1: Create the view via API (backend returns view with real ID)
              // Use a reasonable orderIndex (current count) instead of Date.now()
              const orderIndex = views.length;
              
              const createdView = await viewsService.createView(user.name, {
                name: newView.name,
                reportIds: newView.reportIds,
                widgetIds: newView.widgetIds,
                isVisible: true,
                orderIndex: orderIndex,
              });
              console.log('  ✅ View created in database with ID:', createdView.id);
              
              // Step 2: Add view to selected groups via API (use backend-generated ID)
              if (viewGroupIds && viewGroupIds.length > 0) {
                for (const groupId of viewGroupIds) {
                  console.log('  Adding view to group:', groupId);
                  await viewGroupsService.addViewsToGroup(groupId, user.name, [createdView.id]);
                }
                console.log('  ✅ View added to', viewGroupIds.length, 'groups');
              }
              
              // Step 3: Refresh all data
              console.log('  🔄 Refreshing data...');
              await Promise.all([refetchViews(), refetchViewGroups()]);
              console.log('✅ View created and data refreshed');
            } catch (error: any) {
              console.error('❌ Failed to create view:', error);
              const errorMessage = error?.message || error?.data?.message || 'Unknown error';
              // Show error notification
              alert(`Failed to create view: ${errorMessage}`);
            }
          }}
          onAddViewGroup={async (newViewGroup) => {
            try {
              console.log('🆕 Creating new view group:', newViewGroup.name);
              console.log('  With views:', newViewGroup.viewIds);
              
    // ✅ Step 1: Create the view group via API (WITHOUT viewIds)
    // Use a reasonable orderIndex (current count) instead of Date.now() which is too large for Int32
    const orderIndex = viewGroups.length;
    
    const createdViewGroup = await viewGroupsService.createViewGroup(user.name, {
      name: newViewGroup.name,
      isVisible: newViewGroup.isVisible ?? true,
      isDefault: newViewGroup.isDefault ?? false,
      orderIndex: orderIndex,
    });
              console.log('  ✅ View group created in database with ID:', createdViewGroup.id);
              
              // ✅ Step 2: Add views to the group (if any selected)
              if (newViewGroup.viewIds && newViewGroup.viewIds.length > 0) {
                console.log('  Adding', newViewGroup.viewIds.length, 'views to group');
                await viewGroupsService.addViewsToGroup(
                  createdViewGroup.id,
                  user.name,
                  newViewGroup.viewIds
                );
                console.log('  ✅ Views added to group');
              } else {
                console.log('  No views to add (empty group)');
              }
              
              // ✅ Step 3: Refresh all data
              console.log('  🔄 Refreshing data...');
              await Promise.all([refetchViewGroups(), refetchNavSettings()]);
              console.log('✅ View group created and data refreshed');
            } catch (error: any) {
              console.error('❌ Failed to create view group:', error);
              const errorMessage = error?.message || error?.data?.message || 'Unknown error';
              // Show error notification
              alert(`Failed to create view group: ${errorMessage}`);
            }
          }}
          views={views}
          viewGroups={viewGroups}
          userNavSettings={navSettings ? [navSettings] : []}
          reports={getUserAccessibleReports()}  
          widgets={getUserAccessibleWidgets()}  
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
