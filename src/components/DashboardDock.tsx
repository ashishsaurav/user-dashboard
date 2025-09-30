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
} from "../types";
import {
  testReports,
  testWidgets,
  getUserNavigationData,
  initializeUserNavigationData,
} from "../data/testData";
import { useTheme } from "../contexts/ThemeContext";
import ManageModal from "./ManageModal";
import NavigationManageModal from "./NavigationManageModal";
import "./DashboardDock.css";
import NavigationPanel from "./NavigationPanel";
import ViewContentPanel from "./ViewContentPanel";
import AddReportModal from "./AddReportModal";
import AddWidgetModal from "./AddWidgetModal";

interface DashboardDockProps {
  user: User;
  onLogout: () => void;
}

const DashboardDock: React.FC<DashboardDockProps> = ({ user, onLogout }) => {
  const [showManageModal, setShowManageModal] = useState(false);
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [showAddReportModal, setShowAddReportModal] = useState(false);
  const [showAddWidgetModal, setShowAddWidgetModal] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // NEW: Selected view state for dynamic content
  const [selectedView, setSelectedView] = useState<View | null>(null);

  // FIXED: Force re-render trigger for NavigationPanel
  const [navigationUpdateTrigger, setNavigationUpdateTrigger] = useState(0);

  // RC-DOCK REF for updates
  const dockLayoutRef = useRef<DockLayout>(null);

  // Navigation state management (keeping your original logic)
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

  // FIXED: Enhanced state handlers with real-time updates
  const handleUpdateViews = (updatedViews: View[]) => {
    const sortedViews = [...updatedViews].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );
    setViews(sortedViews);
    sessionStorage.setItem(
      `navigationViews_${user.name}`,
      JSON.stringify(sortedViews)
    );

    // FIXED: Trigger navigation panel update
    setNavigationUpdateTrigger((prev) => prev + 1);

    // FIXED: Update selected view if it was modified
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

    // FIXED: Trigger navigation panel update
    setNavigationUpdateTrigger((prev) => prev + 1);
  };

  const handleUpdateNavSettings = (settings: UserNavigationSettings) => {
    setNavSettings(settings);
    sessionStorage.setItem(
      `navigationSettings_${user.name}`,
      JSON.stringify(settings)
    );

    // FIXED: Trigger navigation panel update
    setNavigationUpdateTrigger((prev) => prev + 1);
  };

  // NEW: View selection handler
  const handleViewSelect = (view: View) => {
    console.log("View selected:", view.name);
    setSelectedView(view);
  };

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

    console.log(
      `Added ${reports.length} reports to view, navigation should update immediately`
    );
  };

  // UPDATED: Handle multiple widgets
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

    console.log(
      `Added ${widgets.length} widgets to view, navigation should update immediately`
    );
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

    // Update all states immediately
    handleUpdateViews(updatedViews);
    setSelectedView(updatedView);

    console.log("Report removed, navigation should update immediately");
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

    // Update all states immediately
    handleUpdateViews(updatedViews);
    setSelectedView(updatedView);

    console.log("Widget removed, navigation should update immediately");
  };

  const handleReorderReports = (newReportOrder: string[]) => {
    if (!selectedView) return;

    const updatedView = {
      ...selectedView,
      reportIds: newReportOrder,
    };

    const updatedViews = views.map((v) =>
      v.id === selectedView.id ? updatedView : v
    );

    handleUpdateViews(updatedViews);
    setSelectedView(updatedView);

    console.log("Reports reordered:", newReportOrder);
  };

  // NEW: Widget reordering handler
  const handleReorderWidgets = (newWidgetOrder: string[]) => {
    if (!selectedView) return;

    const updatedView = {
      ...selectedView,
      widgetIds: newWidgetOrder,
    };

    const updatedViews = views.map((v) =>
      v.id === selectedView.id ? updatedView : v
    );

    handleUpdateViews(updatedViews);
    setSelectedView(updatedView);

    console.log("Widgets reordered:", newWidgetOrder);
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

    console.log(`Theme switched to: ${theme}`);
  }, [theme]);

  // Icons (keeping existing)
  const SettingsIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20V10" />
      <path d="M18 20V4" />
      <path d="M6 20v-6" />
    </svg>
  );

  const NavigationIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  );

  const ReportsIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10,9 9,9 8,9" />
    </svg>
  );

  const WidgetsIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );

  const ManageIcon = () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );

  const PlusIcon = () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );

  const ThemeIconLight = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );

  const ThemeIconDark = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );

  // FIXED: Navigation content with forced updates using navigationUpdateTrigger
  const createNavigationContent = useCallback(() => {
    console.log(
      "Creating navigation content, trigger:",
      navigationUpdateTrigger
    );

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
    user,
    views,
    viewGroups,
    navSettings,
    selectedView,
    navigationUpdateTrigger,
  ]);

  // Dynamic content panels
  const createReportsContent = () => (
    <ViewContentPanel
      type="reports"
      selectedView={selectedView}
      reports={getUserAccessibleReports()}
      widgets={[]}
      onRemoveReport={handleRemoveReportFromView}
      onRemoveWidget={() => {}}
      onReorderReports={handleReorderReports} // NEW
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
      onReorderWidgets={handleReorderWidgets} // NEW
    />
  );

  // FIXED: Update dock layout when content changes - force update using updateTab
  useEffect(() => {
    console.log("Updating dock layout due to navigation changes");

    if (dockLayoutRef.current) {
      // Force update navigation tab with new content
      dockLayoutRef.current.updateTab("navigation", {
        id: "navigation",
        title: (
          <div className="dock-tab-header navigation-tab-header">
            <div className="tab-title">
              <NavigationIcon />
              <span>Navigation</span>
            </div>
            <div className="tab-actions">
              <button
                className="tab-action-btn manage-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNavigationModal(true);
                }}
                title="Manage Navigation"
              >
                <SettingsIcon />
              </button>
              {user.role === "admin" && (
                <button
                  className="tab-action-btn settings-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowManageModal(true);
                  }}
                  title="System Settings"
                >
                  <ManageIcon />
                </button>
              )}
            </div>
          </div>
        ),
        content: createNavigationContent(),
        closable: false,
      });

      dockLayoutRef.current.updateTab("reports", {
        id: "reports",
        title: (
          <div className="dock-tab-header">
            <div className="tab-title">
              <ReportsIcon />
              <span>Reports</span>
            </div>
            {selectedView && (
              <div className="tab-actions">
                <button
                  className="tab-action-btn add-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddReportModal(true);
                  }}
                  title="Add Report"
                >
                  <PlusIcon />
                </button>
              </div>
            )}
          </div>
        ),
        content: createReportsContent(),
        closable: false,
      });

      dockLayoutRef.current.updateTab("widgets", {
        id: "widgets",
        title: (
          <div className="dock-tab-header">
            <div className="tab-title">
              <WidgetsIcon />
              <span>Widgets</span>
            </div>
            {selectedView && (
              <div className="tab-actions">
                <button
                  className="tab-action-btn add-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddWidgetModal(true);
                  }}
                  title="Add Widget"
                >
                  <PlusIcon />
                </button>
              </div>
            )}
          </div>
        ),
        content: createWidgetsContent(),
        closable: false,
      });
    }
  }, [selectedView, views, viewGroups, navSettings, navigationUpdateTrigger]);

  const ThemeIcon = theme === "light" ? ThemeIconLight : ThemeIconDark;

  // Dock layout configuration
  const layout: LayoutData = {
    dockbox: {
      mode: "horizontal",
      children: [
        {
          tabs: [
            {
              id: "navigation",
              title: (
                <div className="dock-tab-header navigation-tab-header">
                  <div className="tab-title">
                    <NavigationIcon />
                    <span>Navigation</span>
                  </div>
                  <div className="tab-actions">
                    <button
                      className="tab-action-btn manage-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowNavigationModal(true);
                      }}
                      title="Manage Navigation"
                    >
                      <ManageIcon />
                    </button>
                    {user.role === "admin" && (
                      <button
                        className="tab-action-btn settings-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowManageModal(true);
                        }}
                        title="System Settings"
                      >
                        <ManageIcon />
                      </button>
                    )}
                  </div>
                </div>
              ),
              content: createNavigationContent(),
              closable: false,
            },
          ],
          size: 320,
        },
        {
          tabs: [
            {
              id: "reports",
              title: (
                <div className="dock-tab-header">
                  <div className="tab-title">
                    <ReportsIcon />
                    <span>Reports</span>
                  </div>
                  {selectedView && (
                    <div className="tab-actions">
                      <button
                        className="tab-action-btn add-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAddReportModal(true);
                        }}
                        title="Add Report"
                      >
                        <PlusIcon />
                      </button>
                    </div>
                  )}
                </div>
              ),
              content: createReportsContent(),
              closable: false,
            },
          ],
          size: 480,
        },
        {
          tabs: [
            {
              id: "widgets",
              title: (
                <div className="dock-tab-header">
                  <div className="tab-title">
                    <WidgetsIcon />
                    <span>Widgets</span>
                  </div>
                  {selectedView && (
                    <div className="tab-actions">
                      <button
                        className="tab-action-btn add-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAddWidgetModal(true);
                        }}
                        title="Add Widget"
                      >
                        <PlusIcon />
                      </button>
                    </div>
                  )}
                </div>
              ),
              content: createWidgetsContent(),
              closable: false,
            },
          ],
          size: 380,
        },
      ],
    },
  };

  return (
    <div className="dashboard-dock modern" data-theme={theme}>
      <div className="dock-container full-height">
        <DockLayout
          ref={dockLayoutRef}
          defaultLayout={layout}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
          }}
        />
      </div>

      {/* Floating Theme Toggle Button */}
      <button
        className="floating-theme-toggle"
        onClick={toggleTheme}
        title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      >
        <ThemeIcon />
      </button>

      {/* Modals */}
      {showManageModal && (
        <ManageModal onClose={() => setShowManageModal(false)} />
      )}

      {showNavigationModal && (
        <NavigationManageModal
          user={user}
          onClose={() => setShowNavigationModal(false)}
          onUpdateViews={(newViews) => {
            handleUpdateViews(newViews);
          }}
          onUpdateViewGroups={(newViewGroups) => {
            handleUpdateViewGroups(newViewGroups);
          }}
          onUpdateNavSettings={(newSettings) => {
            handleUpdateNavSettings(newSettings);
          }}
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

      {/* Add Report Modal */}
      {showAddReportModal && selectedView && (
        <AddReportModal
          onAddReports={handleAddReportsToView} // CHANGED: onAddReports
          onClose={() => setShowAddReportModal(false)}
          availableReports={getUserAccessibleReports().filter(
            (report) => !selectedView.reportIds.includes(report.id)
          )}
        />
      )}

      {showAddWidgetModal && selectedView && (
        <AddWidgetModal
          onAddWidgets={handleAddWidgetsToView} // CHANGED: onAddWidgets
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
