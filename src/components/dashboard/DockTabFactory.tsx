import React from "react";
import { View } from "../../types";

// Icon Components
const NavigationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

const ReportsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
  </svg>
);

const WidgetsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const DashboardIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="7" height="9" />
    <rect x="14" y="3" width="7" height="5" />
    <rect x="14" y="12" width="7" height="9" />
    <rect x="3" y="16" width="7" height="5" />
  </svg>
);

const ManageNavigationIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const HamburgerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const LayoutHorizontalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="18" />
    <rect x="14" y="3" width="7" height="18" />
  </svg>
);

const LayoutVerticalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="7" />
    <rect x="3" y="14" width="18" height="7" />
  </svg>
);

interface DockTabActions {
  onToggleCollapse: () => void;
  onNavigationManage: () => void;
  onSystemSettings: () => void;
  onReopenReports: () => void;
  onReopenWidgets: () => void;
  onAddReport: () => void;
  onAddWidget: () => void;
  onCloseReports: () => void;
  onCloseWidgets: () => void;
  onToggleLayout: () => void; // NEW: Toggle between horizontal and vertical layouts
}

export class DockTabFactory {
  static createNavigationTab(
    actions: DockTabActions,
    selectedView: View | null,
    reportsVisible: boolean,
    widgetsVisible: boolean,
    isAdmin: boolean,
    content: React.ReactNode,
    isCollapsed: boolean = false,
    layoutMode?: 'horizontal' | 'vertical'
  ) {
    return {
      id: "navigation",
      title: (
        <div className="dock-tab-header navigation-tab-header dock-collapsible-header">
          <div className="tab-title"></div>
          <div className="tab-actions">
            {/* Collapse/Expand Toggle - Always visible */}
            <button
              className="tab-action-btn collapse-toggle-btn"
              onClick={(e) => {
                e.stopPropagation();
                actions.onToggleCollapse();
              }}
              title={isCollapsed ? "Expand navigation" : "Collapse navigation"}
            >
              <HamburgerIcon />
            </button>
            
            {/* Quick Action Buttons - Always show */}
            {selectedView && !reportsVisible && (
              <button
                className="tab-action-btn show-section-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  actions.onReopenReports();
                }}
                title="Show Reports"
              >
                <ReportsIcon />
              </button>
            )}
            {selectedView && !widgetsVisible && (
              <button
                className="tab-action-btn show-section-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  actions.onReopenWidgets();
                }}
                title="Show Widgets"
              >
                <WidgetsIcon />
              </button>
            )}
            
            {/* Management Buttons - Always show */}
            <button
              className="tab-action-btn manage-btn"
              onClick={(e) => {
                e.stopPropagation();
                actions.onNavigationManage();
              }}
              title="Manage Navigation"
            >
              <ManageNavigationIcon />
            </button>
            {isAdmin && (
              <button
                className="tab-action-btn settings-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  actions.onSystemSettings();
                }}
                title="System Settings"
              >
                <SettingsIcon />
              </button>
            )}
          </div>
        </div>
      ),
      content,
      closable: false,
    };
  }

  static createReportsTab(actions: DockTabActions, content: React.ReactNode) {
    return {
      id: "reports",
      title: (
        <div className="dock-tab-header reports-tab-header">
          <div className="tab-title">
            <ReportsIcon />
            <span>Reports</span>
          </div>
          <div className="tab-actions">
            <button
              className="tab-action-btn add-btn"
              onClick={(e) => {
                e.stopPropagation();
                actions.onAddReport();
              }}
              title="Add Report"
            >
              <PlusIcon />
            </button>
            <button
              className="tab-action-btn close-btn"
              onClick={(e) => {
                e.stopPropagation();
                actions.onCloseReports();
              }}
              title="Close Reports"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      ),
      content,
      closable: false,
    };
  }

  static createWidgetsTab(actions: DockTabActions, content: React.ReactNode) {
    return {
      id: "widgets",
      title: (
        <div className="dock-tab-header widgets-tab-header">
          <div className="tab-title">
            <WidgetsIcon />
            <span>Widgets</span>
          </div>
          <div className="tab-actions">
            <button
              className="tab-action-btn add-btn"
              onClick={(e) => {
                e.stopPropagation();
                actions.onAddWidget();
              }}
              title="Add Widget"
            >
              <PlusIcon />
            </button>
            <button
              className="tab-action-btn close-btn"
              onClick={(e) => {
                e.stopPropagation();
                actions.onCloseWidgets();
              }}
              title="Close Widgets"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      ),
      content,
      closable: false,
    };
  }

  static createWelcomeTab(content: React.ReactNode, viewName?: string) {
    const id = viewName ? "welcome-sections-closed" : "welcome";
    const title = viewName ? `View: ${viewName}` : "Dashboard";

    return {
      id,
      title: (
        <div className="dock-tab-header welcome-tab-header">
          <div className="tab-title">
            <DashboardIcon />
            <span>{title}</span>
          </div>
        </div>
      ),
      content,
      closable: false,
    };
  }
}