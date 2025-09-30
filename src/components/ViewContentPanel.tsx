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
  onReorderReports?: (reportIds: string[]) => void; // NEW: Report ordering
  onReorderWidgets?: (widgetIds: string[]) => void; // NEW: Widget ordering
}

const ViewContentPanel: React.FC<ViewContentPanelProps> = ({
  type,
  selectedView,
  reports,
  widgets,
  onRemoveReport,
  onRemoveWidget,
  onReorderReports,
  onReorderWidgets,
}) => {
  const [activeReportTab, setActiveReportTab] = useState<string | null>(null);

  // NEW: Drag and drop state for reports (tabs)
  const [draggedReportTab, setDraggedReportTab] = useState<string | null>(null);
  const [dragOverReportTab, setDragOverReportTab] = useState<string | null>(
    null
  );
  const [dragOverPosition, setDragOverPosition] = useState<
    "left" | "right" | null
  >(null);

  // NEW: Drag and drop state for widgets (cards)
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [dragOverWidget, setDragOverWidget] = useState<string | null>(null);

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

  // NEW: Report Tab Drag Handlers
  const handleReportTabDragStart = (e: React.DragEvent, reportId: string) => {
    setDraggedReportTab(reportId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", reportId);

    // Add visual feedback
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = "0.5";
  };

  const handleReportTabDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = "1";

    setDraggedReportTab(null);
    setDragOverReportTab(null);
    setDragOverPosition(null);
  };

  const handleReportTabDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleReportTabDragEnter = (
    e: React.DragEvent,
    targetReportId: string
  ) => {
    e.preventDefault();

    if (draggedReportTab && draggedReportTab !== targetReportId) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;

      const position = x < width / 2 ? "left" : "right";
      setDragOverReportTab(targetReportId);
      setDragOverPosition(position);
    }
  };

  const handleReportTabDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverReportTab(null);
      setDragOverPosition(null);
    }
  };

  const handleReportTabDrop = (e: React.DragEvent, targetReportId: string) => {
    e.preventDefault();

    if (!draggedReportTab || draggedReportTab === targetReportId) return;

    const currentOrder = viewReports.map((r) => r.id);
    const draggedIndex = currentOrder.indexOf(draggedReportTab);
    const targetIndex = currentOrder.indexOf(targetReportId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Create new order
    const newOrder = [...currentOrder];
    const [removed] = newOrder.splice(draggedIndex, 1);

    let insertIndex = targetIndex;
    if (dragOverPosition === "right") {
      insertIndex = targetIndex + 1;
    }
    if (draggedIndex < targetIndex && dragOverPosition === "left") {
      insertIndex = targetIndex - 1;
    }

    newOrder.splice(insertIndex, 0, removed);

    // Call reorder handler
    if (onReorderReports) {
      onReorderReports(newOrder);
    }

    setDraggedReportTab(null);
    setDragOverReportTab(null);
    setDragOverPosition(null);
  };

  // NEW: Widget Card Drag Handlers
  const handleWidgetDragStart = (e: React.DragEvent, widgetId: string) => {
    setDraggedWidget(widgetId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", widgetId);

    // Add visual feedback
    const target = e.currentTarget as HTMLElement;
    target.classList.add("dragging");
  };

  const handleWidgetDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove("dragging");

    setDraggedWidget(null);
    setDragOverWidget(null);
  };

  const handleWidgetDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleWidgetDragEnter = (
    e: React.DragEvent,
    targetWidgetId: string
  ) => {
    e.preventDefault();

    if (draggedWidget && draggedWidget !== targetWidgetId) {
      setDragOverWidget(targetWidgetId);
    }
  };

  const handleWidgetDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverWidget(null);
    }
  };

  const handleWidgetDrop = (e: React.DragEvent, targetWidgetId: string) => {
    e.preventDefault();

    if (!draggedWidget || draggedWidget === targetWidgetId) return;

    const currentOrder = viewWidgets.map((w) => w.id);
    const draggedIndex = currentOrder.indexOf(draggedWidget);
    const targetIndex = currentOrder.indexOf(targetWidgetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Create new order
    const newOrder = [...currentOrder];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, removed);

    // Call reorder handler
    if (onReorderWidgets) {
      onReorderWidgets(newOrder);
    }

    setDraggedWidget(null);
    setDragOverWidget(null);
  };

  // Reports Section with Orderable Tabs
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
        <div className="reports-tabs">
          <div className="tab-nav orderable-tabs">
            {viewReports.map((report) => {
              const isDragOver = dragOverReportTab === report.id;
              const dragOverClass = isDragOver
                ? `drag-over-${dragOverPosition}`
                : "";

              return (
                <div
                  key={report.id}
                  className={`tab-item orderable-tab ${
                    activeReportTab === report.id ? "active" : ""
                  } ${
                    draggedReportTab === report.id ? "dragging" : ""
                  } ${dragOverClass}`}
                  onClick={() => setActiveReportTab(report.id)}
                  draggable
                  onDragStart={(e) => handleReportTabDragStart(e, report.id)}
                  onDragEnd={handleReportTabDragEnd}
                  onDragOver={handleReportTabDragOver}
                  onDragEnter={(e) => handleReportTabDragEnter(e, report.id)}
                  onDragLeave={handleReportTabDragLeave}
                  onDrop={(e) => handleReportTabDrop(e, report.id)}
                >
                  <div className="tab-drag-handle">
                    <DragIcon />
                  </div>
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
              );
            })}
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

  // Widgets Section with Orderable Cards
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
      <div className="widgets-grid orderable-widgets">
        {viewWidgets.map((widget, index) => {
          const isDragOver = dragOverWidget === widget.id;
          const isDragging = draggedWidget === widget.id;

          return (
            <div
              key={widget.id}
              className={`widget-card orderable-widget ${
                isDragging ? "dragging" : ""
              } ${isDragOver ? "drag-over" : ""}`}
              draggable
              onDragStart={(e) => handleWidgetDragStart(e, widget.id)}
              onDragEnd={handleWidgetDragEnd}
              onDragOver={handleWidgetDragOver}
              onDragEnter={(e) => handleWidgetDragEnter(e, widget.id)}
              onDragLeave={handleWidgetDragLeave}
              onDrop={(e) => handleWidgetDrop(e, widget.id)}
            >
              <div className="widget-header">
                <div className="widget-drag-handle">
                  <DragIcon />
                </div>
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
          );
        })}
      </div>
    </div>
  );

  // Icons
  function ReportsIcon() {
    return (
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
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10,9 9,9 8,9" />
      </svg>
    );
  }

  function WidgetsIcon() {
    return (
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

  function DragIcon() {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="9" cy="12" r="1" />
        <circle cx="9" cy="5" r="1" />
        <circle cx="9" cy="19" r="1" />
        <circle cx="15" cy="12" r="1" />
        <circle cx="15" cy="5" r="1" />
        <circle cx="15" cy="19" r="1" />
      </svg>
    );
  }
};

export default ViewContentPanel;
