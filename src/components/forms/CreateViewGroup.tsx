import React, { useState, useMemo } from "react";
import { User, View, ViewGroup, UserNavigationSettings } from "../../types";
import { useNotification } from "../common/NotificationProvider";

interface CreateViewGroupProps {
  user: User;
  views: View[];
  userNavSettings?: UserNavigationSettings[];
  onAddViewGroup: (viewGroup: ViewGroup) => void;
  onUpdateNavSettings?: (settings: UserNavigationSettings) => void;
}

// Define interface for form data to fix TypeScript inference
interface CreateViewGroupFormData {
  name: string;
  viewIds: string[];
}

const CreateViewGroup: React.FC<CreateViewGroupProps> = ({
  user,
  views,
  userNavSettings = [],
  onAddViewGroup,
  onUpdateNavSettings,
}) => {
  // Fix: Explicitly type the form data
  const [formData, setFormData] = useState<CreateViewGroupFormData>({
    name: "",
    viewIds: [] as string[], // Explicit type annotation
  });

  const { showSuccess } = useNotification();


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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

    showSuccess(
      "View Group Created Successfully!",
      `"${formData.name}" has been created and is ready to organize your views.`
    );

    setFormData({
      name: "",
      viewIds: [] as string[],
    });
  };

  const handleViewToggle = (viewId: string, checked: boolean) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      viewIds: checked
        ? [...prevFormData.viewIds, viewId]
        : prevFormData.viewIds.filter((id) => id !== viewId),
    }));
  };

  // Toggle visibility by updating View.isVisible via API
  const handleVisibilityToggle = async (viewId: string) => {
    const view = views.find(v => v.id === viewId);
    if (!view) return;

    try {
      const viewsService = await import('../../services/viewsService');
      await viewsService.viewsService.updateView(view.id, user.name, {
        name: view.name,
        isVisible: !view.isVisible,
        orderIndex: view.order || 0,
      });

      showSuccess(
        view.isVisible ? "View hidden" : "View shown",
        `"${view.name}" ${view.isVisible ? 'will be hidden' : 'will be shown'} in navigation`
      );
    } catch (error) {
      // Silent fail for create form
    }
  };

  // Check if view is hidden (using View.isVisible)
  const isViewHidden = (viewId: string): boolean => {
    const view = views.find(v => v.id === viewId);
    return view ? !view.isVisible : false;
  };

  // Icons - same as EditViewGroupModal
  const CreateIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );

  const EyeIcon = ({ isVisible }: { isVisible: boolean }) =>
    isVisible ? (
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
    ) : (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    );

  return (
    <form onSubmit={handleSubmit} className="modern-form">
      <div className="form-header">
        <div className="header-left">
          <div className="header-icon-container">
            <CreateIcon />
          </div>
          <div className="header-content">
            <h2>Create View Group</h2>
            <p>Group related views together for better organization</p>
          </div>
        </div>
      </div>

      {/* View Group Name Section */}
      <div className="form-section">
        <h3>View Group Information</h3>
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            View Group Name
          </label>
          <input
            type="text"
            id="name"
            className="form-input"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Enter view group name"
            required
          />
        </div>
      </div>

      {/* Views Section with Visibility Toggle */}
      <div className="form-section">
        <h3>Select Views</h3>
        <p className="section-description">
          Choose views for this group and control their navigation visibility
        </p>
        <div className="views-container-modal">
          {views.length > 0 ? (
            views.map((view) => {
              const isInGroup = formData.viewIds.includes(view.id);
              const isHidden = isViewHidden(view.id);

              return (
                <div key={view.id} className="view-row-modal">
                  {/* Left: Checkbox and view info */}
                  <div className="view-info-section">
                    <input
                      type="checkbox"
                      id={`view-${view.id}`}
                      className="view-checkbox"
                      checked={isInGroup}
                      onChange={(e) =>
                        handleViewToggle(view.id, e.target.checked)
                      }
                    />
                    <label
                      htmlFor={`view-${view.id}`}
                      className="view-info-label"
                    >
                      <span className="view-name">{view.name}</span>
                      <span className="view-meta">
                        {view.reportIds?.length || 0} Reports,{" "}
                        {view.widgetIds?.length || 0} Widgets
                      </span>
                    </label>
                  </div>

                  {/* Right: Visibility toggle button (icon only) - ALWAYS SHOWN */}
                  {onUpdateNavSettings && user && (
                    <button
                      type="button"
                      className={`visibility-btn-modal ${
                        isHidden ? "hidden" : "visible"
                      }`}
                      onClick={() => handleVisibilityToggle(view.id)}
                      title={
                        isHidden ? "Show in navigation" : "Hide from navigation"
                      }
                    >
                      <EyeIcon isVisible={!isHidden} />
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="no-views-message">
              <p>No views available. Create some views first.</p>
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        title="Create View Group"
        className="floating-create-btn"
      >
        <CreateIcon />
      </button>
    </form>
  );
};

export default CreateViewGroup;
