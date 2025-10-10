import React, { useState } from "react";
import { CloseIcon, ReportsIcon, WidgetsIcon } from "../ui/Icons";

interface EditItemModalProps<T extends { id: string; name: string; url: string; userRoles: string[]; type: "Report" | "Widget" }> {
  item: T;
  itemType: "Report" | "Widget";
  onSave: (item: T) => void;
  onClose: () => void;
}

export function EditItemModal<T extends { id: string; name: string; url: string; userRoles: string[]; type: "Report" | "Widget" }>({
  item,
  itemType,
  onSave,
  onClose,
}: EditItemModalProps<T>) {
  const [formData, setFormData] = useState<T>({
    ...item,
    userRoles: item.userRoles.includes("admin")
      ? item.userRoles
      : [...item.userRoles, "admin"],
  } as T);

  const availableRoles = ["admin", "user", "viewer"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedItem = {
      ...formData,
      userRoles: formData.userRoles.includes("admin")
        ? formData.userRoles
        : [...formData.userRoles, "admin"],
    } as T;
    onSave(updatedItem);
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    if (role === "admin") return;

    setFormData({
      ...formData,
      userRoles: checked
        ? [...formData.userRoles, role]
        : formData.userRoles.filter((r) => r !== role),
    } as T);
  };

  const ItemIcon = itemType === "Report" ? ReportsIcon : WidgetsIcon;

  return (
    <div className="modern-modal-overlay">
      <div className="modern-modal">
        <div className="modern-modal-header">
          <div className="header-left">
            <div className="header-icon-container">
              <ItemIcon />
            </div>
            <div>
              <h2>Edit {itemType}</h2>
              <p>Modify {itemType.toLowerCase()} details and permissions</p>
            </div>
          </div>
          <button className="modern-close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modern-modal-content">
          <form onSubmit={handleSubmit} className="modern-form">
            <div className="form-section">
              <h3 className="section-title">{itemType} Information</h3>

              <div className="form-row">
                <div className="input-group">
                  <label className="modern-label">{itemType} Name</label>
                  <input
                    type="text"
                    className="modern-input"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value } as T)
                    }
                    placeholder={`Enter ${itemType.toLowerCase()} name`}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label className="modern-label">{itemType} URL</label>
                  <input
                    type="url"
                    className="modern-input"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value } as T)
                    }
                    placeholder={`https://example.com/${itemType.toLowerCase()}`}
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
                        disabled={role === "admin"}
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
}
