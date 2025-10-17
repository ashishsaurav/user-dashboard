import React, { useState, useEffect } from "react";
import { Report, Widget } from "../../types";
import { reportsService } from "../../services/reportsService";
import { widgetsService } from "../../services/widgetsService";
import { useNotification } from "../common/NotificationProvider";
import EditReportModal from "../modals/EditReportModal";
import EditWidgetModal from "../modals/EditWidgetModal";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";

interface AllReportsWidgetsProps {
  onRefreshData?: () => void;
}

const AllReportsWidgets: React.FC<AllReportsWidgetsProps> = ({
  onRefreshData,
}) => {
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "report" | "widget";
    id: string;
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [widgets, setWidgets] = useState<Widget[]>([]);

  const { showSuccess, showError } = useNotification();

  // Fetch all reports and widgets (admin only)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [allReports, allWidgets] = await Promise.all([
          reportsService.getAllReports(),
          widgetsService.getAllWidgets(),
        ]);
        setReports(allReports);
        setWidgets(allWidgets);
      } catch (error) {
        console.error("Failed to fetch reports/widgets:", error);
        showError("Failed to load data", "Please refresh the page");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteConfirm = (
    type: "report" | "widget",
    id: string,
    name: string
  ) => {
    setDeleteConfirm({ type, id, name });
  };

  const handleDeleteExecute = async () => {
    if (!deleteConfirm) return;

    setLoading(true);
    try {
      if (deleteConfirm.type === "report") {
        await reportsService.deleteReport(deleteConfirm.id);
        showSuccess(
          "Report deleted",
          `"${deleteConfirm.name}" has been removed`
        );
      } else {
        await widgetsService.deleteWidget(deleteConfirm.id);
        showSuccess(
          "Widget deleted",
          `"${deleteConfirm.name}" has been removed`
        );
      }

      setDeleteConfirm(null);

      // Reload data
      const [allReports, allWidgets] = await Promise.all([
        reportsService.getAllReports(),
        widgetsService.getAllWidgets(),
      ]);
      setReports(allReports);
      setWidgets(allWidgets);

      // Also refresh parent if needed
      if (onRefreshData) {
        onRefreshData();
      }
    } catch (error) {
      console.error("Failed to delete:", error);
      showError(`Failed to delete ${deleteConfirm.type}`, "Please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleEditReport = (report: Report) => {
    setEditingReport(report);
  };

  const handleEditWidget = (widget: Widget) => {
    setEditingWidget(widget);
  };

  const handleSaveReport = async (updatedReport: Report) => {
    setLoading(true);
    try {
      await reportsService.updateReport(updatedReport.id, {
        reportName: updatedReport.name,
        reportUrl: updatedReport.url,
      });

      showSuccess("Report updated", `"${updatedReport.name}" has been saved`);
      setEditingReport(null);

      // Reload data
      const allReports = await reportsService.getAllReports();
      setReports(allReports);

      // Also refresh parent if needed
      if (onRefreshData) {
        onRefreshData();
      }
    } catch (error) {
      console.error("Failed to update report:", error);
      showError("Failed to update report", "Please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWidget = async (updatedWidget: Widget) => {
    setLoading(true);
    try {
      await widgetsService.updateWidget(updatedWidget.id, {
        widgetName: updatedWidget.name,
        widgetUrl: updatedWidget.url,
      });

      showSuccess("Widget updated", `"${updatedWidget.name}" has been saved`);
      setEditingWidget(null);

      // Reload data
      const allWidgets = await widgetsService.getAllWidgets();
      setWidgets(allWidgets);

      // Also refresh parent if needed
      if (onRefreshData) {
        onRefreshData();
      }
    } catch (error) {
      console.error("Failed to update widget:", error);
      showError("Failed to update widget", "Please try again");
    } finally {
      setLoading(false);
    }
  };

  // SVG Icons
  const EditIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="m18.5 2.5 2.1 2.1L12 13.2l-3.3.8.8-3.3L18.5 2.5z" />
    </svg>
  );

  const DeleteIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="3,6 5,6 21,6" />
      <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );

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
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10,9 9,9 8,9" />
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

  return (
    <div className="modern-dashboard-container">
      <div className="dashboard-sections">
        {/* Reports Section */}
        <div className="dashboard-card">
          <div className="card-header">
            <div className="header-icon">
              <ReportIcon />
            </div>
            <div className="header-content">
              <h3>Reports</h3>
              <span className="item-count">{reports.length} items</span>
            </div>
          </div>

          <div className="card-content">
            <div className="items-list">
              {reports.map((report) => (
                <div key={report.id} className="dashboard-item">
                  <div className="item-info">
                    <ReportIcon />
                    <span className="item-name">{report.name}</span>
                  </div>
                  <div className="item-actions">
                    <button
                      className="edit-btn-compact"
                      onClick={() => handleEditReport(report)}
                      title="Edit Report"
                      disabled={loading}
                    >
                      <EditIcon />
                    </button>
                    <button
                      className="delete-btn-compact"
                      onClick={() =>
                        handleDeleteConfirm("report", report.id, report.name)
                      }
                      title="Delete Report"
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
              ))}
              {reports.length === 0 && (
                <div className="empty-state">
                  <ReportIcon />
                  <p>No reports available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Widgets Section */}
        <div className="dashboard-card">
          <div className="card-header">
            <div className="header-icon">
              <WidgetIcon />
            </div>
            <div className="header-content">
              <h3>Widgets</h3>
              <span className="item-count">{widgets.length} items</span>
            </div>
          </div>

          <div className="card-content">
            <div className="items-list">
              {widgets.map((widget) => (
                <div key={widget.id} className="dashboard-item">
                  <div className="item-info">
                    <WidgetIcon />
                    <span className="item-name">{widget.name}</span>
                  </div>
                  <div className="item-actions">
                    <button
                      className="edit-btn-compact"
                      onClick={() => handleEditWidget(widget)}
                      title="Edit Widget"
                      disabled={loading}
                    >
                      <EditIcon />
                    </button>
                    <button
                      className="delete-btn-compact"
                      onClick={() =>
                        handleDeleteConfirm("widget", widget.id, widget.name)
                      }
                      title="Delete Widget"
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
              ))}
              {widgets.length === 0 && (
                <div className="empty-state">
                  <WidgetIcon />
                  <p>No widgets available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modals */}
      {editingReport && (
        <EditReportModal
          report={editingReport}
          onSave={handleSaveReport}
          onClose={() => setEditingReport(null)}
        />
      )}

      {editingWidget && (
        <EditWidgetModal
          widget={editingWidget}
          onSave={handleSaveWidget}
          onClose={() => setEditingWidget(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          itemName={deleteConfirm.name}
          itemType={deleteConfirm.type}
          onConfirm={handleDeleteExecute}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

export default AllReportsWidgets;
