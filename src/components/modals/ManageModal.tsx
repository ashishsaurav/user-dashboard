import React, { useState } from "react";
import UserRolePermissionsApi from "../features/UserRolePermissions";
import AllReportsWidgetsApi from "../features/AllReportsWidgets";
import AddReportWidgetApi from "../forms/AddReportWidget";
import { User } from "../../types";
import "./styles/ManageModal.css";

interface ManageModalProps {
  onClose: () => void;
  user?: User;
  onRefreshData?: () => void;
}

type TabType = "all" | "permissions" | "add";

const ManageModal: React.FC<ManageModalProps> = ({
  onClose,
  user,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const handleDataRefresh = () => {
    if (onRefreshData) {
      onRefreshData();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Manage Reports & Widgets</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={activeTab === "all" ? "tab active" : "tab"}
            onClick={() => setActiveTab("all")}
          >
            All Reports & Widgets
          </button>
          <button
            className={activeTab === "permissions" ? "tab active" : "tab"}
            onClick={() => setActiveTab("permissions")}
          >
            User Role Permissions
          </button>
          <button
            className={activeTab === "add" ? "tab active" : "tab"}
            onClick={() => setActiveTab("add")}
          >
            Add Report & Widget
          </button>
        </div>

        <div className="modal-content">
          {activeTab === "all" && (
            <AllReportsWidgetsApi onRefreshData={handleDataRefresh} />
          )}
          {activeTab === "permissions" && user && (
            <UserRolePermissionsApi
              userRole={user.role}
              onRefreshData={handleDataRefresh}
            />
          )}
          {activeTab === "add" && (
            <AddReportWidgetApi onItemAdded={handleDataRefresh} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageModal;
