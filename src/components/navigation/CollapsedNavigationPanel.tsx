import React, { useState } from "react";
import {
  User,
  View,
  ViewGroup,
  UserNavigationSettings,
} from "../../types";
import ViewGroupHoverPopup from "./ViewGroupHoverPopup";
import "./styles/GmailNavigation.css";

interface CollapsedNavigationPanelProps {
  user: User;
  views: View[];
  viewGroups: ViewGroup[];
  userNavSettings: UserNavigationSettings;
  onViewSelect?: (view: View) => void;
  selectedView?: View | null;
  // Add callback props for popup actions
  onUpdateViews?: (views: View[]) => void;
  onUpdateViewGroups?: (viewGroups: ViewGroup[]) => void;
  onUpdateNavSettings?: (settings: UserNavigationSettings) => void;
  // Add reports and widgets for modals
  reports?: any[];
  widgets?: any[];
}

const CollapsedNavigationPanel: React.FC<CollapsedNavigationPanelProps> = ({
  user,
  views,
  viewGroups,
  userNavSettings,
  onViewSelect,
  selectedView,
  onUpdateViews,
  onUpdateViewGroups,
  onUpdateNavSettings,
  reports = [],
  widgets = [],
}) => {
  const [hoveredViewGroup, setHoveredViewGroup] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [isPopupHovered, setIsPopupHovered] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

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

  // Generate 3-letter abbreviation from view group name
  const getViewGroupAbbreviation = (name: string) => {
    // Remove common words and get meaningful parts
    const meaningfulWords = name
      .replace(/\b(the|and|or|of|in|on|at|to|for|with|by)\b/gi, '')
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0);

    if (meaningfulWords.length === 0) {
      return name.substring(0, 3).toUpperCase();
    }

    if (meaningfulWords.length === 1) {
      return meaningfulWords[0].substring(0, 3).toUpperCase();
    }

    // Take first letter of each meaningful word, up to 3 letters
    let abbreviation = '';
    for (let i = 0; i < meaningfulWords.length && abbreviation.length < 3; i++) {
      abbreviation += meaningfulWords[i][0].toUpperCase();
    }

    // If still less than 3 letters, pad with letters from first word
    if (abbreviation.length < 3 && meaningfulWords[0].length > 1) {
      const firstWord = meaningfulWords[0].toUpperCase();
      for (let i = 1; i < firstWord.length && abbreviation.length < 3; i++) {
        abbreviation += firstWord[i];
      }
    }

    return abbreviation.substring(0, 3);
  };

  // Handle view group hover with improved timing
  const handleViewGroupHover = (viewGroup: ViewGroup, event: React.MouseEvent) => {
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.right - 2, // Eliminate gap completely
      y: rect.top,
    };

    setHoveredViewGroup(viewGroup.id);
    setHoverPosition(position);
  };

  const handleViewGroupLeave = () => {
    // Only start hide timer if popup is not being hovered
    if (!isPopupHovered) {
      const timeout = setTimeout(() => {
        if (!isPopupHovered) {
          setHoveredViewGroup(null);
          setHoverPosition(null);
        }
      }, 300); // Increased delay for better UX
      setHoverTimeout(timeout);
    }
  };

  // Handle popup mouse events to keep it visible
  const handlePopupMouseEnter = () => {
    setIsPopupHovered(true);
    // Clear any pending hide timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const handlePopupMouseLeave = () => {
    setIsPopupHovered(false);
    // Start hide timer when leaving popup
    const timeout = setTimeout(() => {
      setHoveredViewGroup(null);
      setHoverPosition(null);
    }, 200); // Shorter delay when leaving popup
    setHoverTimeout(timeout);
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  return (
    <div className="collapsed-navigation-panel">
      <div className="collapsed-nav-content">
        {orderedViewGroups.map((viewGroup) => {
          const groupViews = getViewsForGroup(viewGroup.id);
          if (groupViews.length === 0) return null;

          const abbreviation = getViewGroupAbbreviation(viewGroup.name);

          return (
            <div
              key={viewGroup.id}
              className="collapsed-view-group"
              onMouseEnter={(e) => handleViewGroupHover(viewGroup, e)}
              onMouseLeave={handleViewGroupLeave}
              title={viewGroup.name}
            >
              <div className="collapsed-view-group-text">
                {abbreviation}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hover Popup with improved positioning */}
      {hoveredViewGroup && hoverPosition && (
        <ViewGroupHoverPopup
          viewGroup={viewGroups.find(vg => vg.id === hoveredViewGroup)!}
          views={getViewsForGroup(hoveredViewGroup)}
          position={hoverPosition}
          onViewSelect={onViewSelect}
          selectedView={selectedView}
          onMouseEnter={handlePopupMouseEnter}
          onMouseLeave={handlePopupMouseLeave}
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
    </div>
  );
};

export default CollapsedNavigationPanel;