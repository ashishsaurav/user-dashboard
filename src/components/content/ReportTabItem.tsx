import React from "react";
import { Report } from "../../types";
import { DragIcon, CloseIcon } from "../ui/Icons";

interface ReportTabItemProps {
  report: Report;
  isActive: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  dragOverPosition: "left" | "right" | null;
  onClick: () => void;
  onRemove: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export const ReportTabItem: React.FC<ReportTabItemProps> = ({
  report,
  isActive,
  isDragging,
  isDragOver,
  dragOverPosition,
  onClick,
  onRemove,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
}) => {
  const dragOverClass = isDragOver ? `drag-over-${dragOverPosition}` : "";

  return (
    <div
      className={`tab-item orderable-tab ${isActive ? "active" : ""} ${
        isDragging ? "dragging" : ""
      } ${dragOverClass}`}
      onClick={onClick}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="tab-drag-handle">
        <DragIcon width={14} height={14} />
      </div>
      <span className="tab-title">{report.name}</span>
      <button
        className="tab-action-btn close-btn"
        onClick={onRemove}
        title="Remove from view"
      >
        <CloseIcon width={14} height={14} />
      </button>
    </div>
  );
};
