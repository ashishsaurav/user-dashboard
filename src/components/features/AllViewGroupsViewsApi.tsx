/**
 * AllViewGroupsViews Component - API-Connected Version
 * Manages views and view groups with ordering, show/hide, and CRUD operations
 */

import React, { useState } from "react";
import {
  User,
  View,
  ViewGroup,
  Report,
  Widget,
} from "../../types";
import { viewsService } from "../../services/viewsService";
import { viewGroupsService } from "../../services/viewGroupsService";
import EditViewModal from "../modals/EditViewModal";
import EditViewGroupModal from "../modals/EditViewGroupModal";
import DeleteConfirmationModal from "../modals/DeleteConfirmationModal";
import { useNotification } from "../common/NotificationProvider";

interface AllViewGroupsViewsApiProps {
  user: User;
  views: View[];
  viewGroups: ViewGroup[];
  reports: Report[];
  widgets: Widget[];
  onRefresh: () => void;
}

const AllViewGroupsViewsApi: React.FC<AllViewGroupsViewsApiProps> = ({
  user,
  views,
  viewGroups,
  reports,
  widgets,
  onRefresh,
}) => {
  const [expandedViewGroups, setExpandedViewGroups] = useState<{
    [key: string]: boolean;
  }>({});
  const [editingView, setEditingView] = useState<View | null>(null);
  const [editingViewGroup, setEditingViewGroup] = useState<ViewGroup | null>(null);
  const [deletingViewGroup, setDeletingViewGroup] = useState<ViewGroup | null>(null);
  const [deletingView, setDeletingView] = useState<View | null>(null);
  const [loading, setLoading] = useState(false);

  const { showSuccess, showError } = useNotification();

  const toggleViewGroup = (viewGroupId: string) => {
    setExpandedViewGroups((prev) => ({
      ...prev,
      [viewGroupId]: !prev[viewGroupId],
    }));
  };

  // Get views for a view group
  const getViewsForGroup = (viewGroupId: string): View[] => {
    const viewGroup = viewGroups.find((vg) => vg.id === viewGroupId);
    if (!viewGroup) return [];
    
    return viewGroup.viewIds
      .map((viewId) => views.find((v) => v.id === viewId))
      .filter((v): v is View => v !== undefined)
      .sort((a, b) => a.order - b.order);
  };

  // Handle visibility toggle
  const handleToggleVisibility = async (
    item: View | ViewGroup,
    type: "view" | "viewgroup"
  ) => {
    setLoading(true);
    try {
      if (type === "viewgroup") {
        const vg = item as ViewGroup;
        await viewGroupsService.updateViewGroup(vg.id, user.name, {
          name: vg.name,
          isVisible: !vg.isVisible,
          isDefault: vg.isDefault,
          orderIndex: vg.order,
        });
        showSuccess(
          vg.isVisible ? "View group hidden" : "View group shown",
          `"${vg.name}" is now ${vg.isVisible ? "hidden" : "visible"}`
        );
      } else {
        const v = item as View;
        await viewsService.updateView(v.id, user.name, {
          name: v.name,
          isVisible: !v.isVisible,
          orderIndex: v.order,
        });
        showSuccess(
          v.isVisible ? "View hidden" : "View shown",
          `"${v.name}" is now ${v.isVisible ? "hidden" : "visible"}`
        );
      }
      onRefresh();
    } catch (error) {
      console.error("Failed to toggle visibility:", error);
      showError("Failed to update visibility", "Please try again");
    } finally {
      setLoading(false);
    }
  };

  // Handle move up
  const handleMoveUp = async (
    item: View | ViewGroup,
    type: "view" | "viewgroup",
    currentIndex: number,
    parentViewGroupId?: string
  ) => {
    if (currentIndex === 0) return;

    setLoading(true);
    try {
      if (type === "viewgroup") {
        // Reorder view groups
        const sortedGroups = [...viewGroups].sort((a, b) => a.order - b.order);
        const items = sortedGroups.map((vg, idx) => ({
          id: vg.id,
          orderIndex: idx === currentIndex ? idx - 1 : idx === currentIndex - 1 ? idx + 1 : idx,
        }));
        await viewGroupsService.reorderViewGroups(user.name, items);
        showSuccess("View group moved up");
      } else {
        // Reorder views within a view group
        if (!parentViewGroupId) return;
        const groupViews = getViewsForGroup(parentViewGroupId);
        const items = groupViews.map((v, idx) => ({
          id: v.id,
          orderIndex: idx === currentIndex ? idx - 1 : idx === currentIndex - 1 ? idx + 1 : idx,
        }));
        await viewGroupsService.reorderViewsInGroup(parentViewGroupId, user.name, items);
        showSuccess("View moved up");
      }
      onRefresh();
    } catch (error) {
      console.error("Failed to move:", error);
      showError("Failed to reorder", "Please try again");
    } finally {
      setLoading(false);
    }
  };

  // Handle move down
  const handleMoveDown = async (
    item: View | ViewGroup,
    type: "view" | "viewgroup",
    currentIndex: number,
    maxIndex: number,
    parentViewGroupId?: string
  ) => {
    if (currentIndex >= maxIndex - 1) return;

    setLoading(true);
    try {
      if (type === "viewgroup") {
        // Reorder view groups
        const sortedGroups = [...viewGroups].sort((a, b) => a.order - b.order);
        const items = sortedGroups.map((vg, idx) => ({
          id: vg.id,
          orderIndex: idx === currentIndex ? idx + 1 : idx === currentIndex + 1 ? idx - 1 : idx,
        }));
        await viewGroupsService.reorderViewGroups(user.name, items);
        showSuccess("View group moved down");
      } else {
        // Reorder views within a view group
        if (!parentViewGroupId) return;
        const groupViews = getViewsForGroup(parentViewGroupId);
        const items = groupViews.map((v, idx) => ({
          id: v.id,
          orderIndex: idx === currentIndex ? idx + 1 : idx === currentIndex + 1 ? idx - 1 : idx,
        }));
        await viewGroupsService.reorderViewsInGroup(parentViewGroupId, user.name, items);
        showSuccess("View moved down");
      }
      onRefresh();
    } catch (error) {
      console.error("Failed to move:", error);
      showError("Failed to reorder", "Please try again");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit view group
  const handleEditViewGroup = (viewGroup: ViewGroup) => {
    setEditingViewGroup(viewGroup);
  };

  // Handle save view group
  const handleSaveViewGroup = async (updatedViewGroup: ViewGroup) => {
    setLoading(true);
    try {
      await viewGroupsService.updateViewGroup(updatedViewGroup.id, user.name, {
        name: updatedViewGroup.name,
        isVisible: updatedViewGroup.isVisible,
        isDefault: updatedViewGroup.isDefault,
        orderIndex: updatedViewGroup.order,
      });
      showSuccess("View group updated", `"${updatedViewGroup.name}" has been saved`);
      setEditingViewGroup(null);
      onRefresh();
    } catch (error) {
      console.error("Failed to update view group:", error);
      showError("Failed to update view group", "Please try again");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit view
  const handleEditView = (view: View) => {
    setEditingView(view);
  };

  // Handle save view
  const handleSaveView = async (updatedView: View) => {
    setLoading(true);
    try {
      await viewsService.updateView(updatedView.id, user.name, {
        name: updatedView.name,
        isVisible: updatedView.isVisible,
        orderIndex: updatedView.order,
      });
      showSuccess("View updated", `"${updatedView.name}" has been saved`);
      setEditingView(null);
      onRefresh();
    } catch (error) {
      console.error("Failed to update view:", error);
      showError("Failed to update view", "Please try again");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete view group
  const handleDeleteViewGroup = async () => {
    if (!deletingViewGroup) return;

    setLoading(true);
    try {
      await viewGroupsService.deleteViewGroup(deletingViewGroup.id, user.name);
      showSuccess("View group deleted", `"${deletingViewGroup.name}" has been removed`);
      setDeletingViewGroup(null);
      onRefresh();
    } catch (error) {
      console.error("Failed to delete view group:", error);
      showError("Failed to delete view group", "Please try again");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete view
  const handleDeleteView = async () => {
    if (!deletingView) return;

    setLoading(true);
    try {
      await viewsService.deleteView(deletingView.id, user.name);
      showSuccess("View deleted", `"${deletingView.name}" has been removed`);
      setDeletingView(null);
      onRefresh();
    } catch (error) {
      console.error("Failed to delete view:", error);
      showError("Failed to delete view", "Please try again");
    } finally {
      setLoading(false);
    }
  };

  // Icons
  const EyeIcon = ({ isVisible }: { isVisible: boolean }) =>
    isVisible ? (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ) : (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    );

  const EditIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="m18.5 2.5 2.1 2.1L12 13.2l-3.3.8.8-3.3L18.5 2.5z" />
    </svg>
  );

  const DeleteIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3,6 5,6 21,6" />
      <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
    </svg>
  );

  const ArrowUpIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );

  const ArrowDownIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M19 12l-7 7-7-7" />
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

  const sortedViewGroups = [...viewGroups].sort((a, b) => a.order - b.order);

  return (
    <div className="modern-dashboard-container">
      <div className="dashboard-sections">
        <div className="dashboard-card" style={{ maxWidth: "100%" }}>
          <div className="card-header">
            <div className="header-content">
              <h3>All View Groups & Views</h3>
              <span className="item-count">
                {viewGroups.length} groups, {views.length} views
              </span>
            </div>
          </div>

          <div className="card-content">
            <div className="items-list">
              {sortedViewGroups.map((viewGroup, vgIndex) => {
                const groupViews = getViewsForGroup(viewGroup.id);
                const isExpanded = expandedViewGroups[viewGroup.id];

                return (
                  <div key={viewGroup.id} className="view-group-item" style={{ marginBottom: "12px" }}>
                    {/* View Group Header */}
                    <div
                      className="dashboard-item"
                      style={{
                        backgroundColor: isExpanded ? "var(--bg-secondary)" : "transparent",
                        borderLeft: "3px solid var(--primary-color)",
                      }}
                    >
                      <div className="item-info" style={{ flex: 1 }}>
                        <button
                          onClick={() => toggleViewGroup(viewGroup.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "0 8px 0 0",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <ChevronIcon expanded={isExpanded} />
                        </button>
                        <span className="item-name" style={{ fontWeight: "600" }}>
                          {viewGroup.name}
                        </span>
                        <span style={{ color: "var(--text-secondary)", fontSize: "12px", marginLeft: "8px" }}>
                          ({groupViews.length} views)
                        </span>
                        {!viewGroup.isVisible && (
                          <span
                            style={{
                              marginLeft: "8px",
                              fontSize: "11px",
                              color: "var(--warning-color)",
                              fontWeight: "500",
                            }}
                          >
                            Hidden
                          </span>
                        )}
                      </div>
                      <div className="item-actions">
                        <button
                          className="edit-btn-compact"
                          onClick={() => handleMoveUp(viewGroup, "viewgroup", vgIndex, undefined)}
                          title="Move up"
                          disabled={loading || vgIndex === 0}
                          style={{ opacity: vgIndex === 0 ? 0.3 : 1 }}
                        >
                          <ArrowUpIcon />
                        </button>
                        <button
                          className="edit-btn-compact"
                          onClick={() =>
                            handleMoveDown(viewGroup, "viewgroup", vgIndex, sortedViewGroups.length, undefined)
                          }
                          title="Move down"
                          disabled={loading || vgIndex === sortedViewGroups.length - 1}
                          style={{ opacity: vgIndex === sortedViewGroups.length - 1 ? 0.3 : 1 }}
                        >
                          <ArrowDownIcon />
                        </button>
                        <button
                          className="edit-btn-compact"
                          onClick={() => handleToggleVisibility(viewGroup, "viewgroup")}
                          title={viewGroup.isVisible ? "Hide" : "Show"}
                          disabled={loading}
                        >
                          <EyeIcon isVisible={viewGroup.isVisible} />
                        </button>
                        <button
                          className="edit-btn-compact"
                          onClick={() => handleEditViewGroup(viewGroup)}
                          title="Edit view group"
                          disabled={loading}
                        >
                          <EditIcon />
                        </button>
                        <button
                          className="delete-btn-compact"
                          onClick={() => setDeletingViewGroup(viewGroup)}
                          title="Delete view group"
                          disabled={loading}
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </div>

                    {/* Views in Group */}
                    {isExpanded && (
                      <div style={{ paddingLeft: "32px", marginTop: "8px" }}>
                        {groupViews.length === 0 ? (
                          <div
                            style={{
                              padding: "12px",
                              color: "var(--text-secondary)",
                              fontSize: "13px",
                              fontStyle: "italic",
                            }}
                          >
                            No views in this group
                          </div>
                        ) : (
                          groupViews.map((view, viewIndex) => (
                            <div
                              key={view.id}
                              className="dashboard-item"
                              style={{ marginBottom: "4px", backgroundColor: "var(--bg-tertiary)" }}
                            >
                              <div className="item-info">
                                <span className="item-name">{view.name}</span>
                                <span style={{ color: "var(--text-secondary)", fontSize: "11px", marginLeft: "8px" }}>
                                  {view.reportIds.length} reports, {view.widgetIds.length} widgets
                                </span>
                                {!view.isVisible && (
                                  <span
                                    style={{
                                      marginLeft: "8px",
                                      fontSize: "10px",
                                      color: "var(--warning-color)",
                                      fontWeight: "500",
                                    }}
                                  >
                                    Hidden
                                  </span>
                                )}
                              </div>
                              <div className="item-actions">
                                <button
                                  className="edit-btn-compact"
                                  onClick={() => handleMoveUp(view, "view", viewIndex, viewGroup.id)}
                                  title="Move up"
                                  disabled={loading || viewIndex === 0}
                                  style={{ opacity: viewIndex === 0 ? 0.3 : 1 }}
                                >
                                  <ArrowUpIcon />
                                </button>
                                <button
                                  className="edit-btn-compact"
                                  onClick={() =>
                                    handleMoveDown(view, "view", viewIndex, groupViews.length, viewGroup.id)
                                  }
                                  title="Move down"
                                  disabled={loading || viewIndex === groupViews.length - 1}
                                  style={{ opacity: viewIndex === groupViews.length - 1 ? 0.3 : 1 }}
                                >
                                  <ArrowDownIcon />
                                </button>
                                <button
                                  className="edit-btn-compact"
                                  onClick={() => handleToggleVisibility(view, "view")}
                                  title={view.isVisible ? "Hide" : "Show"}
                                  disabled={loading}
                                >
                                  <EyeIcon isVisible={view.isVisible} />
                                </button>
                                <button
                                  className="edit-btn-compact"
                                  onClick={() => handleEditView(view)}
                                  title="Edit view"
                                  disabled={loading}
                                >
                                  <EditIcon />
                                </button>
                                <button
                                  className="delete-btn-compact"
                                  onClick={() => setDeletingView(view)}
                                  title="Delete view"
                                  disabled={loading}
                                >
                                  <DeleteIcon />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {viewGroups.length === 0 && (
                <div className="empty-state">
                  <p>No view groups created yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modals */}
      {editingViewGroup && (
        <EditViewGroupModal
          viewGroup={editingViewGroup}
          views={views}
          userRole={user.role}
          onSave={handleSaveViewGroup}
          onClose={() => setEditingViewGroup(null)}
        />
      )}

      {editingView && (
        <EditViewModal
          view={editingView}
          reports={reports}
          widgets={widgets}
          userRole={user.role}
          onSave={handleSaveView}
          onClose={() => setEditingView(null)}
        />
      )}

      {/* Delete Modals */}
      {deletingViewGroup && (
        <DeleteConfirmationModal
          type="viewgroup"
          item={deletingViewGroup}
          onConfirm={handleDeleteViewGroup}
          onCancel={() => setDeletingViewGroup(null)}
        />
      )}

      {deletingView && (
        <DeleteConfirmationModal
          type="view"
          item={deletingView}
          onConfirm={handleDeleteView}
          onCancel={() => setDeletingView(null)}
        />
      )}
    </div>
  );
};

export default AllViewGroupsViewsApi;
