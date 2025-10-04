import React, { useState } from "react";
import { View, ViewGroup, User, UserNavigationSettings, Report, Widget } from "../../types";
import EditViewModal from "../EditViewModal";
import EditViewGroupModal from "../EditViewGroupModal";
import DeleteConfirmationModal from "../DeleteConfirmationModal";
import { useNotification } from "../NotificationProvider";

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
}) => {
  // Modal states
  const [editingView, setEditingView] = useState<View | null>(null);
  const [editingViewGroup, setEditingViewGroup] = useState<ViewGroup | null>(null);
  const [deletingView, setDeletingView] = useState<View | null>(null);
  const [deletingViewGroup, setDeletingViewGroup] = useState<ViewGroup | null>(null);

  const { showSuccess, showWarning } = useNotification();

  const groupViews = views.filter(view => 
    viewGroup.viewIds.includes(view.id) && view.isVisible
  ).sort((a, b) => (a.order || 0) - (b.order || 0));

  if (groupViews.length === 0) return null;

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
  const handleDeleteViewGroupConfirm = (action?: "group-only" | "group-and-views") => {
    if (!deletingViewGroup || !action || !onUpdateViewGroups) return;

    const defaultGroup = allViewGroups.find((vg) => vg.isDefault);
    if (!defaultGroup && action === "group-only") {
      showWarning("Error", "Default group not found. Cannot proceed with deletion.");
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
      showSuccess("View Group Deleted", `"${deletingViewGroup.name}" deleted. Views moved to Default group.`);
    } else {
      const viewsToDelete = deletingViewGroup.viewIds;
      const updatedViews = allViews.filter((v) => !viewsToDelete.includes(v.id));
      const updatedViewGroups = allViewGroups.filter((vg) => vg.id !== deletingViewGroup.id);

      if (onUpdateViews) onUpdateViews(updatedViews);
      onUpdateViewGroups(updatedViewGroups);
      showSuccess("View Group and Views Deleted", `"${deletingViewGroup.name}" and all its views have been removed.`);
    }

    setDeletingViewGroup(null);
  };

  const handleConfirmDeleteView = () => {
    if (!deletingView) return;
    handleDeleteView(deletingView);
    setDeletingView(null);
  };

  const canModify = user?.role === 'admin' || user?.role === 'user';

  return (
    <>
      <div 
        className="view-group-hover-popup"
        style={{
          position: "fixed",
          left: position.x,
          top: position.y,
          zIndex: 1000,
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="popup-header">
          <span className="popup-title">{viewGroup.name}</span>
          {canModify && (
            <div className="popup-header-actions">
              <button
                className="popup-action-btn edit-btn"
                onClick={handleEditViewGroup}
                title="Edit view group"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m18 2 4 4-14 14H4v-4z"/>
                  <path d="m14.5 5.5 4 4"/>
                </svg>
              </button>
              <button
                className="popup-action-btn hide-btn"
                onClick={handleHideViewGroup}
                title="Hide view group"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                  <path d="m10.73 5.08 1.46.77c4.29 2.27 6.78 5.61 6.78 9.15-1.31 1.91-2.83 3.47-4.58 4.7"/>
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12c1.31 1.91 2.83 3.47 4.58 4.7"/>
                  <line x1="2" y1="2" x2="22" y2="22"/>
                </svg>
              </button>
              <button
                className="popup-action-btn delete-btn"
                onClick={handleDeleteViewGroup}
                title="Delete view group"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m3 6 18 0"/>
                  <path d="m19 6 0 14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="m8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
              </button>
            </div>
          )}
        </div>
        <div className="popup-content">
          {groupViews.map((view) => (
            <div
              key={view.id}
              className={`popup-view-item ${
                selectedView?.id === view.id ? "selected" : ""
              }`}
              onClick={() => onViewSelect?.(view)}
            >
              <div className="view-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="9" y1="9" x2="15" y2="9"/>
                  <line x1="9" y1="13" x2="15" y2="13"/>
                </svg>
              </div>
              <div className="view-info">
                <span className="view-name">{view.name}</span>
                <div className="view-counts">
                  <span className="reports-count">{view.reportIds.length}R</span>
                  <span className="widgets-count">{view.widgetIds.length}W</span>
                </div>
              </div>
              {canModify && (
                <div className="view-actions">
                  <button
                    className="popup-action-btn edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditView(view);
                    }}
                    title="Edit view"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m18 2 4 4-14 14H4v-4z"/>
                      <path d="m14.5 5.5 4 4"/>
                    </svg>
                  </button>
                  <button
                    className="popup-action-btn hide-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHideView(view);
                    }}
                    title="Hide view"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                      <path d="m10.73 5.08 1.46.77c4.29 2.27 6.78 5.61 6.78 9.15-1.31 1.91-2.83 3.47-4.58 4.7"/>
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12c1.31 1.91 2.83 3.47 4.58 4.7"/>
                      <line x1="2" y1="2" x2="22" y2="22"/>
                    </svg>
                  </button>
                  <button
                    className="popup-action-btn delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteView(view);
                    }}
                    title="Delete view"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m3 6 18 0"/>
                      <path d="m19 6 0 14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                      <path d="m8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modals - using correct props based on AllViewGroupsViews.tsx */}
      {editingViewGroup && (
        <EditViewGroupModal
          viewGroup={editingViewGroup}
          views={allViews}
          userRole={user?.role || 'viewer'}
          onSave={handleSaveViewGroup}
          onClose={() => setEditingViewGroup(null)}
        />
      )}

      {editingView && (
        <EditViewModal
          view={editingView}
          reports={reports}
          widgets={widgets}
          userRole={user?.role || 'viewer'}
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