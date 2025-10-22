import React, { useState, useEffect } from "react";
import { Report, Widget } from "../../types";
import { reportsService } from "../../services/reportsService";
import { widgetsService } from "../../services/widgetsService";
import { useNotification } from "../common/NotificationProvider";

interface UserRolePermissionsProps {
  userRole: string;
  onRefreshData?: () => void;
}

interface RoleAssignment {
  roleId: string;
  reportIds: string[];
  widgetIds: string[];
}

const UserRolePermissions: React.FC<UserRolePermissionsProps> = ({
  userRole,
  onRefreshData,
}) => {
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [roleAssignments, setRoleAssignments] = useState<{
    [key: string]: RoleAssignment;
  }>({});
  const [expandedCards, setExpandedCards] = useState<{
    [key: string]: boolean;
  }>({
    admin: true,
    user: true,
    viewer: true,
  });
  const [loading, setLoading] = useState(false);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [allWidgets, setAllWidgets] = useState<Widget[]>([]);

  const { showSuccess, showError } = useNotification();

  const userRoles = ["admin", "user", "viewer"];

  // Fetch all reports, widgets, and role assignments (admin only)
  useEffect(() => {
    if (userRole !== "admin") return;

    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch all reports (not filtered by role)
        const allReportsData = await reportsService.getAllReports();
        setAllReports(allReportsData);

        // Fetch all widgets (not filtered by role)
        const allWidgetsData = await widgetsService.getAllWidgets();
        setAllWidgets(allWidgetsData);

        // Fetch role assignments for each role
        const assignments: { [key: string]: RoleAssignment } = {};

        for (const role of userRoles) {
          const roleReports = await reportsService.getReportsByRole(role);
          const roleWidgets = await widgetsService.getWidgetsByRole(role);

          assignments[role] = {
            roleId: role,
            reportIds: roleReports.map((r) => r.id),
            widgetIds: roleWidgets.map((w) => w.id),
          };
        }

        setRoleAssignments(assignments);
      } catch (error) {
        console.error("Failed to fetch role permissions:", error);
        showError("Failed to load role permissions", "Please refresh the page");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [userRole]);

  const getRolePermissions = (role: string) => {
    const assignment = roleAssignments[role] || {
      roleId: role,
      reportIds: [],
      widgetIds: [],
    };
    const roleReports = allReports.filter((r) =>
      assignment.reportIds.includes(r.id)
    );
    const roleWidgets = allWidgets.filter((w) =>
      assignment.widgetIds.includes(w.id)
    );
    return { reports: roleReports, widgets: roleWidgets };
  };

  const handleEditRole = (role: string) => {
    if (role === "admin") {
      showError(
        "Admin role cannot be edited",
        "Admin has access to all reports and widgets"
      );
      return;
    }
    setEditingRole(role);
  };

  const handleSaveRole = async (
    role: string,
    selectedReportIds: string[],
    selectedWidgetIds: string[]
  ) => {
    setLoading(true);
    try {
      // Get current assignments
      const current = roleAssignments[role] || { reportIds: [], widgetIds: [] };

      // Reports: Determine what to assign/unassign
      const reportsToAssign = selectedReportIds.filter(
        (id) => !current.reportIds.includes(id)
      );
      const reportsToUnassign = current.reportIds.filter(
        (id) => !selectedReportIds.includes(id)
      );

      // Widgets: Determine what to assign/unassign
      const widgetsToAssign = selectedWidgetIds.filter(
        (id) => !current.widgetIds.includes(id)
      );
      const widgetsToUnassign = current.widgetIds.filter(
        (id) => !selectedWidgetIds.includes(id)
      );

      // Batch operations for better performance
      const operations = [];

      // Assign reports (batch)
      if (reportsToAssign.length > 0) {
        operations.push(reportsService.assignReportsToRole(role, reportsToAssign));
      }

      // Unassign reports (one by one - API doesn't support batch delete)
      for (const reportId of reportsToUnassign) {
        operations.push(reportsService.unassignReportFromRole(role, reportId));
      }

      // Assign widgets (batch)
      if (widgetsToAssign.length > 0) {
        operations.push(widgetsService.assignWidgetsToRole(role, widgetsToAssign));
      }

      // Unassign widgets (one by one - API doesn't support batch delete)
      for (const widgetId of widgetsToUnassign) {
        operations.push(widgetsService.unassignWidgetFromRole(role, widgetId));
      }

      // Execute all operations in parallel
      await Promise.all(operations);

      // Update local state
      setRoleAssignments({
        ...roleAssignments,
        [role]: {
          roleId: role,
          reportIds: selectedReportIds,
          widgetIds: selectedWidgetIds,
        },
      });

      showSuccess(
        "Role permissions updated",
        `${role} permissions have been saved successfully`
      );

      setEditingRole(null);

      // Refresh data if callback provided
      if (onRefreshData) {
        onRefreshData();
      }
    } catch (error: any) {
      console.error("Failed to update role permissions:", error);
      const errorMessage = error?.data?.message || error?.message || "Please try again";
      showError("Failed to update permissions", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleCardExpansion = (role: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [role]: !prev[role],
    }));
  };

  // Icons
  const UserIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  const ReportIcon = () => (
    <svg
      width="16"
      height="16"
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

  const EditIcon = () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="m18.5 2.5 2.1 2.1L12 13.2l-3.3.8.8-3.3L18.5 2.5z" />
    </svg>
  );

  const LockIcon = () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );

  const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{
        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.2s ease",
      }}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );

  // Show loading state
  if (loading && allReports.length === 0) {
    return (
      <div className="modern-permissions-container">
        <div className="permissions-header">
          <h2>User Role Permissions</h2>
          <p>Loading role permissions...</p>
        </div>
      </div>
    );
  }

  // Show error if not admin
  if (userRole !== "admin") {
    return (
      <div className="modern-permissions-container">
        <div className="permissions-header">
          <h2>User Role Permissions</h2>
          <p style={{ color: "var(--error-color)" }}>
            Only administrators can manage role permissions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-permissions-container">
      <div className="permissions-header">
        <h2>User Role Permissions</h2>
        <p>Manage access to reports and widgets by user roles</p>
      </div>

      <div className="role-permissions-list">
        {userRoles.map((role) => {
          const roleItems = getRolePermissions(role);
          const isAdmin = role === "admin";
          const isExpanded = expandedCards[role];

          return (
            <div
              key={role}
              className={`role-permission-card-compact ${
                isAdmin ? "admin-role-card" : ""
              }`}
            >
              <div
                className="role-card-header-clickable"
                onClick={() => toggleCardExpansion(role)}
              >
                <div className="role-info">
                  <div
                    className={`role-icon ${isAdmin ? "admin-role-icon" : ""}`}
                  >
                    <UserIcon />
                  </div>
                  <div>
                    <h3 className="role-name">
                      {role.charAt(0).toUpperCase() + role.slice(1)} Role
                      {isAdmin && (
                        <span className="admin-badge">Full Access</span>
                      )}
                    </h3>
                    <div className="role-summary">
                      <span className="summary-text">
                        {isAdmin ? "All" : roleItems.reports.length} Reports •{" "}
                        {isAdmin ? "All" : roleItems.widgets.length} Widgets
                      </span>
                    </div>
                  </div>
                </div>

                <div className="role-actions">
                  {isAdmin ? (
                    <div
                      className="admin-lock-indicator"
                      title="Admin permissions cannot be edited"
                    >
                      <LockIcon />
                    </div>
                  ) : userRole === "admin" ? (
                    <button
                      className="edit-role-btn-compact"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditRole(role);
                      }}
                      title="Edit role permissions"
                    >
                      <EditIcon />
                    </button>
                  ) : null}
                  <div className="expand-indicator">
                    <ChevronIcon expanded={isExpanded} />
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="role-permissions-content-scrollable">
                  <div className="role-items-container">
                    <div className="role-section">
                      <h4>
                        <ReportIcon />
                        Reports {!isAdmin && `(${roleItems.reports.length})`}
                      </h4>
                      <div className="role-items-scrollable">
                        {isAdmin ? (
                          <div className="admin-access-notice">
                            <p>Admin has access to all reports automatically</p>
                          </div>
                        ) : roleItems.reports.length > 0 ? (
                          roleItems.reports.map((report) => (
                            <div key={report.id} className="role-item-compact">
                              <ReportIcon />
                              <span>{report.name}</span>
                            </div>
                          ))
                        ) : (
                          <div className="no-items">No reports assigned</div>
                        )}
                      </div>
                    </div>

                    <div className="role-section">
                      <h4>
                        <WidgetIcon />
                        Widgets {!isAdmin && `(${roleItems.widgets.length})`}
                      </h4>
                      <div className="role-items-scrollable">
                        {isAdmin ? (
                          <div className="admin-access-notice">
                            <p>Admin has access to all widgets automatically</p>
                          </div>
                        ) : roleItems.widgets.length > 0 ? (
                          roleItems.widgets.map((widget) => (
                            <div key={widget.id} className="role-item-compact">
                              <WidgetIcon />
                              <span>{widget.name}</span>
                            </div>
                          ))
                        ) : (
                          <div className="no-items">No widgets assigned</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Role Modal */}
      {editingRole && userRole === "admin" && (
        <EditRolePermissionsModal
          role={editingRole}
          currentReports={allReports}
          currentWidgets={allWidgets}
          assignedReportIds={roleAssignments[editingRole]?.reportIds || []}
          assignedWidgetIds={roleAssignments[editingRole]?.widgetIds || []}
          onSave={handleSaveRole}
          onClose={() => setEditingRole(null)}
          loading={loading}
        />
      )}
    </div>
  );
};

// Edit Role Permissions Modal
interface EditRolePermissionsModalProps {
  role: string;
  currentReports: Report[];
  currentWidgets: Widget[];
  assignedReportIds: string[];
  assignedWidgetIds: string[];
  onSave: (role: string, reportIds: string[], widgetIds: string[]) => void;
  onClose: () => void;
  loading?: boolean;
}

const EditRolePermissionsModal: React.FC<EditRolePermissionsModalProps> = ({
  role,
  currentReports,
  currentWidgets,
  assignedReportIds,
  assignedWidgetIds,
  onSave,
  onClose,
  loading = false,
}) => {
  const [selectedReportIds, setSelectedReportIds] =
    useState<string[]>(assignedReportIds);
  const [selectedWidgetIds, setSelectedWidgetIds] =
    useState<string[]>(assignedWidgetIds);

  const handleReportToggle = (reportId: string, checked: boolean) => {
    if (checked) {
      setSelectedReportIds([...selectedReportIds, reportId]);
    } else {
      setSelectedReportIds(selectedReportIds.filter((id) => id !== reportId));
    }
  };

  const handleWidgetToggle = (widgetId: string, checked: boolean) => {
    if (checked) {
      setSelectedWidgetIds([...selectedWidgetIds, widgetId]);
    } else {
      setSelectedWidgetIds(selectedWidgetIds.filter((id) => id !== widgetId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(role, selectedReportIds, selectedWidgetIds);
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

  const UserIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  return (
    <div className="modern-modal-overlay">
      <div className="modern-modal">
        <div className="modern-modal-header">
          <div className="header-left">
            <div className="header-icon-container">
              <UserIcon />
            </div>
            <div>
              <h2>
                Edit {role.charAt(0).toUpperCase() + role.slice(1)} Role
                Permissions
              </h2>
              <p>Add or remove reports and widgets for this role</p>
            </div>
          </div>
          <button
            className="modern-close-btn"
            onClick={onClose}
            disabled={loading}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="modern-modal-content">
          <form onSubmit={handleSubmit} className="modern-form">
            <div className="form-section">
              <h3 className="section-title">
                Reports ({selectedReportIds.length} selected)
              </h3>
              <div className="items-selection-grid">
                {currentReports.map((report) => (
                  <label key={report.id} className="modern-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedReportIds.includes(report.id)}
                      onChange={(e) =>
                        handleReportToggle(report.id, e.target.checked)
                      }
                      disabled={loading}
                    />
                    <span className="checkmark"></span>
                    <span className="checkbox-label">{report.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">
                Widgets ({selectedWidgetIds.length} selected)
              </h3>
              <div className="items-selection-grid">
                {currentWidgets.map((widget) => (
                  <label key={widget.id} className="modern-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedWidgetIds.includes(widget.id)}
                      onChange={(e) =>
                        handleWidgetToggle(widget.id, e.target.checked)
                      }
                      disabled={loading}
                    />
                    <span className="checkmark"></span>
                    <span className="checkbox-label">{widget.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="modern-modal-footer">
              <button
                type="button"
                className="modal-btn modal-btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="modal-btn modal-btn-primary"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserRolePermissions;
