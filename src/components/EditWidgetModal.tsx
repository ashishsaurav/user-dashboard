import React, { useState } from "react";
import { Widget } from "../types";

interface EditWidgetModalProps {
  widget: Widget;
  onSave: (widget: Widget) => void;
  onClose: () => void;
}

const EditWidgetModal: React.FC<EditWidgetModalProps> = ({
  widget,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<Widget>({
    ...widget,
    userRoles: widget.userRoles.includes("admin")
      ? widget.userRoles
      : [...widget.userRoles, "admin"],
  });
  const availableRoles = ["admin", "user", "viewer"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure admin is always included
    const updatedWidget = {
      ...formData,
      userRoles: formData.userRoles.includes("admin")
        ? formData.userRoles
        : [...formData.userRoles, "admin"],
    };
    onSave(updatedWidget);
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    // Prevent any changes to admin role
    if (role === "admin") {
      return;
    }

    setFormData({
      ...formData,
      userRoles: checked
        ? [...formData.userRoles, role]
        : formData.userRoles.filter((r) => r !== role),
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
    <div className="modern-modal-overlay">
      <div className="modern-modal">
        <div className="modern-modal-header">
          <div className="header-left">
            <div className="header-icon-container">
              <WidgetIcon />
            </div>
            <div>
              <h2>Edit Widget</h2>
              <p>Modify widget details and permissions</p>
            </div>
          </div>
          <button className="modern-close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modern-modal-content">
          <form onSubmit={handleSubmit} className="modern-form">
            <div className="form-section">
              <h3 className="section-title">Widget Information</h3>

              <div className="form-row">
                <div className="input-group">
                  <label className="modern-label">Widget Name</label>
                  <input
                    type="text"
                    className="modern-input"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter widget name"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label className="modern-label">Widget URL</label>
                  <input
                    type="url"
                    className="modern-input"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    placeholder="https://example.com/widget"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Access Permissions</h3>

              <div className="permission-section">
                <label className="modern-label">User Roles</label>
                <p className="admin-notice">
                  Admin role is automatically selected and cannot be changed
                </p>
                <div className="checkbox-grid">
                  {availableRoles.map((role) => (
                    <label
                      key={role}
                      className={`modern-checkbox ${
                        role === "admin" ? "admin-locked disabled" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.userRoles.includes(role)}
                        onChange={(e) =>
                          handleRoleChange(role, e.target.checked)
                        }
                        disabled={role === "admin"} // Admin role is always disabled
                      />
                      <span className="checkmark"></span>
                      <span className="checkbox-label">
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                        {role === "admin" && (
                          <span className="locked-indicator">🔒</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
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

export default EditWidgetModal;
