import React, { useState, useEffect } from "react";
import {
  User,
  View,
  ViewGroup,
  UserNavigationSettings,
  Report,
  Widget,
  UserNavigationData,
} from "../../types";
import AllViewGroupsViewsApi from "../features/AllViewGroupsViews";
import CreateViewGroup from "../forms/CreateViewGroup";
import CreateView from "../forms/CreateView";
import "./styles/NavigationManageModal.css";

interface NavigationManageModalProps {
  user: User;
  onClose: () => void;
  onUpdateViews: (updatedViews: View[]) => void;
  onUpdateViewGroups: (updatedViewGroups: ViewGroup[]) => void;
  onUpdateNavSettings: (settings: UserNavigationSettings) => void;
  onAddView: (newView: View, viewGroupIds?: string[]) => Promise<void>;
  onAddViewGroup: (newViewGroup: ViewGroup) => Promise<void>;
  onRefreshData?: () => Promise<void>;
  views: View[];
  viewGroups: ViewGroup[];
  userNavSettings: UserNavigationSettings[];
  reports: Report[]; // ✅ From API
  widgets: Widget[]; // ✅ From API
}

type NavTabType = "all" | "createGroup" | "createView";

const NavigationManageModal: React.FC<NavigationManageModalProps> = ({
  user,
  onClose,
  onUpdateViews,
  onUpdateViewGroups,
  onUpdateNavSettings,
  onAddView,
  onAddViewGroup,
  onRefreshData,
  views,
  viewGroups,
  userNavSettings,
  reports, // ✅ From API
  widgets, // ✅ From API
}) => {
  const [activeTab, setActiveTab] = useState<NavTabType>("all");

  // ✅ Use reports and widgets from API (already filtered by role)
  const getUserAccessibleReports = () => reports;
  const getUserAccessibleWidgets = () => widgets;

  // Close icon
  const CloseIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Manage Navigation</h2>
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={activeTab === "all" ? "tab active" : "tab"}
            onClick={() => setActiveTab("all")}
          >
            All View Groups & Views
          </button>
          <button
            className={activeTab === "createGroup" ? "tab active" : "tab"}
            onClick={() => setActiveTab("createGroup")}
          >
            Create View Group
          </button>
          <button
            className={activeTab === "createView" ? "tab active" : "tab"}
            onClick={() => setActiveTab("createView")}
          >
            Create View
          </button>
        </div>

        <div className="modal-content">
          {activeTab === "all" && (
            <AllViewGroupsViewsApi
              user={user}
              views={views}
              viewGroups={viewGroups}
              reports={getUserAccessibleReports()}
              widgets={getUserAccessibleWidgets()}
              onRefresh={async () => {
                // Trigger parent refresh
                if (onRefreshData) {
                  await onRefreshData();
                }
              }}
            />
          )}
          {activeTab === "createGroup" && (
            <CreateViewGroup
              user={user}
              views={views}
              userNavSettings={userNavSettings}
              onAddViewGroup={async (newViewGroup) => {
                await onAddViewGroup(newViewGroup);
                setActiveTab("all");
              }}
              onUpdateNavSettings={(updatedSettings) => {
                onUpdateNavSettings(updatedSettings);
                console.log(
                  "CreateViewGroup - Navigation settings updated:",
                  updatedSettings
                );
              }}
            />
          )}
          {activeTab === "createView" && (
            <CreateView
              user={user}
              reports={getUserAccessibleReports()}
              widgets={getUserAccessibleWidgets()}
              viewGroups={viewGroups}
              onAddView={async (newView, viewGroupIds) => {
                await onAddView(newView, viewGroupIds);
                setActiveTab("all");
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NavigationManageModal;
