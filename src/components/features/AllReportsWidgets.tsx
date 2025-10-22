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

interface ReportWithRoles extends Report {
  assignedRoles: string[];
}

interface WidgetWithRoles extends Widget {
  assignedRoles: string[];
}

const AllReportsWidgets: React.FC<AllReportsWidgetsProps> = ({
  onRefreshData,
}) => {
  const [editingReport, setEditingReport] = useState<ReportWithRoles | null>(null);
  const [editingWidget, setEditingWidget] = useState<WidgetWithRoles | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "report" | "widget";
    id: string;
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<ReportWithRoles[]>([]);
  const [widgets, setWidgets] = useState<WidgetWithRoles[]>([]);

  const { showSuccess, showError } = useNotification();
  const allRoles = ["admin", "user", "viewer"];

  // Fetch all reports and widgets with their role assignments
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all reports and widgets
        const [allReports, allWidgets] = await Promise.all([
          reportsService.getAllReports(),
          widgetsService.getAllWidgets(),
        ]);

        // Fetch role assignments for each role
        const roleAssignments = await Promise.all(
          allRoles.map(async (role) => ({
            role,
            reports: await reportsService.getReportsByRole(role),
            widgets: await widgetsService.getWidgetsByRole(role),
          }))
        );

        // Map reports with their assigned roles
        const reportsWithRoles: ReportWithRoles[] = allReports.map((report) => ({
          ...report,
          assignedRoles: roleAssignments
            .filter((ra) => ra.reports.some((r) => r.id === report.id))
            .map((ra) => ra.role),
        }));

        // Map widgets with their assigned roles
        const widgetsWithRoles: WidgetWithRoles[] = allWidgets.map((widget) => ({
          ...widget,
          assignedRoles: roleAssignments
            .filter((ra) => ra.widgets.some((w) => w.id === widget.id))
            .map((ra) => ra.role),
        }));

        setReports(reportsWithRoles);
        setWidgets(widgetsWithRoles);
      } catch (error) {
        console.error("Failed to fetch reports/widgets:", error);
        showError("Failed to load data", "Please refresh the page");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to reload all data with role assignments
  const reloadData = async () => {
    const [allReports, allWidgets] = await Promise.all([
      reportsService.getAllReports(),
      widgetsService.getAllWidgets(),
    ]);

    // Fetch role assignments for each role
    const roleAssignments = await Promise.all(
      allRoles.map(async (role) => ({
        role,
        reports: await reportsService.getReportsByRole(role),
        widgets: await widgetsService.getWidgetsByRole(role),
      }))
    );

    // Map reports with their assigned roles
    const reportsWithRoles: ReportWithRoles[] = allReports.map((report) => ({
      ...report,
      assignedRoles: roleAssignments
        .filter((ra) => ra.reports.some((r) => r.id === report.id))
        .map((ra) => ra.role),
    }));

    // Map widgets with their assigned roles
    const widgetsWithRoles: WidgetWithRoles[] = allWidgets.map((widget) => ({
      ...widget,
      assignedRoles: roleAssignments
        .filter((ra) => ra.widgets.some((w) => w.id === widget.id))
        .map((ra) => ra.role),
    }));

    setReports(reportsWithRoles);
    setWidgets(widgetsWithRoles);
  };

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
      // First, unassign from all roles to avoid foreign key constraint errors
      if (deleteConfirm.type === "report") {
        const report = reports.find(r => r.id === deleteConfirm.id);
        if (report) {
          // Unassign from all roles first
          for (const role of report.assignedRoles) {
            try {
              await reportsService.unassignReportFromRole(role, deleteConfirm.id);
            } catch (err) {
              console.warn(`Failed to unassign report from ${role}:`, err);
              // Continue anyway, backend might have cascade delete
            }
          }
        }
        
        // Now delete the report
        await reportsService.deleteReport(deleteConfirm.id);
        showSuccess(
          "Report deleted",
          `"${deleteConfirm.name}" has been removed`
        );
      } else {
        const widget = widgets.find(w => w.id === deleteConfirm.id);
        if (widget) {
          // Unassign from all roles first
          for (const role of widget.assignedRoles) {
            try {
              await widgetsService.unassignWidgetFromRole(role, deleteConfirm.id);
            } catch (err) {
              console.warn(`Failed to unassign widget from ${role}:`, err);
              // Continue anyway, backend might have cascade delete
            }
          }
        }
        
        // Now delete the widget
        await widgetsService.deleteWidget(deleteConfirm.id);
        showSuccess(
          "Widget deleted",
          `"${deleteConfirm.name}" has been removed`
        );
      }

      setDeleteConfirm(null);

      // Reload data with role assignments
      await reloadData();

      // Also refresh parent if needed
      if (onRefreshData) {
        onRefreshData();
      }
    } catch (error: any) {
      console.error("Failed to delete:", error);
      const errorMessage = error?.data?.message || error?.message || "Please try again";
      showError(`Failed to delete ${deleteConfirm.type}`, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditReport = (report: ReportWithRoles) => {
    // Convert assignedRoles to userRoles format for the modal
    const reportWithUserRoles = {
      ...report,
      userRoles: report.assignedRoles,
    };
    setEditingReport(reportWithUserRoles as ReportWithRoles);
  };

  const handleEditWidget = (widget: WidgetWithRoles) => {
    // Convert assignedRoles to userRoles format for the modal
    const widgetWithUserRoles = {
      ...widget,
      userRoles: widget.assignedRoles,
    };
    setEditingWidget(widgetWithUserRoles as WidgetWithRoles);
  };

  const handleSaveReport = async (updatedReport: Report & { userRoles?: string[] }) => {
    setLoading(true);
    try {
      // Update report details
      await reportsService.updateReport(updatedReport.id, {
        reportName: updatedReport.name,
        reportUrl: updatedReport.url,
      });

      // Handle role assignments if userRoles is provided
      if (updatedReport.userRoles && editingReport) {
        const currentRoles = editingReport.assignedRoles;
        const newRoles = updatedReport.userRoles;

        // Determine roles to assign and unassign
        const rolesToAssign = newRoles.filter(r => !currentRoles.includes(r));
        const rolesToUnassign = currentRoles.filter(r => !newRoles.includes(r));

        // Batch assign new roles
        if (rolesToAssign.length > 0) {
          for (const role of rolesToAssign) {
            await reportsService.assignReportToRole(role, updatedReport.id);
          }
        }

        // Unassign removed roles
        if (rolesToUnassign.length > 0) {
          for (const role of rolesToUnassign) {
            await reportsService.unassignReportFromRole(role, updatedReport.id);
          }
        }
      }

      showSuccess("Report updated", `"${updatedReport.name}" has been saved`);
      setEditingReport(null);

      // Reload data with role assignments
      await reloadData();

      // Also refresh parent if needed
      if (onRefreshData) {
        onRefreshData();
      }
    } catch (error: any) {
      console.error("Failed to update report:", error);
      const errorMessage = error?.data?.message || error?.message || "Please try again";
      showError("Failed to update report", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWidget = async (updatedWidget: Widget & { userRoles?: string[] }) => {
    setLoading(true);
    try {
      // Update widget details
      await widgetsService.updateWidget(updatedWidget.id, {
        widgetName: updatedWidget.name,
        widgetUrl: updatedWidget.url,
      });

      // Handle role assignments if userRoles is provided
      if (updatedWidget.userRoles && editingWidget) {
        const currentRoles = editingWidget.assignedRoles;
        const newRoles = updatedWidget.userRoles;

        // Determine roles to assign and unassign
        const rolesToAssign = newRoles.filter(r => !currentRoles.includes(r));
        const rolesToUnassign = currentRoles.filter(r => !newRoles.includes(r));

        // Batch assign new roles
        if (rolesToAssign.length > 0) {
          for (const role of rolesToAssign) {
            await widgetsService.assignWidgetToRole(role, updatedWidget.id);
          }
        }

        // Unassign removed roles
        if (rolesToUnassign.length > 0) {
          for (const role of rolesToUnassign) {
            await widgetsService.unassignWidgetFromRole(role, updatedWidget.id);
          }
        }
      }

      showSuccess("Widget updated", `"${updatedWidget.name}" has been saved`);
      setEditingWidget(null);

      // Reload data with role assignments
      await reloadData();

      // Also refresh parent if needed
      if (onRefreshData) {
        onRefreshData();
      }
    } catch (error: any) {
      console.error("Failed to update widget:", error);
      const errorMessage = error?.data?.message || error?.message || "Please try again";
      showError("Failed to update widget", errorMessage);
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
