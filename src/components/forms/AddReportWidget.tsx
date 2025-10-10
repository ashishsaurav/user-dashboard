import React, { useState } from "react";
import { ReportFormData, WidgetFormData, Report, Widget } from "../types";
import { useNotification } from "./NotificationProvider";

interface AddReportWidgetProps {
  onAddItem: (item: Report | Widget) => void;
}

type FormType = "report" | "widget";

const AddReportWidget: React.FC<AddReportWidgetProps> = ({ onAddItem }) => {
  const [formType, setFormType] = useState<FormType>("report");
  const [reportForm, setReportForm] = useState<ReportFormData>({
    name: "",
    url: "",
    userRoles: ["admin"],
  });
  const [widgetForm, setWidgetForm] = useState<WidgetFormData>({
    name: "",
    url: "",
    userRoles: ["admin"],
  });

  const { showSuccess } = useNotification();
  const availableRoles = ["admin", "user", "viewer"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = formType === "report" ? reportForm : widgetForm;

    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 5);
    const autoId = `${formType}-${timestamp}-${randomSuffix}`;

    const newItem = {
      id: autoId,
      ...formData,
      type: formType === "report" ? ("Report" as const) : ("Widget" as const),
    };

    onAddItem(newItem);

    console.log(`Adding new ${formType}:`, newItem);

    // Show beautiful success notification
    showSuccess(
      `${formType === "report" ? "Report" : "Widget"} Created Successfully!`,
      `"${formData.name}" has been added and is now available to assigned users.`
    );

    // Reset form with admin pre-selected
    if (formType === "report") {
      setReportForm({ name: "", url: "", userRoles: ["admin"] });
    } else {
      setWidgetForm({ name: "", url: "", userRoles: ["admin"] });
    }
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    if (role === "admin") return;

    if (formType === "report") {
      setReportForm({
        ...reportForm,
        userRoles: checked
          ? [...reportForm.userRoles, role]
          : reportForm.userRoles.filter((r) => r !== role),
      });
    } else {
      setWidgetForm({
        ...widgetForm,
        userRoles: checked
          ? [...widgetForm.userRoles, role]
          : widgetForm.userRoles.filter((r) => r !== role),
      });
    }
  };

  const currentForm = formType === "report" ? reportForm : widgetForm;
  const setCurrentForm = formType === "report" ? setReportForm : setWidgetForm;

  const ReportIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
    </svg>
  );

  const WidgetIcon = () => (
    <svg
      width="20"
      height="20"
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

  const AddIcon = () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );

  return (
    <div className="modern-add-container">
      <div className="add-header">
        <h2>Add New {formType === "report" ? "Report" : "Widget"}</h2>
        <p>Create and configure access permissions</p>
      </div>

      <div className="form-type-tabs">
        <button
          className={`tab-btn ${formType === "report" ? "active" : ""}`}
          onClick={() => setFormType("report")}
        >
          <ReportIcon />
          <span>Add Report</span>
        </button>
        <button
          className={`tab-btn ${formType === "widget" ? "active" : ""}`}
          onClick={() => setFormType("widget")}
        >
          <WidgetIcon />
          <span>Add Widget</span>
        </button>
      </div>

      <div className="add-form-wrapper">
        <form onSubmit={handleSubmit} className="modern-add-form">
          <div className="form-section">
            <h3 className="section-title">
              {formType === "report" ? "Report" : "Widget"} Information
            </h3>

            <div className="form-row">
              <div className="input-group">
                <label className="modern-label">
                  {formType === "report" ? "Report" : "Widget"} Name
                </label>
                <input
                  type="text"
                  className="modern-input"
                  value={currentForm.name}
                  onChange={(e) =>
                    setCurrentForm({ ...currentForm, name: e.target.value })
                  }
                  placeholder={`Enter ${formType} name`}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="modern-label">
                  {formType === "report" ? "Report" : "Widget"} URL
                </label>
                <input
                  type="url"
                  className="modern-input"
                  value={currentForm.url}
                  onChange={(e) =>
                    setCurrentForm({ ...currentForm, url: e.target.value })
                  }
                  placeholder={`https://example.com/${formType}`}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Access Permissions</h3>

            <div className="permission-section">
              <label className="modern-label">User Roles</label>
              <p className="admin-notice">
                Admin role is automatically selected and cannot be changed
              </p>
              <div className="checkbox-grid">
                {availableRoles.map((role) => (
                  <label
                    key={role}
                    className={`modern-checkbox ${
                      role === "admin" ? "admin-locked disabled" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={currentForm.userRoles.includes(role)}
                      onChange={(e) => handleRoleChange(role, e.target.checked)}
                      disabled={role === "admin"}
                    />
                    <span className="checkmark"></span>
                    <span className="checkbox-label">
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                      {role === "admin" && (
                        <span className="locked-indicator">🔒</span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </form>

        <button
          type="submit"
          onClick={handleSubmit}
          className="floating-add-btn"
          title={`Add ${formType === "report" ? "Report" : "Widget"}`}
        >
          <AddIcon />
        </button>
      </div>
    </div>
  );
};

export default AddReportWidget;
