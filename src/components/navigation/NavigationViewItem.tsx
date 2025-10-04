import React from "react";
import { View, Report, Widget } from "../../types";
import { EyeIcon, EditIcon, DeleteIcon } from "../ui/Icons";
import { IconButton } from "../ui/Button";

interface NavigationViewItemProps {
  view: View;
  isHidden: boolean;
  isSelected: boolean;
  isHorizontalLayout: boolean;
  isDragOver: boolean;
  dragPosition: "top" | "bottom" | "middle" | null;
  reports: Report[];
  widgets: Widget[];
  onViewClick: () => void;
  onToggleVisibility: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

const NavigationViewItem: React.FC<NavigationViewItemProps> = ({
  view,
  isHidden,
  isSelected,
  isHorizontalLayout,
  isDragOver,
  dragPosition,
  reports,
  widgets,
  onViewClick,
  onToggleVisibility,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
}) => {
  return (
    <div
      className={`nav-view-item ${isDragOver ? "drag-over" : ""} ${
        dragPosition ? `drag-${dragPosition}` : ""
      } ${isSelected ? "selected" : ""} ${
        isHorizontalLayout
          ? "nav-view-item-horizontal"
          : "nav-view-item-vertical"
      }`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onViewClick}
    >
      <div className="nav-view-info">
        <div className="nav-view-content">
          <div className="nav-view-title">{view.name}</div>
          {!isHorizontalLayout && (
            <div className="nav-view-meta">
              {reports.length} Reports, {widgets.length} Widgets
            </div>
          )}
        </div>
      </div>
      <div
        className="nav-view-actions"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <IconButton
          icon={<EyeIcon isVisible={!isHidden} />}
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          className="nav-action-btn visibility-btn"
          title={isHidden ? "Show in navigation" : "Hide from navigation"}
        />
        <IconButton
          icon={<EditIcon />}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="nav-action-btn edit-btn"
          title="Edit view"
        />
        <IconButton
          icon={<DeleteIcon />}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="nav-action-btn delete-btn"
          variant="danger"
          title="Delete view"
        />
      </div>
    </div>
  );
};

export default NavigationViewItem;
