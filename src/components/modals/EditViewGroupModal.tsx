import React, { useState, useMemo } from "react";
import { ViewGroup, View, UserNavigationSettings } from "../../types";
import { viewGroupsService } from "../../services/viewGroupsService";
import { useNotification } from "../common/NotificationProvider";

interface EditViewGroupModalProps {
  viewGroup: ViewGroup;
  views: View[];
  userRole: string;
  userNavSettings?: UserNavigationSettings[];
  user?: { name: string };
  onSave: (viewGroup: ViewGroup) => void;
  onClose: () => void;
  onUpdateNavSettings?: (settings: UserNavigationSettings) => void; // Changed to single object
}

const EditViewGroupModal: React.FC<EditViewGroupModalProps> = ({
  viewGroup,
  views,
  userRole,
  userNavSettings = [],
  user,
  onSave,
  onClose,
  onUpdateNavSettings,
}) => {
  const [formData, setFormData] = useState({
    ...viewGroup,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  // Get current user settings - this will sync with base data
  const currentSettings = useMemo((): UserNavigationSettings => {
    const settings = userNavSettings.find((s) => s.userId === user?.name);
    return (
      settings || {
        userId: user?.name || "",
        viewGroupOrder: [],
        viewOrders: {},
        hiddenViewGroups: [],
        hiddenViews: [],
      }
    );
  }, [userNavSettings, user?.name]);

  // Initialize local hidden views with CURRENT base data - will sync properly
  const [localHiddenViews, setLocalHiddenViews] = useState<string[]>(() => {
    console.log(
      "Initializing local hidden views:",
      currentSettings.hiddenViews
    );
    return [...currentSettings.hiddenViews]; // Create a copy to avoid mutation
  });

  // Reset local state when modal reopens with new data
  React.useEffect(() => {
    console.log("Syncing with new base data:", currentSettings.hiddenViews);
    setLocalHiddenViews([...currentSettings.hiddenViews]);
  }, [viewGroup.id]); // Only reset when editing a different viewgroup

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Saving changes:", {
        viewGroup: formData,
        hiddenViews: localHiddenViews,
        originalHidden: currentSettings.hiddenViews,
      });

      // 1. Update view group name and basic info
      await viewGroupsService.updateViewGroup(formData.id, user?.name || '', {
        name: formData.name,
        isVisible: formData.isVisible,
        isDefault: formData.isDefault,
        orderIndex: formData.order || 0,
      });

      // 2. Update views in group - calculate what to add/remove
      const originalViewIds = viewGroup.viewIds;
      const newViewIds = formData.viewIds;
      
      const viewsToAdd = newViewIds.filter(id => !originalViewIds.includes(id));
      const viewsToRemove = originalViewIds.filter(id => !newViewIds.includes(id));

      // Add new views
      if (viewsToAdd.length > 0) {
        await viewGroupsService.addViewsToGroup(formData.id, user?.name || '', viewsToAdd);
      }

      // Remove views
      for (const viewId of viewsToRemove) {
        await viewGroupsService.removeViewFromGroup(formData.id, viewId, user?.name || '');
      }

      showSuccess(
        "View Group Updated",
        `"${formData.name}" has been updated with ${formData.viewIds.length} views`
      );

      // Save the view group changes
      onSave(formData);

      // Save visibility changes if there are any changes
      if (onUpdateNavSettings && user) {
        const updatedSettings = {
          ...currentSettings,
          hiddenViews: localHiddenViews,
        };

        console.log("Updating navigation settings:", updatedSettings);
        onUpdateNavSettings(updatedSettings);
      }
    } catch (error) {
      console.error("Failed to update view group:", error);
      showError("Update Failed", "Could not update view group. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewToggle = (viewId: string, checked: boolean) => {
    setFormData({
      ...formData,
      viewIds: checked
        ? [...formData.viewIds, viewId]
        : formData.viewIds.filter((id) => id !== viewId),
    });
  };

  // LOCAL VISIBILITY TOGGLE: Update local state only
  const handleVisibilityToggle = (viewId: string) => {
    setLocalHiddenViews((prev) => {
      const isCurrentlyHidden = prev.includes(viewId);
      const newState = isCurrentlyHidden
        ? prev.filter((id) => id !== viewId) // Show view
        : [...prev, viewId]; // Hide view

      console.log(`Toggling view ${viewId}:`, {
        wasHidden: isCurrentlyHidden,
        newHidden: !isCurrentlyHidden,
        newState,
      });

      return newState;
    });
  };

  // Check if view is hidden (using local state)
  const isViewHidden = (viewId: string): boolean => {
    const hidden = localHiddenViews.includes(viewId);
    // console.log(`View ${viewId} is hidden:`, hidden);
    return hidden;
  };

  // Icons
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
    <div className="modern-modal-overlay">
      <div className="modern-modal-container edit-viewgroup-container">
        <div className="modern-modal-header">
          <div className="modal-header-content">
            <ViewGroupIcon />
            <div className="modal-header-text">
              <h2>Edit View Group</h2>
              <p>Modify view group details and control view visibility</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modern-modal-content">
          {/* View Group Name Section */}
          <div className="form-section">
            <h3>View Group Information</h3>
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                View Group Name
                {viewGroup.isDefault && (
                  <span className="default-badge">Default</span>
                )}
              </label>
              <input
                type="text"
                id="name"
                className="form-input"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter view group name"
                required
              />
              {viewGroup.isDefault && (
                <p className="form-help">
                  This is the default view group. You can rename it, but it will
                  remain as the default group.
                </p>
              )}
            </div>
          </div>

          {/* Views Section */}
          <div className="form-section">
            <h3>Views in Group ({formData.viewIds.length} selected)</h3>
            <p className="section-description">
              Select which views belong to this group and control their
              navigation visibility
            </p>
            <div className="views-container-modal">
              {views.length === 0 ? (
                <div className="no-views-message">
                  <p>
                    No views available. Create views first to add them to this
                    group.
                  </p>
                </div>
              ) : (
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
                      <button
                        type="button"
                        className={`visibility-btn-modal ${
                          isHidden ? "hidden" : "visible"
                        }`}
                        onClick={() => handleVisibilityToggle(view.id)}
                        title={
                          isHidden
                            ? "Show in navigation"
                            : "Hide from navigation"
                        }
                      >
                        <EyeIcon isVisible={!isHidden} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="modern-modal-footer">
            <button
              type="button"
              className="modal-btn modal-btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="modal-btn modal-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditViewGroupModal;
