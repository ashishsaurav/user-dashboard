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
}

const AddReportWidget: React.FC<AddReportWidgetProps> = ({ onItemAdded }) => {
  const [formType, setFormType] = useState<FormType>("report");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    url: "",
  });
  const [loading, setLoading] = useState(false);

  const { showSuccess, showError } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      if (formType === "report") {
        await reportsService.createReport({
          reportName: formData.name,
          reportUrl: formData.url,
        });
        showSuccess(
          "Report Created Successfully!",
          `"${formData.name}" has been added and is now available.`
        );
      } else {
        await widgetsService.createWidget({
          widgetName: formData.name,
          widgetUrl: formData.url,
        });
        showSuccess(
          "Widget Created Successfully!",
          `"${formData.name}" has been added and is now available.`
        );
      }

      // Reset form
      setFormData({ name: "", url: "" });

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
          onClick={() => setFormType("report")}
          disabled={loading}
        >
          <ReportIcon />
          <span>Add Report</span>
        </button>
        <button
          className={`tab-btn ${formType === "widget" ? "active" : ""}`}
          onClick={() => setFormType("widget")}
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
            <div
              style={{
                padding: "16px",
                backgroundColor: "var(--bg-secondary)",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
              }}
            >
              <h4
                style={{
                  marginBottom: "8px",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                }}
              >
                📝 Note about Permissions
              </h4>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: "13px",
                  lineHeight: "1.6",
                }}
              >
                After creating the {formType}, use the "User Role Permissions"
                tab to assign it to specific roles (admin, user, viewer). By
                default, new items are not assigned to any role.
              </p>
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
