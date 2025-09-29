import React, { useState } from "react";
import { View, Report, Widget } from "../types";

interface EditViewModalProps {
  view: View;
  reports: Report[];
  widgets: Widget[];
  userRole: string;
  onSave: (view: View) => void;
  onClose: () => void;
}

const EditViewModal: React.FC<EditViewModalProps> = ({
  view,
  reports,
  widgets,
  userRole,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<View>({
    ...view,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleReportToggle = (reportId: string, checked: boolean) => {
    setFormData({
      ...formData,
      reportIds: checked
        ? [...formData.reportIds, reportId]
        : formData.reportIds.filter((id) => id !== reportId),
    });
  };

  const handleWidgetToggle = (widgetId: string, checked: boolean) => {
    setFormData({
      ...formData,
      widgetIds: checked
        ? [...formData.widgetIds, widgetId]
        : formData.widgetIds.filter((id) => id !== widgetId),
    });
  };

  const CloseIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  const ViewIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  return (
    <div className="modern-modal-overlay">
      <div className="modern-modal">
        <div className="modern-modal-header">
          <div className="header-left">
            <div className="header-icon-container">
              <ViewIcon />
            </div>
            <div>
              <h2>Edit View</h2>
              <p>Modify view details and content</p>
            </div>
          </div>
          <button className="modern-close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modern-modal-content">
          <form onSubmit={handleSubmit} className="modern-form">
            <div className="form-section">
              <h3 className="section-title">View Information</h3>

              <div className="form-row">
                <div className="input-group">
                  <label className="modern-label">View Name</label>
                  <input
                    type="text"
                    className="modern-input"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter view name"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Reports</h3>
              <div className="items-selection-grid">
                {reports.map((report) => (
                  <label key={report.id} className="modern-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.reportIds.includes(report.id)}
                      onChange={(e) =>
                        handleReportToggle(report.id, e.target.checked)
                      }
                    />
                    <span className="checkmark"></span>
                    <span className="checkbox-label">{report.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Widgets</h3>
              <div className="items-selection-grid">
                {widgets.map((widget) => (
                  <label key={widget.id} className="modern-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.widgetIds.includes(widget.id)}
                      onChange={(e) =>
                        handleWidgetToggle(widget.id, e.target.checked)
                      }
                    />
                    <span className="checkmark"></span>
                    <span className="checkbox-label">{widget.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="modern-form-actions-fixed">
              <button
                type="button"
                className="modern-btn secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="modern-btn primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditViewModal;
