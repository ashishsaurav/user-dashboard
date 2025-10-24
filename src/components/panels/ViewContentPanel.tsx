import React, { useState, useMemo } from "react";
import { View, Report, Widget } from "../../types";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";
import PowerBIEmbedReport from "../powerbi/PowerBIEmbedReport";
import PowerBIEmbedVisual from "../powerbi/PowerBIEmbedVisual";
import { parsePowerBIReportUrl, parsePowerBIVisualUrl } from "../../utils/powerBIUrlParser";
import "./styles/ViewContentPanel.css";

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
  
  // Use refs to store order without triggering re-renders
  const reportOrderMapRef = React.useRef<Record<string, number>>({});
  const widgetOrderMapRef = React.useRef<Record<string, number>>({});
  const tabNavRef = React.useRef<HTMLDivElement>(null);
  const widgetsGridRef = React.useRef<HTMLDivElement>(null);
  
  // Track current view ID to detect view changes
  const currentViewIdRef = React.useRef<string | null>(null);
  
  // Reset order maps when view changes
  React.useEffect(() => {
    if (selectedView && selectedView.id !== currentViewIdRef.current) {
      console.log("🔄 View changed - resetting order maps");
      reportOrderMapRef.current = {};
      widgetOrderMapRef.current = {};
      currentViewIdRef.current = selectedView.id;
      
      // Reset active tab when view changes
      setActiveReportTab(null);
    }
  }, [selectedView]);

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

  const [removeConfirmation, setRemoveConfirmation] = useState<{
    isOpen: boolean;
    itemId: string;
    itemName: string;
    itemType: "report" | "widget";
  } | null>(null);

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

    console.log("🎯 ViewContentPanel: Reordering tabs with CSS order (no re-render):", newOrder);

    // Update order map in ref (doesn't trigger re-render)
    const orderMap: Record<string, number> = {};
    newOrder.forEach((id, index) => {
      orderMap[id] = index;
    });
    reportOrderMapRef.current = orderMap;
    
    // Manually update DOM elements with CSS order (no React re-render!)
    setTimeout(() => {
      if (tabNavRef.current) {
        const tabs = tabNavRef.current.querySelectorAll('.tab-item');
        console.log(`  Found ${tabs.length} tab elements`);
        tabs.forEach((tab) => {
          const tabElement = tab as HTMLElement;
          const tabKey = tabElement.getAttribute('data-report-id');
          console.log(`  Checking tab: data-report-id="${tabKey}"`);
          if (tabKey && orderMap[tabKey] !== undefined) {
            tabElement.style.order = String(orderMap[tabKey]);
            console.log(`    ✅ Set tab "${tabKey}" order to ${orderMap[tabKey]}`);
          }
        });
      } else {
        console.warn("  ⚠️ tabNavRef.current is null");
      }
    }, 0);
    
    // Notify parent to save new order to backend
    if (onReorderReports) {
      console.log("📤 Sending new report order to parent for backend save");
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

    console.log("🎯 ViewContentPanel: Reordering widgets with CSS order (no re-render):", newOrder);

    // Update order map in ref (doesn't trigger re-render)
    const orderMap: Record<string, number> = {};
    newOrder.forEach((id, index) => {
      orderMap[id] = index;
    });
    widgetOrderMapRef.current = orderMap;
    
    // Manually update DOM elements with CSS order (no React re-render!)
    setTimeout(() => {
      if (widgetsGridRef.current) {
        const widgets = widgetsGridRef.current.querySelectorAll('.widget-card');
        console.log(`  Found ${widgets.length} widget elements`);
        widgets.forEach((widget) => {
          const widgetElement = widget as HTMLElement;
          const widgetKey = widgetElement.getAttribute('data-widget-id');
          console.log(`  Checking widget: data-widget-id="${widgetKey}"`);
          if (widgetKey && orderMap[widgetKey] !== undefined) {
            widgetElement.style.order = String(orderMap[widgetKey]);
            console.log(`    ✅ Set widget "${widgetKey}" order to ${orderMap[widgetKey]}`);
          }
        });
      } else {
        console.warn("  ⚠️ widgetsGridRef.current is null");
      }
    }, 0);
    
    // Notify parent to save new order to backend
    if (onReorderWidgets) {
      console.log("📤 Sending new widget order to parent for backend save");
      onReorderWidgets(newOrder);
    }

    setDraggedWidget(null);
    setDragOverWidget(null);
  };

  const handleRemoveReportClick = (reportId: string, reportName: string) => {
    setRemoveConfirmation({
      isOpen: true,
      itemId: reportId,
      itemName: reportName,
      itemType: "report",
    });
  };

  const handleRemoveWidgetClick = (widgetId: string, widgetName: string) => {
    setRemoveConfirmation({
      isOpen: true,
      itemId: widgetId,
      itemName: widgetName,
      itemType: "widget",
    });
  };

  const handleConfirmRemove = () => {
    if (!removeConfirmation) return;

    if (removeConfirmation.itemType === "report") {
      onRemoveReport(removeConfirmation.itemId);
    } else {
      onRemoveWidget(removeConfirmation.itemId);
    }

    setRemoveConfirmation(null);
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
          <div ref={tabNavRef} className="tab-nav orderable-tabs">
            {viewReports.map((report) => {
              const isDragOver = dragOverReportTab === report.id;
              const dragOverClass = isDragOver
                ? `drag-over-${dragOverPosition}`
                : "";
              
              // Generate stable key for tab (same logic as content)
              let workspaceId = report.workspaceId;
              let reportId = report.reportId;
              let pageName = undefined;
              
              if (report.url) {
                const reportConfig = parsePowerBIReportUrl(report.url);
                if (reportConfig) {
                  workspaceId = workspaceId || reportConfig.workspaceId;
                  reportId = reportId || reportConfig.reportId;
                  pageName = reportConfig.pageName;
                }
              }
              
              const tabStableKey = workspaceId && reportId && pageName
                ? `tab-${workspaceId}-${reportId}-${pageName}`
                : workspaceId && reportId
                ? `tab-${workspaceId}-${reportId}`
                : `tab-${report.id}`;

              return (
                <div
                  key={tabStableKey}
                  data-report-id={report.id}
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
                    className="tab-action-btn close-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveReportClick(report.id, report.name);
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

          {/* Render ALL tabs but hide inactive ones with opacity */}
          <div className="tab-content-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
            {viewReports.map((report) => {
              // Always parse URL to get full config including pageName
              let reportConfig = null;
              let workspaceId = report.workspaceId;
              let reportId = report.reportId;
              let pageName = undefined;
              
              if (report.url) {
                reportConfig = parsePowerBIReportUrl(report.url);
                if (reportConfig) {
                  workspaceId = workspaceId || reportConfig.workspaceId;
                  reportId = reportId || reportConfig.reportId;
                  pageName = reportConfig.pageName; // Get page name from URL
                }
              }
              
              const isActive = activeReportTab === report.id;
              const hasPowerBIConfig = workspaceId && reportId;
              
              // Generate stable key based on PowerBI config to prevent re-renders on reorder
              const stableKey = workspaceId && reportId && pageName
                ? `report-${workspaceId}-${reportId}-${pageName}`
                : workspaceId && reportId
                ? `report-${workspaceId}-${reportId}`
                : `report-${report.id}`;
              
              return (
                <div 
                  key={stableKey}
                  className="tab-content"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: isActive ? 1 : 0,
                    pointerEvents: isActive ? 'auto' : 'none',
                    zIndex: isActive ? 1 : 0,
                    transition: 'opacity 0.15s ease'
                  }}
                >
                  {hasPowerBIConfig ? (
                    <div className="powerbi-report-container">
                      <PowerBIEmbedReport
                        workspaceId={workspaceId!}
                        reportId={reportId!}
                        reportName={report.name}
                        pageName={pageName} // Include specific page from URL
                      />
                    </div>
                  ) : (
                    <div className="report-no-config">
                      <div className="no-config-message">
                        <ReportsIcon />
                        <h3>Report Not Configured</h3>
                        <p>This report doesn't have PowerBI configuration yet.</p>
                        <small>Provide a valid PowerBI URL or WorkspaceId/ReportId.</small>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {removeConfirmation && (
          <DeleteConfirmModal
            onCancel={() => setRemoveConfirmation(null)}
            onConfirm={handleConfirmRemove}
            itemType={removeConfirmation.itemType}
            itemName={removeConfirmation.itemName}
          />
        )}
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
      <div ref={widgetsGridRef} className="widgets-grid orderable-widgets">
        {viewWidgets.map((widget) => {
          const isDragOver = dragOverWidget === widget.id;
          const isDragging = draggedWidget === widget.id;
          
          // Try to get PowerBI config from URL or direct fields
          let workspaceId = widget.workspaceId;
          let reportId = widget.reportId;
          let pageName = widget.pageName;
          let visualName = widget.visualName;
          
          // If not in fields, try parsing from URL
          if ((!workspaceId || !reportId || !pageName || !visualName) && widget.url) {
            const config = parsePowerBIVisualUrl(widget.url);
            if (config) {
              workspaceId = workspaceId || config.workspaceId;
              reportId = reportId || config.reportId;
              pageName = pageName || config.pageName;
              visualName = visualName || config.visualName;
            }
          }
          
          const hasPowerBIConfig = workspaceId && reportId && pageName && visualName;

          // Generate stable key based on PowerBI config to prevent re-renders on reorder
          const widgetStableKey = workspaceId && reportId && pageName && visualName
            ? `widget-${workspaceId}-${reportId}-${pageName}-${visualName}`
            : `widget-${widget.id}`;
          
          return (
            <div
              key={widgetStableKey}
              data-widget-id={widget.id}
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
                  className="tab-action-btn close-btn"
                  onClick={() =>
                    handleRemoveWidgetClick(widget.id, widget.name)
                  }
                  title="Remove from view"
                >
                  <CloseIcon />
                </button>
              </div>
              <div className="widget-content">
                {hasPowerBIConfig ? (
                  <PowerBIEmbedVisual
                    workspaceId={workspaceId!}
                    reportId={reportId!}
                    pageName={pageName!}
                    visualName={visualName!}
                    widgetName={widget.name}
                  />
                ) : (
                  <div className="widget-no-config">
                    <WidgetsIcon />
                    <h4>Widget Not Configured</h4>
                    <p>PowerBI configuration required</p>
                    <small>Provide a valid PowerBI visual URL</small>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {removeConfirmation && (
        <DeleteConfirmModal
          onCancel={() => setRemoveConfirmation(null)}
          onConfirm={handleConfirmRemove}
          itemType={removeConfirmation.itemType}
          itemName={removeConfirmation.itemName}
        />
      )}
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
