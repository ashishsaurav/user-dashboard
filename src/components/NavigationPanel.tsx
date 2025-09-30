import React, { useState } from "react";
import {
  User,
  View,
  ViewGroup,
  UserNavigationSettings,
  Report,
  Widget,
} from "../types";
import EditViewModal from "./EditViewModal";
import EditViewGroupModal from "./EditViewGroupModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { useNotification } from "./NotificationProvider";

interface NavigationPanelProps {
  user: User;
  views: View[];
  viewGroups: ViewGroup[];
  userNavSettings: UserNavigationSettings[]; // This is array from DashboardDock
  reports: Report[];
  widgets: Widget[];
  onUpdateViews: (views: View[]) => void;
  onUpdateViewGroups: (viewGroups: ViewGroup[]) => void;
  onUpdateNavSettings: (settings: UserNavigationSettings) => void; // But this expects single object
}

const NavigationPanel: React.FC<NavigationPanelProps> = ({
  user,
  views,
  viewGroups,
  userNavSettings,
  reports,
  widgets,
  onUpdateViews,
  onUpdateViewGroups,
  onUpdateNavSettings,
}) => {
  // Local state
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

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<{
    type: "view" | "viewgroup";
    id: string;
    data?: any;
  } | null>(null);
  const [dragOverItem, setDragOverItem] = useState<{
    id: string;
    position: "top" | "bottom" | "middle";
  } | null>(null);

  const { showSuccess, showWarning } = useNotification();

  // Get current user settings - Compatible with DashboardDock's single object
  const getCurrentUserSettings = (): UserNavigationSettings => {
    // userNavSettings comes as array from DashboardDock, but we need single object
    const currentSettings = userNavSettings.find((s) => s.userId === user.name);
    return (
      currentSettings || {
        userId: user.name,
        viewGroupOrder: [],
        viewOrders: {},
        hiddenViewGroups: [],
        hiddenViews: [],
      }
    );
  };

  const settings = getCurrentUserSettings();

  // Check if item is hidden
  const isItemHidden = (type: "view" | "viewgroup", id: string): boolean => {
    return type === "view"
      ? settings.hiddenViews.includes(id)
      : settings.hiddenViewGroups.includes(id);
  };

  // Get viewgroup views with proper ordering (same as AllViewGroupsViews)
  const getViewGroupViews = (viewGroupId: string) => {
    const viewGroup = viewGroups.find((vg) => vg.id === viewGroupId);
    if (!viewGroup) return [];

    const groupViews = viewGroup.viewIds
      .map((viewId) => views.find((v) => v.id === viewId))
      .filter(Boolean) as View[];

    return groupViews.sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  // Get visible viewgroups and views
  const getVisibleOrderedViewGroups = (): ViewGroup[] => {
    const sortedViewGroups = [...viewGroups].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );
    return sortedViewGroups.filter((vg) => !isItemHidden("viewgroup", vg.id));
  };

  const getVisibleViewsInGroup = (viewGroupId: string): View[] => {
    const groupViews = getViewGroupViews(viewGroupId);
    return groupViews.filter((view) => !isItemHidden("view", view.id));
  };

  // FIXED: Toggle visibility - Works with DashboardDock's single object expectation
  const handleToggleVisibility = (type: "view" | "viewgroup", id: string) => {
    const currentSettings = getCurrentUserSettings();
    let updatedSettings: UserNavigationSettings;

    if (type === "view") {
      updatedSettings = {
        ...currentSettings,
        hiddenViews: currentSettings.hiddenViews.includes(id)
          ? currentSettings.hiddenViews.filter((vId) => vId !== id)
          : [...currentSettings.hiddenViews, id],
      };
    } else {
      updatedSettings = {
        ...currentSettings,
        hiddenViewGroups: currentSettings.hiddenViewGroups.includes(id)
          ? currentSettings.hiddenViewGroups.filter((vgId) => vgId !== id)
          : [...currentSettings.hiddenViewGroups, id],
      };
    }

    // DashboardDock expects single UserNavigationSettings object
    onUpdateNavSettings(updatedSettings);
  };

  // Toggle expansion
  const toggleViewGroupExpansion = (viewGroupId: string) => {
    setExpandedViewGroups((prev) => ({
      ...prev,
      [viewGroupId]: !prev[viewGroupId],
    }));
  };

  // Same drag handlers as AllViewGroupsViews
  const handleDragStart = (
    e: React.DragEvent,
    type: "view" | "viewgroup",
    id: string
  ) => {
    e.stopPropagation();
    setDraggedItem({ type, id });
    e.dataTransfer.setData("text/plain", JSON.stringify({ type, id }));
    e.dataTransfer.effectAllowed = "move";
    (e.currentTarget as HTMLElement).style.opacity = "0.5";
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = "1";
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

    let position: "top" | "bottom" | "middle" = "middle";

    if (targetType === "view") {
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const height = rect.height;

      if (y < height * 0.33) {
        position = "top";
      } else if (y > height * 0.66) {
        position = "bottom";
      }
    }

    setDragOverItem({ id: targetId, position });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverItem(null);
    }
  };

  const handleDrop = (
    e: React.DragEvent,
    targetId: string,
    targetType: "view" | "viewgroup"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedItem || draggedItem.id === targetId) {
      setDragOverItem(null);
      return;
    }

    if (draggedItem.type === "viewgroup" && targetType === "viewgroup") {
      handleViewGroupReorder(draggedItem.id, targetId);
    } else if (draggedItem.type === "view") {
      if (targetType === "view") {
        handleViewReorder(draggedItem.id, targetId);
      } else if (targetType === "viewgroup") {
        handleViewMoveToGroup(draggedItem.id, targetId);
      }
    }

    setDragOverItem(null);
  };

  // Same ordering logic as AllViewGroupsViews
  const handleViewGroupReorder = (
    draggedGroupId: string,
    targetGroupId: string
  ) => {
    const draggedIndex = viewGroups.findIndex((vg) => vg.id === draggedGroupId);
    const targetIndex = viewGroups.findIndex((vg) => vg.id === targetGroupId);

    if (
      draggedIndex !== -1 &&
      targetIndex !== -1 &&
      draggedIndex !== targetIndex
    ) {
      const reorderedGroups = [...viewGroups];
      const [draggedGroup] = reorderedGroups.splice(draggedIndex, 1);
      reorderedGroups.splice(targetIndex, 0, draggedGroup);

      const updatedGroupsWithOrder = reorderedGroups.map((group, index) => ({
        ...group,
        order: index + 1,
      }));

      onUpdateViewGroups(updatedGroupsWithOrder);
    }
  };

  const handleViewReorder = (draggedViewId: string, targetViewId: string) => {
    const sourceGroupId = viewGroups.find((vg) =>
      vg.viewIds.includes(draggedViewId)
    )?.id;
    const targetGroupId = viewGroups.find((vg) =>
      vg.viewIds.includes(targetViewId)
    )?.id;

    if (!sourceGroupId || !targetGroupId) return;

    if (sourceGroupId === targetGroupId) {
      // Reordering within the same group
      const viewGroup = viewGroups.find((vg) => vg.id === sourceGroupId);
      if (!viewGroup) return;

      const draggedIndex = viewGroup.viewIds.findIndex(
        (id) => id === draggedViewId
      );
      const targetIndex = viewGroup.viewIds.findIndex(
        (id) => id === targetViewId
      );

      if (
        draggedIndex !== -1 &&
        targetIndex !== -1 &&
        draggedIndex !== targetIndex
      ) {
        const reorderedViewIds = [...viewGroup.viewIds];
        const [draggedViewIdItem] = reorderedViewIds.splice(draggedIndex, 1);

        const position = dragOverItem?.position || "middle";
        let insertIndex;

        if (position === "top") {
          insertIndex = targetIndex;
        } else if (position === "bottom") {
          insertIndex = targetIndex + 1;
        } else {
          insertIndex = targetIndex;
        }

        reorderedViewIds.splice(insertIndex, 0, draggedViewIdItem);

        const updatedViews = views.map((view) => {
          if (reorderedViewIds.includes(view.id)) {
            const newIndex = reorderedViewIds.findIndex((id) => id === view.id);
            return {
              ...view,
              order: newIndex + 1,
            };
          }
          return view;
        });

        const updatedViewGroups = viewGroups.map((vg) =>
          vg.id === sourceGroupId ? { ...vg, viewIds: reorderedViewIds } : vg
        );

        onUpdateViews(updatedViews);
        onUpdateViewGroups(updatedViewGroups);
      }
    } else {
      // Move to different group
      handleViewMoveToGroup(draggedViewId, targetGroupId, targetViewId);
    }
  };

  const handleViewMoveToGroup = (
    draggedViewId: string,
    targetGroupId: string,
    targetViewId?: string
  ) => {
    const draggedView = views.find((v) => v.id === draggedViewId);
    const sourceGroupId = viewGroups.find((vg) =>
      vg.viewIds.includes(draggedViewId)
    )?.id;

    if (!draggedView || !sourceGroupId || sourceGroupId === targetGroupId)
      return;

    let updatedViewGroups = [...viewGroups];
    let newTargetViewIds: string[] = [];

    updatedViewGroups = viewGroups.map((vg) => {
      if (vg.id === sourceGroupId) {
        return {
          ...vg,
          viewIds: vg.viewIds.filter((vId) => vId !== draggedViewId),
        };
      } else if (vg.id === targetGroupId) {
        if (targetViewId) {
          const targetIndex = vg.viewIds.findIndex((id) => id === targetViewId);
          const position = dragOverItem?.position || "bottom";
          const newViewIds = [...vg.viewIds];

          let insertIndex = targetIndex;
          if (position === "top") {
            insertIndex = targetIndex;
          } else if (position === "bottom") {
            insertIndex = targetIndex + 1;
          } else {
            insertIndex = targetIndex + 1;
          }

          newViewIds.splice(insertIndex, 0, draggedViewId);
          newTargetViewIds = newViewIds;
          return {
            ...vg,
            viewIds: newViewIds,
          };
        } else {
          newTargetViewIds = [...vg.viewIds, draggedViewId];
          return {
            ...vg,
            viewIds: newTargetViewIds,
          };
        }
      }
      return vg;
    });

    // Update view orders
    const sourceGroup = viewGroups.find((vg) => vg.id === sourceGroupId);
    const targetGroup = updatedViewGroups.find((vg) => vg.id === targetGroupId);

    const updatedViews = views.map((view) => {
      if (
        sourceGroup &&
        sourceGroup.viewIds.includes(view.id) &&
        view.id !== draggedViewId
      ) {
        const sourceGroupAfterRemoval = updatedViewGroups.find(
          (vg) => vg.id === sourceGroupId
        );
        if (sourceGroupAfterRemoval) {
          const newIndex = sourceGroupAfterRemoval.viewIds.findIndex(
            (id) => id === view.id
          );
          return {
            ...view,
            order: newIndex + 1,
          };
        }
      }

      if (targetGroup && newTargetViewIds.includes(view.id)) {
        const newIndex = newTargetViewIds.findIndex((id) => id === view.id);
        return {
          ...view,
          order: newIndex + 1,
        };
      }

      return view;
    });

    onUpdateViews(updatedViews);
    onUpdateViewGroups(updatedViewGroups);

    const sourceGroupName = viewGroups.find(
      (vg) => vg.id === sourceGroupId
    )?.name;
    const targetGroupName = viewGroups.find(
      (vg) => vg.id === targetGroupId
    )?.name;

    showSuccess(
      "View Moved",
      `"${draggedView.name}" moved from "${sourceGroupName}" to "${targetGroupName}"`
    );
  };

  // Delete handlers (same as before)
  const handleDeleteView = (view: View) => {
    const updatedViews = views.filter((v) => v.id !== view.id);
    const updatedViewGroups = viewGroups.map((vg) => ({
      ...vg,
      viewIds: vg.viewIds.filter((vId) => vId !== view.id),
    }));

    onUpdateViews(updatedViews);
    onUpdateViewGroups(updatedViewGroups);
    showSuccess(
      "View Deleted",
      `"${view.name}" has been removed successfully.`
    );
  };

  const handleDeleteViewGroupConfirm = (
    action?: "group-only" | "group-and-views"
  ) => {
    if (!deletingViewGroup || !action) return;

    const defaultGroup = viewGroups.find((vg) => vg.isDefault);
    if (!defaultGroup) {
      showWarning(
        "Error",
        "Default group not found. Cannot proceed with deletion."
      );
      return;
    }

    if (action === "group-only") {
      const updatedViewGroups = viewGroups
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
      const updatedViews = views.filter((v) => !viewsToDelete.includes(v.id));
      const updatedViewGroups = viewGroups.filter(
        (vg) => vg.id !== deletingViewGroup.id
      );

      onUpdateViews(updatedViews);
      onUpdateViewGroups(updatedViewGroups);
      showSuccess(
        "View Group and Views Deleted",
        `"${deletingViewGroup.name}" and all its views have been removed.`
      );
    }

    setDeletingViewGroup(null);
  };

  // Icons (keeping existing)
  const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{
        transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
        transition: "transform 0.2s ease",
      }}
    >
      <path d="M9 18l6-6-6-6" />
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
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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
      <path d="M19,6V20a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6M8,6V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2V6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
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

  const DragIcon = () => (
    <svg
      width="12"
      height="12"
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
    <div className="navigation-panel">
      <div className="nav-menu">
        {getVisibleOrderedViewGroups().map((viewGroup) => {
          const groupViews = getVisibleViewsInGroup(viewGroup.id);
          const isExpanded = expandedViewGroups[viewGroup.id];
          const isHidden = isItemHidden("viewgroup", viewGroup.id);
          const isDragOver = dragOverItem?.id === viewGroup.id;

          return (
            <div
              key={viewGroup.id}
              className={`nav-group ${isDragOver ? "drag-over" : ""}`}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, "viewgroup", viewGroup.id)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, viewGroup.id, "viewgroup")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, viewGroup.id, "viewgroup")}
            >
              <div
                className="nav-group-header"
                onClick={() => toggleViewGroupExpansion(viewGroup.id)}
              >
                <div className="nav-group-info">
                  <div className="nav-group-icon">
                    <ChevronIcon expanded={isExpanded} />
                  </div>
                  <ViewGroupIcon />
                  <span className="nav-group-title">{viewGroup.name}</span>
                  {viewGroup.isDefault && (
                    <span className="default-badge">Default</span>
                  )}
                </div>
                <div className="nav-group-actions">
                  <button
                    className="nav-action-btn drag-btn"
                    title="Drag to reorder"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <DragIcon />
                  </button>
                  <button
                    className="nav-action-btn visibility-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleVisibility("viewgroup", viewGroup.id);
                    }}
                    title={
                      isHidden ? "Show in navigation" : "Hide from navigation"
                    }
                  >
                    <EyeIcon isVisible={!isHidden} />
                  </button>
                  <button
                    className="nav-action-btn edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingViewGroup(viewGroup);
                    }}
                    title="Edit view group and manage views"
                  >
                    <EditIcon />
                  </button>
                  {!viewGroup.isDefault && (
                    <button
                      className="nav-action-btn delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingViewGroup(viewGroup);
                      }}
                      title="Delete view group"
                    >
                      <DeleteIcon />
                    </button>
                  )}
                </div>
              </div>

              {isExpanded && groupViews.length > 0 && (
                <div className="nav-group-content">
                  {groupViews.map((view) => {
                    const viewIsHidden = isItemHidden("view", view.id);
                    const viewReports = view.reportIds
                      .map((id) => reports.find((r) => r.id === id))
                      .filter(Boolean);
                    const viewWidgets = view.widgetIds
                      .map((id) => widgets.find((w) => w.id === id))
                      .filter(Boolean);
                    const isViewDragOver = dragOverItem?.id === view.id;
                    const dragPosition = dragOverItem?.position;

                    return (
                      <div
                        key={view.id}
                        className={`nav-view-item ${
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
                        onDragStart={(e) => handleDragStart(e, "view", view.id)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDragEnter={(e) => handleDragEnter(e, view.id, "view")}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, view.id, "view")}
                      >
                        <div className="nav-view-info">
                          <ViewIcon />
                          <div className="nav-view-content">
                            <span className="nav-view-title">{view.name}</span>
                            <span className="nav-view-meta">
                              {viewReports.length} Reports, {viewWidgets.length}{" "}
                              Widgets
                            </span>
                          </div>
                        </div>
                        <div className="nav-view-actions">
                          <button
                            className="nav-action-btn drag-btn"
                            title="Drag to reorder"
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <DragIcon />
                          </button>
                          <button
                            className="nav-action-btn visibility-btn"
                            onClick={() =>
                              handleToggleVisibility("view", view.id)
                            }
                            title={
                              viewIsHidden
                                ? "Show in navigation"
                                : "Hide from navigation"
                            }
                          >
                            <EyeIcon isVisible={!viewIsHidden} />
                          </button>
                          <button
                            className="nav-action-btn edit-btn"
                            onClick={() => setEditingView(view)}
                            title="Edit view"
                          >
                            <EditIcon />
                          </button>
                          <button
                            className="nav-action-btn delete-btn"
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
              )}
            </div>
          );
        })}
      </div>
      {/* Edit Modals */}
      {editingView && (
        <EditViewModal
          view={editingView}
          reports={reports}
          widgets={widgets}
          userRole={user.role}
          onSave={(updatedView) => {
            onUpdateViews(
              views.map((v) => (v.id === updatedView.id ? updatedView : v))
            );
            setEditingView(null);
          }}
          onClose={() => setEditingView(null)}
        />
      )}

      {editingViewGroup && (
        <EditViewGroupModal
          viewGroup={editingViewGroup}
          views={views}
          userRole={user.role}
          userNavSettings={userNavSettings}
          user={user}
          onSave={(updatedViewGroup) => {
            onUpdateViewGroups(
              viewGroups.map((vg) =>
                vg.id === updatedViewGroup.id ? updatedViewGroup : vg
              )
            );
            setEditingViewGroup(null);
            showSuccess(
              "View Group Updated",
              `"${updatedViewGroup.name}" has been updated successfully.`
            );
          }}
          onClose={() => setEditingViewGroup(null)}
          onUpdateNavSettings={(updatedSettings) => {
            console.log(
              "NavigationPanel receiving settings update:",
              updatedSettings
            );

            // Pass the single settings object to DashboardDock
            onUpdateNavSettings(updatedSettings);

            // Force a small re-render to ensure NavigationPanel updates
            setEditingViewGroup(null);

            // Optional: Add a small delay to ensure state has propagated
            setTimeout(() => {
              console.log("Navigation panel should now reflect changes");
            }, 100);
          }}
        />
      )}
      {/* Delete Confirmation Modals */}
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
          onConfirm={() => {
            handleDeleteView(deletingView);
            setDeletingView(null);
          }}
          onCancel={() => setDeletingView(null)}
        />
      )}
    </div>
  );
};

export default NavigationPanel;
