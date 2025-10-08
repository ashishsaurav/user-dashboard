import React, { useState } from "react";
import {
  View,
  ViewGroup,
  User,
  UserNavigationSettings,
  Report,
  Widget,
} from "../../types";
import EditViewModal from "../EditViewModal";
import EditViewGroupModal from "../EditViewGroupModal";
import DeleteConfirmationModal from "../DeleteConfirmationModal";
import { useNotification } from "../NotificationProvider";
import { DeleteIcon, EditIcon, EyeIcon, ViewGroupIcon } from "../ui/Icons";

interface ViewGroupHoverPopupProps {
  viewGroup: ViewGroup;
  views: View[];
  position: { x: number; y: number };
  onViewSelect?: (view: View) => void;
  selectedView?: View | null;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  // New props for full functionality
  user?: User;
  allViews?: View[];
  allViewGroups?: ViewGroup[];
  userNavSettings?: UserNavigationSettings;
  reports?: Report[];
  widgets?: Widget[];
  onUpdateViews?: (views: View[]) => void;
  onUpdateViewGroups?: (viewGroups: ViewGroup[]) => void;
  onUpdateNavSettings?: (settings: UserNavigationSettings) => void;
  // Dock position for smart popup placement
  dockPosition?: "left" | "right";
}

const ViewGroupHoverPopup: React.FC<ViewGroupHoverPopupProps> = ({
  viewGroup,
  views,
  position,
  onViewSelect,
  selectedView,
  onMouseEnter,
  onMouseLeave,
  user,
  allViews = [],
  allViewGroups = [],
  userNavSettings,
  reports = [],
  widgets = [],
  onUpdateViews,
  onUpdateViewGroups,
  onUpdateNavSettings,
  dockPosition = "left",
}) => {
  // Modal states
  const [editingView, setEditingView] = useState<View | null>(null);
  const [editingViewGroup, setEditingViewGroup] = useState<ViewGroup | null>(
    null
  );
  const [deletingView, setDeletingView] = useState<View | null>(null);
  const [deletingViewGroup, setDeletingViewGroup] = useState<ViewGroup | null>(
    null
  );

  const { showSuccess, showWarning } = useNotification();

  const groupViews = views
    .filter((view) => viewGroup.viewIds.includes(view.id) && view.isVisible)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (groupViews.length === 0) return null;

  // Calculate popup style with dynamic positioning left/right based on available space
  // Assume popup width approx 300px, can be replaced with ref measurement for precision
  const popupWidth = 300;
  const screenWidth = window.innerWidth;

  let popupLeft: number | undefined = position.x;
  let popupRight: number | undefined = undefined;

  if (dockPosition === "right") {
    const spaceRight = screenWidth - position.x;
    if (spaceRight < popupWidth) {
      // Not enough space on right, switch popup to left side
      popupRight = screenWidth - position.x;
      popupLeft = undefined;
    }
  } else {
    // dockPosition left, normal placement left
    popupLeft = position.x;
    popupRight = undefined;
  }

  const popupStyle: React.CSSProperties = {
    position: "fixed",
    top: position.y,
    left: popupLeft,
    right: popupRight,
    width: popupWidth,
    zIndex: 1000,
  };

  // Action handlers
  const handleEditViewGroup = () => {
    setEditingViewGroup(viewGroup);
  };

  const handleDeleteViewGroup = () => {
    setDeletingViewGroup(viewGroup);
  };

  const handleHideViewGroup = () => {
    if (!userNavSettings || !onUpdateNavSettings) return;
    const updatedSettings = {
      ...userNavSettings,
      hiddenViewGroups: [...userNavSettings.hiddenViewGroups, viewGroup.id],
    };
    onUpdateNavSettings(updatedSettings);
    showSuccess("View group hidden successfully");
  };

  const handleEditView = (view: View) => {
    setEditingView(view);
  };

  const handleDeleteView = (view: View) => {
    setDeletingView(view);
  };

  const handleHideView = (view: View) => {
    if (!userNavSettings || !onUpdateNavSettings) return;
    const updatedSettings = {
      ...userNavSettings,
      hiddenViews: [...userNavSettings.hiddenViews, view.id],
    };
    onUpdateNavSettings(updatedSettings);
    showSuccess("View hidden successfully");
  };

  // Modal handlers - based on AllViewGroupsViews.tsx patterns
  const handleSaveViewGroup = (updatedViewGroup: ViewGroup) => {
    if (!onUpdateViewGroups) return;
    const updated = allViewGroups.map((vg) =>
      vg.id === updatedViewGroup.id ? updatedViewGroup : vg
    );
    onUpdateViewGroups(updated);
    setEditingViewGroup(null);
    showSuccess("View group updated successfully");
  };

  const handleSaveView = (updatedView: View) => {
    if (!onUpdateViews) return;
    const updated = allViews.map((v) =>
      v.id === updatedView.id ? updatedView : v
    );
    onUpdateViews(updated);
    setEditingView(null);
    showSuccess("View updated successfully");
  };

  // Delete handlers - matching AllViewGroupsViews.tsx pattern
  const handleDeleteViewGroupConfirm = (
    action?: "group-only" | "group-and-views"
  ) => {
    if (!deletingViewGroup || !action || !onUpdateViewGroups) return;

    const defaultGroup = allViewGroups.find((vg) => vg.isDefault);
    if (!defaultGroup && action === "group-only") {
      showWarning(
        "Error",
        "Default group not found. Cannot proceed with deletion."
      );
      return;
    }

    if (action === "group-only") {
      const updatedViewGroups = allViewGroups
        .map((vg) => {
          if (vg.isDefault) {
            return {
              ...vg,
              viewIds: [...vg.viewIds, ...deletingViewGroup.viewIds],
            };
          }
          return vg;
        })
        .filter((vg) => vg.id !== deletingViewGroup.id);

      onUpdateViewGroups(updatedViewGroups);
      showSuccess(
        "View Group Deleted",
        `"${deletingViewGroup.name}" deleted. Views moved to Default group.`
      );
    } else {
      const viewsToDelete = deletingViewGroup.viewIds;
      const updatedViews = allViews.filter(
        (v) => !viewsToDelete.includes(v.id)
      );
      const updatedViewGroups = allViewGroups.filter(
        (vg) => vg.id !== deletingViewGroup.id
      );

      if (onUpdateViews) onUpdateViews(updatedViews);
      onUpdateViewGroups(updatedViewGroups);
      showSuccess(
        "View Group and Views Deleted",
        `"${deletingViewGroup.name}" and all its views have been removed.`
      );
    }

    setDeletingViewGroup(null);
  };

  const handleConfirmDeleteView = () => {
    if (!deletingView || !onUpdateViews || !onUpdateViewGroups) return;

    // Remove view from all view groups
    const updatedViewGroups = allViewGroups.map((vg) => ({
      ...vg,
      viewIds: vg.viewIds.filter((id) => id !== deletingView.id),
    }));

    // Remove view from views array
    const updatedViews = allViews.filter((v) => v.id !== deletingView.id);

    onUpdateViews(updatedViews);
    onUpdateViewGroups(updatedViewGroups);
    setDeletingView(null);
    showSuccess("View deleted successfully");
  };

  const canModify = user?.role === "admin" || user?.role === "user";

  // Check if any modal is open
  const hasOpenModal =
    editingView || editingViewGroup || deletingView || deletingViewGroup;

  // Handle mouse leave - don't close if modal is open
  const handleMouseLeave = (e: React.MouseEvent) => {
    if (!hasOpenModal && onMouseLeave) {
      onMouseLeave();
    }
  };

  return (
    <>
      <div
        className="view-group-hover-popup"
        style={popupStyle}
        onMouseEnter={onMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Replicate exact NavigationPanel structure */}
        <div className="navigation-popup-content">
          {/* View Group - Exact NavigationPanel replica */}
          <div className="nav-group nav-group-vertical">
            <div className="nav-group-header nav-group-header-vertical">
              <div className="nav-group-info">
                <div className="nav-group-icon">
                  <ViewGroupIcon />
                </div>
                <div className="nav-group-title">{viewGroup.name}</div>
                {viewGroup.isDefault && (
                  <span className="default-badge">Default</span>
                )}
              </div>
              {canModify && (
                <div className="nav-group-actions">
                  <button
                    className="nav-action-btn visibility-btn"
                    onClick={handleHideViewGroup}
                    title="Hide from navigation"
                  >
                    <EyeIcon isVisible={true} />
                  </button>
                  <button
                    className="nav-action-btn edit-btn"
                    onClick={handleEditViewGroup}
                    title="Edit view group and manage views"
                  >
                    <EditIcon />
                  </button>
                  {!viewGroup.isDefault && (
                    <button
                      className="nav-action-btn delete-btn"
                      onClick={handleDeleteViewGroup}
                      title="Delete view group"
                    >
                      <DeleteIcon />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* View Group Content - Exact NavigationPanel replica */}
            <div className="nav-group-content nav-group-content-vertical">
              {groupViews.map((view) => {
                const viewReports = view.reportIds
                  .map((id) => reports.find((r) => r.id === id))
                  .filter(Boolean);
                const viewWidgets = view.widgetIds
                  .map((id) => widgets.find((w) => w.id === id))
                  .filter(Boolean);
                const isSelected = selectedView?.id === view.id;

                return (
                  <div
                    key={view.id}
                    className={`nav-view-item nav-view-item-vertical ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => onViewSelect?.(view)}
                  >
                    <div className="nav-view-info">
                      <div className="nav-view-content">
                        <div className="nav-view-title">{view.name}</div>
                        <div className="nav-view-meta">
                          {viewReports.length} Reports, {viewWidgets.length}{" "}
                          Widgets
                        </div>
                      </div>
                    </div>
                    {canModify && (
                      <div className="nav-view-actions">
                        <button
                          className="nav-action-btn visibility-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleHideView(view);
                          }}
                          title="Hide from navigation"
                        >
                          <EyeIcon isVisible={true} />
                        </button>
                        <button
                          className="nav-action-btn edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditView(view);
                          }}
                          title="Edit view"
                        >
                          <EditIcon />
                        </button>
                        <button
                          className="nav-action-btn delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteView(view);
                          }}
                          title="Delete view"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Panel Icons - Exact replicas */}
      {React.createElement(() => {
        const ViewGroupIcon = () => (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 3h18v18H3zM9 9h6v6H9z" />
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
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 1 2-2v-7" />
            <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        );

        const DeleteIcon = () => (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="3,6 5,6 21,6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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

        return null;
      })}

      {/* Modals - using correct props based on AllViewGroupsViews.tsx */}
      {editingViewGroup && (
        <EditViewGroupModal
          viewGroup={editingViewGroup}
          views={allViews}
          userRole={user?.role || "viewer"}
          onSave={handleSaveViewGroup}
          onClose={() => setEditingViewGroup(null)}
        />
      )}

      {editingView && (
        <EditViewModal
          view={editingView}
          reports={reports}
          widgets={widgets}
          userRole={user?.role || "viewer"}
          onSave={handleSaveView}
          onClose={() => setEditingView(null)}
        />
      )}

      {deletingViewGroup && (
        <DeleteConfirmationModal
          type="viewgroup"
          item={deletingViewGroup}
          onConfirm={handleDeleteViewGroupConfirm}
          onCancel={() => setDeletingViewGroup(null)}
        />
      )}

      {deletingView && (
        <DeleteConfirmationModal
          type="view"
          item={deletingView}
          onConfirm={handleConfirmDeleteView}
          onCancel={() => setDeletingView(null)}
        />
      )}
    </>
  );
};

export default ViewGroupHoverPopup;
