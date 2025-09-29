import React, { useState } from "react";
import { ViewGroup, View } from "../types";

interface EditViewGroupModalProps {
  viewGroup: ViewGroup;
  views: View[];
  userRole: string;
  onSave: (viewGroup: ViewGroup) => void;
  onClose: () => void;
}

const EditViewGroupModal: React.FC<EditViewGroupModalProps> = ({
  viewGroup,
  views,
  userRole,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<ViewGroup>({
    ...viewGroup,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleViewToggle = (viewId: string, checked: boolean) => {
    setFormData({
      ...formData,
      viewIds: checked
        ? [...formData.viewIds, viewId]
        : formData.viewIds.filter((id) => id !== viewId),
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

  const ViewGroupIcon = () => (
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
              <ViewGroupIcon />
            </div>
            <div>
              <h2>Edit View Group</h2>
              <p>Modify view group details and views</p>
            </div>
          </div>
          <button className="modern-close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modern-modal-content">
          <form onSubmit={handleSubmit} className="modern-form">
            <div className="form-section">
              <h3 className="section-title">View Group Information</h3>

              <div className="form-row">
                <div className="input-group">
                  <label className="modern-label">
                    View Group Name
                    {viewGroup.isDefault && (
                      <span className="default-badge">Default</span>
                    )}
                  </label>
                  <input
                    type="text"
                    className="modern-input"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter view group name"
                    required
                  />
                  {viewGroup.isDefault && (
                    <p className="form-note">
                      This is the default view group. You can rename it, but it
                      will remain as the default group.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Views</h3>
              <div className="items-selection-grid">
                {views.map((view) => (
                  <label key={view.id} className="modern-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.viewIds.includes(view.id)}
                      onChange={(e) =>
                        handleViewToggle(view.id, e.target.checked)
                      }
                    />
                    <span className="checkmark"></span>
                    <span className="checkbox-label">{view.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="modern-form-actions-fixed">
              <button
                type="button"
                className="modern-btn secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="modern-btn primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditViewGroupModal;
