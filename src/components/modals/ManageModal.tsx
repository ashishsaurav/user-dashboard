import React, { useState, useEffect } from "react";
import AllReportsWidgets from "../AllReportsWidgets";
import UserRolePermissions from "../UserRolePermissions";
import AddReportWidget from "../AddReportWidget";
import { testReports, testWidgets } from "../../data/testData";
import { Report, Widget } from "../../types";
import "./styles/ManageModal.css";

interface ManageModalProps {
  onClose: () => void;
}

type TabType = "all" | "permissions" | "add";

const ManageModal: React.FC<ManageModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  // Shared state for reports and widgets
  const [reports, setReports] = useState<Report[]>([]);
  const [widgets, setWidgets] = useState<Widget[]>([]);

  // Initialize data from sessionStorage or testData
  useEffect(() => {
    const savedReports = sessionStorage.getItem("reports");
    const savedWidgets = sessionStorage.getItem("widgets");

    if (savedReports && savedWidgets) {
      setReports(JSON.parse(savedReports));
      setWidgets(JSON.parse(savedWidgets));
    } else {
      setReports(testReports);
      setWidgets(testWidgets);
      sessionStorage.setItem("reports", JSON.stringify(testReports));
      sessionStorage.setItem("widgets", JSON.stringify(testWidgets));
    }
  }, []);

  // Save to sessionStorage whenever data changes
  useEffect(() => {
    if (reports.length > 0) {
      sessionStorage.setItem("reports", JSON.stringify(reports));
    }
  }, [reports]);

  useEffect(() => {
    if (widgets.length > 0) {
      sessionStorage.setItem("widgets", JSON.stringify(widgets));
    }
  }, [widgets]);

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
          {activeTab === "permissions" && (
            <UserRolePermissions
              reports={reports}
              widgets={widgets}
              onUpdateReports={setReports}
              onUpdateWidgets={setWidgets}
            />
          )}
          {activeTab === "add" && <AddReportWidget onAddItem={handleAddItem} />}
        </div>
      </div>
    </div>
  );
};

export default ManageModal;
