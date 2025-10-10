import React, { useState } from "react";
import { testUsers } from "../../data/testData";
import { Report, Widget } from "../../types";

interface UserRolePermissionsProps {
  reports: Report[];
  widgets: Widget[];
  onUpdateReports: (reports: Report[]) => void;
  onUpdateWidgets: (widgets: Widget[]) => void;
}

const UserRolePermissions: React.FC<UserRolePermissionsProps> = ({
  reports,
  widgets,
  onUpdateReports,
  onUpdateWidgets,
}) => {
  const [editingRole, setEditingRole] = useState<{
    role: string;
    items: { reports: Report[]; widgets: Widget[] };
  } | null>(null);
  const [expandedCards, setExpandedCards] = useState<{
    [key: string]: boolean;
  }>({
    admin: true,
    user: true,
    viewer: true,
  });

  // Get unique user roles
  const userRoles = Array.from(new Set(testUsers.map((user) => user.role)));

  const getRolePermissions = (role: string) => {
    const roleReports = reports.filter((r) => r.userRoles.includes(role));
    const roleWidgets = widgets.filter((w) => w.userRoles.includes(role));
    return { reports: roleReports, widgets: roleWidgets };
  };

  const handleEditRole = (role: string) => {
    // Prevent editing admin role
    if (role === "admin") {
      alert(
        "Admin role permissions cannot be edited. Admin has access to all reports and widgets."
      );
      return;
    }

    const roleItems = getRolePermissions(role);
    setEditingRole({ role, items: roleItems });
  };

  const handleSaveRole = (
    updatedReports: Report[],
    updatedWidgets: Widget[]
  ) => {
    onUpdateReports(updatedReports);
    onUpdateWidgets(updatedWidgets);
    setEditingRole(null);
  };

  const toggleCardExpansion = (role: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [role]: !prev[role],
    }));
  };

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
                  ) : (
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
                  )}
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

      {/* Edit Role Modal - Only for non-admin roles */}
      {editingRole && editingRole.role !== "admin" && (
        <EditRolePermissionsModal
          role={editingRole.role}
          currentReports={reports}
          currentWidgets={widgets}
          onSave={handleSaveRole}
          onClose={() => setEditingRole(null)}
        />
      )}
    </div>
  );
};

// Edit Role Permissions Modal Component (unchanged)
interface EditRolePermissionsModalProps {
  role: string;
  currentReports: Report[];
  currentWidgets: Widget[];
  onSave: (reports: Report[], widgets: Widget[]) => void;
  onClose: () => void;
}

const EditRolePermissionsModal: React.FC<EditRolePermissionsModalProps> = ({
  role,
  currentReports,
  currentWidgets,
  onSave,
  onClose,
}) => {
  const [reports, setReports] = useState<Report[]>(currentReports);
  const [widgets, setWidgets] = useState<Widget[]>(currentWidgets);

  const handleReportToggle = (reportId: string, checked: boolean) => {
    setReports(
      reports.map((report) =>
        report.id === reportId
          ? {
              ...report,
              userRoles: checked
                ? [...report.userRoles, role]
                : report.userRoles.filter((r) => r !== role),
            }
          : report
      )
    );
  };

  const handleWidgetToggle = (widgetId: string, checked: boolean) => {
    setWidgets(
      widgets.map((widget) =>
        widget.id === widgetId
          ? {
              ...widget,
              userRoles: checked
                ? [...widget.userRoles, role]
                : widget.userRoles.filter((r) => r !== role),
            }
          : widget
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(reports, widgets);
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
          <button className="modern-close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modern-modal-content">
          <form onSubmit={handleSubmit} className="modern-form">
            <div className="form-section">
              <h3 className="section-title">Reports</h3>
              <div className="items-selection-grid">
                {reports.map((report) => (
                  <label key={report.id} className="modern-checkbox">
                    <input
                      type="checkbox"
                      checked={report.userRoles.includes(role)}
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
                      checked={widget.userRoles.includes(role)}
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

            <div className="modern-modal-footer">
              <button
                type="button"
                className="modal-btn modal-btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="modal-btn modal-btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserRolePermissions;
