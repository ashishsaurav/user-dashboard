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
// No longer needed - using API data passed as props
import AllViewGroupsViews from "../features/AllViewGroupsViews";
import CreateViewGroup from "../forms/CreateViewGroup";
import CreateView from "../forms/CreateView";
import "./styles/NavigationManageModal.css";

interface NavigationManageModalProps {
  user: User;
  onClose: () => void;
  onUpdateViews: (updatedViews: View[]) => void;
  onUpdateViewGroups: (updatedViewGroups: ViewGroup[]) => void;
  onUpdateNavSettings: (settings: UserNavigationSettings) => void;
  onAddView: (newView: View, viewGroupIds?: string[]) => void;
  onAddViewGroup: (newViewGroup: ViewGroup) => void;
  views: View[];
  viewGroups: ViewGroup[];
  userNavSettings: UserNavigationSettings[];
  reports: Report[];  // ✅ From API
  widgets: Widget[];  // ✅ From API
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
  views,
  viewGroups,
  userNavSettings,
  reports,  // ✅ From API
  widgets,  // ✅ From API
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
            <AllViewGroupsViews
              user={user}
              views={views}
              viewGroups={viewGroups}
              userNavSettings={userNavSettings}
              reports={getUserAccessibleReports()}
              widgets={getUserAccessibleWidgets()}
              onUpdateViews={onUpdateViews}
              onUpdateViewGroups={onUpdateViewGroups}
              onUpdateNavSettings={(settingsArr) => {
                if (Array.isArray(settingsArr) && settingsArr.length > 0) {
                  onUpdateNavSettings(settingsArr[0]);
                }
              }}
            />
          )}
          {activeTab === "createGroup" && (
            <CreateViewGroup
              user={user}
              views={views}
              userNavSettings={userNavSettings}
              onAddViewGroup={(newViewGroup) => {
                onAddViewGroup(newViewGroup);
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
              onAddView={onAddView}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NavigationManageModal;
