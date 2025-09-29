import React, { useState, useEffect, useCallback, useRef } from "react";
import DockLayout, { LayoutData } from "rc-dock";
import "rc-dock/dist/rc-dock.css";
import "rc-dock/dist/rc-dock-dark.css"; // Keep this for dark theme
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

interface DashboardDockProps {
  user: User;
  onLogout: () => void;
}

// Icons for buttons - properly sized (keeping your existing icons)
const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.4a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const NavigationIcon = () => (
  <svg
    width="14"
    height="14"
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
    width="14"
    height="14"
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
    width="14"
    height="14"
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

// Button icons - smaller for buttons
const ManageIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const SettingsSmallIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.4a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

// Theme toggle icons for floating button
const ThemeIconLight = () => (
  <svg
    width="20"
    height="20"
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
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const DashboardDock: React.FC<DashboardDockProps> = ({ user, onLogout }) => {
  const [showManageModal, setShowManageModal] = useState(false);
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // RC-DOCK REF for updates
  const dockLayoutRef = useRef<DockLayout>(null);

  // Apply RC-Dock theme classes properly when theme changes
  useEffect(() => {
    // Apply theme to document root for global theming
    document.documentElement.setAttribute("data-theme", theme);

    // Apply RC-Dock theme classes to the dock layout container
    const dockContainer = document.querySelector(".dock-container");
    const dockLayoutElement = document.querySelector(".dock-layout");

    if (dockContainer) {
      // Remove all theme classes first
      dockContainer.classList.remove("dock-layout-dark", "dock-layout-light");

      // Add appropriate theme class
      if (theme === "dark") {
        dockContainer.classList.add("dock-layout-dark");
      } else {
        dockContainer.classList.add("dock-layout-light");
      }
    }

    if (dockLayoutElement) {
      // Remove all theme classes first
      dockLayoutElement.classList.remove(
        "dock-layout-dark",
        "dock-layout-light"
      );

      // Add appropriate theme class
      if (theme === "dark") {
        dockLayoutElement.classList.add("dock-layout-dark");
      } else {
        dockLayoutElement.classList.add("dock-layout-light");
      }
    }

    // Also apply to body for global theme switching
    document.body.setAttribute("data-theme", theme);

    console.log(`Theme switched to: ${theme}`);
  }, [theme]);

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

  const [navSettings, setNavSettings] = useState<UserNavigationSettings | null>(
    () => {
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
    }
  );

  // State handlers
  const handleUpdateViews = (updatedViews: View[]) => {
    const sortedViews = [...updatedViews].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );
    setViews(sortedViews);
    sessionStorage.setItem(
      `navigationViews_${user.name}`,
      JSON.stringify(sortedViews)
    );
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
  };

  const handleUpdateNavSettings = (settings: UserNavigationSettings) => {
    setNavSettings(settings);
    sessionStorage.setItem(
      `navigationSettings_${user.name}`,
      JSON.stringify(settings)
    );
  };

  const handleAddView = (newView: View, viewGroupIds?: string[]) => {
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
    } else {
      const defaultGroup = viewGroups.find((vg) => vg.isDefault);
      if (defaultGroup) {
        const updatedViewGroups = viewGroups.map((vg) =>
          vg.id === defaultGroup.id
            ? { ...vg, viewIds: [...vg.viewIds, newView.id] }
            : vg
        );
        handleUpdateViewGroups(updatedViewGroups);
      }
    }
  };

  const handleAddViewGroup = (newViewGroup: ViewGroup) => {
    const updatedViewGroups = [...viewGroups, newViewGroup];
    handleUpdateViewGroups(updatedViewGroups);
  };

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

  const userNavSettingsArray = navSettings ? [navSettings] : [];

  // Create NavigationPanel content
  const createNavigationContent = useCallback(() => {
    return (
      <NavigationPanel
        user={user}
        views={views}
        viewGroups={viewGroups}
        userNavSettings={userNavSettingsArray}
        reports={getUserAccessibleReports()}
        widgets={getUserAccessibleWidgets()}
        onUpdateViews={handleUpdateViews}
        onUpdateViewGroups={handleUpdateViewGroups}
        onUpdateNavSettings={handleUpdateNavSettings}
      />
    );
  }, [user, views, viewGroups, userNavSettingsArray]);

  // RC-DOCK UPDATE using updateTab API
  useEffect(() => {
    if (dockLayoutRef.current) {
      const updated = dockLayoutRef.current.updateTab("navigation", {
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
                  <SettingsSmallIcon />
                </button>
              )}
            </div>
          </div>
        ),
        content: createNavigationContent(),
        closable: false,
      });

      if (!updated) {
        console.warn("Failed to update navigation tab");
      }
    }
  }, [views, viewGroups, navSettings, createNavigationContent, user.role]);

  const ThemeIcon = theme === "light" ? ThemeIconLight : ThemeIconDark;

  // Dock layout with proper theme class application
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
                        <SettingsSmallIcon />
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
                </div>
              ),
              content: (
                <div className="panel-content">
                  <div className="reports-list">
                    {getUserAccessibleReports().map((report) => (
                      <div key={report.id} className="content-item report-item">
                        <h4>{report.name}</h4>
                        <p>Type: {report.type}</p>
                        <a
                          href={report.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open Report
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ),
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
                </div>
              ),
              content: (
                <div className="panel-content">
                  <div className="widgets-list">
                    {getUserAccessibleWidgets().map((widget) => (
                      <div key={widget.id} className="content-item widget-item">
                        <h4>{widget.name}</h4>
                        <p>Type: {widget.type}</p>
                        <a
                          href={widget.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open Widget
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ),
              closable: false,
            },
          ],
          size: 380,
        },
      ],
    },
  };

  return (
    <div className={`dashboard-dock modern`} data-theme={theme}>
      <div
        className={`dock-container ${
          theme === "dark" ? "dock-layout-dark" : "dock-layout-light"
        }`}
      >
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
          onUpdateViews={handleUpdateViews}
          onUpdateViewGroups={handleUpdateViewGroups}
          onUpdateNavSettings={handleUpdateNavSettings}
          onAddView={handleAddView}
          onAddViewGroup={handleAddViewGroup}
          views={views}
          viewGroups={viewGroups}
          userNavSettings={navSettings ? [navSettings] : []}
        />
      )}
    </div>
  );
};

export default DashboardDock;
