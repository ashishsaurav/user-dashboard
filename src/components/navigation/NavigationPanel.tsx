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
import "./styles/NavigationPanel.css";

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
  onRefreshData?: () => void; // NEW: Callback to refresh data from parent
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
  onRefreshData,
}) => {
  // Local state
  const [expandedViewGroups, setExpandedViewGroups] = useState<{
    [key: string]: boolean;
  }>({});
  const [editingView, setEditingView] = useState<any>(null);
  const [editingViewGroup, setEditingViewGroup] = useState<any>(null);
  const [deletingViewGroup, setDeletingViewGroup] = useState<any>(null);
  const [deletingView, setDeletingView] = useState<any>(null);

  // Track if we've initialized the expanded state - USE REF to prevent re-initialization
  const hasInitializedRef = useRef(false);

  // Load expanded state from navigation settings - ONLY ONCE
  useEffect(() => {
    if (viewGroups.length > 0 && !hasInitializedRef.current) {
      const initialExpanded: { [key: string]: boolean } = {};
      
      console.log('🔄 Initializing view group expand state');
      console.log('  Saved expandedViewGroups:', userNavSettings.expandedViewGroups);
      console.log('  ViewGroups count:', viewGroups.length);
      
      // CRITICAL: If expandedViewGroups exists (even as empty array), use it
      // Empty array [] means ALL COLLAPSED (user clicked "Collapse All")
      if (userNavSettings.expandedViewGroups !== undefined && userNavSettings.expandedViewGroups !== null) {
        console.log('  ✅ Using saved state from backend');
        viewGroups.forEach((vg) => {
          const isExpanded = userNavSettings.expandedViewGroups!.includes(vg.id);
          initialExpanded[vg.id] = isExpanded;
          console.log(`    ${vg.name}: ${isExpanded ? 'EXPANDED' : 'COLLAPSED'}`);
        });
      } else {
        console.log('  ⚠️ No saved state - defaulting to all expanded');
        // Default: expand all (only if no saved state exists at all)
        viewGroups.forEach((vg) => {
          initialExpanded[vg.id] = true;
        });
      }
      
      console.log('  ✅ Final expanded state:', initialExpanded);
      setExpandedViewGroups(initialExpanded);
      hasInitializedRef.current = true;
    }
  }, [viewGroups, userNavSettings]);

  // NEW: Responsive layout state
  const [isHorizontalLayout, setIsHorizontalLayout] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<{
    type: "view" | "viewgroup";
    id: string;
    data?: { viewGroupId?: string };
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
    if (type === "view") {
      const view = views.find(v => v.id === id);
      return view ? !view.isVisible : false;
    } else {
      const viewGroup = viewGroups.find(vg => vg.id === id);
      return viewGroup ? !viewGroup.isVisible : false;
    }
  };

  // Get viewgroup views with proper ordering
  const getViewGroupViews = (viewGroupId: string): View[] => {
    const viewGroup = viewGroups.find((vg) => vg.id === viewGroupId);
    if (!viewGroup) return [];
    
    // ✅ CRITICAL FIX: Preserve the order from viewGroup.viewIds
    // The backend returns viewIds in the correct order (from ViewGroupView.OrderIndex)
    // DO NOT re-sort by View.order as that's a different global ordering!
    const groupViews = viewGroup.viewIds
      .map((viewId) => views.find((v) => v.id === viewId))
      .filter(Boolean) as View[];
    
    // Return views in the same order as viewGroup.viewIds (already sorted by backend)
    return groupViews;
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
      } else {
        const viewGroup = viewGroups.find((vg) => vg.id === id);
        if (!viewGroup) return;

        await viewGroupsService.updateViewGroup(viewGroup.id, user.name, {
          name: viewGroup.name,
          isVisible: !viewGroup.isVisible,
          isDefault: viewGroup.isDefault,
          orderIndex: viewGroup.order,
        });
      }
      
      // Refresh data from parent
      if (onRefreshData) {
        onRefreshData();
      }
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

  // Toggle expansion with persistence
  const toggleViewGroupExpansion = async (viewGroupId: string) => {
    const newExpanded = {
      ...expandedViewGroups,
      [viewGroupId]: !expandedViewGroups[viewGroupId],
    };
    setExpandedViewGroups(newExpanded);
    
    // Save to backend
    await saveExpandedState(newExpanded);
  };

  // Collapse all view groups
  const handleCollapseAll = async () => {
    const allCollapsed: { [key: string]: boolean } = {};
    viewGroups.forEach((vg) => {
      allCollapsed[vg.id] = false;
    });
    setExpandedViewGroups(allCollapsed);
    
    // Save to backend
    await saveExpandedState(allCollapsed);
  };

  // Expand all view groups
  const handleExpandAll = async () => {
    const allExpanded: { [key: string]: boolean } = {};
    viewGroups.forEach((vg) => {
      allExpanded[vg.id] = true;
    });
    setExpandedViewGroups(allExpanded);
    
    // Save to backend
    await saveExpandedState(allExpanded);
  };

  // Save expanded state to navigation settings
  const saveExpandedState = async (expandedState: { [key: string]: boolean }) => {
    try {
      const expandedIds = Object.keys(expandedState).filter(id => expandedState[id]);
      
      console.log('💾 Saving view group expand/collapse state:', expandedIds);
      console.log('  Total groups:', Object.keys(expandedState).length);
      console.log('  Expanded count:', expandedIds.length);
      
      const updatedSettings: UserNavigationSettings = {
        ...userNavSettings,
        expandedViewGroups: expandedIds,
      };
      
      await navigationService.updateNavigationSettings(user.name, updatedSettings);
      onUpdateNavSettings(updatedSettings);
      
      console.log('✅ Saved to backend successfully');
    } catch (error) {
      console.error('❌ Failed to save expand/collapse state:', error);
      // Don't show error to user - this is a non-critical operation
    }
  };

  // Check if all view groups are expanded or collapsed
  const visibleViewGroups = getVisibleOrderedViewGroups();
  const areAllExpanded = visibleViewGroups.every(vg => expandedViewGroups[vg.id] === true);
  const areAllCollapsed = visibleViewGroups.every(vg => expandedViewGroups[vg.id] === false);
  
  // Debug logging
  useEffect(() => {
    if (Object.keys(expandedViewGroups).length > 0) {
      const expandedCount = Object.values(expandedViewGroups).filter(v => v === true).length;
      const totalCount = Object.keys(expandedViewGroups).length;
      console.log(`📊 View groups: ${expandedCount}/${totalCount} expanded`);
    }
  }, [expandedViewGroups]);

  // Drag handlers
  const handleDragStart = (
    e: React.DragEvent,
    type: "view" | "viewgroup",
    id: string,
    viewGroupId?: string
  ) => {
    e.stopPropagation();
    setDraggedItem({ type, id, data: { viewGroupId } });
    e.dataTransfer.setData("text/plain", JSON.stringify({ type, id, viewGroupId }));
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
    e.stopPropagation();
    if (!draggedItem) return;
    
    let position: "top" | "bottom" | "middle" = "middle";
    if (targetType === "view") {
      const rect = e.currentTarget.getBoundingClientRect();

      if (isHorizontalLayout) {
        // Horizontal layout - use left/right
        const x = e.clientX - rect.left;
        const width = rect.width;
        if (x < width * 0.5) {
          position = "top"; // Left half
        } else {
          position = "bottom"; // Right half
        }
      } else {
        // Vertical layout - use top/bottom
        const y = e.clientY - rect.top;
        const height = rect.height;
        if (y < height * 0.5) {
          position = "top"; // Top half
        } else {
          position = "bottom"; // Bottom half
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
      setDraggedItem(null);
      return;
    }

    // Store drag data before any state changes
    const dragData = { ...draggedItem };
    const dropPosition = dragOverItem?.position;
    
    // Clear drag UI state
    setDragOverItem(null);

    if (dragData.type === "viewgroup" && targetType === "viewgroup") {
      handleViewGroupReorder(dragData.id, targetId);
    } else if (dragData.type === "view") {
      if (targetType === "view") {
        handleViewReorder(dragData.id, targetId, dropPosition);
      } else if (targetType === "viewgroup") {
        handleViewMoveToGroup(dragData.id, targetId);
      }
    }
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
        
        if (onRefreshData) {
          await onRefreshData();
        }
      } catch (error) {
        showWarning("Failed to save order", "Changes not saved");
      } finally {
        setDraggedItem(null);
      }
    }
  };

  const handleViewReorder = async (draggedViewId: string, targetViewId: string, position?: "top" | "bottom" | "middle") => {
    const sourceGroupId = draggedItem?.data?.viewGroupId || viewGroups.find((vg) =>
      vg.viewIds.includes(draggedViewId)
    )?.id;
    const targetGroupId = viewGroups.find((vg) =>
      vg.viewIds.includes(targetViewId)
    )?.id;
    
    if (!sourceGroupId || !targetGroupId) {
      return;
    }

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

        // Calculate insert position based on drop position
        let insertIndex: number;
        const pos = position || "bottom";
        
        if (pos === "top") {
          // Insert before target
          insertIndex = targetIndex;
          // Adjust if dragging down (item was removed before target)
          if (draggedIndex < targetIndex) {
            insertIndex = targetIndex - 1;
          }
        } else {
          // Insert after target (bottom or middle)
          insertIndex = targetIndex + 1;
          // Adjust if dragging down
          if (draggedIndex < targetIndex) {
            insertIndex = targetIndex;
          }
        }

        reorderedViewIds.splice(insertIndex, 0, draggedViewIdItem);

        const items = reorderedViewIds.map((id, index) => ({
          id,
          orderIndex: index,
        }));

        try {
          await viewGroupsService.reorderViewsInGroup(sourceGroupId, user.name, items);
          
          if (onRefreshData) {
            await onRefreshData();
          }
        } catch (error) {
          showWarning("Failed to save order", "Changes not saved");
        } finally {
          setDraggedItem(null);
        }
      }
    } else {
      handleViewMoveToGroup(draggedViewId, targetGroupId, targetViewId);
    }
  };

  const handleViewMoveToGroup = async (
    draggedViewId: string,
    targetGroupId: string,
    targetViewId?: string
  ) => {
    const draggedView = views.find((v) => v.id === draggedViewId);
    // Use the source group from drag data to avoid conflicts
    const sourceGroupId = draggedItem?.data?.viewGroupId || viewGroups.find((vg) =>
      vg.viewIds.includes(draggedViewId)
    )?.id;

    if (!draggedView || !sourceGroupId || sourceGroupId === targetGroupId)
      return;

    const sourceGroupName = viewGroups.find(
      (vg) => vg.id === sourceGroupId
    )?.name;
    const targetGroupName = viewGroups.find(
      (vg) => vg.id === targetGroupId
    )?.name;

    try {
      await viewGroupsService.removeViewFromGroup(sourceGroupId, draggedViewId, user.name);
      await viewGroupsService.addViewsToGroup(targetGroupId, user.name, [draggedViewId]);
      
      if (onRefreshData) {
        await onRefreshData();
      }
    } catch (error) {
      showWarning("Failed to move view", "Changes not saved");
    } finally {
      setDraggedItem(null);
    }
  };

  // Delete handlers (API-connected)
  const handleDeleteView = async (view: View) => {
    try {
      const groupsContainingView = viewGroups.filter((vg: ViewGroup) => vg.viewIds.includes(view.id));
      
      for (const group of groupsContainingView) {
        await viewGroupsService.removeViewFromGroup(group.id, view.id, user.name);
      }
      
      await viewsService.deleteView(view.id, user.name);
      
      if (onRefreshData) {
        await onRefreshData();
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.data?.message || 'Unknown error';
      showWarning("Failed to delete view", errorMessage);
    }
  };

  const handleDeleteViewGroupConfirm = async (
    action?: "group-only" | "group-and-views"
  ) => {
    if (!deletingViewGroup || !action) return;

    const defaultGroup = viewGroups.find((vg) => vg.isDefault);
    if (!defaultGroup && action === "group-only") {
      showWarning(
        "Error",
        "Default group not found. Cannot move views. Please create a default group first."
      );
      return;
    }

    try {
      if (action === "group-only") {
        const viewsInGroup = [...deletingViewGroup.viewIds];
        
        if (viewsInGroup.length > 0) {
          const defaultGroupViewIds = defaultGroup!.viewIds;
          const viewsToAdd = viewsInGroup.filter(
            (viewId: string) => !defaultGroupViewIds.includes(viewId)
          );
          
          if (viewsToAdd.length > 0) {
            await viewGroupsService.addViewsToGroup(
              defaultGroup!.id,
              user.name,
              viewsToAdd
            );
          }
        }
        
        for (const viewId of viewsInGroup) {
          try {
            await viewGroupsService.removeViewFromGroup(
              deletingViewGroup.id,
              viewId,
              user.name
            );
          } catch (error) {
            // Ignore errors
          }
        }
        
        await viewGroupsService.deleteViewGroup(deletingViewGroup.id, user.name);
      } else {
        const viewsToDelete = deletingViewGroup.viewIds;
        
        for (const viewId of viewsToDelete) {
          const view = views.find(v => v.id === viewId);
          if (!view) continue;
          
          const groupsContainingView = viewGroups.filter((vg: ViewGroup) => vg.viewIds.includes(viewId));
          
          for (const group of groupsContainingView) {
            await viewGroupsService.removeViewFromGroup(group.id, viewId, user.name);
          }
          
          await viewsService.deleteView(viewId, user.name);
        }
        
        await viewGroupsService.deleteViewGroup(deletingViewGroup.id, user.name);
      }

      setDeletingViewGroup(null);
      
      if (onRefreshData) {
        await onRefreshData();
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.data?.message || 'Unknown error';
      showWarning("Failed to delete view group", errorMessage);
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

  const CollapseAllIcon = () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );

  const ExpandAllIcon = () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );

  return (
    <div
      ref={containerRef}
      className={`navigation-panel ${
        isHorizontalLayout ? "horizontal-layout" : "vertical-layout"
      }`}
    >
      {/* Collapse/Expand All Buttons - Always show both in vertical layout */}
      {!isHorizontalLayout && (
        <div className="nav-toolbar">
          <button
            className="nav-toolbar-btn"
            onClick={handleExpandAll}
            title="Expand All View Groups"
            disabled={visibleViewGroups.length === 0 || areAllExpanded}
          >
            <ExpandAllIcon />
            <span className="nav-toolbar-text">Expand All</span>
          </button>
          <button
            className="nav-toolbar-btn"
            onClick={handleCollapseAll}
            title="Collapse All View Groups"
            disabled={visibleViewGroups.length === 0 || areAllCollapsed}
          >
            <CollapseAllIcon />
            <span className="nav-toolbar-text">Collapse All</span>
          </button>
        </div>
      )}

      <div
        className={`nav-menu ${
          isHorizontalLayout ? "nav-menu-horizontal" : "nav-menu-vertical"
        }`}
      >
        {getVisibleOrderedViewGroups().map((viewGroup) => {
          const groupViews = getVisibleViewsInGroup(viewGroup.id);
          const isExpanded = isHorizontalLayout
            ? true
            : (expandedViewGroups[viewGroup.id] ?? true); // Default to expanded if not set
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
                        onDragStart={(e) => handleDragStart(e, "view", view.id, viewGroup.id)}
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
          userId={user.name}
          onSave={(updatedView) => {
            // Modal handles all API calls internally
            setEditingView(null);
            // Refresh data from parent
            if (onRefreshData) {
              onRefreshData();
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
          onSave={(updatedViewGroup) => {
            // Modal handles all API calls internally
            setEditingViewGroup(null);
            // Refresh data from parent
            if (onRefreshData) {
              onRefreshData();
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
