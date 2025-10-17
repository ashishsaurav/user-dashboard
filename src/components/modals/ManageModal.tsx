import React, { useState, useEffect } from "react";
import AllReportsWidgets from "../features/AllReportsWidgets";
import UserRolePermissions from "../features/UserRolePermissions";
import AddReportWidget from "../forms/AddReportWidget";
import LayoutResetButton from "../dashboard/LayoutResetButton";
import { testReports, testWidgets } from "../../data/testData";
import { Report, Widget, User } from "../../types";
import { layoutPersistenceService } from "../../services/layoutPersistenceService";
import "./styles/ManageModal.css";

interface ManageModalProps {
  onClose: () => void;
  user?: User;
  reports?: Report[];  // ✅ From API
  widgets?: Widget[];  // ✅ From API
}

type TabType = "all" | "permissions" | "add" | "layout";

const ManageModal: React.FC<ManageModalProps> = ({ 
  onClose, 
  user, 
  reports: apiReports = [], 
  widgets: apiWidgets = [] 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  // ✅ Use reports and widgets from API (fallback to testData only if not provided)
  const [reports, setReports] = useState<Report[]>(apiReports.length > 0 ? apiReports : testReports);
  const [widgets, setWidgets] = useState<Widget[]>(apiWidgets.length > 0 ? apiWidgets : testWidgets);

  // Update local state when API data changes
  useEffect(() => {
    if (apiReports.length > 0) {
      setReports(apiReports);
    }
  }, [apiReports]);

  useEffect(() => {
    if (apiWidgets.length > 0) {
      setWidgets(apiWidgets);
    }
  }, [apiWidgets]);

  // Add new item (from Add tab)
  const handleAddItem = (newItem: Report | Widget) => {
    if (newItem.type === "Report") {
      setReports((prev) => [...prev, newItem as Report]);
    } else {
      setWidgets((prev) => [...prev, newItem as Widget]);
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
          {user && (
            <button
              className={activeTab === "layout" ? "tab active" : "tab"}
              onClick={() => setActiveTab("layout")}
            >
              Layout Settings
            </button>
          )}
        </div>

        <div className="modal-content">
          {activeTab === "all" && (
            <AllReportsWidgets
              reports={reports}
              widgets={widgets}
              onUpdateReports={setReports}
              onUpdateWidgets={setWidgets}
            />
          )}
          {activeTab === "permissions" && user && (
            <UserRolePermissions
              reports={reports}
              widgets={widgets}
              onUpdateReports={setReports}
              onUpdateWidgets={setWidgets}
            />
          )}
          {/* To use the new API-connected version, replace above with:
          {activeTab === "permissions" && user && (
            <UserRolePermissionsApi
              userRole={user.role}
              onRefreshData={onClose}
            />
          )}
          */}
          {activeTab === "add" && <AddReportWidget onAddItem={handleAddItem} />}
          {activeTab === "layout" && user && (
            <div style={{ padding: "20px" }}>
              <h3 style={{ marginBottom: "16px", color: "var(--text-primary)" }}>
                Layout Customization Settings
              </h3>
              <p style={{ marginBottom: "24px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                Your layout customizations (panel sizes, positions) are saved automatically
                for each layout configuration. You can reset all customizations to start fresh.
              </p>

              <div style={{ 
                padding: "16px", 
                backgroundColor: "var(--bg-secondary)", 
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                marginBottom: "20px"
              }}>
                <h4 style={{ marginBottom: "12px", color: "var(--text-primary)", fontSize: "14px" }}>
                  📊 Saved Layout Configurations
                </h4>
                {(() => {
                  const signatures = layoutPersistenceService.getSavedSignatures(user.name);
                  if (signatures.length === 0) {
                    return (
                      <p style={{ color: "var(--text-secondary)", fontSize: "13px", margin: 0 }}>
                        No custom layouts saved yet. Resize or rearrange panels to create customizations.
                      </p>
                    );
                  }
                  return (
                    <ul style={{ 
                      margin: 0, 
                      paddingLeft: "20px",
                      color: "var(--text-secondary)",
                      fontSize: "13px"
                    }}>
                      {signatures.map((sig) => (
                        <li key={sig} style={{ marginBottom: "4px" }}>
                          {sig}
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>

              <div style={{
                padding: "16px",
                backgroundColor: "var(--warning-light)",
                border: "1px solid var(--warning-border)",
                borderRadius: "8px",
                marginBottom: "20px"
              }}>
                <h4 style={{ marginBottom: "8px", color: "var(--text-primary)", fontSize: "14px" }}>
                  ⚠️ Reset All Layouts
                </h4>
                <p style={{ marginBottom: "12px", color: "var(--text-secondary)", fontSize: "13px" }}>
                  This will clear all your saved layout customizations and reset everything to default.
                  This action cannot be undone.
                </p>
                <LayoutResetButton 
                  user={user} 
                  onReset={() => {
                    onClose();
                    window.location.reload();
                  }}
                />
              </div>

              <div style={{
                padding: "16px",
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px"
              }}>
                <h4 style={{ marginBottom: "8px", color: "var(--text-primary)", fontSize: "14px" }}>
                  💡 How Layout Persistence Works
                </h4>
                <ul style={{ 
                  margin: 0, 
                  paddingLeft: "20px",
                  color: "var(--text-secondary)",
                  fontSize: "13px",
                  lineHeight: "1.8"
                }}>
                  <li>Panel sizes and positions are saved automatically when you make changes</li>
                  <li>Each layout configuration (different views, panel combinations) has its own customizations</li>
                  <li>When the layout structure changes (e.g., switching views), it resets to default</li>
                  <li>Your customizations are restored when you return to a previously customized layout</li>
                  <li>All settings are stored per user and persist across browser sessions</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageModal;
