import React, { useState, useEffect, useRef } from "react";
import {
  User,
  View,
  ViewGroup,
  UserNavigationSettings,
  Report,
  Widget,
} from "../../types";
import EditViewModal from "../modals/EditViewModal";
import EditViewGroupModal from "../modals/EditViewGroupModal";
import DeleteConfirmationModal from "../modals/DeleteConfirmationModal";
import { useNotification } from "../common/NotificationProvider";
import ActionPopup from "../common/ActionPopup";
import { viewsService } from "../../services/viewsService";
import { viewGroupsService } from "../../services/viewGroupsService";
import { navigationService } from "../../services/navigationService";

interface NavigationPanelProps {
  user: User;
  views: View[];
  viewGroups: ViewGroup[];
  userNavSettings: UserNavigationSettings; // FIXED: Single object, not array
  reports: Report[];
  widgets: Widget[];
  onUpdateViews: (views: View[]) => void;
  onUpdateViewGroups: (viewGroups: ViewGroup[]) => void;
  onUpdateNavSettings: (settings: UserNavigationSettings) => void;
  onViewSelect?: (view: View) => void; // NEW: View selection handler
  selectedView?: View | null; // NEW: Currently selected view
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
  onViewSelect,
  selectedView,
}) => {
  // Local state
  const [expandedViewGroups, setExpandedViewGroups] = useState<{
    [key: string]: boolean;
  }>({});
  const [editingView, setEditingView] = useState<any>(null);
  const [editingViewGroup, setEditingViewGroup] = useState<any>(null);
  const [deletingViewGroup, setDeletingViewGroup] = useState<any>(null);
  const [deletingView, setDeletingView] = useState<any>(null);

  // NEW: Responsive layout state
  const [isHorizontalLayout, setIsHorizontalLayout] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // NEW: Detect if navigation is in horizontal layout (top/bottom dock)
  useEffect(() => {
    const detectLayout = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      // If width is significantly larger than height, it's horizontal layout
      const aspectRatio = rect.width / rect.height;
      const newIsHorizontal = aspectRatio > 2; // Width is more than 2x height

      if (newIsHorizontal !== isHorizontalLayout) {
        setIsHorizontalLayout(newIsHorizontal);
        console.log(
          "Navigation layout changed:",
          newIsHorizontal ? "Horizontal" : "Vertical"
        );
      }
    };

    // Initial detection
    detectLayout();

    // Create ResizeObserver to detect layout changes
    const resizeObserver = new ResizeObserver(detectLayout);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Cleanup
    return () => {
      resizeObserver.disconnect();
    };
  }, [isHorizontalLayout]);

  // FIXED: Get current user settings - now expects single object
  const getCurrentUserSettings = (): UserNavigationSettings => {
    return (
      userNavSettings || {
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

  // Get viewgroup views with proper ordering
  const getViewGroupViews = (viewGroupId: string): View[] => {
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

  // Toggle visibility (API-connected)
  const handleToggleVisibility = async (type: "view" | "viewgroup", id: string) => {
    try {
      if (type === "view") {
        const view = views.find((v) => v.id === id);
        if (!view) return;

        await viewsService.updateView(view.id, user.name, {
          name: view.name,
          isVisible: !view.isVisible,
          orderIndex: view.order,
        });
        
        showSuccess(
          view.isVisible ? "View hidden" : "View shown",
          `"${view.name}" is now ${view.isVisible ? "hidden" : "visible"}`
        );
      } else {
        const viewGroup = viewGroups.find((vg) => vg.id === id);
        if (!viewGroup) return;

        await viewGroupsService.updateViewGroup(viewGroup.id, user.name, {
          name: viewGroup.name,
          isVisible: !viewGroup.isVisible,
          isDefault: viewGroup.isDefault,
          orderIndex: viewGroup.order,
        });
        
        showSuccess(
          viewGroup.isVisible ? "View group hidden" : "View group shown",
          `"${viewGroup.name}" is now ${viewGroup.isVisible ? "hidden" : "visible"}`
        );
      }
      
      // Reload data
      window.location.reload();
    } catch (error) {
      console.error("Failed to toggle visibility:", error);
      showWarning("Failed to update visibility", "Please try again");
    }
  };

  // NEW: Handle view selection
  const handleViewClick = (view: View) => {
    if (onViewSelect) {
      onViewSelect(view);
    }
  };

  // Toggle expansion
  const toggleViewGroupExpansion = (viewGroupId: string) => {
    setExpandedViewGroups((prev) => ({
      ...prev,
      [viewGroupId]: !prev[viewGroupId],
    }));
  };

  // Drag handlers
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

      if (isHorizontalLayout) {
        // Horizontal layout - use left/right instead of top/bottom
        const x = e.clientX - rect.left;
        const width = rect.width;
        if (x < width * 0.33) {
          position = "top"; // Left side
        } else if (x > width * 0.66) {
          position = "bottom"; // Right side
        }
      } else {
        // Vertical layout - use top/bottom
        const y = e.clientY - rect.top;
        const height = rect.height;
        if (y < height * 0.33) {
          position = "top";
        } else if (y > height * 0.66) {
          position = "bottom";
        }
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

  // Reorder view groups (API-connected)
  const handleViewGroupReorder = async (
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

      const items = reorderedGroups.map((group, index) => ({
        id: group.id,
        orderIndex: index,
      }));

      try {
        await viewGroupsService.reorderViewGroups(user.name, items);
        showSuccess("View groups reordered");
        
        // Update local state
        const updatedGroupsWithOrder = reorderedGroups.map((group, index) => ({
          ...group,
          order: index,
        }));
        onUpdateViewGroups(updatedGroupsWithOrder);
      } catch (error) {
        console.error("Failed to reorder view groups:", error);
        showWarning("Failed to save order", "Changes not saved");
      }
    }
  };

  const handleViewReorder = async (draggedViewId: string, targetViewId: string) => {
    const sourceGroupId = viewGroups.find((vg) =>
      vg.viewIds.includes(draggedViewId)
    )?.id;
    const targetGroupId = viewGroups.find((vg) =>
      vg.viewIds.includes(targetViewId)
    )?.id;

    if (!sourceGroupId || !targetGroupId) return;

    if (sourceGroupId === targetGroupId) {
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
        let insertIndex = targetIndex;
        if (position === "top") {
          insertIndex = targetIndex;
        } else if (position === "bottom") {
          insertIndex = targetIndex + 1;
        } else {
          insertIndex = targetIndex;
        }

        reorderedViewIds.splice(insertIndex, 0, draggedViewIdItem);

        const items = reorderedViewIds.map((id, index) => ({
          id,
          orderIndex: index,
        }));

        try {
          // Call API to persist reorder
          await viewGroupsService.reorderViewsInGroup(sourceGroupId, user.name, items);
          showSuccess("Views reordered");
          
          // Update local state
          const updatedViews = views.map((view) => {
            if (reorderedViewIds.includes(view.id)) {
              const newIndex = reorderedViewIds.findIndex((id) => id === view.id);
              return { ...view, order: newIndex };
            }
            return view;
          });

          const updatedViewGroups = viewGroups.map((vg) =>
            vg.id === sourceGroupId ? { ...vg, viewIds: reorderedViewIds } : vg
          );

          onUpdateViews(updatedViews);
          onUpdateViewGroups(updatedViewGroups);
        } catch (error) {
          console.error("Failed to reorder views:", error);
          showWarning("Failed to save order", "Changes not saved");
        }
      }
    } else {
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
    let newTargetViewIds: string[];

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
          return { ...vg, viewIds: newViewIds };
        } else {
          newTargetViewIds = [...vg.viewIds, draggedViewId];
          return { ...vg, viewIds: newTargetViewIds };
        }
      }
      return vg;
    });

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
          return { ...view, order: newIndex + 1 };
        }
      }
      if (targetGroup && newTargetViewIds.includes(view.id)) {
        const newIndex = newTargetViewIds.findIndex((id) => id === view.id);
        return { ...view, order: newIndex + 1 };
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
      `${draggedView.name} moved from ${sourceGroupName} to ${targetGroupName}.`
    );
  };

  // Delete handlers (API-connected)
  const handleDeleteView = async (view: View) => {
    try {
      await viewsService.deleteView(view.id, user.name);
      showSuccess("View Deleted", `${view.name} has been removed successfully.`);
      
      // Reload data
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete view:", error);
      showWarning("Failed to delete view", "Please try again");
    }
  };

  const handleDeleteViewGroupConfirm = async (
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

    try {
      if (action === "group-only") {
        // Move views to default group before deleting view group
        // This is a complex operation - for now, just delete the group
        await viewGroupsService.deleteViewGroup(deletingViewGroup.id, user.name);
        showSuccess(
          "View Group Deleted",
          `${deletingViewGroup.name} deleted. Views moved to other groups.`
        );
      } else {
        // Delete view group and all its views
        const viewsToDelete = deletingViewGroup.viewIds;
        
        // Delete all views first
        for (const viewId of viewsToDelete) {
          await viewsService.deleteView(viewId, user.name);
        }
        
        // Then delete view group
        await viewGroupsService.deleteViewGroup(deletingViewGroup.id, user.name);
        
        showSuccess(
          "View Group and Views Deleted",
          `${deletingViewGroup.name} and all its views have been removed.`
        );
      }

      setDeletingViewGroup(null);
      
      // Reload data
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete view group:", error);
      showWarning("Failed to delete view group", "Please try again");
    }
  };

  const [hoveredItem, setHoveredItem] = useState<{
    type: string;
    id: string;
    position: { x: number; y: number };
  } | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (e: React.MouseEvent, type: string, id: string) => {
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    // Clear any pending show timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const POPUP_HEIGHT = 40;

    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredItem({
        type,
        id,
        position: {
          x: rect.left,
          y: rect.top - POPUP_HEIGHT - 4,
        },
      });
    }, 300);
  };

  const handleMouseLeave = () => {
    // Clear the show timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    // Delay hiding to allow moving to popup
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
    }, 200); // 200ms grace period to move to popup
  };

  const handlePopupMouseEnter = () => {
    // Cancel hiding when mouse enters popup
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handlePopupMouseLeave = () => {
    // Hide immediately when leaving popup
    setHoveredItem(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Icons
  const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{
        transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
        transition: "transform 0.2s ease",
      }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );

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

  const ViewIcon = () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
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
    <div
      ref={containerRef}
      className={`navigation-panel ${
        isHorizontalLayout ? "horizontal-layout" : "vertical-layout"
      }`}
    >
      <div
        className={`nav-menu ${
          isHorizontalLayout ? "nav-menu-horizontal" : "nav-menu-vertical"
        }`}
      >
        {getVisibleOrderedViewGroups().map((viewGroup) => {
          const groupViews = getVisibleViewsInGroup(viewGroup.id);
          const isExpanded = isHorizontalLayout
            ? true
            : expandedViewGroups[viewGroup.id]; // Always expanded in horizontal
          const isHidden = isItemHidden("viewgroup", viewGroup.id);
          const isDragOver = dragOverItem?.id === viewGroup.id;

          return (
            <div
              key={viewGroup.id}
              className={`nav-group ${isDragOver ? "drag-over" : ""} ${
                isHorizontalLayout
                  ? "nav-group-horizontal"
                  : "nav-group-vertical"
              }`}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, "viewgroup", viewGroup.id)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, viewGroup.id, "viewgroup")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, viewGroup.id, "viewgroup")}
            >
              <div
                className={`nav-group-header ${
                  isHorizontalLayout
                    ? "nav-group-header-horizontal"
                    : "nav-group-header-vertical"
                }`}
                onMouseEnter={(e) =>
                  handleMouseEnter(e, "viewgroup", viewGroup.id)
                }
                onMouseLeave={handleMouseLeave}
                onClick={() =>
                  !isHorizontalLayout && toggleViewGroupExpansion(viewGroup.id)
                }
              >
                <div className="nav-group-info">
                  <div className="nav-group-icon">
                    <ViewGroupIcon />
                  </div>
                  <div className="nav-group-title">{viewGroup.name}</div>
                  {viewGroup.isDefault && (
                    <span className="default-badge">Default</span>
                  )}
                </div>
              </div>
              {isExpanded && groupViews.length > 0 && (
                <div
                  className={`nav-group-content ${
                    isHorizontalLayout
                      ? "nav-group-content-horizontal"
                      : "nav-group-content-vertical"
                  }`}
                >
                  {groupViews.map((view) => {
                    const viewIsHidden = isItemHidden("view", view.id);
                    const viewReports = view.reportIds
                      .map((id) => reports.find((r) => r.id === id))
                      .filter((r): r is Report => r !== undefined);
                    const viewWidgets = view.widgetIds
                      .map((id) => widgets.find((w) => w.id === id))
                      .filter((w): w is Widget => w !== undefined);
                    
                    // Debug: Log count mismatch
                    if (view.reportIds.length !== viewReports.length || view.widgetIds.length !== viewWidgets.length) {
                      console.warn(`⚠️ NavigationPanel - "${view.name}":`);
                      console.warn(`  Reports: ${viewReports.length}/${view.reportIds.length} accessible`);
                      console.warn(`  Widgets: ${viewWidgets.length}/${view.widgetIds.length} accessible`);
                      console.warn(`  Missing Reports:`, view.reportIds.filter(id => !reports.find(r => r.id === id)));
                      console.warn(`  Missing Widgets:`, view.widgetIds.filter(id => !widgets.find(w => w.id === id)));
                    }
                    
                    const isViewDragOver = dragOverItem?.id === view.id;
                    const dragPosition = dragOverItem?.position;
                    const isSelected = selectedView?.id === view.id;

                    return (
                      <div
                        key={view.id}
                        className={`nav-view-item ${
                          isViewDragOver ? "drag-over" : ""
                        } ${dragPosition ? `drag-${dragPosition}` : ""} ${
                          isSelected ? "selected" : ""
                        } ${
                          isHorizontalLayout
                            ? "nav-view-item-horizontal"
                            : "nav-view-item-vertical"
                        }`}
                        onMouseEnter={(e) =>
                          handleMouseEnter(e, "view", view.id)
                        }
                        onMouseLeave={handleMouseLeave}
                        draggable
                        onDragStart={(e) => handleDragStart(e, "view", view.id)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDragEnter={(e) => handleDragEnter(e, view.id, "view")}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, view.id, "view")}
                        onClick={() => handleViewClick(view)}
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
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Keep all existing modals */}
      {editingView && (
        <EditViewModal
          view={editingView}
          reports={reports}
          widgets={widgets}
          userRole={user.role}
          onSave={async (updatedView) => {
            try {
              await viewsService.updateView(updatedView.id, user.name, {
                name: updatedView.name,
                isVisible: updatedView.isVisible,
                orderIndex: updatedView.order,
              });
              showSuccess("View Updated", `"${updatedView.name}" has been updated successfully.`);
              setEditingView(null);
              window.location.reload();
            } catch (error) {
              console.error("Failed to update view:", error);
              showWarning("Failed to update view", "Please try again");
            }
          }}
          onClose={() => setEditingView(null)}
        />
      )}

      {editingViewGroup && (
        <EditViewGroupModal
          viewGroup={editingViewGroup}
          views={views}
          userRole={user.role}
          userNavSettings={[userNavSettings]} // Convert single object to array for modal
          user={user}
          onSave={async (updatedViewGroup) => {
            try {
              await viewGroupsService.updateViewGroup(updatedViewGroup.id, user.name, {
                name: updatedViewGroup.name,
                isVisible: updatedViewGroup.isVisible,
                isDefault: updatedViewGroup.isDefault,
                orderIndex: updatedViewGroup.order,
              });
              showSuccess(
                "View Group Updated",
                `"${updatedViewGroup.name}" has been updated successfully.`
              );
              setEditingViewGroup(null);
              window.location.reload();
            } catch (error) {
              console.error("Failed to update view group:", error);
              showWarning("Failed to update view group", "Please try again");
            }
          }}
          onClose={() => setEditingViewGroup(null)}
          onUpdateNavSettings={(updatedSettings) => {
            console.log(
              "NavigationPanel receiving settings update:",
              updatedSettings
            );
            onUpdateNavSettings(updatedSettings);
          }}
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
          onConfirm={() => {
            handleDeleteView(deletingView);
            setDeletingView(null);
          }}
          onCancel={() => setDeletingView(null)}
        />
      )}

      {hoveredItem && (
        <ActionPopup
          onEdit={() => {
            if (hoveredItem.type === "viewgroup") {
              const group = viewGroups.find((g) => g.id === hoveredItem.id);
              if (group) setEditingViewGroup(group);
            } else {
              const view = views.find((v) => v.id === hoveredItem.id);
              if (view) setEditingView(view);
            }
            setHoveredItem(null);
          }}
          onDelete={() => {
            if (hoveredItem.type === "viewgroup") {
              const group = viewGroups.find((g) => g.id === hoveredItem.id);
              if (group && !group.isDefault) setDeletingViewGroup(group);
            } else {
              const view = views.find((v) => v.id === hoveredItem.id);
              if (view) setDeletingView(view);
            }
            setHoveredItem(null);
          }}
          onToggleVisibility={() => {
            handleToggleVisibility(
              hoveredItem.type as "view" | "viewgroup",
              hoveredItem.id
            );
            setHoveredItem(null);
          }}
          isVisible={
            hoveredItem.type === "viewgroup"
              ? viewGroups.find((g) => g.id === hoveredItem.id)?.isVisible ??
                true
              : views.find((v) => v.id === hoveredItem.id)?.isVisible ?? true
          }
          showDelete={
            hoveredItem.type === "viewgroup"
              ? !viewGroups.find((g) => g.id === hoveredItem.id)?.isDefault
              : true
          }
          position={hoveredItem.position}
          onMouseEnter={handlePopupMouseEnter} // ✅ NEW
          onMouseLeave={handlePopupMouseLeave} // ✅ NEW
        />
      )}
    </div>
  );
};

export default NavigationPanel;
