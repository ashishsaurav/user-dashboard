import React, { useState } from "react";
import { View, Report, Widget } from "../types";
import "./ViewContentPanel.css";

interface ViewContentPanelProps {
  type: "reports" | "widgets";
  selectedView: View | null;
  reports: Report[];
  widgets: Widget[];
  onRemoveReport: (reportId: string) => void;
  onRemoveWidget: (widgetId: string) => void;
}

const ViewContentPanel: React.FC<ViewContentPanelProps> = ({
  type,
  selectedView,
  reports,
  widgets,
  onRemoveReport,
  onRemoveWidget,
}) => {
  const [activeReportTab, setActiveReportTab] = useState<string | null>(null);

  // If no view is selected, show welcome message
  if (!selectedView) {
    return (
      <div className="content-welcome">
        <div className="welcome-message">
          <div className="welcome-icon">
            {type === "reports" ? <ReportsIcon /> : <WidgetsIcon />}
          </div>
          <h3>No View Selected</h3>
          <p>
            Select a view from the Navigation panel to see its{" "}
            {type === "reports" ? "reports" : "widgets"}.
          </p>
        </div>
      </div>
    );
  }

  const getViewReports = () => {
    return selectedView.reportIds
      .map((id) => reports.find((r) => r.id === id))
      .filter(Boolean) as Report[];
  };

  const getViewWidgets = () => {
    return selectedView.widgetIds
      .map((id) => widgets.find((w) => w.id === id))
      .filter(Boolean) as Widget[];
  };

  const viewReports = getViewReports();
  const viewWidgets = getViewWidgets();

  // Set first report as active tab if none selected
  if (type === "reports" && viewReports.length > 0 && !activeReportTab) {
    setActiveReportTab(viewReports[0].id);
  }

  // Reports Section - Grid Table Layout
  if (type === "reports") {
    if (viewReports.length === 0) {
      return (
        <div className="content-empty">
          <div className="empty-state">
            <ReportsIcon />
            <h3>No Reports in "{selectedView.name}"</h3>
            <p>Add reports to this view to see them here.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="content-panel reports-panel">
        {/* Removed content-header */}

        <div className="reports-tabs">
          <div className="tab-nav">
            {viewReports.map((report) => (
              <div
                key={report.id}
                className={`tab-item ${
                  activeReportTab === report.id ? "active" : ""
                }`}
                onClick={() => setActiveReportTab(report.id)}
              >
                <span className="tab-title">{report.name}</span>
                <button
                  className="tab-close-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveReport(report.id);
                    if (
                      activeReportTab === report.id &&
                      viewReports.length > 1
                    ) {
                      const remainingReports = viewReports.filter(
                        (r) => r.id !== report.id
                      );
                      setActiveReportTab(remainingReports[0]?.id || null);
                    }
                  }}
                  title="Remove from view"
                >
                  <CloseIcon />
                </button>
              </div>
            ))}
          </div>

          <div className="tab-content">
            {activeReportTab && (
              <div className="reports-table-container">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Report Item</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Last Updated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 8 }, (_, i) => {
                      const activeReport = viewReports.find(
                        (r) => r.id === activeReportTab
                      );
                      return (
                        <tr key={i}>
                          <td>
                            <div className="report-cell">
                              <ReportsIcon />
                              <div className="report-cell-content">
                                <div className="report-title">
                                  {activeReport?.name} - Item {i + 1}
                                </div>
                                <div className="report-description">
                                  Sample report data for visualization
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="type-badge">
                              {activeReport?.type || "Report"}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`status-badge ${
                                i % 3 === 0
                                  ? "success"
                                  : i % 3 === 1
                                  ? "warning"
                                  : "info"
                              }`}
                            >
                              {i % 3 === 0
                                ? "Active"
                                : i % 3 === 1
                                ? "Pending"
                                : "Draft"}
                            </span>
                          </td>
                          <td>
                            <span className="date-text">
                              {new Date(
                                Date.now() - i * 86400000
                              ).toLocaleDateString()}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="action-btn view-btn"
                                title="View Report"
                              >
                                <ViewIcon />
                              </button>
                              <button
                                className="action-btn edit-btn"
                                title="Edit Report"
                              >
                                <EditIcon />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Widgets Section - Card Layout (No Header)
  if (viewWidgets.length === 0) {
    return (
      <div className="content-empty">
        <div className="empty-state">
          <WidgetsIcon />
          <h3>No Widgets in "{selectedView.name}"</h3>
          <p>Add widgets to this view to see them here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-panel widgets-panel">
      {/* Removed content-header */}

      <div className="widgets-grid">
        {viewWidgets.map((widget, index) => (
          <div key={widget.id} className="widget-card" draggable>
            <div className="widget-header">
              <div className="widget-title">
                <WidgetsIcon />
                <span>{widget.name}</span>
              </div>
              <button
                className="widget-close-btn"
                onClick={() => onRemoveWidget(widget.id)}
                title="Remove from view"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="widget-content">
              <div className="widget-placeholder">
                <WidgetsIcon />
                <h4>Widget Content</h4>
                <p>Dummy widget data - {widget.type}</p>
                <div className="widget-metrics">
                  <div className="metric">
                    <span className="metric-value">
                      {Math.floor(Math.random() * 1000)}
                    </span>
                    <span className="metric-label">Value A</span>
                  </div>
                  <div className="metric">
                    <span className="metric-value">
                      {Math.floor(Math.random() * 100)}%
                    </span>
                    <span className="metric-label">Value B</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Icons
  function ReportsIcon() {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10,9 9,9 8,9" />
      </svg>
    );
  }

  function WidgetsIcon() {
    return (
      <svg
        width="24"
        height="24"
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
  }

  function CloseIcon() {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    );
  }

  function ViewIcon() {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  function EditIcon() {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    );
  }
};

export default ViewContentPanel;
