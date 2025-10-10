import React, { useState } from "react";
import { User, View, Report, Widget, ViewFormData, ViewGroup } from "../../types";
import { useNotification } from "../common/NotificationProvider";

interface CreateViewProps {
  user: User;
  reports: Report[];
  widgets: Widget[];
  viewGroups: ViewGroup[];
  onAddView: (view: View, viewGroupIds?: string[]) => void; // Changed signature
}

const CreateView: React.FC<CreateViewProps> = ({
  user,
  reports,
  widgets,
  viewGroups,
  onAddView,
}) => {
  // Find default view group
  const defaultViewGroup = viewGroups.find((vg) => vg.isDefault);

  const [formData, setFormData] = useState<
    ViewFormData & { viewGroupIds: string[] }
  >({
    name: "",
    reportIds: [],
    widgetIds: [],
    viewGroupIds: defaultViewGroup ? [defaultViewGroup.id] : [],
  });

  const { showSuccess } = useNotification();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 5);
    const autoId = `${user.name}-view-${timestamp}-${randomSuffix}`;

    const newView: View = {
      id: autoId,
      name: formData.name,
      reportIds: formData.reportIds,
      widgetIds: formData.widgetIds,
      isVisible: true,
      order: Date.now(),
      createdBy: user.name,
    };

    // Pass viewGroupIds separately
    onAddView(newView, formData.viewGroupIds);

    console.log(
      "Creating new view:",
      newView,
      "for groups:",
      formData.viewGroupIds
    );

    const selectedGroupNames = formData.viewGroupIds
      .map((id) => viewGroups.find((vg) => vg.id === id)?.name)
      .filter(Boolean)
      .join(", ");

    showSuccess(
      "View Created Successfully!",
      `"${formData.name}" has been created and added to: ${selectedGroupNames}`
    );

    // Reset form
    setFormData({
      name: "",
      reportIds: [],
      widgetIds: [],
      viewGroupIds: defaultViewGroup ? [defaultViewGroup.id] : [],
    });
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

  const handleViewGroupToggle = (viewGroupId: string) => {
    const isSelected = formData.viewGroupIds.includes(viewGroupId);
    const defaultGroup = viewGroups.find((vg) => vg.isDefault);

    if (isSelected) {
      // If removing and it's the only selected group, keep default selected
      const newSelection = formData.viewGroupIds.filter(
        (id) => id !== viewGroupId
      );
      if (newSelection.length === 0 && defaultGroup) {
        setFormData({
          ...formData,
          viewGroupIds: [defaultGroup.id],
        });
      } else {
        setFormData({
          ...formData,
          viewGroupIds: newSelection,
        });
      }
    } else {
      setFormData({
        ...formData,
        viewGroupIds: [...formData.viewGroupIds, viewGroupId],
      });
    }
  };

  const CreateIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );

  const ViewGroupIcon = () => (
    <svg
      width="16"
      height="16"
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

  const CheckIcon = () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="20,6 9,17 4,12" />
    </svg>
  );

  return (
    <div className="create-form-container">
      <div className="create-form-header">
        <h2>Create View</h2>
        <p>Combine reports and widgets into a custom view</p>
      </div>

      <div className="create-form-wrapper">
        <form onSubmit={handleSubmit} className="create-form">
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
            <h3 className="section-title">View Groups Selection</h3>
            <p className="section-description">
              Select one or more view groups where this view will be available.
              {viewGroups.find((vg) => vg.isDefault) &&
                " Default group will be selected if none chosen."}
            </p>

            <div className="view-groups-selection">
              {viewGroups.map((viewGroup) => {
                const isSelected = formData.viewGroupIds.includes(viewGroup.id);
                const isDefault = viewGroup.isDefault;

                return (
                  <button
                    key={viewGroup.id}
                    type="button"
                    className={`view-group-btn ${
                      isSelected ? "selected" : ""
                    } ${isDefault ? "default" : ""}`}
                    onClick={() => handleViewGroupToggle(viewGroup.id)}
                  >
                    <div className="view-group-btn-icon">
                      <ViewGroupIcon />
                    </div>
                    <div className="view-group-btn-content">
                      <span className="view-group-btn-name">
                        {viewGroup.name}
                        {isDefault && (
                          <span className="small-badge">Default</span>
                        )}
                      </span>
                      <span className="view-group-btn-views">
                        {viewGroup.viewIds.length} views
                      </span>
                    </div>
                    {isSelected && (
                      <div className="view-group-btn-check">
                        <CheckIcon />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="selection-summary">
              <p>
                Selected: <strong>{formData.viewGroupIds.length}</strong> view
                group{formData.viewGroupIds.length !== 1 ? "s" : ""}
                {formData.viewGroupIds.length > 0 && (
                  <span className="selected-groups">
                    {" - "}
                    {formData.viewGroupIds
                      .map((id) => viewGroups.find((vg) => vg.id === id)?.name)
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Reports</h3>
            <div className="selection-grid">
              {reports.length > 0 ? (
                reports.map((report) => (
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
                ))
              ) : (
                <div className="no-items">
                  <p>No reports available for your role.</p>
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Widgets</h3>
            <div className="selection-grid">
              {widgets.length > 0 ? (
                widgets.map((widget) => (
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
                ))
              ) : (
                <div className="no-items">
                  <p>No widgets available for your role.</p>
                </div>
              )}
            </div>
          </div>
        </form>

        <button
          type="submit"
          onClick={handleSubmit}
          className="floating-create-btn"
          title="Create View"
          disabled={!formData.name.trim() || formData.viewGroupIds.length === 0}
        >
          <CreateIcon />
        </button>
      </div>
    </div>
  );
};

export default CreateView;
