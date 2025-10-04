import React from "react";
import { ViewGroup } from "../../types";
import {
  ViewGroupIcon,
  ChevronIcon,
  EyeIcon,
  EditIcon,
  DeleteIcon,
} from "../ui/Icons";
import { IconButton } from "../ui/Button";

interface NavigationHeaderProps {
  viewGroup: ViewGroup;
  isExpanded: boolean;
  isHidden: boolean;
  isHorizontalLayout: boolean;
  onToggleExpansion: () => void;
  onToggleVisibility: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  viewGroup,
  isExpanded,
  isHidden,
  isHorizontalLayout,
  onToggleExpansion,
  onToggleVisibility,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      className={`nav-group-header ${
        isHorizontalLayout
          ? "nav-group-header-horizontal"
          : "nav-group-header-vertical"
      }`}
      onClick={() => !isHorizontalLayout && onToggleExpansion()}
    >
      <div className="nav-group-info">
        <div className="nav-group-icon">
          <ViewGroupIcon />
        </div>
        <div className="nav-group-title">{viewGroup.name}</div>
        {viewGroup.isDefault && <span className="default-badge">Default</span>}
      </div>
      <div
        className="nav-group-actions"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {!isHorizontalLayout && (
          <IconButton
            icon={<ChevronIcon expanded={isExpanded} />}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpansion();
            }}
            className="nav-action-btn"
            title={isExpanded ? "Collapse" : "Expand"}
          />
        )}
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
          title="Edit view group and manage views"
        />
        {!viewGroup.isDefault && (
          <IconButton
            icon={<DeleteIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="nav-action-btn delete-btn"
            variant="danger"
            title="Delete view group"
          />
        )}
      </div>
    </div>
  );
};

export default NavigationHeader;
