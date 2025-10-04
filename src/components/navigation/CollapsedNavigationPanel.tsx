import React from "react";
import {
  User,
  View,
  ViewGroup,
  UserNavigationSettings,
} from "../../types";
import ViewGroupHoverPopup from "./ViewGroupHoverPopup";
import { useGmailNavigation } from "./useGmailNavigation";
import "./styles/GmailNavigation.css";

interface CollapsedNavigationPanelProps {
  user: User;
  views: View[];
  viewGroups: ViewGroup[];
  userNavSettings: UserNavigationSettings;
  onViewSelect?: (view: View) => void;
  selectedView?: View | null;
}

const CollapsedNavigationPanel: React.FC<CollapsedNavigationPanelProps> = ({
  user,
  views,
  viewGroups,
  userNavSettings,
  onViewSelect,
  selectedView,
}) => {
  const {
    navState,
    setHoveredViewGroup,
  } = useGmailNavigation();

  // Get ordered and visible view groups
  const orderedViewGroups = viewGroups
    .filter((vg) => vg.isVisible && !userNavSettings.hiddenViewGroups.includes(vg.id))
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Get views for a specific view group
  const getViewsForGroup = (viewGroupId: string) => {
    const viewGroup = viewGroups.find((vg) => vg.id === viewGroupId);
    if (!viewGroup) return [];

    return viewGroup.viewIds
      .map((viewId) => views.find((v) => v.id === viewId))
      .filter(Boolean)
      .filter((view) => view!.isVisible && !userNavSettings.hiddenViews.includes(view!.id))
      .sort((a, b) => (a!.order || 0) - (b!.order || 0)) as View[];
  };

  // Handle view group hover
  const handleViewGroupHover = (viewGroup: ViewGroup, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.right,
      y: rect.top,
    };

    setHoveredViewGroup(viewGroup.id, position);
  };

  const handleViewGroupLeave = () => {
    // Delay hiding to allow moving to popup
    setTimeout(() => setHoveredViewGroup(null), 100);
  };

  // Icons
  const ViewGroupIcon = ({ viewGroup }: { viewGroup: ViewGroup }) => {
    if (viewGroup.isDefault) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      );
    }
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    );
  };

  return (
    <div className="collapsed-navigation-panel">
      <div className="collapsed-nav-content">
        {orderedViewGroups.map((viewGroup) => {
          const groupViews = getViewsForGroup(viewGroup.id);
          if (groupViews.length === 0) return null;

          return (
            <div
              key={viewGroup.id}
              className="collapsed-view-group"
              onMouseEnter={(e) => handleViewGroupHover(viewGroup, e)}
              onMouseLeave={handleViewGroupLeave}
              title={viewGroup.name}
            >
              <div className="collapsed-view-group-icon">
                <ViewGroupIcon viewGroup={viewGroup} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Hover Popup */}
      {navState.hoveredViewGroup && navState.hoverPosition && (
        <ViewGroupHoverPopup
          viewGroup={viewGroups.find(vg => vg.id === navState.hoveredViewGroup)!}
          views={getViewsForGroup(navState.hoveredViewGroup)}
          position={navState.hoverPosition}
          onViewSelect={onViewSelect}
          selectedView={selectedView}
        />
      )}
    </div>
  );
};

export default CollapsedNavigationPanel;