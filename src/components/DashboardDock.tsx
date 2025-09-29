import React, { useState } from "react";
import DockLayout, { LayoutData, PanelData, TabData } from "rc-dock";
import "rc-dock/dist/rc-dock.css";
import {
  User,
  View,
  ViewGroup,
  UserNavigationSettings,
  Report,
  Widget,
} from "../types";
import {
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

// Icons for buttons - properly sized
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

// Button icons - smaller for buttons
const NavigationButtonIcon = () => (
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
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
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

  // Navigation state with default data
  const [views, setViews] = useState<View[]>(() => {
    const savedViews = sessionStorage.getItem(`navigationViews_${user.name}`);
    if (savedViews) {
      return JSON.parse(savedViews);
    }

    // Get default views from test data
    const defaultData = getUserNavigationData(user.name);
    if (defaultData) {
      const defaultViews = defaultData.views;
      sessionStorage.setItem(
        `navigationViews_${user.name}`,
        JSON.stringify(defaultViews)
      );
      return defaultViews;
    }

    // Initialize new user with default structure
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

    // Get default view groups from test data
    const defaultData = getUserNavigationData(user.name);
    if (defaultData) {
      const defaultViewGroups = defaultData.viewGroups;
      sessionStorage.setItem(
        `navigationViewGroups_${user.name}`,
        JSON.stringify(defaultViewGroups)
      );
      return defaultViewGroups;
    }

    // Initialize new user with default structure
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

      // Get default navigation settings from test data
      const defaultData = getUserNavigationData(user.name);
      if (defaultData) {
        const defaultSettings = defaultData.navigationSettings;
        sessionStorage.setItem(
          `navigationSettings_${user.name}`,
          JSON.stringify(defaultSettings)
        );
        return defaultSettings;
      }

      // Initialize new user with default structure
      const newUserData = initializeUserNavigationData(user.name);
      sessionStorage.setItem(
        `navigationSettings_${user.name}`,
        JSON.stringify(newUserData.navigationSettings)
      );
      return newUserData.navigationSettings;
    }
  );

  // Navigation state management methods
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
    console.log("Adding new view:", newView.name, "to groups:", viewGroupIds);
    // Add the new view to views array
    const updatedViews = [...views, newView];
    handleUpdateViews(updatedViews);

    // Add view to selected view groups
    if (viewGroupIds && viewGroupIds.length > 0) {
      const updatedViewGroups = viewGroups.map((vg) => {
        if (viewGroupIds.includes(vg.id)) {
          return {
            ...vg,
            viewIds: [...vg.viewIds, newView.id],
          };
        }
        return vg;
      });
      handleUpdateViewGroups(updatedViewGroups);
    } else {
      // If no viewGroupIds specified, add to default group
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
    console.log("Adding new view group:", newViewGroup.name);
    const updatedViewGroups = [...viewGroups, newViewGroup];
    handleUpdateViewGroups(updatedViewGroups);
  };

  const ThemeIcon = () =>
    theme === "light" ? <ThemeIconLight /> : <ThemeIconDark />;

  // Get user's accessible reports and widgets
  const getUserAccessibleReports = (): Report[] => {
    const savedReports = sessionStorage.getItem("reports");
    const systemReports: Report[] = savedReports
      ? JSON.parse(savedReports)
      : [];
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
      : [];
    return user.role === "admin"
      ? systemWidgets
      : systemWidgets.filter((widget: Widget) =>
          widget.userRoles.includes(user.role)
        );
  };

  // Already defined in the state management methods above

  // Convert navSettings to array format for compatibility
  const userNavSettingsArray = navSettings ? [navSettings] : [];

  // Navigation Panel Component
  interface NavigationPanelProps {
    user: User;
    views: View[];
    viewGroups: ViewGroup[];
    userNavSettings: UserNavigationSettings[];
    reports: Report[];
    widgets: Widget[];
    onUpdateViews: (updatedViews: View[]) => void;
    onUpdateViewGroups: (updatedViewGroups: ViewGroup[]) => void;
    onUpdateNavSettings: (settings: UserNavigationSettings[]) => void;
    onAddView: (newView: View, viewGroupIds?: string[]) => void;
    onAddViewGroup: (newViewGroup: ViewGroup) => void;
  }

  const ReportsPanel = () => <div className="reports-panel"></div>;
  const WidgetsPanel = () => <div className="widgets-panel"></div>;

  const layout: LayoutData = {
    dockbox: {
      mode: "horizontal",
      children: [
        {
          tabs: [
            {
              id: "navigation",
              title: (
                <div className="dock-tab-simple navigation-tab">
                  <div className="tab-title-section">
                    <NavigationIcon />
                    <span>Navigation</span>
                  </div>
                  <div className="tab-controls">
                    <button
                      className="tab-btn primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowNavigationModal(true);
                      }}
                      title="Manage Navigation"
                    >
                      <NavigationButtonIcon />
                    </button>
                    {user.role === "admin" && (
                      <button
                        className="tab-btn secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowManageModal(true);
                        }}
                        title="Manage Reports & Widgets"
                      >
                        <SettingsIcon />
                      </button>
                    )}
                  </div>
                </div>
              ),
              content: (
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
              ),
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
                <div className="dock-tab-simple">
                  <div className="tab-title-section">
                    <ReportsIcon />
                    <span>Reports</span>
                  </div>
                </div>
              ),
              content: <ReportsPanel />,
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
                <div className="dock-tab-simple">
                  <div className="tab-title-section">
                    <WidgetsIcon />
                    <span>Widgets</span>
                  </div>
                </div>
              ),
              content: <WidgetsPanel />,
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
          defaultLayout={layout}
          style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }}
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
