import React, { useState, useEffect, useCallback, useRef } from "react";
import * as FlexLayout from "flexlayout-react";
import "flexlayout-react/style/light.css";
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
import { useFlexLayoutManager } from "./FlexLayoutManager";
import { LAYOUT_SIZES } from "../../constants/layout";
import "./styles/DashboardDock.css";
import "./styles/GmailDockIntegration.css";
import "./styles/FlexLayoutCustom.css";

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

  // Force re-render trigger for NavigationPanel
  const [navigationUpdateTrigger, setNavigationUpdateTrigger] = useState(0);

  // FlexLayout model ref
  const [model, setModel] = useState<FlexLayout.Model | null>(null);
  const layoutRef = useRef<FlexLayout.Layout>(null);
  
  // Layout persistence key
  const LAYOUT_STORAGE_KEY = `flexlayout_${user.name}`;

  // Resize observer ref for navigation panel
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const isManualToggleRef = useRef<boolean>(false);

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
    setSelectedView(view);

    // Auto-show both sections when a view is selected
    setReportsVisible(true);
    setWidgetsVisible(true);
  };

  // Section handlers
  const handleCloseReports = () => setReportsVisible(false);
  const handleCloseWidgets = () => setWidgetsVisible(false);
  const handleReopenReports = () => selectedView && setReportsVisible(true);
  const handleReopenWidgets = () => selectedView && setWidgetsVisible(true);

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

  // Handle manual toggle (button click)
  const handleToggleCollapse = useCallback(() => {
    isManualToggleRef.current = true;
    setIsDockCollapsed(prev => !prev);
  }, []);

  // Custom tab renderer with action buttons (better than onRenderTabSet)
  const onRenderTab = useCallback((node: FlexLayout.TabNode, renderValues: any) => {
    const component = node.getComponent();
    
    console.log('Rendering tab for component:', component);
    
    // Hide tab names (empty content)
    renderValues.content = <span style={{ display: 'none' }}></span>;
    
    // Initialize buttons array
    if (!renderValues.buttons) {
      renderValues.buttons = [];
    }
    
    const buttons: React.ReactNode[] = [];

    if (component === "navigation") {
      // Collapse/Expand button
      buttons.push(
        <button
          key="collapse"
          className="flexlayout__tab_toolbar_button"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleCollapse();
          }}
          title={isDockCollapsed ? "Expand navigation" : "Collapse navigation"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      );

      // Show Reports button (if hidden)
      if (selectedView && !reportsVisible) {
        buttons.push(
          <button
            key="show-reports"
            className="flexlayout__tab_toolbar_button"
            onClick={(e) => {
              e.stopPropagation();
              handleReopenReports();
            }}
            title="Show Reports"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
          </button>
        );
      }

      // Show Widgets button (if hidden)
      if (selectedView && !widgetsVisible) {
        buttons.push(
          <button
            key="show-widgets"
            className="flexlayout__tab_toolbar_button"
            onClick={(e) => {
              e.stopPropagation();
              handleReopenWidgets();
            }}
            title="Show Widgets"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </button>
        );
      }

      // Manage Navigation button
      buttons.push(
        <button
          key="manage-nav"
          className="flexlayout__tab_toolbar_button"
          onClick={(e) => {
            e.stopPropagation();
            setShowNavigationModal(true);
          }}
          title="Manage Navigation"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      );

      // System Settings button (admin only)
      if (user.role === "admin") {
        buttons.push(
          <button
            key="settings"
            className="flexlayout__tab_toolbar_button"
            onClick={(e) => {
              e.stopPropagation();
              setShowManageModal(true);
            }}
            title="System Settings"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        );
      }
    } else if (component === "reports") {
      // Add Report button
      buttons.push(
        <button
          key="add-report"
          className="flexlayout__tab_toolbar_button"
          onClick={(e) => {
            e.stopPropagation();
            setShowAddReportModal(true);
          }}
          title="Add Report"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      );

      // Close Reports button
      buttons.push(
        <button
          key="close-reports"
          className="flexlayout__tab_toolbar_button"
          onClick={(e) => {
            e.stopPropagation();
            handleCloseReports();
          }}
          title="Close Reports"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      );
    } else if (component === "widgets") {
      // Add Widget button
      buttons.push(
        <button
          key="add-widget"
          className="flexlayout__tab_toolbar_button"
          onClick={(e) => {
            e.stopPropagation();
            setShowAddWidgetModal(true);
          }}
          title="Add Widget"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      );

      // Close Widgets button
      buttons.push(
        <button
          key="close-widgets"
          className="flexlayout__tab_toolbar_button"
          onClick={(e) => {
            e.stopPropagation();
            handleCloseWidgets();
          }}
          title="Close Widgets"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      );
    }

    // Add buttons to the tab
    buttons.forEach(button => renderValues.buttons.push(button));
    
    console.log(`Added ${buttons.length} buttons for tab: ${component}`);
  }, [isDockCollapsed, selectedView, reportsVisible, widgetsVisible, user.role, 
      handleToggleCollapse, handleReopenReports, handleReopenWidgets, 
      handleCloseReports, handleCloseWidgets]);

  // FlexLayout factory to render components
  const factory = (node: FlexLayout.TabNode) => {
    const component = node.getComponent();
    const config = node.getConfig();

    switch (component) {
      case "navigation":
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

      case "reports":
        return (
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

      case "widgets":
        return (
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

      case "welcome":
        return (
          <WelcomeContent
            selectedView={selectedView}
            onReopenReports={handleReopenReports}
            onReopenWidgets={handleReopenWidgets}
          />
        );

      default:
        return <div>Unknown component: {component}</div>;
    }
  };

  // FlexLayout manager
  const { generateLayout } = useFlexLayoutManager({
    selectedView,
    reportsVisible,
    widgetsVisible,
    isAdmin: user.role === "admin",
    isDockCollapsed,
  });

  // Initialize model with persistence
  useEffect(() => {
    // Try to load saved layout from localStorage
    const savedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY);
    
    let newModel: FlexLayout.Model;
    
    if (savedLayout) {
      try {
        const layoutJson = JSON.parse(savedLayout);
        newModel = FlexLayout.Model.fromJson(layoutJson);
        console.log('Loaded saved layout from localStorage');
      } catch (error) {
        console.error('Error loading saved layout:', error);
        newModel = generateLayout();
      }
    } else {
      newModel = generateLayout();
    }
    
    setModel(newModel);
  }, []);

  // Update model when state changes (but preserve user's layout customizations)
  useEffect(() => {
    if (!model) return;
    
    // Only regenerate if structure fundamentally changed (view selected/deselected, panels shown/hidden)
    // Don't regenerate on every minor change to preserve user's layout
    const currentStructure = getCurrentLayoutStructure();
    
    // Save layout to localStorage whenever model changes
    if (model) {
      const layoutJson = model.toJson();
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layoutJson));
    }
  }, [selectedView, reportsVisible, widgetsVisible, isDockCollapsed, navigationUpdateTrigger]);

  // Apply theme changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  // Setup ResizeObserver for auto expand/collapse based on panel size
  useEffect(() => {
    const setupResizeObserver = () => {
      const navTabset = document.querySelector('.flexlayout__tabset[data-layout-path*="/0"]');
      
      if (!navTabset) {
        console.log('Navigation tabset not found, retrying...');
        return;
      }

      console.log('Found navigation tabset, setting up resize observer');

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }

      resizeObserverRef.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const width = entry.contentRect.width;
          const height = entry.contentRect.height;
          
          const isVerticalStacked = height < width;
          
          console.log(`Navigation panel - Width: ${width}px, Height: ${height}px, Vertical: ${isVerticalStacked}, Collapsed: ${isDockCollapsed}`);
          
          if (!isManualToggleRef.current) {
            if (!isVerticalStacked) {
              if (width < LAYOUT_SIZES.NAVIGATION_COLLAPSE_THRESHOLD && !isDockCollapsed) {
                console.log(`🔽 Auto-collapsing: width ${width}px < ${LAYOUT_SIZES.NAVIGATION_COLLAPSE_THRESHOLD}px`);
                setIsDockCollapsed(true);
              }
              else if (width > LAYOUT_SIZES.NAVIGATION_EXPAND_THRESHOLD && isDockCollapsed) {
                console.log(`🔼 Auto-expanding: width ${width}px > ${LAYOUT_SIZES.NAVIGATION_EXPAND_THRESHOLD}px`);
                setIsDockCollapsed(false);
              }
            } else {
              const heightCollapseThreshold = 100;
              const heightExpandThreshold = 150;
              
              if (height < heightCollapseThreshold && !isDockCollapsed) {
                console.log(`🔽 Auto-collapsing: height ${height}px < ${heightCollapseThreshold}px`);
                setIsDockCollapsed(true);
              }
              else if (height > heightExpandThreshold && isDockCollapsed) {
                console.log(`🔼 Auto-expanding: height ${height}px > ${heightExpandThreshold}px`);
                setIsDockCollapsed(false);
              }
            }
          }
          
          if (isManualToggleRef.current) {
            setTimeout(() => {
              isManualToggleRef.current = false;
              console.log('Manual toggle flag reset');
            }, 300);
          }
        }
      });

      resizeObserverRef.current.observe(navTabset);
      console.log('ResizeObserver attached successfully');
    };

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
  }, [isDockCollapsed]);

  if (!model) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-dock modern" data-theme={theme}>
      <div className="flex-layout-container" style={{ height: '100vh' }}>
        <FlexLayout.Layout
          ref={layoutRef}
          model={model}
          factory={factory}
          onRenderTab={onRenderTab}
          onModelChange={(newModel) => {
            // Save layout when user drags/resizes panels
            const layoutJson = newModel.toJson();
            localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layoutJson));
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
