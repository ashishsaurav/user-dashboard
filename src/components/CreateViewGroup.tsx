import React, { useState } from "react";
import { User, View, ViewGroup, ViewGroupFormData } from "../types";
import { useNotification } from "./NotificationProvider";

interface CreateViewGroupProps {
  user: User;
  views: View[];
  onAddViewGroup: (viewGroup: ViewGroup) => void;
}

const CreateViewGroup: React.FC<CreateViewGroupProps> = ({
  user,
  views,
  onAddViewGroup,
}) => {
  const [formData, setFormData] = useState<ViewGroupFormData>({
    name: "",
    viewIds: [],
  });

  const { showSuccess } = useNotification();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 5);
    const autoId = `${user.name}-viewgroup-${timestamp}-${randomSuffix}`;

    const newViewGroup: ViewGroup = {
      id: autoId,
      ...formData,
      isVisible: true,
      order: Date.now(),
      isDefault: false,
      createdBy: user.name,
    };

    onAddViewGroup(newViewGroup);

    console.log("Creating new view group:", newViewGroup);

    // Show beautiful success notification
    showSuccess(
      "View Group Created Successfully!",
      `"${formData.name}" has been created and is ready to organize your views.`
    );

    // Reset form
    setFormData({
      name: "",
      viewIds: [],
    });
  };

  const handleViewToggle = (viewId: string, checked: boolean) => {
    setFormData({
      ...formData,
      viewIds: checked
        ? [...formData.viewIds, viewId]
        : formData.viewIds.filter((id) => id !== viewId),
    });
  };

  const CreateIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );

  return (
    <div className="create-form-container">
      <div className="create-form-header">
        <h2>Create View Group</h2>
        <p>Group related views together for better organization</p>
      </div>

      <div className="create-form-wrapper">
        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-section">
            <h3 className="section-title">View Group Information</h3>

            <div className="form-row">
              <div className="input-group">
                <label className="modern-label">View Group Name</label>
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
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Select Views</h3>
            <div className="selection-grid">
              {views.length > 0 ? (
                views.map((view) => (
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
                ))
              ) : (
                <div className="no-items">
                  <p>No views available. Create some views first.</p>
                </div>
              )}
            </div>
          </div>
        </form>
        <button
          type="submit"
          onClick={handleSubmit}
          className="floating-create-btn"
          title="Create View Group"
          disabled={!formData.name.trim()}
        >
          <CreateIcon />
        </button>
      </div>
    </div>
  );
};

export default CreateViewGroup;
