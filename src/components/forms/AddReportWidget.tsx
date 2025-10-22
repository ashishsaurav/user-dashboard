import React, { useState } from "react";
import { reportsService } from "../../services/reportsService";
import { widgetsService } from "../../services/widgetsService";
import { useNotification } from "../common/NotificationProvider";

interface AddReportWidgetProps {
  onItemAdded?: () => void;
}

type FormType = "report" | "widget";

interface FormData {
  name: string;
  url: string;
  selectedRoles: string[];
}

const AddReportWidget: React.FC<AddReportWidgetProps> = ({ onItemAdded }) => {
  const [formType, setFormType] = useState<FormType>("report");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    url: "",
    selectedRoles: ["admin"], // Admin is always selected by default
  });
  const [loading, setLoading] = useState(false);

  const { showSuccess, showError } = useNotification();
  const availableRoles = ["admin", "user", "viewer"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      let createdId: string;

      if (formType === "report") {
        // Create the report
        const createdReport = await reportsService.createReport({
          reportName: formData.name,
          reportUrl: formData.url,
        });
        createdId = createdReport.id;

        // Assign to selected roles
        if (formData.selectedRoles.length > 0) {
          for (const role of formData.selectedRoles) {
            await reportsService.assignReportToRole(role, createdId);
          }
        }

        showSuccess(
          "Report Created Successfully!",
          `"${formData.name}" has been added and assigned to ${formData.selectedRoles.join(", ")}.`
        );
      } else {
        // Create the widget
        const createdWidget = await widgetsService.createWidget({
          widgetName: formData.name,
          widgetUrl: formData.url,
        });
        createdId = createdWidget.id;

        // Assign to selected roles
        if (formData.selectedRoles.length > 0) {
          for (const role of formData.selectedRoles) {
            await widgetsService.assignWidgetToRole(role, createdId);
          }
        }

        showSuccess(
          "Widget Created Successfully!",
          `"${formData.name}" has been added and assigned to ${formData.selectedRoles.join(", ")}.`
        );
      }

      // Reset form
      setFormData({ 
        name: "", 
        url: "",
        selectedRoles: ["admin"] // Reset to admin only
      });

      // Notify parent to refresh
      if (onItemAdded) {
        onItemAdded();
      }
    } catch (error: any) {
      console.error(`Failed to create ${formType}:`, error);
      const errorMessage = error?.data?.message || error?.message || "Please check your input and try again";
      showError(`Failed to create ${formType}`, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    if (role === "admin") return; // Admin cannot be unchecked

    setFormData({
      ...formData,
      selectedRoles: checked
        ? [...formData.selectedRoles, role]
        : formData.selectedRoles.filter((r) => r !== role),
    });
  };

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
        <p>Create a new {formType} in the system</p>
      </div>

      <div className="form-type-tabs">
        <button
          className={`tab-btn ${formType === "report" ? "active" : ""}`}
          onClick={() => {
            setFormType("report");
            // Reset form when switching types
            setFormData({ name: "", url: "", selectedRoles: ["admin"] });
          }}
          disabled={loading}
        >
          <ReportIcon />
          <span>Add Report</span>
        </button>
        <button
          className={`tab-btn ${formType === "widget" ? "active" : ""}`}
          onClick={() => {
            setFormType("widget");
            // Reset form when switching types
            setFormData({ name: "", url: "", selectedRoles: ["admin"] });
          }}
          disabled={loading}
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
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder={`Enter ${formType} name`}
                  required
                  disabled={loading}
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
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  placeholder={`https://example.com/${formType}`}
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Access Permissions</h3>

            <div className="permission-section">
              <label className="modern-label">Assign to User Roles</label>
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
                      checked={formData.selectedRoles.includes(role)}
                      onChange={(e) =>
                        handleRoleChange(role, e.target.checked)
                      }
                      disabled={role === "admin" || loading}
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
          disabled={loading}
        >
          {loading ? <span>...</span> : <AddIcon />}
        </button>
      </div>
    </div>
  );
};

export default AddReportWidget;
