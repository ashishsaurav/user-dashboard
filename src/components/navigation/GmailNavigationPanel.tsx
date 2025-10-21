import React, { useState, useEffect, useMemo } from "react";
import {
  User,
  View,
  ViewGroup,
  UserNavigationSettings,
  Report,
  Widget,
} from "../../types";
import { useGmailNavigation } from "./useGmailNavigation";
import ViewGroupHoverPopup from "./ViewGroupHoverPopup";
import EditViewModal from "../modals/EditViewModal";
import EditViewGroupModal from "../modals/EditViewGroupModal";
import DeleteConfirmationModal from "../modals/DeleteConfirmationModal";
import { useNotification } from "../common/NotificationProvider";
import "./styles/GmailNavigation.css";

interface GmailNavigationPanelProps {
  user: User;
  views: View[];
  viewGroups: ViewGroup[];
  userNavSettings: UserNavigationSettings;
  reports: Report[];
  widgets: Widget[];
  onUpdateViews: (views: View[]) => void;
  onUpdateViewGroups: (viewGroups: ViewGroup[]) => void;
  onUpdateNavSettings: (settings: UserNavigationSettings) => void;
  onViewSelect?: (view: View) => void;
  selectedView?: View | null;
}

const GmailNavigationPanel: React.FC<GmailNavigationPanelProps> = ({
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
  const { navState, containerRef, toggleCollapsed, setHoveredViewGroup } =
    useGmailNavigation();

  // Local state for expanded view groups
  const [expandedViewGroups, setExpandedViewGroups] = useState<{
    [key: string]: boolean;
  }>({});

  // Modal states
  const [editingView, setEditingView] = useState<View | null>(null);
  const [editingViewGroup, setEditingViewGroup] = useState<ViewGroup | null>(
    null
  );
  const [deletingViewGroup, setDeletingViewGroup] = useState<ViewGroup | null>(
    null
  );
  const [deletingView, setDeletingView] = useState<View | null>(null);

  const { showSuccess, showWarning } = useNotification();

  // Get ordered and visible view groups
  const orderedViewGroups = useMemo(() => {
    return viewGroups
      .filter(
        (vg) =>
          vg.isVisible && !userNavSettings.hiddenViewGroups.includes(vg.id)
      )
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [viewGroups, userNavSettings.hiddenViewGroups]);

  // Get views for a specific view group
  const getViewsForGroup = (viewGroupId: string) => {
    const viewGroup = viewGroups.find((vg) => vg.id === viewGroupId);
    if (!viewGroup) return [];

    return viewGroup.viewIds
      .map((viewId) => views.find((v) => v.id === viewId))
      .filter(Boolean)
      .filter(
        (view) =>
          view!.isVisible && !userNavSettings.hiddenViews.includes(view!.id)
      )
      .sort((a, b) => (a!.order || 0) - (b!.order || 0)) as View[];
  };

  // Handle view group toggle
  const toggleViewGroupExpansion = (viewGroupId: string) => {
    if (navState.isHorizontal || navState.isCollapsed) return; // Don't toggle in horizontal or collapsed mode

    setExpandedViewGroups((prev) => ({
      ...prev,
      [viewGroupId]: !prev[viewGroupId],
    }));
  };

  // Handle view group hover for collapsed mode
  const handleViewGroupHover = (
    viewGroup: ViewGroup,
    event: React.MouseEvent
  ) => {
    if (!navState.isCollapsed) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.right,
      y: rect.top,
    };

    setHoveredViewGroup(viewGroup.id, position);
  };

  const handleViewGroupLeave = () => {
    if (navState.isCollapsed) {
      // Delay hiding to allow moving to popup
      setTimeout(() => setHoveredViewGroup(null), 100);
    }
  };

  // Icons
  const NavigationIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  );

  const CollapseIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="15,18 9,12 15,6" />
    </svg>
  );

  const ChevronIcon = () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="9,18 15,12 9,6" />
    </svg>
  );

  const ViewGroupIcon = ({ viewGroup }: { viewGroup: ViewGroup }) => {
    if (viewGroup.isDefault) {
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      );
    }
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    );
  };

  const ViewIcon = () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="13" x2="15" y2="13" />
    </svg>
  );

  // Action buttons (same as before but styled for Gmail)
  const ManageIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );

  return (
    <div
      ref={containerRef}
      className={`gmail-navigation-panel ${
        navState.isCollapsed ? "collapsed" : ""
      } ${navState.isHorizontal ? "horizontal" : ""}`}
    >
      {/* Navigation Header */}
      <div className="gmail-nav-header">
        <div className="gmail-nav-title">
          <NavigationIcon />
          <span className="nav-title-text">Navigation</span>
        </div>

        <div className="gmail-nav-actions">
          <button
            className="gmail-collapse-toggle"
            onClick={toggleCollapsed}
            title={
              navState.isCollapsed ? "Expand navigation" : "Collapse navigation"
            }
          >
            <CollapseIcon />
          </button>
          {!navState.isCollapsed && (
            <>
              <button
                className="gmail-collapse-toggle"
                title="Manage Navigation"
                // Add your manage handler here
              >
                <ManageIcon />
              </button>
              {user.role === "admin" && (
                <button
                  className="gmail-collapse-toggle"
                  title="System Settings"
                  // Add your settings handler here
                >
                  <ManageIcon />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Navigation Content */}
      <div className="gmail-nav-content">
        <div className="gmail-nav-list">
          {orderedViewGroups.map((viewGroup) => {
            const groupViews = getViewsForGroup(viewGroup.id);
            const isExpanded =
              expandedViewGroups[viewGroup.id] || navState.isHorizontal;

            return (
              <div
                key={viewGroup.id}
                className={`gmail-view-group ${isExpanded ? "expanded" : ""}`}
              >
                {/* View Group Header */}
                <div
                  className="gmail-view-group-header"
                  onClick={() => toggleViewGroupExpansion(viewGroup.id)}
                  onMouseEnter={(e) => handleViewGroupHover(viewGroup, e)}
                  onMouseLeave={handleViewGroupLeave}
                >
                  <div className="gmail-view-group-icon">
                    <ViewGroupIcon viewGroup={viewGroup} />
                  </div>
                  <span className="gmail-view-group-text">
                    {viewGroup.name}
                  </span>
                  {!navState.isHorizontal && (
                    <div className="gmail-view-group-chevron">
                      <ChevronIcon />
                    </div>
                  )}
                </div>

                {/* View List */}
                {(isExpanded || navState.isHorizontal) &&
                  groupViews.length > 0 && (
                    <div className="gmail-view-list">
                      {groupViews.map((view) => (
                        <div
                          key={view.id}
                          className={`gmail-view-item ${
                            selectedView?.id === view.id ? "selected" : ""
                          }`}
                          onClick={() => onViewSelect?.(view)}
                        >
                          <div className="gmail-view-item-icon">
                            <ViewIcon />
                          </div>
                          <span className="gmail-view-item-text">
                            {view.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hover Popup for Collapsed Mode */}
      {navState.isCollapsed &&
        navState.hoveredViewGroup &&
        navState.hoverPosition && (
          <ViewGroupHoverPopup
            viewGroup={
              viewGroups.find((vg) => vg.id === navState.hoveredViewGroup)!
            }
            views={getViewsForGroup(navState.hoveredViewGroup)}
            position={navState.hoverPosition}
            onViewSelect={onViewSelect}
            selectedView={selectedView}
            user={user}
            allViews={views}
            allViewGroups={viewGroups}
            userNavSettings={userNavSettings}
            reports={reports}
            widgets={widgets}
            onUpdateViews={onUpdateViews}
            onUpdateViewGroups={onUpdateViewGroups}
            onUpdateNavSettings={onUpdateNavSettings}
          />
        )}

      {/* Modals */}
      {editingView && (
        <EditViewModal
          userRole={user.role}
          userId={user.name}
          view={editingView}
          reports={reports}
          widgets={widgets}
          onSave={(updatedView) => {
            const updatedViews = views.map((v) =>
              v.id === editingView.id ? updatedView : v
            );
            onUpdateViews(updatedViews);
            setEditingView(null);
            showSuccess("View updated successfully");
          }}
          onClose={() => setEditingView(null)}
        />
      )}

      {editingViewGroup && (
        <EditViewGroupModal
          viewGroup={editingViewGroup}
          views={views}
          userRole={user.role}
          onSave={(updatedViewGroup) => {
            const updatedViewGroups = viewGroups.map((vg) =>
              vg.id === editingViewGroup.id ? updatedViewGroup : vg
            );
            onUpdateViewGroups(updatedViewGroups);
            setEditingViewGroup(null);
            showSuccess("View group updated successfully");
          }}
          onClose={() => setEditingViewGroup(null)}
        />
      )}

      {deletingViewGroup && (
        <DeleteConfirmationModal
          type="viewgroup"
          item={deletingViewGroup}
          onConfirm={() => {
            const updatedViewGroups = viewGroups.filter(
              (vg) => vg.id !== deletingViewGroup.id
            );
            onUpdateViewGroups(updatedViewGroups);
            setDeletingViewGroup(null);
            showSuccess("View group deleted successfully");
          }}
          onCancel={() => setDeletingViewGroup(null)}
        />
      )}

      {deletingView && (
        <DeleteConfirmationModal
          type="view"
          item={deletingView}
          onConfirm={() => {
            const updatedViews = views.filter((v) => v.id !== deletingView.id);
            onUpdateViews(updatedViews);
            setDeletingView(null);
            showSuccess("View deleted successfully");
          }}
          onCancel={() => setDeletingView(null)}
        />
      )}
    </div>
  );
};

export default GmailNavigationPanel;
