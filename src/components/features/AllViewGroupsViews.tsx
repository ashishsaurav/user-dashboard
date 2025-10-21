import React, { useState } from "react";
import { User, View, ViewGroup, Report, Widget } from "../../types";
import { viewsService } from "../../services/viewsService";
import { viewGroupsService } from "../../services/viewGroupsService";
import EditViewModal from "../modals/EditViewModal";
import EditViewGroupModal from "../modals/EditViewGroupModal";
import DeleteConfirmationModal from "../modals/DeleteConfirmationModal";
import { useNotification } from "../common/NotificationProvider";

interface AllViewGroupsViewsProps {
  user: User;
  views: View[];
  viewGroups: ViewGroup[];
  reports: Report[];
  widgets: Widget[];
  onRefresh: () => void;
}

const AllViewGroupsViews: React.FC<AllViewGroupsViewsProps> = ({
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
  const [editingViewGroup, setEditingViewGroup] = useState<ViewGroup | null>(
    null
  );
  const [deletingViewGroup, setDeletingViewGroup] = useState<ViewGroup | null>(
    null
  );
  const [deletingView, setDeletingView] = useState<View | null>(null);
  const [draggedItem, setDraggedItem] = useState<{
    type: "view" | "viewgroup";
    id: string;
    data?: { viewGroupId?: string };
  } | null>(null);
  const [dragOverItem, setDragOverItem] = useState<{
    id: string;
    position: "top" | "bottom" | "middle";
  } | null>(null);

  const { showSuccess, showError } = useNotification();

  const toggleViewGroupExpansion = (viewGroupId: string) => {
    setExpandedViewGroups((prev) => ({
      ...prev,
      [viewGroupId]: !prev[viewGroupId],
    }));
  };

  const getViewGroupViews = (viewGroupId: string) => {
    const viewGroup = viewGroups.find((vg) => vg.id === viewGroupId);
    if (!viewGroup) return [];

    // Preserve backend ordering from viewGroup.viewIds
    const groupViews = viewGroup.viewIds
      .map((viewId) => views.find((v) => v.id === viewId))
      .filter(Boolean) as View[];

    return groupViews;
  };

  // Handle save view group
  const handleSaveViewGroup = async (updatedViewGroup: ViewGroup) => {
    try {
      await viewGroupsService.updateViewGroup(updatedViewGroup.id, user.name, {
        name: updatedViewGroup.name,
        isVisible: updatedViewGroup.isVisible,
        isDefault: updatedViewGroup.isDefault,
        orderIndex: updatedViewGroup.order,
      });
      showSuccess(
        "View group updated",
        `"${updatedViewGroup.name}" has been saved`
      );
      setEditingViewGroup(null);
      onRefresh();
    } catch (error) {
      showError("Failed to update view group", "Please try again");
    }
  };

  // Handle save view
  const handleSaveView = async (updatedView: View) => {
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
      showError("Failed to update view", "Please try again");
    }
  };

  // Handle delete view group
  const handleDeleteViewGroup = async () => {
    if (!deletingViewGroup) return;

    try {
      await viewGroupsService.deleteViewGroup(deletingViewGroup.id, user.name);
      showSuccess(
        "View group deleted",
        `"${deletingViewGroup.name}" has been removed`
      );
      setDeletingViewGroup(null);
      onRefresh();
    } catch (error) {
      showError("Failed to delete view group", "Please try again");
    }
  };

  // Handle delete view
  const handleDeleteView = async () => {
    if (!deletingView) return;

    try {
      await viewsService.deleteView(deletingView.id, user.name);
      showSuccess("View deleted", `"${deletingView.name}" has been removed`);
      setDeletingView(null);
      onRefresh();
    } catch (error) {
      showError("Failed to delete view", "Please try again");
    }
  };

  // Handle toggle visibility
  const handleToggleVisibility = async (
    type: "view" | "viewgroup",
    id: string
  ) => {
    try {
      if (type === "viewgroup") {
        const vg = viewGroups.find((v) => v.id === id);
        if (!vg) return;

        await viewGroupsService.updateViewGroup(vg.id, user.name, {
          name: vg.name,
          isVisible: !vg.isVisible,
          isDefault: vg.isDefault,
          orderIndex: vg.order,
        });
      } else {
        const v = views.find((view) => view.id === id);
        if (!v) return;

        await viewsService.updateView(v.id, user.name, {
          name: v.name,
          isVisible: !v.isVisible,
          orderIndex: v.order,
        });
      }
      onRefresh();
    } catch (error) {
      showError("Failed to update visibility", "Please try again");
    }
  };

  // Drag and drop handlers
  const handleDragStart = (
    e: React.DragEvent,
    type: "view" | "viewgroup",
    id: string,
    viewGroupId?: string
  ) => {
    setDraggedItem({ type, id, data: { viewGroupId } });
    e.dataTransfer.effectAllowed = "move";
    (e.currentTarget as HTMLElement).style.opacity = "0.5";
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (
    e: React.DragEvent,
    targetId: string,
    targetType: "view" | "viewgroup"
  ) => {
    e.preventDefault();
    if (!draggedItem) return;

    // Determine position
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position = e.clientY < midpoint ? "top" : "bottom";

    setDragOverItem({ id: targetId, position: position as "top" | "bottom" });
  };

  const handleDragLeave = () => {
    // Don't clear immediately to prevent flickering
  };

  const handleDrop = async (
    e: React.DragEvent,
    targetId: string,
    targetType: "view" | "viewgroup"
  ) => {
    e.preventDefault();
    if (!draggedItem || !dragOverItem) return;

    // For now, show success message
    // Full implementation would call reorder
    showSuccess("Drag and drop", "Use up/down buttons for now");

    setDraggedItem(null);
    setDragOverItem(null);
  };

  const sortedViewGroups = [...viewGroups].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  // Icons
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

  const ViewGroupIcon = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );

  const ViewIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeIcon = ({ isVisible }: { isVisible: boolean }) =>
    isVisible ? (
      <svg
        width="16"
        height="16"
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
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    );

  const EditIcon = () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="m18.5 2.5 2.1 2.1L12 13.2l-3.3.8.8-3.3L18.5 2.5z" />
    </svg>
  );

  const DeleteIcon = () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="3,6 5,6 21,6" />
      <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
    </svg>
  );

  const DragIcon = () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="9" cy="12" r="1" />
      <circle cx="9" cy="5" r="1" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="15" cy="5" r="1" />
      <circle cx="15" cy="19" r="1" />
    </svg>
  );

  return (
    <div className="navigation-manage-container">
      <div className="navigation-header">
        <h2>Navigation Management</h2>
        <p>Configure and organize your navigation structure</p>
      </div>

      <div className="view-groups-section">
        <h3 className="section-title">Your View Groups & Views</h3>
        <div className="view-groups-list">
          {sortedViewGroups.map((viewGroup) => {
            const groupViews = getViewGroupViews(viewGroup.id);
            const isExpanded = expandedViewGroups[viewGroup.id];
            const isDragOver = dragOverItem?.id === viewGroup.id;

            return (
              <div
                key={viewGroup.id}
                className={`view-group-card ${isDragOver ? "drag-over" : ""}`}
                draggable={true}
                onDragStart={(e) =>
                  handleDragStart(e, "viewgroup", viewGroup.id)
                }
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragEnter={(e) =>
                  handleDragEnter(e, viewGroup.id, "viewgroup")
                }
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, viewGroup.id, "viewgroup")}
              >
                <div
                  className="view-group-header"
                  onClick={() => toggleViewGroupExpansion(viewGroup.id)}
                >
                  <div className="view-group-info">
                    <div className="view-group-icon">
                      <ViewGroupIcon />
                    </div>
                    <div>
                      <div className="view-group-name">
                        <span>{viewGroup.name}</span>
                        {viewGroup.isDefault && (
                          <span className="default-badge">Default</span>
                        )}
                      </div>
                      <p className="view-group-summary">
                        {groupViews.length} Views
                      </p>
                    </div>
                  </div>

                  <div className="view-group-actions">
                    <button
                      className="drag-handle"
                      title="Drag to reorder"
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <DragIcon />
                    </button>

                    <button
                      className={`visibility-btn ${
                        !viewGroup.isVisible ? "hidden" : "visible"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleVisibility("viewgroup", viewGroup.id);
                      }}
                      title={
                        viewGroup.isVisible
                          ? "Hide from navigation"
                          : "Show in navigation"
                      }
                    >
                      <EyeIcon isVisible={viewGroup.isVisible} />
                    </button>

                    <button
                      className="edit-btn-compact"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingViewGroup(viewGroup);
                      }}
                      title="Edit view group"
                    >
                      <EditIcon />
                    </button>

                    {!viewGroup.isDefault && (
                      <button
                        className="delete-btn-compact"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingViewGroup(viewGroup);
                        }}
                        title="Delete view group"
                      >
                        <DeleteIcon />
                      </button>
                    )}

                    <div className="expand-indicator">
                      <ChevronIcon expanded={isExpanded} />
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="view-group-content">
                    <div className="views-list">
                      {groupViews.map((view) => {
                        const viewReports = view.reportIds
                          .map((id) => reports.find((r) => r.id === id))
                          .filter((r): r is Report => r !== undefined);
                        const viewWidgets = view.widgetIds
                          .map((id) => widgets.find((w) => w.id === id))
                          .filter((w): w is Widget => w !== undefined);

                        const isViewDragOver = dragOverItem?.id === view.id;
                        const dragPosition = dragOverItem?.position;

                        return (
                          <div
                            key={view.id}
                            className={`view-item ${
                              isViewDragOver ? "drag-over" : ""
                            } ${
                              isViewDragOver && dragPosition === "top"
                                ? "drag-over-top"
                                : ""
                            } ${
                              isViewDragOver && dragPosition === "bottom"
                                ? "drag-over-bottom"
                                : ""
                            }`}
                            draggable={true}
                            onDragStart={(e) =>
                              handleDragStart(e, "view", view.id, viewGroup.id)
                            }
                            onDragEnd={handleDragEnd}
                            onDragOver={handleDragOver}
                            onDragEnter={(e) =>
                              handleDragEnter(e, view.id, "view")
                            }
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, view.id, "view")}
                          >
                            <div className="view-info">
                              <ViewIcon />
                              <div className="view-details">
                                <span className="view-name">{view.name}</span>
                                <span className="view-content">
                                  {viewReports.length} Reports,{" "}
                                  {viewWidgets.length} Widgets
                                </span>
                              </div>
                            </div>

                            <div className="view-actions">
                              <button
                                className="drag-handle"
                                title="Drag to reorder"
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                              >
                                <DragIcon />
                              </button>

                              <button
                                className={`visibility-btn ${
                                  !view.isVisible ? "hidden" : "visible"
                                }`}
                                onClick={() =>
                                  handleToggleVisibility("view", view.id)
                                }
                                title={
                                  view.isVisible
                                    ? "Hide from navigation"
                                    : "Show in navigation"
                                }
                              >
                                <EyeIcon isVisible={view.isVisible} />
                              </button>

                              <button
                                className="edit-btn-compact"
                                onClick={() => setEditingView(view)}
                                title="Edit view"
                              >
                                <EditIcon />
                              </button>

                              <button
                                className="delete-btn-compact"
                                onClick={() => setDeletingView(view)}
                                title="Delete view"
                              >
                                <DeleteIcon />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
          userId={user.name}
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

export default AllViewGroupsViews;
