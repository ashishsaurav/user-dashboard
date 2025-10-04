import React from "react";
import { View, ViewGroup } from "../../types";

interface ViewGroupHoverPopupProps {
  viewGroup: ViewGroup;
  views: View[];
  position: { x: number; y: number };
  onViewSelect?: (view: View) => void;
  selectedView?: View | null;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const ViewGroupHoverPopup: React.FC<ViewGroupHoverPopupProps> = ({
  viewGroup,
  views,
  position,
  onViewSelect,
  selectedView,
  onMouseEnter,
  onMouseLeave,
}) => {
  const groupViews = views.filter(view => 
    viewGroup.viewIds.includes(view.id) && view.isVisible
  ).sort((a, b) => (a.order || 0) - (b.order || 0));

  if (groupViews.length === 0) return null;

  return (
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
            <span className="view-name">{view.name}</span>
            <div className="view-counts">
              <span className="reports-count">{view.reportIds.length}R</span>
              <span className="widgets-count">{view.widgetIds.length}W</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewGroupHoverPopup;