import React from "react";
import { Widget } from "../../types";
import { WidgetsIcon, DragIcon, CloseIcon } from "../ui/Icons";

interface WidgetCardProps {
  widget: Widget;
  isDragging: boolean;
  isDragOver: boolean;
  onRemove: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export const WidgetCard: React.FC<WidgetCardProps> = ({
  widget,
  isDragging,
  isDragOver,
  onRemove,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
}) => {
  return (
    <div
      className={`widget-card orderable-widget ${
        isDragging ? "dragging" : ""
      } ${isDragOver ? "drag-over" : ""}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="widget-header">
        <div className="widget-drag-handle">
          <DragIcon width={14} height={14} />
        </div>
        <div className="widget-title">
          <WidgetsIcon />
          <span>{widget.name}</span>
        </div>
        <button
          className="tab-action-btn close-btn"
          onClick={onRemove}
          title="Remove from view"
        >
          <CloseIcon width={14} height={14} />
        </button>
      </div>
      <div className="widget-content">
        <div className="widget-placeholder">
          <WidgetsIcon width={32} height={32} />
          <h4>Widget Content</h4>
          <p>Dummy widget data - {widget.type}</p>
          <div className="widget-metrics">
            <div className="metric">
              <span className="metric-value">
                {Math.floor(Math.random() * 1000)}
              </span>
              <span className="metric-label">Value A</span>
            </div>
            <div className="metric">
              <span className="metric-value">
                {Math.floor(Math.random() * 100)}%
              </span>
              <span className="metric-label">Value B</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
